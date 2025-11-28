-- ============================================
-- SCRIPT COMPLETO DE MIGRAÇÕES DE SEGURANÇA
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- ============================================

-- MIGRAÇÃO 1: Expansão de Audit Logs
-- ============================================

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Função helper para criar audit logs
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_admin_id UUID,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, p_action, p_target_user_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditar mudanças de role em family_members
CREATE OR REPLACE FUNCTION public.audit_family_member_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
    VALUES (
      auth.uid(),
      'family_member_role_changed',
      NEW.user_id,
      jsonb_build_object(
        'family_id', NEW.family_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'member_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_family_member_role_change_trigger ON public.family_members;
CREATE TRIGGER audit_family_member_role_change_trigger
  AFTER UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_family_member_role_change();

-- Trigger para auditar mudanças de access_status em users
CREATE OR REPLACE FUNCTION public.audit_user_access_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND (
    OLD.access_status IS DISTINCT FROM NEW.access_status OR
    OLD.user_type IS DISTINCT FROM NEW.user_type
  )) THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, details)
    VALUES (
      COALESCE(auth.uid(), NEW.approved_by),
      'user_access_changed',
      NEW.id,
      jsonb_build_object(
        'old_access_status', OLD.access_status,
        'new_access_status', NEW.access_status,
        'old_user_type', OLD.user_type,
        'new_user_type', NEW.user_type,
        'email', NEW.email
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_user_access_change_trigger ON public.users;
CREATE TRIGGER audit_user_access_change_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_access_change();

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_days INTEGER DEFAULT 730)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MIGRAÇÃO 2: Remoção de Email Hardcoded
-- ============================================

-- Criar tabela de configuração
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política de acesso
CREATE POLICY "Super admins can view system config" ON public.system_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

-- Função para configurar super admin
CREATE OR REPLACE FUNCTION public.setup_super_admin(admin_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_exists BOOLEAN;
BEGIN
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE EXCEPTION 'Email do super admin não pode estar vazio';
  END IF;
  
  UPDATE public.users 
  SET 
    user_type = 'super_admin', 
    access_status = 'active',
    approved_at = NOW()
  WHERE email = admin_email;
  
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = admin_email AND user_type = 'super_admin'
  ) INTO v_user_exists;
  
  IF v_user_exists THEN
    INSERT INTO public.system_config (key, value, description)
    VALUES ('super_admin_email', admin_email, 'Email do super administrador')
    ON CONFLICT (key) DO UPDATE SET value = admin_email, updated_at = NOW();
    
    RAISE NOTICE 'Super admin configurado com sucesso: %', admin_email;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Usuário com email % ainda não existe. Será configurado no primeiro login.', admin_email;
    
    INSERT INTO public.system_config (key, value, description)
    VALUES ('super_admin_email', admin_email, 'Email do super administrador')
    ON CONFLICT (key) DO UPDATE SET value = admin_email, updated_at = NOW();
    
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função de verificação de acesso
CREATE OR REPLACE FUNCTION public.check_user_access_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_super_admin_email TEXT;
BEGIN
  SELECT value INTO v_super_admin_email
  FROM public.system_config
  WHERE key = 'super_admin_email';
  
  IF v_super_admin_email IS NOT NULL AND NEW.email = v_super_admin_email THEN
    NEW.user_type := 'super_admin';
    NEW.access_status := 'active';
    NEW.approved_at := NOW();
    RETURN NEW;
  END IF;
  
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

-- Melhorar política de inserção de métricas
DROP POLICY IF EXISTS "System can insert metrics" ON public.usage_metrics;

CREATE POLICY "Users can insert their own metrics" ON public.usage_metrics
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- ============================================
-- CONFIGURAR SUPER ADMIN
-- ============================================

-- Execute esta linha para configurar seu email como super admin
SELECT public.setup_super_admin('gabrielgomesdevbr@gmail.com');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se o super admin foi configurado
SELECT 
  email,
  user_type,
  access_status,
  approved_at
FROM public.users
WHERE email = 'gabrielgomesdevbr@gmail.com';

-- Verificar configuração do sistema
SELECT * FROM public.system_config WHERE key = 'super_admin_email';
