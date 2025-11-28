-- ============================================
-- MIGRAÇÃO: Expansão de Audit Logs
-- Data: 2025-11-25
-- Descrição: Expande sistema de auditoria para cobrir todas operações administrativas
-- ============================================

-- 1. Adicionar novos tipos de ação ao audit log
COMMENT ON TABLE public.admin_audit_logs IS 'Logs de auditoria de ações administrativas e sensíveis';

-- 2. Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 3. Função helper para criar audit logs
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

-- 4. Trigger para auditar mudanças de role em family_members
CREATE OR REPLACE FUNCTION public.audit_family_member_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas auditar se o role mudou
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

-- 5. Trigger para auditar mudanças de access_status em users
CREATE OR REPLACE FUNCTION public.audit_user_access_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Auditar mudanças de access_status ou user_type
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

-- 6. Política de retenção de audit logs (manter por 2 anos)
COMMENT ON COLUMN public.admin_audit_logs.created_at IS 'Data de criação do log. Logs devem ser mantidos por no mínimo 2 anos.';

-- 7. Função para limpar logs antigos (executar manualmente ou via cron)
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

COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Remove audit logs mais antigos que o período de retenção (padrão: 730 dias / 2 anos)';
