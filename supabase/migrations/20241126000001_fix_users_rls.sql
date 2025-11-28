-- ===============================================
-- Add RLS Policies for Super Admin on Users Table
-- ===============================================
-- This fixes the issue where super admins cannot view
-- users in the waitlist page

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Policy: Super admins can view all users
CREATE POLICY "Super admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

-- Policy: Super admins can update all users
CREATE POLICY "Super admins can manage all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = id
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Policy: Allow service role to insert new users (for auth callback)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

COMMENT ON POLICY "Super admins can view all users" ON public.users 
  IS 'Permite que super admins visualizem todos os usuários no painel admin';

COMMENT ON POLICY "Super admins can manage all users" ON public.users 
  IS 'Permite que super admins atualizem todos os usuários';

COMMENT ON POLICY "Users can view their own profile" ON public.users 
  IS 'Permite que usuários visualizem seu próprio perfil';

COMMENT ON POLICY "Users can update their own profile" ON public.users 
  IS 'Permite que usuários atualizem seu próprio perfil';
