-- ============================================
-- GOALS TABLE - Sistema de Metas Financeiras
-- ============================================

-- Criar tabela de metas
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados da meta
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(10, 2) DEFAULT 0 CHECK (current_amount >= 0),

  -- Prazo
  deadline DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_current_amount CHECK (current_amount <= target_amount OR status = 'completed')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON goals(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Trigger para marcar meta como concluída automaticamente
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se atingiu o target_amount e ainda está active
  IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_auto_complete
  BEFORE UPDATE ON goals
  FOR EACH ROW
  WHEN (NEW.current_amount <> OLD.current_amount)
  EXECUTE FUNCTION check_goal_completion();

-- ============================================
-- GOAL DEPOSITS TABLE - Histórico de Depósitos
-- ============================================

CREATE TABLE IF NOT EXISTS goal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do depósito
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  note TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_goal_deposits_goal_id ON goal_deposits(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_deposits_user_id ON goal_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_deposits_created_at ON goal_deposits(created_at);

-- Trigger para atualizar current_amount da meta ao adicionar depósito
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar current_amount da meta
  UPDATE goals
  SET current_amount = current_amount + NEW.amount
  WHERE id = NEW.goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_deposit_increment
  AFTER INSERT ON goal_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_current_amount();

-- Trigger para reverter current_amount se depósito for deletado
CREATE OR REPLACE FUNCTION revert_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrementar current_amount da meta
  UPDATE goals
  SET current_amount = GREATEST(current_amount - OLD.amount, 0)
  WHERE id = OLD.goal_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_deposit_decrement
  AFTER DELETE ON goal_deposits
  FOR EACH ROW
  EXECUTE FUNCTION revert_goal_current_amount();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_deposits ENABLE ROW LEVEL SECURITY;

-- GOALS POLICIES

-- Policy: Usuários podem ver metas da própria família
CREATE POLICY "Users can view goals from their family"
  ON goals
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuários podem criar metas para sua família
CREATE POLICY "Users can create goals for their family"
  ON goals
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- Policy: Usuários podem atualizar suas próprias metas
CREATE POLICY "Users can update their own goals"
  ON goals
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Usuários podem deletar suas próprias metas
CREATE POLICY "Users can delete their own goals"
  ON goals
  FOR DELETE
  USING (user_id = auth.uid());

-- GOAL DEPOSITS POLICIES

-- Policy: Usuários podem ver depósitos de metas da própria família
CREATE POLICY "Users can view goal deposits from their family"
  ON goal_deposits
  FOR SELECT
  USING (
    goal_id IN (
      SELECT id
      FROM goals
      WHERE family_id IN (
        SELECT family_id
        FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Usuários podem criar depósitos em metas da própria família
CREATE POLICY "Users can create goal deposits for their family"
  ON goal_deposits
  FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id
      FROM goals
      WHERE family_id IN (
        SELECT family_id
        FROM family_members
        WHERE user_id = auth.uid()
      )
    ) AND user_id = auth.uid()
  );

-- Policy: Usuários podem deletar seus próprios depósitos
CREATE POLICY "Users can delete their own deposits"
  ON goal_deposits
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- VIEW: Goal Progress (Progresso das Metas)
-- ============================================

CREATE OR REPLACE VIEW goal_progress AS
SELECT
  g.id AS goal_id,
  g.family_id,
  g.user_id,
  g.name,
  g.description,
  g.target_amount,
  g.current_amount,
  g.deadline,
  g.status,

  -- Calcular percentual de progresso
  CASE
    WHEN g.target_amount > 0 THEN
      ROUND((g.current_amount / g.target_amount) * 100, 2)
    ELSE 0
  END AS percentage,

  -- Valor restante para atingir a meta
  GREATEST(g.target_amount - g.current_amount, 0) AS remaining_amount,

  -- Dias restantes até o deadline
  CASE
    WHEN g.deadline IS NOT NULL THEN
      g.deadline - CURRENT_DATE
    ELSE NULL
  END AS days_remaining,

  -- Total de depósitos realizados
  COALESCE(
    (SELECT COUNT(*)
     FROM goal_deposits
     WHERE goal_id = g.id
    ),
    0
  ) AS total_deposits,

  -- Último depósito
  (SELECT MAX(created_at)
   FROM goal_deposits
   WHERE goal_id = g.id
  ) AS last_deposit_date,

  g.created_at,
  g.updated_at,
  g.completed_at

FROM goals g;

-- Grant permissions na view
GRANT SELECT ON goal_progress TO authenticated;

-- Comentários
COMMENT ON TABLE goals IS 'Metas financeiras dos usuários';
COMMENT ON TABLE goal_deposits IS 'Histórico de depósitos nas metas';
COMMENT ON COLUMN goals.status IS 'Status: active, completed, cancelled';
COMMENT ON VIEW goal_progress IS 'View com progresso detalhado das metas incluindo percentuais e depósitos';
