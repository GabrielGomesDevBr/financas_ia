-- Fix Missing Family Members Records
-- This script backfills family_members records for users who have family_id but no corresponding family_members entry
-- This fixes the issue where budget and goals APIs return 404 errors for affected users

-- Step 1: Check how many users are affected
SELECT 
    COUNT(*) as affected_users,
    STRING_AGG(u.email, ', ') as user_emails
FROM public.users u
WHERE u.family_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = u.id AND fm.family_id = u.family_id
);

-- Step 2: Backfill family_members for affected users
INSERT INTO public.family_members (family_id, user_id, role)
SELECT u.family_id, u.id, u.role
FROM public.users u
WHERE u.family_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = u.id AND fm.family_id = u.family_id
)
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Step 3: Verify the fix
SELECT 
    'Before Fix' as status,
    COUNT(DISTINCT u.id) as users_with_family,
    COUNT(DISTINCT fm.user_id) as users_in_family_members,
    COUNT(DISTINCT u.id) - COUNT(DISTINCT fm.user_id) as missing_records
FROM public.users u
LEFT JOIN public.family_members fm ON fm.user_id = u.id AND fm.family_id = u.family_id
WHERE u.family_id IS NOT NULL;

-- Expected result after running Step 2: missing_records should be 0
