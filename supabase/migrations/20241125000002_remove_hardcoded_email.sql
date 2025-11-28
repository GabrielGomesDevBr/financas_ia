-- ============================================
-- MIGRAÇÃO: Atualização de Controle de Acesso
-- Data: 2025-11-25
-- Descrição: Remove email hardcoded e melhora políticas de segurança
-- ============================================

-- 1. Criar tabela de configuração para super admin
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS na tabela de configuração
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- 3. Apenas super admins podem ler configurações
CREATE POLICY "Super admins can view system config" ON public.system_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'super_admin'
    )
  );

-- 4. Função para configurar super admin via variável de ambiente
-- Esta função deve ser chamada após deploy com a variável SUPER_ADMIN_EMAIL configurada
CREATE OR REPLACE FUNCTION public.setup_super_admin(admin_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_exists BOOLEAN;
BEGIN
  -- Verificar se o email foi fornecido
  IF admin_email IS NULL OR admin_email = '' THEN
    RAISE EXCEPTION 'Email do super admin não pode estar vazio';
  END IF;
  
  -- Atualizar usuário existente
  UPDATE public.users 
  SET 
    user_type = 'super_admin', 
    access_status = 'active',
    approved_at = NOW()
  WHERE email = admin_email;
  
  -- Verificar se foi atualizado
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = admin_email AND user_type = 'super_admin'
  ) INTO v_user_exists;
  
  IF v_user_exists THEN
    -- Salvar na configuração
    INSERT INTO public.system_config (key, value, description)
    VALUES ('super_admin_email', admin_email, 'Email do super administrador')
    ON CONFLICT (key) DO UPDATE SET value = admin_email, updated_at = NOW();
    
    RAISE NOTICE 'Super admin configurado com sucesso: %', admin_email;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Usuário com email % ainda não existe. Será configurado no primeiro login.', admin_email;
    
    -- Salvar na configuração para aplicar no primeiro login
    INSERT INTO public.system_config (key, value, description)
    VALUES ('super_admin_email', admin_email, 'Email do super administrador')
    ON CONFLICT (key) DO UPDATE SET value = admin_email, updated_at = NOW();
    
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Atualizar função de verificação de acesso no signup
CREATE OR REPLACE FUNCTION public.check_user_access_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_super_admin_email TEXT;
BEGIN
  -- Buscar email do super admin da configuração
  SELECT value INTO v_super_admin_email
  FROM public.system_config
  WHERE key = 'super_admin_email';
  
  -- Se for o super admin, configurar automaticamente
  IF v_super_admin_email IS NOT NULL AND NEW.email = v_super_admin_email THEN
    NEW.user_type := 'super_admin';
    NEW.access_status := 'active';
    NEW.approved_at := NOW();
    RETURN NEW;
  END IF;
  
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

-- 6. Melhorar política de inserção de métricas
-- Remover política antiga muito permissiva
DROP POLICY IF EXISTS "System can insert metrics" ON public.usage_metrics;

-- Nova política: apenas usuários autenticados podem inserir suas próprias métricas
CREATE POLICY "Users can insert their own metrics" ON public.usage_metrics
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- 7. Comentários e documentação
COMMENT ON FUNCTION public.setup_super_admin IS 'Configura o super administrador usando email da variável de ambiente. Deve ser chamado após deploy.';
COMMENT ON TABLE public.system_config IS 'Configurações do sistema (apenas super admins podem visualizar)';

-- 8. Nota: O email hardcoded foi removido
-- Para configurar o super admin, execute após deploy:
-- SELECT public.setup_super_admin('seu-email@exemplo.com');
-- Ou configure via variável de ambiente SUPER_ADMIN_EMAIL e chame a função no startup
