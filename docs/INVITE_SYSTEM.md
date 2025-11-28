# 📧 Sistema de Convites - Family Invites

## Visão Geral

Sistema completo para convidar membros para uma família com links seguros, validação de tokens e sincronização automática.

---

## 🔄 Fluxo Completo

```
1. Admin envia convite
   ↓
2. Convite criado no database (status: pending)
   ↓
3. Email enviado com link único
   ↓
4. Usuário clica no link
   ↓
5. Página pública mostra detalhes da família
   ↓
6. Usuário aceita convite
   ↓
7. Sistema valida token, status e expiração
   ↓
8. Atualiza users.family_id
   ↓
9. Cria family_members record (role: member)
   ↓
10. Atualiza convite (status: accepted)
   ↓
11. Redireciona para dashboard
```

---

## 📋 Componentes

### 1. Database (family_invites)

**Schema**:
```sql
CREATE TABLE family_invites (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);
```

**Status**:
- `pending` - Aguardando aceitação
- `accepted` - Aceito
- `cancelled` - Cancelado pelo admin
- `expired` - Expirado (7 dias)

---

### 2. RLS Policies (6 políticas)

```sql
-- 1. Membros da família veem convites
CREATE POLICY "Family members view invites"
  ON family_invites FOR SELECT
  USING (family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()));

-- 2. Admins criam convites
CREATE POLICY "Admins create invites"
  ON family_invites FOR INSERT
  WITH CHECK (...);

-- 3. Admins atualizam convites
CREATE POLICY "Admins update invites"
  ON family_invites FOR UPDATE
  USING (...);

-- 4. Admins deletam convites
CREATE POLICY "Admins delete invites"
  ON family_invites FOR DELETE
  USING (...);

-- 5. Ver próprio convite por email
CREATE POLICY "View own invite by email"
  ON family_invites FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 6. Público vê por token (apenas campos necessários)
CREATE POLICY "Public view by token"
  ON family_invites FOR SELECT
  USING (token IS NOT NULL);
```

---

### 3. APIs

#### POST /api/family/invite
Envia convite para novo membro.

**Request**:
```json
{
  "email": "novo@exemplo.com"
}
```

**Response**:
```json
{
  "message": "Convite enviado com sucesso",
  "invite": {
    "id": "uuid",
    "email": "novo@exemplo.com",
    "token": "abc123...",
    "expires_at": "2024-12-05T..."
  }
}
```

**Validações**:
- ✅ Usuário é admin da família
- ✅ Email não está vazio
- ✅ Email válido
- ✅ Destinatário não é membro da família
- ✅ Não há convite pending para esse email

**Ações**:
1. Gera token único (crypto.randomUUID())
2. Cria convite no database
3. Envia email com link
4. Retorna sucesso

---

#### GET /api/family/invite/[token]
Busca detalhes do convite (público, sem auth).

**Response**:
```json
{
  "invite": {
    "family_name": "Família Silva",
    "invited_by_name": "João Silva",
    "email": "novo@exemplo.com",
    "expires_at": "2024-12-05T...",
    "status": "pending"
  }
}
```

**Validações**:
- ✅ Token existe
- ✅ Status é 'pending'
- ✅ Não expirou

--- #### POST /api/family/invite/[token]
Aceita convite.

**Response**:
```json
{
  "message": "Convite aceito com sucesso",
  "family_id": "uuid"
}
```

**Validações**:
- ✅ Usuário autenticado
- ✅ Email do user = email do convite
- ✅ Token válido
- ✅ Status pending
- ✅ Não expirado
- ✅ User não pertence a outra família

**Ações**:
1. Atualiza users.family_id
2. Cria family_members (role: member)
3. Atualiza invite (status: accepted, accepted_at)
4. Retorna sucesso

---

#### POST /api/family/invite/[id]/resend
Reenvia convite com novo token.

**Request**:
```json
{}
```

**Response**:
```json
{
  "message": "Convite reenviado com sucesso"
}
```

**Validações**:
- ✅ Usuário é admin
- ✅ Convite existe
- ✅ Status pending

**Ações**:
1. Gera novo token
2. Estende expiração (+7 dias)
3. Envia novo email
4. Retorna sucesso

---

#### DELETE /api/family/invite/[id]
Cancela convite.

**Response**:
```json
{
  "message": "Convite cancelado"
}
```

---

### 4. Página Pública (/invite/[token])

**Rota**: `src/app/invite/[token]/page.tsx`

**UI**:
- Card bonito com informações da família
- Ícone de família
- Nome da família
- Quem convidou
- Email do destinatário
- Data de expiração
- Lista de benefícios
- Botão "Aceitar Convite"

**Fluxo**:
1. Carrega dados do convite via GET /api/family/invite/[token]
2. Verifica autenticação
3. Se não autenticado → redireciona para login com returnTo
4. Se autenticado → mostra botão aceitar
5. Ao aceitar → POST /api/family/invite/[token]
6. Sucesso → redireciona para /dashboard

**Estados**:
- ✅ Loading
- ✅ Válido e pending
- ❌ Não encontrado
- ❌ Expirado
- ❌ Já aceito

---

### 5. Email Template

Enviado via Resend:

```html
Olá!

Você foi convidado para participar da família [Nome] no Assistente Financeiro IA.

[Botão: Aceitar Convite]

Link: https://app.com/invite/[token]

Este convite expira em 7 dias.
```

---

## 🔐 Segurança

1. **Token único**: Crypto-secure UUID
2. **Expiração**: 7 dias automático
3. **RLS policies**: 6 políticas de acesso
4. **Validação de email**: Email do user deve = email do convite
5. **Status tracking**: Previne reuso de convites
6. **One family**: User não pode aceitar se já pertence a família

---

## 📊 Monitoring

### Queries Úteis

**Convites pendentes**:
```sql
SELECT * FROM family_invites 
WHERE status = 'pending' 
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

**Convites expirados**:
```sql
SELECT * FROM family_invites
WHERE status = 'pending'
  AND expires_at <NOW();
```

**Taxa de aceitação**:
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'accepted') * 100.0 / COUNT(*) as acceptance_rate
FROM family_invites;
```

---

## 🐛 Troubleshooting

### Erro: "Convite expirado"
- Verificar expires_at
- Admin pode reenviar convite (novo token, nova expiração)

### Erro: "Você já pertence a uma família"
- User deve sair da família atual primeiro
- Ou admin deve remover da família atual

### Erro: "Email não corresponde"
- User logado deve usar mesmo email do convite
- Verificar users.email vs invites.email

---

## 📚 Referências

- [Migration 20241128000002](../supabase/migrations/20241128000002_fix_family_invites_rls.sql) - RLS Policies
- [Resend Endpoint](../src/app/api/family/invite/[id]/resend/route.ts) - Email sending
- [Public Page](../src/app/invite/[token]/page.tsx) - UI
