-- ============================================
-- MIGRAÇÃO: Sistema de Controle de Acesso
-- ============================================

-- 1. Adicionar campos de controle em users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'waitlist' 
  CHECK (access_status IN ('active', 'waitlist', 'blocked')),
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user' 
  CHECK (user_type IN ('super_admin', 'admin', 'user')),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- 2. Criar tabela de waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela de métricas de uso
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar tabela de audit logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_created_at ON public.usage_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON public.usage_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_users_access_status ON public.users(access_status);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- 6. Habilitar RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acesso
CREATE POLICY "Super admins can view all waitlist" ON public.waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage waitlist" ON public.waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all metrics" ON public.usage_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

CREATE POLICY "System can insert metrics" ON public.usage_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

-- 8. Função para verificar acesso no signup
CREATE OR REPLACE FUNCTION public.check_user_access_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se email está na whitelist aprovada
  IF EXISTS (
    SELECT 1 FROM public.waitlist 
    WHERE email = NEW.email 
    AND status = 'approved'
  ) THEN
    NEW.access_status := 'active';
    NEW.approved_at := NOW();
  ELSE
    NEW.access_status := 'waitlist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para aplicar função no signup
DROP TRIGGER IF EXISTS set_user_access_on_signup ON public.users;
CREATE TRIGGER set_user_access_on_signup
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_access_on_signup();

-- 10. Definir o primeiro super admin
-- IMPORTANTE: Isso apenas ATUALIZA o usuário existente, não deleta nada
UPDATE public.users 
SET 
  user_type = 'super_admin', 
  access_status = 'active',
  approved_at = NOW()
WHERE email = 'gabrielgomesdevbr@gmail.com';

-- Verificar se foi atualizado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'gabrielgomesdevbr@gmail.com' AND user_type = 'super_admin') THEN
    RAISE EXCEPTION 'ERRO: Super admin não foi configurado. Verifique o e-mail!';
  ELSE
    RAISE NOTICE 'Super admin configurado com sucesso!';
  END IF;
END $$;

COMMENT ON TABLE public.waitlist IS 'Lista de espera de usuários aguardando aprovação';
COMMENT ON TABLE public.usage_metrics IS 'Métricas de uso da aplicação';
COMMENT ON TABLE public.admin_audit_logs IS 'Logs de auditoria de ações administrativas';
