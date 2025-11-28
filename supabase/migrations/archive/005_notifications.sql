-- ====================================
-- NOTIFICATIONS SYSTEM
-- ====================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- transaction, budget, goal, family, system
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  metadata JSONB, -- dados extras específicos por tipo
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their notifications
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their notifications
CREATE POLICY "Users can delete their notifications"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ====================================
-- NOTIFICATION TRIGGERS
-- ====================================

-- Trigger: Nova transação via chat
CREATE OR REPLACE FUNCTION notify_transaction_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source = 'chat' THEN
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
      NEW.user_id,
      'transaction',
      'Nova transação registrada',
      CASE
        WHEN NEW.type = 'expense' THEN
          'Despesa de R$ ' || TO_CHAR(NEW.amount, 'FM999G999D00') || ' registrada'
        ELSE
          'Receita de R$ ' || TO_CHAR(NEW.amount, 'FM999G999D00') || ' registrada'
      END,
      '/transactions',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'type', NEW.type
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_created_notification
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction_created();

-- Trigger: Meta completada
CREATE OR REPLACE FUNCTION notify_goal_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND
     (OLD.current_amount < OLD.target_amount OR NOT OLD.is_completed) AND
     NOT NEW.is_completed THEN

    -- Marcar meta como completada
    UPDATE goals
    SET is_completed = true, completed_at = NOW()
    WHERE id = NEW.id;

    -- Criar notificação
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
      COALESCE(NEW.user_id, (
        SELECT id FROM users WHERE family_id = NEW.family_id LIMIT 1
      )),
      'goal',
      'Meta alcançada! 🎉',
      'Parabéns! Você completou a meta: ' || NEW.name,
      '/goals',
      jsonb_build_object(
        'goal_id', NEW.id,
        'goal_name', NEW.name,
        'target_amount', NEW.target_amount
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_completed_notification
  AFTER UPDATE ON goals
  FOR EACH ROW
  WHEN (NEW.current_amount >= NEW.target_amount)
  EXECUTE FUNCTION notify_goal_completed();

-- Trigger: Budget threshold alert
CREATE OR REPLACE FUNCTION check_budget_threshold()
RETURNS TRIGGER AS $$
DECLARE
  budget_record RECORD;
  spent DECIMAL;
  percentage INTEGER;
BEGIN
  -- Buscar todos os budgets ativos da família e categoria
  FOR budget_record IN
    SELECT b.id, b.family_id, b.name, b.amount, b.alert_threshold, b.category_id
    FROM budgets b
    WHERE b.family_id = NEW.family_id
      AND b.category_id = NEW.category_id
      AND b.is_active = true
      AND NEW.type = 'expense'
  LOOP
    -- Calcular gasto total no período
    SELECT COALESCE(SUM(amount), 0) INTO spent
    FROM transactions
    WHERE family_id = budget_record.family_id
      AND category_id = budget_record.category_id
      AND type = 'expense'
      AND date >= budget_record.start_date
      AND (budget_record.end_date IS NULL OR date <= budget_record.end_date);

    percentage := ((spent / budget_record.amount) * 100)::INTEGER;

    -- Se atingiu o threshold, notificar usuário
    IF percentage >= budget_record.alert_threshold THEN
      -- Verificar se já não existe notificação recente (últimas 24h)
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = NEW.user_id
          AND type = 'budget'
          AND metadata->>'budget_id' = budget_record.id::text
          AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
        VALUES (
          NEW.user_id,
          'budget',
          'Orçamento atingindo limite ⚠️',
          'Você já gastou ' || percentage || '% do orçamento de ' || budget_record.name,
          '/budgets',
          jsonb_build_object(
            'budget_id', budget_record.id,
            'percentage', percentage,
            'spent', spent,
            'budget_amount', budget_record.amount
          )
        );
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_threshold_check
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  WHEN (NEW.type = 'expense')
  EXECUTE FUNCTION check_budget_threshold();

-- Trigger: Family member accepted invitation
CREATE OR REPLACE FUNCTION notify_invitation_accepted()
RETURNS TRIGGER AS $$
DECLARE
  inviter_id UUID;
  new_member_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Buscar quem convidou
    inviter_id := NEW.invited_by;

    -- Buscar nome do novo membro
    SELECT name INTO new_member_name
    FROM users
    WHERE email = NEW.email;

    -- Notificar quem convidou
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
      inviter_id,
      'family',
      'Convite aceito!',
      COALESCE(new_member_name, NEW.email) || ' aceitou seu convite e entrou na família!',
      '/family',
      jsonb_build_object(
        'invite_id', NEW.id,
        'new_member_email', NEW.email
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitation_accepted_notification
  AFTER UPDATE ON family_invites
  FOR EACH ROW
  WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
  EXECUTE FUNCTION notify_invitation_accepted();
