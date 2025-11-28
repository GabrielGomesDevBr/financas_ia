# 🗑️ Deleção de Conta - Soft Delete com Recuperação

## Visão Geral

Sistema de deleção de conta com período de recuperação de 30 dias, compliance com GDPR/LGPD e deleção automática de TODOS os dados do usuário.

---

## 🔄 Fluxo Completo

```
1. User clica "Deletar Conta" em Settings
   ↓
2. Modal de confirmação (digitar DELETE)
   ↓
3. Sistema verifica se user é admin com membros
   ↓
4. Se sim → Sugere transferir (não obrigatório)
   ↓
5. User confirma deleção
   ↓
6. POST /api/user/delete-account
   ↓
7. Marca deleted_at = NOW()
   ↓
8. Define deletion_scheduled_at = NOW() + 30 dias
   ↓
9. Cria audit_log
   ↓
10. Sign out usuário
   ↓
11. [30 dias depois]
   ↓
12. Cron executa cleanup_expired_user_deletions()
   ↓
13. Deleção permanente de TODOS os dados
```

---

## 📋 Componentes

### 1. Database Columns (users table)

**Schema**:
```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deletion_reason TEXT;

CREATE INDEX idx_users_deletion_scheduled 
ON users(deletion_scheduled_at) 
WHERE deletion_scheduled_at IS NOT NULL;
```

**Estados**:
- Ativo: `deleted_at` = NULL
- Marcado para deleção: `deleted_at` = timestamp, `deletion_scheduled_at` = +30 dias
- Deletado: Registro não existe mais

---

### 2. Funções do Banco

#### permanently_delete_user(user_id UUID)

Deleta permanentemente usuário e **TODOS** os dados:

