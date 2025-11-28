-- Add missing notification columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS budget_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS goal_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS transaction_alerts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS family_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'family' CHECK (profile_visibility IN ('public', 'family', 'private')),
ADD COLUMN IF NOT EXISTS show_transaction_details BOOLEAN DEFAULT true;
