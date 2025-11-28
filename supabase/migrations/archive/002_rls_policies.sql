-- ====================================
-- HABILITAR ROW LEVEL SECURITY
-- ====================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLICIES: FAMILIES
-- ====================================

-- Usuários podem ver a própria família
CREATE POLICY "Users can view their own family"
  ON families FOR SELECT
  USING (
    id IN (SELECT family_id FROM users WHERE id = auth.uid())
  );

-- Apenas admins podem atualizar a família
CREATE POLICY "Admins can update their family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem criar famílias
CREATE POLICY "Users can create families"
  ON families FOR INSERT
  WITH CHECK (true);

-- ====================================
-- POLICIES: USERS
-- ====================================

-- Usuários podem ver membros da própria família
CREATE POLICY "Users can view family members"
  ON users FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
    OR id = auth.uid()
  );

-- Usuários podem atualizar o próprio perfil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins podem atualizar membros da família
CREATE POLICY "Admins can update family members"
  ON users FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem se inserir
CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ====================================
-- POLICIES: CATEGORIES
-- ====================================

-- Todos podem ver categorias padrão e da própria família
CREATE POLICY "Users can view default and family categories"
  ON categories FOR SELECT
  USING (
    is_default = true
    OR family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins e members podem criar categorias customizadas
CREATE POLICY "Members can create family categories"
  ON categories FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem atualizar categorias da família
CREATE POLICY "Members can update family categories"
  ON categories FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem deletar categorias da família
CREATE POLICY "Members can delete family categories"
  ON categories FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- ====================================
-- POLICIES: SUBCATEGORIES
-- ====================================

-- Todos podem ver subcategorias
CREATE POLICY "Users can view subcategories"
  ON subcategories FOR SELECT
  USING (
    category_id IN (
      SELECT id FROM categories
      WHERE is_default = true
        OR family_id IN (
          SELECT family_id FROM users WHERE id = auth.uid()
        )
    )
  );

-- Members podem criar subcategorias
CREATE POLICY "Members can create subcategories"
  ON subcategories FOR INSERT
  WITH CHECK (
    category_id IN (
      SELECT id FROM categories
      WHERE family_id IN (
        SELECT family_id FROM users
        WHERE id = auth.uid() AND role IN ('admin', 'member')
      )
    )
  );

-- ====================================
-- POLICIES: TRANSACTIONS
-- ====================================

-- Usuários podem ver transações da família
-- Dependents só veem as próprias
CREATE POLICY "Users can view family transactions"
  ON transactions FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid()
        AND (
          role IN ('admin', 'member')
          OR (role = 'dependent' AND transactions.user_id = auth.uid())
        )
    )
  );

-- Usuários podem criar transações na própria família
CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Usuários podem atualizar próprias transações
-- Admins podem atualizar qualquer transação da família
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem deletar próprias transações
-- Admins podem deletar qualquer transação da família
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (
    user_id = auth.uid()
    OR family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ====================================
-- POLICIES: BUDGETS
-- ====================================

-- Todos podem ver orçamentos da família
CREATE POLICY "Users can view family budgets"
  ON budgets FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins e members podem criar orçamentos
CREATE POLICY "Members can create budgets"
  ON budgets FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem atualizar orçamentos
CREATE POLICY "Members can update budgets"
  ON budgets FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem deletar orçamentos
CREATE POLICY "Members can delete budgets"
  ON budgets FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- ====================================
-- POLICIES: GOALS
-- ====================================

-- Todos podem ver metas da família
CREATE POLICY "Users can view family goals"
  ON goals FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins e members podem criar metas
CREATE POLICY "Members can create goals"
  ON goals FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem atualizar metas
CREATE POLICY "Members can update goals"
  ON goals FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Admins e members podem deletar metas
CREATE POLICY "Members can delete goals"
  ON goals FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- ====================================
-- POLICIES: CHAT_MESSAGES
-- ====================================

-- Usuários podem ver mensagens da família
CREATE POLICY "Users can view family chat messages"
  ON chat_messages FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Usuários podem criar mensagens
CREATE POLICY "Users can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- ====================================
-- POLICIES: INSIGHTS
-- ====================================

-- Usuários podem ver insights da família
CREATE POLICY "Users can view family insights"
  ON insights FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Sistema pode criar insights (via service role)
CREATE POLICY "System can create insights"
  ON insights FOR INSERT
  WITH CHECK (true);

-- Usuários podem atualizar insights (marcar como lido/dismissed)
CREATE POLICY "Users can update family insights"
  ON insights FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- ====================================
-- POLICIES: NOTIFICATIONS
-- ====================================

-- Usuários podem ver próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Sistema pode criar notificações (via service role)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Usuários podem atualizar próprias notificações
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ====================================
-- POLICIES: FAMILY_SETTINGS
-- ====================================

-- Usuários podem ver configurações da família
CREATE POLICY "Users can view family settings"
  ON family_settings FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins podem atualizar configurações
CREATE POLICY "Admins can update family settings"
  ON family_settings FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sistema pode criar configurações (via trigger)
CREATE POLICY "System can create family settings"
  ON family_settings FOR INSERT
  WITH CHECK (true);