```sql
CREATE OR REPLACE FUNCTION permanently_delete_user(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Criar audit log ANTES de deletar
  INSERT INTO audit_logs (action, user_id, details)
  VALUES ('account_permanently_deleted', user_id, ...);
  
  -- Deletar dados do usuário
  DELETE FROM goals WHERE user_id = user_id;
  DELETE FROM chat_messages WHERE user_id = user_id;
  DELETE FROM transactions WHERE user_id = user_id;
  DELETE FROM family_invites WHERE invited_by = user_id;
  
  -- CASCADE deleta: user_settings, family_members, notifications
  DELETE FROM users WHERE id = user_id;
  
  -- Deletar auth.users (final)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**O que é deletado**:
- ✅ `goals` (user_id)
- ✅ `chat_messages` (user_id)
- ✅ `transactions` (user_id)
- ✅ `family_invites` (invited_by)
- ✅ `users` → CASCADE para:
  - `user_settings`
  - `family_members`
  - `notifications`
- ✅ `auth.users` (final)

---

#### cleanup_expired_user_deletions()

Auto-cleanup de contas expiradas (>30 dias):

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_user_deletions()
RETURNS TABLE(deleted_count INT) AS $$
DECLARE
  user_rec RECORD;
  count INT := 0;
BEGIN
  FOR user_rec IN
    SELECT id FROM users
    WHERE deletion_scheduled_at IS NOT NULL
      AND deletion_scheduled_at <= NOW()
  LOOP
    PERFORM permanently_delete_user(user_rec.id);
    count := count + 1;
  END LOOP;
  
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Uso via Cron**:
```sql
SELECT * FROM cleanup_expired_user_deletions();
-- Returns: { deleted_count: 2 }
```

---

### 3. APIs

#### DELETE /api/user/delete-account
Marca conta para deleção (soft delete).

**Request**: (vazio)

**Response**:
```json
{
  "success": true,
  "deletion_date": "2024-12-28T10:00:00Z",
  "is_admin_with_members": false,
  "days_until_deletion": 30
}
```

**Validações**:
- ✅ Usuário autenticado
- ✅ Conta não está marcada para deleção
- ⚠️ Se admin com membros → `is_admin_with_members: true` (aviso, não bloqueia)

**Ações**:
1. Marca `deleted_at` = NOW()
2. Define `deletion_scheduled_at` = NOW() + 30 dias
3. Salva `deletion_reason` (opcional)
4. Cria audit_log
5. **Sign out automático**
6. Retorna data de deleção

**Comportamento Admin**:
- Se user é admin E tem outros membros na família
- Retorna `is_admin_with_members: true`
- **NÃO bloqueia** deleção (apenas sugere transferir)
- Admin pode deletar mesmo assim

---

#### POST /api/user/delete-account
Reativa conta (dentro do período de 30 dias).

**Request**: (vazio)

**Response**:
```json
{
  "success": true,
  "message": "Conta reativada com sucesso"
}
```

**Validações**:
- ✅ Usuário autenticado
- ✅ Conta está marcada (`deleted_at` NOT NULL)
- ✅ Ainda no período de 30 dias (`deletion_scheduled_at` > NOW())

**Ações**:
1. Remove `deleted_at` (= NULL)
2. Remove `deletion_scheduled_at` (= NULL)
3. Cria audit_log de reativação
4. Retorna sucesso

**Depois de 30 dias**:
- Conta já foi deletada permanentemente
- POST retorna 404 "User not found"
- Impossível recuperar

---

#### POST /api/cron/cleanup-deleted-users
Endpoint manual para executar auto-cleanup.

**Headers**:
```
Authorization: Bearer <CRON_SECRET>
```

**Response**:
```json
{
  "success": true,
  "deleted_count": 2,
  "timestamp": "2024-11-28T10:00:00Z"
}
```

**Autenticação**:
- Header `Authorization: Bearer <CRON_SECRET>`
- CRON_SECRET definido no .env
- Sem secret → 401 Unauthorized

**GET /api/cron/cleanup-deleted-users** (status):
```json
{
  "pending_deletions": 3,
  "ready_for_deletion": 1,
  "accounts": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "scheduled_for": "2024-11-30T10:00:00Z",
      "days_remaining": 2
    }
  ]
}
```

---

### 4. UI (Settings Page)

**Localização**: `/src/app/(dashboard)/settings/page.tsx`

**Seção**: "Zona de Perigo" (Danger Zone)

**Componentes**:
1. Card vermelho com ícone AlertTriangle
2. Título "Deletar Conta"
3. Descrição do período de 30 dias
4. Lista do que será deletado:
   - Remover da família
   - Transações
   - Metas e orçamentos
   - Conversas com assistente
5. Botão "Deletar Minha Conta"

**Modal de Confirmação**:
- Header com ícone de alerta
- Info: "Conta será desativada por 30 dias"
- Input: Digitar "DELETE" para confirmar
- Validação: botão disabled até digitar corretamente
- Botões: Cancelar | Deletar Conta
- Loading state durante requisição

---

### 5. Cron Job Setup

#### Opção 1: GitHub Actions

`.github/workflows/cleanup-users.yml`:
```yaml
name: Cleanup Deleted Users
on:
  schedule:
    - cron: '0 2 * * *' # 2 AM UTC daily

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cleanup Endpoint
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.vercel.app/api/cron/cleanup-deleted-users
```

#### Opção 2: Vercel Cron

`vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-deleted-users",
    "schedule": "0 2 * * *"
  }]
}
```

Note: Vercel Cron requer Pro plan

#### Opção 3: Serviço Externo

- cron-job.org
- EasyCron
- etc.

Configure para chamar:
```
POST https://your-domain.vercel.app/api/cron/cleanup-deleted-users
Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

## 🔐 Segurança

1. **Double confirmation**: User precisa digitar "DELETE"
2. **Audit logs**: Toda deleção é registrada
3. **Soft delete**: 30 dias para recuperar
4. **Secure function**: SECURITY DEFINER em funções PL/pgSQL
5. **Cron auth**: Bearer token obrigatório
6. **Sign out**: User é deslogado imediatamente

