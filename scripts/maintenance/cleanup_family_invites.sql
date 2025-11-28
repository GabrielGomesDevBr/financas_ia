-- Clean Up Old and Invalid Family Invites
-- This script removes old, expired, or invalid invites to prevent conflicts

-- Step 1: Check current invite status
SELECT 
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_count
FROM family_invites
GROUP BY status;

-- Step 2: Auto-expire old invites that are still pending
UPDATE family_invites
SET status = 'expired'
WHERE status = 'pending' 
AND expires_at < NOW();

-- Step 3: Delete old cancelled and expired invites (optional cleanup)
-- Uncomment if you want to permanently delete them
-- DELETE FROM family_invites
-- WHERE status IN ('cancelled', 'expired')
-- AND created_at < NOW() - INTERVAL '30 days';

-- Step 4: Check for invites to users who already have a family
SELECT 
  fi.id,
  fi.email,
  fi.status,
  u.family_id as user_current_family,
  fi.family_id as invite_family
FROM family_invites fi
JOIN auth.users au ON au.email = fi.email
JOIN users u ON u.id = au.id
WHERE fi.status = 'pending'
AND u.family_id IS NOT NULL
AND u.family_id != fi.family_id;

-- Step 5: Auto-cancel invites to users who already joined another family
UPDATE family_invites fi
SET status = 'cancelled'
FROM auth.users au
JOIN users u ON u.id = au.id
WHERE fi.email = au.email
AND fi.status = 'pending'
AND u.family_id IS NOT NULL
AND u.family_id != fi.family_id;

-- Step 6: Verify cleanup
SELECT 
  status,
  COUNT(*) as count
FROM family_invites
GROUP BY status
ORDER BY status;
