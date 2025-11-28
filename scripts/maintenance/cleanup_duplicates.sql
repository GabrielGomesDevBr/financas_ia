-- Script para limpar transações duplicadas criadas durante testes
-- Execute este script APENAS UMA VEZ no SQL Editor do Supabase

-- 1. Identificar e manter apenas a transação mais antiga de cada duplicata
-- (Mantém a primeira ocorrência, remove duplicatas posteriores)

WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY family_id, amount, description, date, source
      ORDER BY created_at ASC  -- Mantém a primeira (mais antiga)
    ) as row_num
  FROM transactions
  WHERE
    source = 'chat'
    AND family_id = 'afaaeb84-2cbb-4611-bfff-6fb3ffd59a5e'
)
DELETE FROM transactions
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE row_num > 1
);

-- 2. Verificar resultado: contar quantas transações sobraram
SELECT
  description,
  amount,
  date,
  COUNT(*) as quantidade
FROM transactions
WHERE
  source = 'chat'
  AND family_id = 'afaaeb84-2cbb-4611-bfff-6fb3ffd59a5e'
GROUP BY description, amount, date
ORDER BY date DESC, created_at DESC;

-- Se ainda houver duplicatas (quantidade > 1), rodar o primeiro comando novamente
