# Estrutura de Código

## 📁 Organização de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Rotas protegidas (layout compartilhado)
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── family/
│   │   ├── goals/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── transactions/
│   │
│   ├── admin/              # Painel administrativo
│   │   ├── dashboard/
│   │   ├── metrics/
│   │   ├── settings/
│   │   ├── users/
│   │   └── waitlist/
│   │
│   ├── api/                # API Routes
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── chat/
│   │   ├── family/
│   │   ├── goals/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── transactions/
│   │   └── user/
│   │
│   ├── auth/               # Autenticação
│   │   └── callback/
│   │
│   ├── blocked/            # Página de bloqueio
│   ├── login/              # Login
│   ├── more/               # Menu "Mais"
│   ├── onboarding/         # Onboarding
│   └── waitlist/           # Waitlist
│
├── components/             # Componentes React
│   ├── admin/              # Componentes admin
│   │   ├── AdminSidebar.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── chat/               # Chat com IA
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatSidebar.tsx
│   │
│   ├── filters/            # Filtros
│   │   └── PeriodSelector.tsx
│   │
│   ├── layout/             # Layout
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── mobile/             # Mobile específicos
│   │
│   ├── transactions/       # Transações
│   │   └── TransactionModal.tsx
│   │
│   └── ui/                 # Componentes base
│       ├── button.tsx
│       ├── card.tsx
│       ├── empty-state.tsx
│       ├── input.tsx
│       ├── loading-spinner.tsx
│       ├── modal.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── index.ts        # Barrel export
│
├── config/                 # Configurações (NOVO)
│   ├── constants.ts        # Constantes da aplicação
│   ├── env.ts              # Validação de env vars
│   └── index.ts            # Barrel export
│
├── hooks/                  # Custom hooks
│   ├── usePeriodFilter.ts
│   └── index.ts            # Barrel export
│
├── lib/                    # Utilitários
│   ├── openai/
│   │   └── tools.ts
│   │
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   │
│   ├── email.ts
│   ├── logger.ts           # Logger profissional
│   ├── tracking.ts
│   ├── utils.ts
│   └── index.ts            # Barrel export
│
├── types/                  # TypeScript types
│   └── database.ts
│
└── middleware.ts           # Middleware de auth
```

## 🎯 Convenções

### Nomenclatura

- **Componentes**: PascalCase (`Button.tsx`, `ChatMessage.tsx`)
- **Hooks**: camelCase com prefixo `use` (`usePeriodFilter.ts`)
- **Utilitários**: camelCase (`logger.ts`, `utils.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`APP_CONFIG`, `OPENAI_MODEL`)
- **Types**: PascalCase (`User`, `Transaction`)

### Imports

Use barrel exports para imports mais limpos:

```typescript
// ❌ Antes
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ✅ Depois
import { Button, Card, Input } from '@/components/ui'
```

### Organização de Arquivos

- Um componente por arquivo
- Testes ao lado do componente (`__tests__/`)
- Estilos inline com TailwindCSS
- Types compartilhados em `src/types/`

## 📦 Barrel Exports

Arquivos `index.ts` criados em:
- `src/components/ui/index.ts`
- `src/hooks/index.ts`
- `src/lib/index.ts`
- `src/config/index.ts`

## 🔧 Configuração

### Constants (`src/config/constants.ts`)

Centralize valores fixos:
```typescript
import { APP_CONFIG, OPENAI_CONFIG } from '@/config'
```

### Environment (`src/config/env.ts`)

Validação de variáveis de ambiente:
```typescript
import { env } from '@/config'

const apiKey = env.openai.apiKey
```

## 🎨 Padrões de Código

### Componentes

```typescript
interface Props {
  title: string
  onSave: () => void
}

export function MyComponent({ title, onSave }: Props) {
  // Hooks primeiro
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => {
    // ...
  }
  
  // Render
  return <div>{title}</div>
}
```

### API Routes

```typescript
import { logger } from '@/lib'
import { env } from '@/config'

export async function GET(request: Request) {
  try {
    logger.debug('API', 'Processing request')
    // ...
    return NextResponse.json({ data })
  } catch (error) {
    logger.error('API', 'Error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

## 📚 Referências

- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [React Best Practices](https://react.dev/learn)
