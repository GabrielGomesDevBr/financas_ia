# Arquitetura da Aplicação

## 🏗️ Visão Geral

Aplicação full-stack moderna construída com Next.js 15, utilizando arquitetura serverless e banco de dados PostgreSQL gerenciado.

```
┌─────────────┐
│   Cliente   │ (Browser/PWA)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js 15 │ (App Router + API Routes)
└──────┬──────┘
       │
       ├──────────┐
       │          │
       ▼          ▼
┌──────────┐  ┌──────────┐
│ Supabase │  │  OpenAI  │
│PostgreSQL│  │  GPT-4o  │
└──────────┘  └──────────┘
```

## 🎯 Camadas da Aplicação

### 1. Frontend (Client Components)

**Localização:** `src/components/`, `src/app/(dashboard)/`

**Responsabilidades:**
- Renderização de UI
- Interação do usuário
- Estado local
- Chamadas para API Routes

**Tecnologias:**
- React 18 (Server + Client Components)
- TailwindCSS
- TypeScript

### 2. Backend (API Routes)

**Localização:** `src/app/api/`

**Responsabilidades:**
- Lógica de negócio
- Validação de dados
- Integração com serviços externos
- Autenticação e autorização

**Endpoints principais:**
- `/api/chat` - Chat com IA
- `/api/transactions` - CRUD de transações
- `/api/admin/*` - Painel administrativo
- `/api/user/me` - Dados do usuário

### 3. Banco de Dados (Supabase)

**Tecnologia:** PostgreSQL + Row Level Security

**Principais tabelas:**
- `users` - Usuários
- `families` - Famílias
- `transactions` - Transações financeiras
- `categories` - Categorias
- `conversations` - Histórico de chat
- `waitlist` - Lista de espera

### 4. Serviços Externos

**OpenAI GPT-4o:**
- Processamento de linguagem natural
- Extração de informações de transações
- Function calling

**Supabase Auth:**
- Google OAuth
- Gestão de sessões
- JWT tokens

## 🔄 Fluxos Principais

### Autenticação

```
1. Usuário clica "Login com Google"
2. Redirect para Google OAuth
3. Callback → /auth/callback
4. Supabase valida token
5. Cria/atualiza registro em users
6. Verifica access_status
7. Redirect para dashboard ou waitlist
```

### Chat com IA

```
1. Usuário envia mensagem
2. POST /api/chat
3. Busca contexto (categorias, histórico)
4. Chama OpenAI com function calling
5. IA extrai informações
6. Registra transação (se aplicável)
7. Retorna resposta formatada
```

### Registro de Transação

```
1. Chat identifica transação
2. Function call: registrar_transacao
3. Valida categoria
4. Insere em transactions
5. Atualiza estatísticas
6. Retorna confirmação
```

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS:

```sql
-- Exemplo: users só veem seus próprios dados
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### Middleware de Autenticação

**Arquivo:** `src/middleware.ts`

**Proteções:**
- Rotas públicas vs protegidas
- Verificação de access_status
- Controle de rotas admin
- Redirect automático

### Validação de Dados

- TypeScript para type safety
- Validação de env vars (`src/config/env.ts`)
- Sanitização de inputs
- Rate limiting (futuro)

## 📊 Estado e Dados

### Server Components (padrão)

- Fetch direto do Supabase
- Sem JavaScript no cliente
- SEO otimizado

### Client Components

- `'use client'` explícito
- Hooks React (useState, useEffect)
- Interatividade

### Caching

- Next.js automatic caching
- Revalidation on-demand
- PWA offline support

## 🚀 Deploy

### Vercel (Frontend + API)

- Serverless functions
- Edge network
- Automatic HTTPS
- Preview deployments

### Supabase (Database + Auth)

- Managed PostgreSQL
- Automatic backups
- Real-time subscriptions
- Global CDN

## 📈 Performance

### Otimizações

- Code splitting automático
- Image optimization (next/image)
- Font optimization
- Bundle size: 102 KB first load

### Métricas Alvo

- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## 🔄 Padrões de Código

### Estrutura de Componentes

```typescript
// Server Component (padrão)
export default async function Page() {
  const data = await fetchData()
  return <View data={data} />
}

// Client Component
'use client'
export function Interactive() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>
}
```

### API Routes

```typescript
export async function GET(request: Request) {
  // 1. Autenticação
  const user = await getUser()
  
  // 2. Validação
  if (!user) return unauthorized()
  
  // 3. Lógica
  const data = await fetchData(user.id)
  
  // 4. Resposta
  return NextResponse.json({ data })
}
```

## 📚 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
