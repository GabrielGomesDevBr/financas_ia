-- ============================================
-- BUDGETS TABLE - Sistema de Orçamentos
-- ============================================

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  -- Dados do orçamento
  limit_amount NUMERIC(10, 2) NOT NULL CHECK (limit_amount > 0),
  period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),

  -- Período específico
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Alertas
  alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold > 0 AND alert_threshold <= 100),

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT unique_budget_per_category_period UNIQUE (family_id, category_id, start_date, end_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_budgets_family_id ON budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON budgets(start_date, end_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budgets_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ler orçamentos da própria família
CREATE POLICY "Users can view budgets from their family"
  ON budgets
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuários podem criar orçamentos para sua família
CREATE POLICY "Users can create budgets for their family"
  ON budgets
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar orçamentos da própria família
CREATE POLICY "Users can update budgets from their family"
  ON budgets
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Usuários podem deletar orçamentos da própria família
CREATE POLICY "Users can delete budgets from their family"
  ON budgets
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id
      FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- VIEW: Budget Status (Gastos vs Limite)
-- ============================================

CREATE OR REPLACE VIEW budget_status AS
SELECT
  b.id AS budget_id,
  b.family_id,
  b.category_id,
  c.name AS category_name,
  b.limit_amount,
  b.period,
  b.start_date,
  b.end_date,
  b.alert_threshold,

  -- Calcular total gasto no período
  COALESCE(
    (SELECT SUM(t.amount)
     FROM transactions t
     WHERE t.family_id = b.family_id
       AND t.category_id = b.category_id
       AND t.type = 'expense'
       AND t.date >= b.start_date
       AND t.date <= b.end_date
    ),
    0
  ) AS spent_amount,

  -- Calcular percentual gasto
  CASE
    WHEN b.limit_amount > 0 THEN
      ROUND(
        (COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.family_id = b.family_id
             AND t.category_id = b.category_id
             AND t.type = 'expense'
             AND t.date >= b.start_date
             AND t.date <= b.end_date
          ),
          0
        ) / b.limit_amount) * 100,
        2
      )
    ELSE 0
  END AS percentage_used,

  -- Valor restante
  b.limit_amount - COALESCE(
    (SELECT SUM(t.amount)
     FROM transactions t
     WHERE t.family_id = b.family_id
       AND t.category_id = b.category_id
       AND t.type = 'expense'
       AND t.date >= b.start_date
       AND t.date <= b.end_date
    ),
    0
  ) AS remaining_amount,

  -- Status (dentro do orçamento, alerta, excedido)
  CASE
    WHEN COALESCE(
      (SELECT SUM(t.amount)
       FROM transactions t
       WHERE t.family_id = b.family_id
         AND t.category_id = b.category_id
         AND t.type = 'expense'
         AND t.date >= b.start_date
         AND t.date <= b.end_date
      ),
      0
    ) > b.limit_amount THEN 'exceeded'

    WHEN COALESCE(
      (SELECT SUM(t.amount)
       FROM transactions t
       WHERE t.family_id = b.family_id
         AND t.category_id = b.category_id
         AND t.type = 'expense'
         AND t.date >= b.start_date
         AND t.date <= b.end_date
      ),
      0
    ) >= (b.limit_amount * b.alert_threshold / 100) THEN 'warning'

    ELSE 'ok'
  END AS status,

  b.created_at,
  b.updated_at

FROM budgets b
JOIN categories c ON b.category_id = c.id;

-- Grant permissions na view
GRANT SELECT ON budget_status TO authenticated;

-- Comentários
COMMENT ON TABLE budgets IS 'Orçamentos definidos por categoria e período';
COMMENT ON COLUMN budgets.period IS 'Tipo de período: monthly, weekly, yearly';
COMMENT ON COLUMN budgets.alert_threshold IS 'Percentual para disparar alerta (padrão 80%)';
COMMENT ON VIEW budget_status IS 'View com status dos orçamentos incluindo gastos atuais';
