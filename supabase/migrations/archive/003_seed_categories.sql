-- ====================================
-- SEED: CATEGORIAS PADRÃO DE DESPESAS
-- ====================================

-- Alimentação
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Alimentação', '🍔', '#F59E0B', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Mercado', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true)),
  ('Restaurante', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true)),
  ('Delivery', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true)),
  ('Padaria', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true)),
  ('Lanchonete', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true)),
  ('Café', (SELECT id FROM categories WHERE name = 'Alimentação' AND is_default = true));

-- Transporte
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Transporte', '🚗', '#3B82F6', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Combustível', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Uber/App', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Táxi', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Ônibus', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Metrô', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Estacionamento', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('Manutenção', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true)),
  ('IPVA', (SELECT id FROM categories WHERE name = 'Transporte' AND is_default = true));

-- Moradia
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Moradia', '🏠', '#8B5CF6', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Aluguel', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Condomínio', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Água', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Luz', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Gás', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Internet', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Telefone', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('IPTU', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Manutenção', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true)),
  ('Móveis', (SELECT id FROM categories WHERE name = 'Moradia' AND is_default = true));

-- Saúde
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Saúde', '💊', '#EF4444', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Plano de Saúde', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Médico', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Dentista', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Farmácia', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Exames', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Academia', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true)),
  ('Terapia', (SELECT id FROM categories WHERE name = 'Saúde' AND is_default = true));

-- Educação
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Educação', '📚', '#10B981', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Escola', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true)),
  ('Faculdade', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true)),
  ('Curso', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true)),
  ('Material Escolar', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true)),
  ('Livros', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true)),
  ('Idiomas', (SELECT id FROM categories WHERE name = 'Educação' AND is_default = true));

-- Lazer
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Lazer', '🎮', '#EC4899', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Cinema', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Teatro', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Show', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Viagem', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Assinaturas', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Streaming', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Games', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Hobbies', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true)),
  ('Bar/Balada', (SELECT id FROM categories WHERE name = 'Lazer' AND is_default = true));

-- Compras
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Compras', '🛍️', '#F97316', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Roupas', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Calçados', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Acessórios', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Eletrônicos', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Presentes', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Beleza', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true)),
  ('Cuidados Pessoais', (SELECT id FROM categories WHERE name = 'Compras' AND is_default = true));

-- Pets
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Pets', '🐾', '#14B8A6', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Veterinário', (SELECT id FROM categories WHERE name = 'Pets' AND is_default = true)),
  ('Ração', (SELECT id FROM categories WHERE name = 'Pets' AND is_default = true)),
  ('Pet Shop', (SELECT id FROM categories WHERE name = 'Pets' AND is_default = true)),
  ('Banho e Tosa', (SELECT id FROM categories WHERE name = 'Pets' AND is_default = true));

-- Seguros
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Seguros', '🛡️', '#6366F1', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Seguro Auto', (SELECT id FROM categories WHERE name = 'Seguros' AND is_default = true)),
  ('Seguro Residencial', (SELECT id FROM categories WHERE name = 'Seguros' AND is_default = true)),
  ('Seguro Vida', (SELECT id FROM categories WHERE name = 'Seguros' AND is_default = true));

-- Impostos e Taxas
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Impostos e Taxas', '📋', '#78716C', 'expense', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Imposto de Renda', (SELECT id FROM categories WHERE name = 'Impostos e Taxas' AND is_default = true)),
  ('Taxa Bancária', (SELECT id FROM categories WHERE name = 'Impostos e Taxas' AND is_default = true)),
  ('Cartório', (SELECT id FROM categories WHERE name = 'Impostos e Taxas' AND is_default = true)),
  ('Multas', (SELECT id FROM categories WHERE name = 'Impostos e Taxas' AND is_default = true));

-- Outros
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Outros', '📦', '#94A3B8', 'expense', true, NULL);

-- ====================================
-- SEED: CATEGORIAS PADRÃO DE RECEITAS
-- ====================================

-- Salário
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Salário', '💰', '#10B981', 'income', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Salário Principal', (SELECT id FROM categories WHERE name = 'Salário' AND type = 'income' AND is_default = true)),
  ('13º Salário', (SELECT id FROM categories WHERE name = 'Salário' AND type = 'income' AND is_default = true)),
  ('Férias', (SELECT id FROM categories WHERE name = 'Salário' AND type = 'income' AND is_default = true)),
  ('Bonificação', (SELECT id FROM categories WHERE name = 'Salário' AND type = 'income' AND is_default = true)),
  ('Comissão', (SELECT id FROM categories WHERE name = 'Salário' AND type = 'income' AND is_default = true));

-- Freelance
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Freelance', '💼', '#3B82F6', 'income', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Projeto', (SELECT id FROM categories WHERE name = 'Freelance' AND type = 'income' AND is_default = true)),
  ('Consultoria', (SELECT id FROM categories WHERE name = 'Freelance' AND type = 'income' AND is_default = true)),
  ('Bico', (SELECT id FROM categories WHERE name = 'Freelance' AND type = 'income' AND is_default = true));

-- Investimentos
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Investimentos', '📈', '#8B5CF6', 'income', true, NULL);

INSERT INTO subcategories (name, category_id) VALUES
  ('Dividendos', (SELECT id FROM categories WHERE name = 'Investimentos' AND type = 'income' AND is_default = true)),
  ('Juros', (SELECT id FROM categories WHERE name = 'Investimentos' AND type = 'income' AND is_default = true)),
  ('Rendimentos', (SELECT id FROM categories WHERE name = 'Investimentos' AND type = 'income' AND is_default = true)),
  ('Venda de Ativos', (SELECT id FROM categories WHERE name = 'Investimentos' AND type = 'income' AND is_default = true));

-- Aluguéis
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Aluguéis', '🏘️', '#F59E0B', 'income', true, NULL);

-- Presentes e Doações
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Presentes e Doações', '🎁', '#EC4899', 'income', true, NULL);

-- Reembolsos
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Reembolsos', '↩️', '#06B6D4', 'income', true, NULL);

-- Outros
INSERT INTO categories (name, icon, color, type, is_default, family_id) VALUES
  ('Outros', '📦', '#94A3B8', 'income', true, NULL);
