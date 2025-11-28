-- ====================================
-- FAMILY INVITES
-- ====================================

CREATE TABLE family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_family_invites_family ON family_invites(family_id);
CREATE INDEX idx_family_invites_email ON family_invites(email);
CREATE INDEX idx_family_invites_token ON family_invites(token);
CREATE INDEX idx_family_invites_status ON family_invites(status);

-- RLS Policies
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites for their family
CREATE POLICY "Users can view invites for their family"
  ON family_invites
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins can create invites for their family
CREATE POLICY "Admins can create invites for their family"
  ON family_invites
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update invites for their family
CREATE POLICY "Admins can update invites for their family"
  ON family_invites
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete invites for their family
CREATE POLICY "Admins can delete invites for their family"
  ON family_invites
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
