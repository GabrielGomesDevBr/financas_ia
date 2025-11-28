# Documento Técnico: Melhorias de UX e Robustez - Contas com IA
**Versão:** 1.2
**Objetivo:** Implementar Optimistic UI, Feedback Visual de Ações, Lógica de Incerteza e Tutoriais Interativos para mitigar latência, aumentar a confiança e educar o utilizador.

## 1. Feedback Visual e Transparência ("Sair da Caixa Preta")

Atualmente, a aplicação retorna uma mensagem de texto simples da IA. Para o utilizador que "odeia planilhas", ver um "comprovante" visual de que o sistema entendeu e salvou o dado é reconfortante e profissional.

### 1.1. Novo Componente: ActionFeedback

Crie um componente para renderizar o resultado das ações (transações salvas, orçamentos criados) de forma visual, não apenas textual.

**Arquivo:** `src/components/chat/ActionFeedback.tsx` (Novo)

```tsx
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ActionFeedbackProps {
  action: {
    type: string
    parameters: any
    success: boolean
    result?: any
  }
}

export function ActionFeedback({ action }: ActionFeedbackProps) {
  if (action.type === 'registrar_transacao' && action.success) {
    const { amount, category, description, type } = action.parameters
    const isExpense = type === 'expense'

    return (
      <Card className="mt-2 p-3 bg-green-50 border-green-200 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Transação Registada</span>
        </div>
        
        <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase">{category}</span>
            <span className="text-sm font-medium">{description}</span>
          </div>
          <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '-' : '+'}{formatCurrency(amount)}
          </span>
        </div>
      </Card>
    )
  }
  
  if (action.type === 'criar_orcamento' && action.success) {
    const { amount, category, period } = action.parameters
    return (
      <Card className="mt-2 p-3 bg-blue-50 border-blue-200 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Orçamento Criado</span>
        </div>
        <div className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase">{category}</span>
            <span className="text-sm font-medium">Período: {period}</span>
          </div>
          <span className="font-bold text-blue-600">
             {formatCurrency(amount)}
          </span>
        </div>
      </Card>
    )
  }

  // Fallback para outras ações ou erros
  return null
}
```

### 1.2. Atualizar o Componente de Chat para Renderizar Ações

Modifique a interface de mensagem e o loop de renderização para suportar esse novo dado.

**Arquivo:** `src/app/(dashboard)/chat/page.tsx`

```tsx
// 1. Atualize a interface Message
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  actions?: any[] // Novo campo para armazenar ações retornadas pela API
}

// ... imports

// 2. No handleSendMessage, ao receber a resposta, salve as actions
const handleSendMessage = async (content: string) => {
  // ... código anterior ...
  
  try {
    // ... fetch ...
    const data = await response.json()
    
    if (!response.ok) {
       throw new Error(data.error || 'Erro ao processar mensagem')
    }

    // Adicionar resposta do assistente COM ações
    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: data.message,
      created_at: new Date().toISOString(),
      actions: data.actions // <--- Captura as ações aqui
    }
    
    // ... restante do código para setMessages ...
```

**Arquivo:** `src/components/chat/ChatMessage.tsx`

```tsx
// Atualize para receber e renderizar actions
import { ActionFeedback } from './ActionFeedback' // Importe o novo componente
import { HelpCard } from './HelpCard' // Importe o novo componente de ajuda
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  actions?: any[] // Nova prop
}

export function ChatMessage({ role, content, timestamp, actions }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary' : 'bg-purple-600'
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-primary-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          
          {/* Renderizar feedback de ações se existirem */}
          {actions && actions.length > 0 && (
            <div className="mt-2 space-y-2">
               {actions.map((action, idx) => {
                  // Verifica se é uma ação de tutorial
                  if (action.type === 'explicar_funcionalidade' && action.result?.data) {
                      return <HelpCard key={idx} data={action.result.data} />
                  }
                  // Renderiza feedback de ação normal
                  return <ActionFeedback key={idx} action={action} />
               })}
            </div>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground px-1">
            {new Date(timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>
    </div>
  )
}
```

## 2. Optimistic UI (Redução da Latência Percebida)

Para combater a sensação de lentidão (timeout de 60s), implemente estados de carregamento "vivos" que informam o utilizador o que está a acontecer, em vez de apenas um spinner genérico.

**Arquivo:** `src/app/(dashboard)/chat/page.tsx`

Adicione um estado para descrever o passo atual do processamento.

