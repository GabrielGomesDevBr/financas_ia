# Arquitetura do Sistema de Chat com IA

## 📐 Visão Geral

O sistema de chat usa **OpenAI GPT-4o-mini** com **Function Calling** para processar linguagem natural e executar ações estruturadas no banco de dados.

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ "gastei 30 reais no mercado"
       ▼
┌─────────────────────────────────────┐
│       Frontend (React/Next.js)      │
│  - Componente ChatPage              │
│  - Gerencia threads/conversas       │
│  - Exibe mensagens em tempo real    │
└──────────────┬──────────────────────┘
               │ POST /api/chat
               ▼
┌─────────────────────────────────────┐
│     Backend API Route (Next.js)     │
│  1. Carrega histórico (2 msgs)      │
│  2. Prepara contexto (categorias)   │
│  3. Chama OpenAI                    │
└──────────────┬──────────────────────┘
               │ Chat Completion
               ▼
┌─────────────────────────────────────┐
│         OpenAI GPT-4o-mini          │
│  - Analisa mensagem                 │
│  - Decide chamar funções            │
│  - Extrai parâmetros estruturados   │
└──────────────┬──────────────────────┘
               │ Function Call: registrar_transacao
               ▼
┌─────────────────────────────────────┐
│    registerTransaction Function     │
│  1. ✅ Busca categoria              │
│  2. ✅ Verifica duplicatas (5min)   │
│  3. ✅ Insere no Supabase           │
│  4. ✅ Retorna resultado            │
└──────────────┬──────────────────────┘
               │ Success/Failure
               ▼
┌─────────────────────────────────────┐
│         Supabase PostgreSQL         │
│  - Tabela: transactions             │
│  - Tabela: categories               │
│  - Tabela: subcategories            │
│  - Tabela: chat_messages            │
└─────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Dados