---

## 📊 Compliance

### GDPR (Europa)
✅ Direito ao esquecimento (Art. 17)  
✅ Deleção completa de dados  
✅ Período de recuperação razoável  
✅ Confirmação explícita  

### LGPD (Brasil)
✅ Direito de eliminação (Art. 18, VI)  
✅ Deleção de todos os dados pessoais  
✅ Processo claro e documentado  

---

## 🐛 Troubleshooting

### "Você tem 30 dias para recuperar"
- Normal! Conta em soft delete
- Fazer login novamente dentro de 30 dias para reativar
- Verificar `deletion_scheduled_at` no database

### "Conta não encontrada" ao tentar reativar
- Já passou 30 dias
- Conta foi deletada permanentemente
- Impossível recuperar, precisa criar nova

### Cron não está executando
1. Verificar CRON_SECRET no .env
2. Verificar configuração do cron job
3. Testar manualmente: GET /api/cron/cleanup-deleted-users
4. Ver logs do cron service

### Admin quer deletar mas tem membros
- Sistema apenas SUGERE transferir admin
- Admin pode deletar mesmo assim
- Outros membros ficam sem admin (considerar implementar auto-promote)

---

## 📊 Monitoring

### Queries Úteis

**Contas marcadas para deleção**:
```sql
SELECT 
  id,
  email,
  deleted_at,
  deletion_scheduled_at,
  deletion_scheduled_at - NOW() as days_remaining
FROM users
WHERE deleted_at IS NOT NULL
ORDER BY deletion_scheduled_at;
```

**Próximas deleções (próximos 7 dias)**:
```sql
SELECT * FROM users
WHERE deletion_scheduled_at IS NOT NULL
  AND deletion_scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

**Contas prontas para deleção**:
```sql
SELECT * FROM users
WHERE deletion_scheduled_at IS NOT NULL
  AND deletion_scheduled_at <= NOW();
```

**Audit logs de deleção**:
```sql
SELECT * FROM audit_logs
WHERE action IN ('account_deleted', 'account_reactivated', 'account_permanently_deleted')
ORDER BY created_at DESC;
```

---

## 🧪 Testing

### Teste Manual - Deleção e Recuperação

```bash
# 1. Deletar conta
DELETE /api/user/delete-account

# 2. Verificar no database
SELECT deleted_at, deletion_scheduled_at FROM users WHERE id = 'user-id';

# 3. Tentar fazer login (deve funcionar)
# Login → redireciona para reativação

# 4. Reativar conta
POST /api/user/delete-account

# 5. Verificar no database
SELECT deleted_at FROM users WHERE id = 'user-id';
-- deleted_at deve ser NULL
```

### Teste Manual - Deleção Permanente

```sql
-- Simular conta expirada
UPDATE users
SET deletion_scheduled_at = NOW() - INTERVAL '1 day'
WHERE id = 'test-user-id';

-- Executar cleanup
SELECT * FROM cleanup_expired_user_deletions();

-- Verificar deleção
SELECT * FROM users WHERE id = 'test-user-id';
-- Deve retornar 0 rows

SELECT * FROM auth.users WHERE id = 'test-user-id';
-- Deve retornar 0 rows
```

---

## 📚 Referências

- [Migration 20241128000003](../supabase/migrations/20241128000003_add_soft_delete.sql) - Schema e funções
- [API Endpoint](../src/app/api/user/delete-account/route.ts) - Delete & Reativate
- [Cron Endpoint](../src/app/api/cron/cleanup-deleted-users/route.ts) - Auto-cleanup
- [Settings UI](../src/app/(dashboard)/settings/page.tsx) - Interface
- [GDPR Art. 17](https://gdpr-info.eu/art-17-gdpr/) - Right to erasure
- [LGPD Art. 18](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) - Direitos do titular
