-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- FAMÍLIAS E USUÁRIOS
-- ====================================

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'individual', 'familiar', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'dependent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_family ON users(family_id);
CREATE INDEX idx_users_email ON users(email);

-- ====================================
-- CATEGORIAS
-- ====================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  is_default BOOLEAN DEFAULT false,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type, family_id)
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- Índices
CREATE INDEX idx_categories_family ON categories(family_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- ====================================
-- TRANSAÇÕES
-- ====================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,

  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,

  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurring_config JSONB,
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,

  -- Metadados
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('chat', 'ocr', 'manual', 'import', 'email', 'recurring')),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_suggested_category UUID REFERENCES categories(id),
  user_confirmed BOOLEAN DEFAULT true,

  -- Anexos
  receipt_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_family_date ON transactions(family_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_recurring ON transactions(is_recurring) WHERE is_recurring = true;

-- ====================================
-- ORÇAMENTOS
-- ====================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),

  start_date DATE NOT NULL,
  end_date DATE,

  alert_threshold DECIMAL(3, 2) DEFAULT 0.80 CHECK (alert_threshold >= 0 AND alert_threshold <= 1),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(family_id, category_id, period, start_date)
);

-- Índices
CREATE INDEX idx_budgets_family ON budgets(family_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);

-- ====================================
-- METAS FINANCEIRAS
-- ====================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),

  deadline DATE,
  category VARCHAR(100),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_family ON goals(family_id);
CREATE INDEX idx_goals_status ON goals(status);

-- ====================================
-- HISTÓRICO DE CONVERSAS (CHAT)
-- ====================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadados da ação realizada
  action_type VARCHAR(50),
  action_metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chat_family_date ON chat_messages(family_id, created_at DESC);
CREATE INDEX idx_chat_user ON chat_messages(user_id);

-- ====================================
-- INSIGHTS E SUGESTÕES
-- ====================================

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN ('alert', 'suggestion', 'pattern', 'achievement')),
  title VARCHAR(255) NOT NULL,
  description TEXT,

  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Ação sugerida
  action_label VARCHAR(100),
  action_data JSONB,

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  valid_until DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_insights_family_date ON insights(family_id, created_at DESC);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_unread ON insights(family_id, is_read) WHERE is_read = false;

-- ====================================
-- NOTIFICAÇÕES E EMAILS
-- ====================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,

  is_read BOOLEAN DEFAULT false,

  -- Email
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_date ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ====================================
-- CONFIGURAÇÕES DA FAMÍLIA
-- ====================================

CREATE TABLE family_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE UNIQUE,

  -- Preferências de email
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day VARCHAR(10) DEFAULT 'monday',
  monthly_report_enabled BOOLEAN DEFAULT true,
  monthly_report_day INTEGER DEFAULT 1 CHECK (monthly_report_day >= 1 AND monthly_report_day <= 28),

  -- Preferências de notificações
  budget_alerts_enabled BOOLEAN DEFAULT true,
  goal_alerts_enabled BOOLEAN DEFAULT true,
  insights_enabled BOOLEAN DEFAULT true,

  -- Timezone
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Moeda
  currency VARCHAR(3) DEFAULT 'BRL',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_family_settings_family ON family_settings(family_id);

-- ====================================
-- TRIGGERS PARA UPDATED_AT
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_settings_updated_at BEFORE UPDATE ON family_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- FUNÇÃO PARA CRIAR CONFIGURAÇÕES PADRÃO
-- ====================================

CREATE OR REPLACE FUNCTION create_default_family_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO family_settings (family_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_family_settings_trigger
  AFTER INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION create_default_family_settings();