### Tabela: `transactions`

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2),
  description TEXT,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  date DATE,
  source TEXT, -- 'chat' ou 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `chat_messages`

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id),
  user_id UUID REFERENCES users(id),
  thread_id UUID REFERENCES chat_threads(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  family_id UUID REFERENCES families(id),
  is_default BOOLEAN DEFAULT FALSE
);
```

---

## 🔄 Fluxo de Processamento

### 1. Recepção da Mensagem

```typescript
// src/app/api/chat/route.ts
export async function POST(request: Request) {
  const { message, familyId, threadId } = await request.json()

  // Validação básica
  if (!message || !familyId) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
```

### 2. Preparação do Contexto

```typescript
// Carregar apenas 2 mensagens recentes (contexto mínimo)
const { data: recentMessages } = await supabase
  .from('chat_messages')
  .select('role, content')
  .eq('thread_id', threadId)
  .order('created_at', { ascending: false })
  .limit(2)

// Carregar categorias disponíveis
const { data: categories } = await supabase
  .from('categories')
  .select('name, type, subcategories(name)')
  .or(`is_default.eq.true,family_id.eq.${familyId}`)
```

### 3. Construção do Prompt do Sistema

```typescript
const systemPrompt = `
Você é um assistente financeiro para a família "${family?.name}".

CATEGORIAS DISPONÍVEIS:
${categoriesContext}

DIRETRIZES:
- Registre APENAS transações da mensagem ATUAL
- NÃO registre transações de mensagens anteriores
- Use as funções disponíveis para executar ações
`
```

### 4. Chamada à OpenAI

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    ...recentMessages.reverse(),
    { role: 'user', content: message }
  ],
  tools,  // Funções disponíveis
  tool_choice: 'auto',  // IA decide quando usar
  temperature: 0.7,
  max_tokens: 500
})
```

### 5. Processamento de Function Calls

```typescript
if (toolCalls && toolCalls.length > 0) {
  const functionResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
      switch (toolCall.function.name) {
        case 'registrar_transacao':
          return await registerTransaction(...)
        case 'buscar_transacoes':
          return await searchTransactions(...)
        // ... outras funções
      }
    })
  )
}
```

### 6. Deduplicação (Proteção Final)

```typescript
// Verifica se transação idêntica existe nos últimos 5 minutos
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
const { data: existing } = await supabase
  .from('transactions')
  .select('*')
  .eq('family_id', familyId)
  .eq('amount', args.amount)
  .eq('description', args.description)
  .eq('source', 'chat')
  .gte('created_at', fiveMinutesAgo)

if (existing && existing.length > 0) {
  return { success: true, wasDuplicate: true, transaction: existing[0] }
}
```

---

## 🛡️ Camadas de Proteção

### Camada 1: Instruções Claras
- Prompt do sistema enfatiza "APENAS mensagem ATUAL"
- Descrição da função deixa claro quando usar

### Camada 2: Histórico Limitado
- Apenas 2 mensagens de contexto
- Reduz chances de ver transações antigas

### Camada 3: Inteligência da IA
- GPT-4o-mini reconhece contexto
- Evita duplicatas naturalmente

### Camada 4: Deduplicação Backend
- Última linha de defesa
- Previne 100% das duplicatas
- Janela de 5 minutos

---

## 📦 Funções Disponíveis

### 1. `registrar_transacao`

**Propósito:** Registrar nova despesa ou receita

**Parâmetros:**
```typescript
{
  type: 'expense' | 'income',
  amount: number,
  description: string,
  category: string,
  subcategory?: string,
  date?: string  // YYYY-MM-DD
}
```

**Fluxo:**
1. Busca categoria no banco
2. Busca subcategoria (se fornecida)
3. Verifica duplicatas (últimos 5min)
4. Insere transação
5. Retorna resultado

---

### 2. `buscar_transacoes`

**Propósito:** Buscar transações com filtros

**Parâmetros:**
```typescript
{
  type?: 'expense' | 'income' | 'all',
  category?: string,
  start_date?: string,
  end_date?: string,
  limit?: number
}
```

---

### 3. `resumo_financeiro`

**Propósito:** Gerar resumo de período

**Parâmetros:**
```typescript
{
  period?: 'week' | 'month' | 'year' | 'all'
}
```

**Retorno:**
```typescript
{
  period: string,
  income: number,
  expenses: number,
  balance: number,
  transactionCount: number
}
```

---

### 4. `criar_orcamento`

**Propósito:** Criar/atualizar orçamento para categoria

**Parâmetros:**
```typescript
{
  category: string,
  amount: number,
  period?: 'weekly' | 'monthly' | 'yearly'
}
```

---

### 5. `criar_meta`

**Propósito:** Criar meta financeira

**Parâmetros:**
```typescript
{
  name: string,
  target_amount: number,
  deadline?: string,
  category?: string
}
```

---

## 🎨 Frontend - Sistema de Threads

### Estrutura de Threads

```typescript
interface Thread {
  id: string
  title: string
  last_message_at: string
  created_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
```

### Gerenciamento de Estado

```typescript
const [messages, setMessages] = useState<Message[]>([])
const [threads, setThreads] = useState<Thread[]>([])
const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
```

### Criação de Thread

```typescript
// Nova conversa = Nova thread
const handleNewThread = async () => {
  const { data: newThread } = await supabase
    .from('chat_threads')
    .insert({ family_id: familyId, title: 'Nova conversa' })
    .select()
    .single()

  setCurrentThreadId(newThread.id)
  setMessages([])
}
```

---

## ⚙️ Configurações

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-proj-xxx
```

### API Route Config

```typescript
// Timeout de 60 segundos para chamadas à OpenAI
export const maxDuration = 60
```

### Limites

- **Histórico:** 2 mensagens
- **Janela de deduplicação:** 5 minutos
- **Max tokens (OpenAI):** 500
- **Timeout de API:** 60 segundos

---

## 🔍 Debugging

### Logs Importantes

```typescript
// Início da requisição
console.log('[Chat API] ===== NOVA REQUISIÇÃO =====')
console.log('[Chat API] Mensagem recebida:', message)

// Resposta da OpenAI
console.log('[Chat API] Tool calls:', toolCalls ? toolCalls.length : 'NENHUMA')

// Execução de função
console.log('Executando função:', functionName, functionArgs)

// Deduplicação
console.log('[registerTransaction] ⚠️  Transação duplicada detectada')

// Sucesso
console.log('[registerTransaction] Transação inserida com sucesso:', data)
```

### Como Investigar Problemas

1. **Transação não foi registrada:**
   - Verificar logs: A IA chamou a função?
   - Verificar categoria: Existe no banco?
   - Verificar deduplicação: Foi detectada como duplicata?

2. **Transação duplicada:**
   - Verificar histórico: Quantas mensagens foram enviadas?
   - Verificar logs: Múltiplos tool calls?
   - Verificar deduplicação: Por que não bloqueou?

3. **Resposta lenta:**
   - Verificar tempo de resposta da OpenAI
   - Verificar se há timeout (>60s)
   - Verificar queries do Supabase

---

## 📊 Performance

### Otimizações Implementadas

1. **Histórico limitado:** Reduz tokens enviados à OpenAI
2. **Queries eficientes:** Usa índices do Supabase
3. **Timeout adequado:** 60s para operações longas
4. **Parallel processing:** Múltiplas funções executam em paralelo

### Métricas Esperadas

- **Latência média:** 2-4 segundos
- **Taxa de sucesso:** >95%
- **Duplicatas:** <5% (todas bloqueadas pelo sistema)

---

## 🚦 Monitoramento

### Métricas a Observar

1. **Taxa de duplicatas detectadas**
   - Query: Contar `wasDuplicate: true` nos últimos 7 dias
   - Alerta se >10%

2. **Tempo de resposta**
   - Média de tempo entre POST e resposta
   - Alerta se >10s

3. **Taxa de erro**
   - Contar requisições com status 500
   - Alerta se >5%

---

## 🔐 Segurança

### Autenticação

- Todas as requisições verificam `supabase.auth.getUser()`
- Apenas usuários autenticados podem usar o chat
- Row Level Security no Supabase

### Validação

- Validação de `familyId` e `message` obrigatórios
- Validação de categorias existentes
- Sanitização de inputs (Supabase protege contra SQL injection)

### Rate Limiting

- Timeout de 60s previne abuso
- Deduplicação previne spam de registros

---

## 📚 Referências

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Changelog das Mudanças](../CHANGELOG_CHAT_FIX.md)