```tsx
// Novo estado
const [processingStep, setProcessingStep] = useState<string | null>(null)

// Dentro de handleSendMessage:
const handleSendMessage = async (content: string) => {
  // ... setup inicial ...
  
  setIsLoading(true)
  setProcessingStep('A entender a sua mensagem...') // Passo 1

  try {
    // Simulação de progresso para feedback imediato (opcional, mas ajuda na perceção)
    // Nota: Em produção, isto poderia ser via Server-Sent Events (SSE) para ser real
    const stepTimer1 = setTimeout(() => setProcessingStep('A consultar categorias...'), 1500)
    const stepTimer2 = setTimeout(() => setProcessingStep('A processar o seu pedido...'), 3500)
    const stepTimer3 = setTimeout(() => setProcessingStep('A finalizar...'), 5500)

    const response = await fetch('/api/chat', { /* ... */ })
    
    clearTimeout(stepTimer1)
    clearTimeout(stepTimer2)
    clearTimeout(stepTimer3)

    // ... processamento da resposta ...
  } finally {
    setIsLoading(false)
    setProcessingStep(null)
  }
}
```

Renderização do Loading (substituir o spinner atual):

```tsx
{isLoading && (
  <div className="flex gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
       {/* Ícone do Bot */}
       <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m8 22-2-4a9 9 0 0 1 0-12h12a9 9 0 0 1 0 12l-2 4"/><path d="M9 11h.01"/><path d="M15 11h.01"/></svg>
    </div>
    <div className="bg-muted rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        </div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse transition-all duration-500">
          {processingStep || 'A pensar...'}
        </p>
      </div>
    </div>
  </div>
)}
```

## 3. Lógica de Incerteza (Prompt Engineering)

Para evitar categorizações erradas que frustram o utilizador, ajuste o `SYSTEM_PROMPT` no backend para forçar a IA a perguntar quando não tiver certeza, em vez de "chutar".

**Arquivo:** `src/app/api/chat/route.ts`

Atualize a constante `messages` dentro da função POST:

```typescript
    // Build messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: `Você é um assistente financeiro pessoal inteligente e amigável para a família "${family?.name}".

SUAS CAPACIDADES:
1. Registar despesas e receitas em linguagem natural
2. Categorizar transações automaticamente
3. Criar e gerir orçamentos
4. Criar e acompanhar metas financeiras
5. Analisar padrões de gastos
6. Gerar insights e sugestões personalizadas
7. Explicar como usar a aplicação e dar dicas de funcionalidades (Tutorial Interativo)

DIRETRIZES GERAIS:
- Seja conciso e objetivo (respostas com até 3 parágrafos)
- Use emojis com moderação (apenas para highlights importantes)
- Sempre confirme ações importantes antes de executar
- Quando registar uma transação, informe o impacto no orçamento se houver
- Para valores monetários, sempre use o formato brasileiro (ex: R$ 1.234,56)
- Use as funções disponíveis para executar ações
- Quando o utilizador mencionar "hoje", "ontem", "semana passada", calcule a data correta
- IMPORTANTE: Quando procurar transações ou gerar resumos financeiros SEM período específico, use APENAS o mês atual
- Quando o utilizador pedir somatórios ou totais SEM especificar período, considere APENAS o mês vigente
- Se o utilizador quiser dados de outro período, ele deve pedir explicitamente (ex: "gastos do ano", "total da semana passada")
- CRÍTICO: Registe APENAS as transações mencionadas na mensagem ATUAL do utilizador. NÃO registe transações de mensagens antigas do histórico

DIRETRIZES DE TUTORIAIS E AJUDA:
- Se o utilizador parecer confuso ou perguntar "o que você faz?", use a função 'explicar_funcionalidade'.
- Se o utilizador tentar fazer algo que não sabe como, explique o passo a passo ou ofereça um tutorial rápido usando a função.
- Dê dicas proativas ("Sabia que pode criar orçamentos? Quer que eu lhe mostre como?").

DIRETRIZES DE INTERAÇÃO E AMBIGUIDADE:
1. **Ambiguidade:** Se o utilizador disser algo vago como "Comprei remédio" (pode ser Saúde ou Outros) ou "Gastei 50 no Extra" (pode ser Mercado ou Eletrodomésticos), NÃO chame a função imediatamente. PERGUNTE ao utilizador para esclarecer a categoria.
   - Exemplo Errado: Utilizador "Gastei 100 na farmácia" -> Registar direto como Saúde.
   - Exemplo Correto: Utilizador "Gastei 100 na farmácia" -> Resposta: "Isso foi em medicamentos (Saúde) ou cosméticos (Cuidados Pessoais)?"

2. **Confirmação de Valores Altos:** Para transações acima de R$ 500,00, pergunte se o valor está correto antes de registar, a menos que o utilizador já tenha confirmado explicitamente.

3. **Dedução Inteligente:** Se o utilizador mencionar "Almoço", infira "Alimentação". Se mencionar "Uber", infira "Transporte". Nestes casos óbvios, pode registar direto.

CATEGORIAS DISPONÍVEIS:
${categoriesContext}

DATA ATUAL: ${new Date().toLocaleDateString('pt-BR')}

Responda em português brasileiro de forma natural e amigável.`
      }
    ]
```

## 4. Tutoriais Interativos e Dicas ("Aprender Fazendo")

Implemente um sistema onde o chat pode explicar funcionalidades e guiar o utilizador com cartões interativos, reduzindo a necessidade de suporte externo.

