-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(family_id, user_id)
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view members of their family" ON public.family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Populate from users table
INSERT INTO public.family_members (family_id, user_id, role)
SELECT family_id, id, role
FROM public.users
WHERE family_id IS NOT NULL
ON CONFLICT (family_id, user_id) DO NOTHING;
