# Documentação da API

## 🔌 Endpoints

Base URL: `https://seu-app.vercel.app/api`

### Autenticação

Todas as rotas (exceto públicas) requerem autenticação via cookie de sessão Supabase.

---

## 👤 User

### GET /api/user/me

Retorna dados do usuário autenticado.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome",
  "avatar_url": "https://...",
  "family_id": "uuid",
  "role": "admin",
  "access_status": "active",
  "user_type": "user"
}
```

---

## 💬 Chat

### POST /api/chat

Envia mensagem para o chat com IA.

**Request:**
```json
{
  "message": "Gastei 50 reais no mercado",
  "conversationId": "uuid",
  "familyId": "uuid"
}
```

**Response:**
```json
{
  "response": "✅ Registrado! Despesa de R$ 50,00 em Alimentação",
  "transactionId": "uuid"
}
```

**Function Calling:**

A IA pode chamar:
- `registrar_transacao` - Registra transação
- `buscar_categorias` - Lista categorias
- `consultar_saldo` - Consulta saldo

---

## 💰 Transactions

### GET /api/transactions

Lista transações da família.

**Query params:**
- `startDate` (opcional) - Data início (ISO)
- `endDate` (opcional) - Data fim (ISO)
- `type` (opcional) - income/expense

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "expense",
      "amount": 50.00,
      "description": "Mercado",
      "category": "Alimentação",
      "date": "2024-11-25",
      "source": "chat"
    }
  ]
}
```

### POST /api/transactions

Cria nova transação.

**Request:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "description": "Mercado",
  "category_id": "uuid",
  "date": "2024-11-25"
}
```

### PUT /api/transactions/[id]

Atualiza transação.

### DELETE /api/transactions/[id]

Deleta transação.

---

## 📊 Categories

### GET /api/categories

Lista categorias.

**Query params:**
- `type` (opcional) - income/expense

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Alimentação",
      "type": "expense",
      "icon": "🍔",
      "color": "#FF6B6B"
    }
  ]
}
```

---

## 👨‍👩‍👧‍👦 Family

### POST /api/family/create

Cria nova família.

**Request:**
```json
{
  "name": "Família Silva"
}
```

### GET /api/family/members

Lista membros da família.

### POST /api/family/invite

Convida membro.

**Request:**
```json
{
  "email": "membro@example.com"
}
```

### GET /api/family/invite

Lista convites pendentes da família.

**Response:**
```json
{
  "invites": [
    {
      "id": "uuid",
      "email": "novo@example.com",
      "status": "pending",
      "expires_at": "2024-12-05T...",
      "created_at": "2024-11-28T..."
    }
  ]
}
```

### POST /api/family/invite

Envia convite para novo membro.

**Request:**
```json
{
  "email": "novo@example.com"
}
```

**Response:**
```json
{
  "message": "Convite enviado com sucesso",
  "invite": {
    "id": "uuid",
    "token": "abc123..."
  }
}
```

### GET /api/family/invite/[token]

Busca detalhes do convite (público, sem autenticação).

**Response:**
```json
{
  "invite": {
    "family_name": "Família Silva",
    "invited_by_name": "João",
    "email": "novo@example.com",
    "status": "pending"
  }
}
```

### POST /api/family/invite/[token]

Aceita convite (requer autenticação).

**Response:**
```json
{
  "message": "Convite aceito com sucesso",
  "family_id": "uuid"
}
```

###POST /api/family/invite/[id]/resend

Reenvia convite com novo token.

**Response:**
```json
{
  "message": "Convite reenviado com sucesso"
}
```

### DELETE /api/family/invite/[id]

Cancela convite.

---

## 🗑️ User Account

### DELETE /api/user/delete-account

Marca conta para deleção (soft delete com 30 dias de recuperação).

**Response:**
```json
{
  "success": true,
  "deletion_date": "2024-12-28T...",
  "is_admin_with_members": false
}
```

### POST /api/user/delete-account

Reativa conta deletada (dentro de 30 dias).

**Response:**
```json
{
  "success": true,
  "message": "Conta reativada com sucesso"
}
```

### POST /api/cron/cleanup-deleted-users

Auto-cleanup de contas expiradas (>30 dias).

**Headers**: `Authorization: Bearer <CRON_SECRET>`

**Response:**
```json
{
  "success": true,
  "deleted_count": 2
}
```

### GET /api/cron/cleanup-deleted-users

Status de contas pendentes de deleção.

---

## 🔐 Admin (Super Admin apenas)

### GET /api/admin/stats

Estatísticas do sistema.

**Response:**
```json
{
  "activeUsers": 10,
  "waitlistUsers": 5,
  "monthlyMessages": 1000,
  "openaiCost": 15.50
}
```

### GET /api/admin/users

Lista todos os usuários.

**Query params:**
- `filter` - all/active/waitlist/blocked

### POST /api/admin/users/approve

Aprova usuário da waitlist.

**Request:**
```json
{
  "userId": "uuid"
}
```

### POST /api/admin/users/block

Bloqueia usuário.

---

## ⚠️ Erros

### Códigos HTTP

- `200` - Sucesso
- `400` - Bad Request (validação)
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

### Formato de Erro

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

---

## 🔒 Autenticação

### Cookie de Sessão

Gerenciado automaticamente pelo Supabase Auth.

### Headers

Não é necessário enviar headers manualmente - o cookie é suficiente.

---

## 📊 Rate Limiting

Atualmente não implementado.

**Planejado:**
- 100 requests/min por usuário
- 1000 requests/hora por IP

---

## 🧪 Testando

### cURL

```bash
# Login primeiro via browser
# Depois use o cookie

curl https://seu-app.vercel.app/api/user/me \
  -H "Cookie: sb-access-token=..."
```

### Postman

1. Faça login no browser
2. Copie cookies do DevTools
3. Use no Postman

---

## 📚 Referências

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