### 4.1. Nova Tool: explicar_funcionalidade

Adicione a definição da nova ferramenta para a IA.

**Arquivo:** `src/lib/openai/tools.ts`

```typescript
// ... tools existentes ...
  {
    type: "function" as const,
    function: {
      name: "explicar_funcionalidade",
      description: "Fornece explicações, tutoriais ou dicas sobre como usar uma funcionalidade específica da aplicação.",
      parameters: {
        type: "object",
        properties: {
          funcionalidade: {
            type: "string",
            enum: ["geral", "transacoes", "orcamentos", "metas", "relatorios", "chat"],
            description: "A funcionalidade que o utilizador quer entender. 'geral' para uma visão geral da app."
          },
          tipo: {
            type: "string",
            enum: ["tutorial", "dica", "explicacao"],
            description: "O tipo de conteúdo a ser retornado."
          }
        },
        required: ["funcionalidade"]
      }
    }
  }
// ...
```

### 4.2. Implementação da Lógica de Ajuda

Adicione a lógica para retornar o conteúdo de ajuda estruturado.

**Arquivo:** `src/app/api/chat/route.ts` (Adições)

```typescript
// Função auxiliar para obter conteúdo de ajuda
function getHelpContent(funcionalidade: string, tipo: string) {
  const contents: Record<string, any> = {
    geral: {
      title: "O que eu posso fazer?",
      description: "Sou o seu assistente financeiro pessoal. Posso ajudar a organizar as suas contas de forma simples:",
      steps: [
        "Registar os seus gastos e ganhos falando naturalmente.",
        "Criar orçamentos para controlar categorias (ex: Lazer, Mercado).",
        "Definir metas financeiras (ex: Viagem, Reserva).",
        "Analisar os seus hábitos e dar dicas de economia."
      ],
      action: { label: "Começar Tour", url: "/onboarding" } 
    },
    transacoes: {
      title: "Como registar transações",
      description: "Basta dizer-me o que aconteceu! Ex: 'Gastei 50 no Uber' ou 'Recebi 2000 de salário'.",
      examples: ["Comprei pão por 10 reais", "Paguei a conta de luz de 150", "Recebi 500 de freela"],
      action: { label: "Ver Transações", url: "/transactions" }
    },
    orcamentos: {
       title: "Controle os seus gastos com Orçamentos",
       description: "Defina um limite mensal para categorias e eu aviso se estiver perto de estourar.",
       steps: [
         "Diga: 'Criar orçamento de 500 reais para Lazer'",
         "Acompanhe o progresso na página de Orçamentos."
       ],
       action: { label: "Ir para Orçamentos", url: "/budgets" }
    },
    metas: {
        title: "Alcance os seus sonhos com Metas",
        description: "Quer juntar dinheiro para algo? Eu ajudo a monitorizar.",
        steps: [
            "Diga: 'Quero criar uma meta de 5000 para Viagem'",
            "Sempre que sobrar dinheiro, diga 'Adicionar 200 na meta de Viagem'"
        ],
        action: { label: "Ver Metas", url: "/goals" }
    }
    // Adicionar mais conforme necessário
  }
  
  return contents[funcionalidade] || contents['geral'];
}

// ... dentro do switch de funções ...
            case 'explicar_funcionalidade':
              const helpData = getHelpContent(functionArgs.funcionalidade, functionArgs.tipo);
              result = { 
                success: true, 
                data: helpData,
                message: `Aqui está uma ajuda sobre ${functionArgs.funcionalidade}:` 
              }
              break
// ...
```

### 4.3. Componente HelpCard

Crie o componente visual para exibir o tutorial.

**Arquivo:** `src/components/chat/HelpCard.tsx` (Novo)

```tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface HelpCardProps {
  data: {
    title: string
    description?: string
    steps?: string[]
    examples?: string[]
    action?: { label: string; url: string }
  }
}

export function HelpCard({ data }: HelpCardProps) {
  return (
    <Card className="mt-3 p-4 bg-indigo-50 border-indigo-100">
      <div className="flex items-center gap-2 mb-2 text-indigo-700">
        <Lightbulb className="w-5 h-5" />
        <h4 className="font-semibold">{data.title}</h4>
      </div>
      
      {data.description && (
        <p className="text-sm text-indigo-900 mb-3">{data.description}</p>
      )}

      {data.steps && (
        <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1 mb-3">
          {data.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      )}

      {data.examples && (
        <div className="bg-white/60 p-3 rounded-md text-xs text-indigo-900 mb-3 border border-indigo-100">
          <strong className="block mb-1 text-indigo-700">Tente dizer:</strong>
          <ul className="space-y-1 italic">
             {data.examples.map((ex, idx) => <li key={idx}>"{ex}"</li>)}
          </ul>
        </div>
      )}

      {data.action && (
        <Link href={data.action.url} className="w-full block">
          <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 bg-white">
            {data.action.label} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </Card>
  )
}
```
