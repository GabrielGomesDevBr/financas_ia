-- Add assistant_personality column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS assistant_personality TEXT DEFAULT 'padrao' 
CHECK (assistant_personality IN ('padrao', 'julius', 'severina', 'augusto', 'luna', 'marcos'));
