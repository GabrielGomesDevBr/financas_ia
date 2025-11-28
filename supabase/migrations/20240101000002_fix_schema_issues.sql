-- Rename amount to limit_amount in budgets table
ALTER TABLE public.budgets RENAME COLUMN amount TO limit_amount;

-- Fix family_invites foreign key to reference public.users instead of auth.users
ALTER TABLE public.family_invites DROP CONSTRAINT family_invites_invited_by_fkey;

ALTER TABLE public.family_invites
    ADD CONSTRAINT family_invites_invited_by_fkey
    FOREIGN KEY (invited_by)
    REFERENCES public.users(id)
    ON DELETE SET NULL;
