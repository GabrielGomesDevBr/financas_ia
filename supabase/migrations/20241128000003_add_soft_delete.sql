-- Add Soft Delete Support to Users Table
-- Allows 30-day grace period before permanent account deletion

-- Add soft delete columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

-- Create index for efficient querying of deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON public.users(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

-- Function to permanently delete user and all related data
CREATE OR REPLACE FUNCTION public.permanently_delete_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Delete user-specific data (not handled by CASCADE)
  DELETE FROM public.goals WHERE user_id = user_uuid;
  DELETE FROM public.chat_messages WHERE user_id = user_uuid;
  DELETE FROM public.transactions WHERE user_id = user_uuid;
  DELETE FROM public.family_invites WHERE invited_by = user_uuid;
  
  -- Audit log before deletion
  INSERT INTO public.audit_logs (user_id, action, details, created_at)
  VALUES (
    user_uuid,
    'account_permanently_deleted',
    jsonb_build_object(
      'deleted_at', NOW(),
      'method', 'auto_cleanup'
    ),
    NOW()
  );
  
  -- Delete from public.users (will cascade to user_settings, family_members, notifications)
  DELETE FROM public.users WHERE id = user_uuid;
  
  -- Delete from auth.users (final step)
  DELETE FROM auth.users WHERE id = user_uuid;
  
  RAISE NOTICE 'User % permanently deleted', user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-cleanup users scheduled for deletion
-- This should be called by a cron job daily
CREATE OR REPLACE FUNCTION public.cleanup_expired_user_deletions()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  user_record RECORD;
  count INTEGER := 0;
BEGIN
  -- Find users whose 30-day grace period has expired
  FOR user_record IN
    SELECT id, email
    FROM public.users
    WHERE deletion_scheduled_at IS NOT NULL
    AND deletion_scheduled_at <= NOW()
    AND deleted_at IS NULL
  LOOP
    -- Permanently delete the user
    PERFORM public.permanently_delete_user(user_record.id);
    count := count + 1;
    
    RAISE NOTICE 'Auto-deleted user: % (ID: %)', user_record.email, user_record.id;
  END LOOP;
  
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run cleanup daily at 2 AM (requires pg_cron extension)
-- Note: pg_cron may need to be enabled in Supabase dashboard
-- If pg_cron is not available, this can be called via API endpoint scheduled with external cron

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule daily cleanup at 2 AM UTC
    PERFORM cron.schedule(
      'cleanup-deleted-users',
      '0 2 * * *',
      'SELECT public.cleanup_expired_user_deletions();'
    );
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Please schedule cleanup_expired_user_deletions() manually.';
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.permanently_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_user_deletions() TO authenticated;

COMMENT ON COLUMN public.users.deleted_at IS 'When the user marked their account for deletion (soft delete)';
COMMENT ON COLUMN public.users.deletion_scheduled_at IS 'When the account will be permanently deleted (30 days after deleted_at)';
COMMENT ON COLUMN public.users.deletion_reason IS 'Optional reason provided by user for deletion';
COMMENT ON FUNCTION public.permanently_delete_user IS 'Permanently deletes a user and all related data';
COMMENT ON FUNCTION public.cleanup_expired_user_deletions IS 'Auto-cleanup function to delete users past their 30-day grace period';
