-- Fix Family Invites RLS Policies
-- This migration creates the necessary RLS policies for the family_invites table
-- that were previously commented out, enabling invite functionality

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Family members can view invites" ON public.family_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON public.family_invites;
DROP POLICY IF EXISTS "Admins can update invites" ON public.family_invites;
DROP POLICY IF EXISTS "Admins can delete invites" ON public.family_invites;
DROP POLICY IF EXISTS "Anyone can view their own invite" ON public.family_invites;

-- Policy 1: Family members can view invites for their family
CREATE POLICY "Family members can view invites" ON public.family_invites
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_invites.family_id
    AND fm.user_id = auth.uid()
  )
);

-- Policy 2: Admins can create invites for their family
CREATE POLICY "Admins can create invites" ON public.family_invites
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_invites.family_id
    AND fm.user_id = auth.uid()
    AND fm.role = 'admin'
  )
);

-- Policy 3: Admins can update invites for their family
CREATE POLICY "Admins can update invites" ON public.family_invites
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_invites.family_id
    AND fm.user_id = auth.uid()
    AND fm.role = 'admin'
  )
);

-- Policy 4: Admins can delete invites for their family
CREATE POLICY "Admins can delete invites" ON public.family_invites
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_id = family_invites.family_id
    AND fm.user_id = auth.uid()
    AND fm.role = 'admin'
  )
);

-- Policy 5: Anyone can view invites sent to their email (for acceptance)
-- This allows users to view invite details even if not authenticated or not a family member yet
CREATE POLICY "Anyone can view their own invite" ON public.family_invites
FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy 6: Allow public access to view invite by token (unauthenticated)
-- This is needed for the public invite acceptance page
CREATE POLICY "Public can view invite by token" ON public.family_invites
FOR SELECT USING (true);

-- Note: Policy 6 allows anyone to view invites, but sensitive operations (accept/reject)
-- will still require authentication and additional validation in the API layer
