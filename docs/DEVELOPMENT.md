# Guia de Desenvolvimento

## 🚀 Setup Inicial

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git
- Conta Supabase (gratuita)
- Conta OpenAI
- Conta Resend (opcional, para emails)

### 1. Clone e Instalação

```bash
git clone https://github.com/GabrielGomesDevBr/financas_ia.git
cd financas_ia
npm install
```

### 2. Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings → API**
4. Copie:
   - Project URL
   - anon/public key
   - service_role key (secret)

### 3. Configuração do OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma API key
3. Adicione créditos (mínimo $5)

### 4. Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Resend (opcional)
RESEND_API_KEY=re_...

# Node
NODE_ENV=development
```

### 5. Migrações do Banco

```bash
npm run db:migrate
```

Isso criará todas as tabelas necessárias no Supabase.

### 6. Executar Localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor dev
npm run build              # Build de produção
npm run start              # Servidor de produção

# Qualidade de Código
npm run lint               # ESLint
npm run lint:fix           # Fix automático
npm run type-check         # TypeScript check
npm run format             # Prettier

# Banco de Dados
npm run db:migrate         # Executar migrações
npm run db:seed            # Popular dados (se disponível)

# Testes
npm run test               # Executar testes
npm run test:ui            # UI de testes
npm run test:coverage      # Coverage report
```

## 📁 Estrutura do Projeto

```
contas_com_ia/
├── src/
│   ├── app/              # Rotas Next.js (App Router)
│   │   ├── (dashboard)/  # Rotas protegidas
│   │   ├── admin/        # Painel admin
│   │   ├── api/          # API Routes
│   │   └── auth/         # Autenticação
│   │
│   ├── components/       # Componentes React
│   │   ├── admin/        # Componentes admin
│   │   ├── chat/         # Chat com IA
│   │   ├── layout/       # Layout (Header, Sidebar)
│   │   ├── mobile/       # Mobile específicos
│   │   └── ui/           # Componentes base
│   │
│   ├── hooks/            # Custom hooks
│   │   └── usePeriodFilter.ts
│   │
│   ├── lib/              # Utilitários
│   │   ├── supabase/     # Cliente Supabase
│   │   ├── openai/       # Configuração OpenAI
│   │   ├── logger.ts     # Logger profissional
│   │   └── utils.ts      # Funções auxiliares
│   │
│   ├── types/            # TypeScript types
│   │   └── database.ts
│   │
│   └── middleware.ts     # Middleware de autenticação
│
├── supabase/
│   └── migrations/       # Migrações SQL
│
├── public/               # Assets estáticos
├── docs/                 # Documentação
└── scripts/              # Scripts utilitários
```

## 🔄 Workflow de Desenvolvimento

### 1. Criar Feature

```bash
git checkout -b feature/minha-feature
```

### 2. Desenvolver

- Faça mudanças incrementais
- Teste localmente
- Commits frequentes e descritivos

### 3. Testar

```bash
npm run lint
npm run type-check
npm run build
```

### 4. Pull Request

- Push para seu fork
- Abra PR com descrição clara
- Aguarde review

## 🐛 Debug

### Logs

O projeto usa um logger profissional que só exibe logs em desenvolvimento:

```typescript
import { logger } from '@/lib/logger'

logger.debug('Context', 'Debug message')
logger.info('Context', 'Info message')
logger.warn('Context', 'Warning message')
logger.error('Context', 'Error message')
```

### DevTools

- **React DevTools** - Inspecionar componentes
- **Network Tab** - Ver chamadas API
- **Supabase Studio** - Ver dados do banco

### Problemas Comuns

Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📦 Adicionar Dependências

```bash
# Produção
npm install pacote

# Desenvolvimento
npm install -D pacote
```

Sempre verifique:
- Licença compatível
- Tamanho do bundle
- Manutenção ativa

## 🧪 Testes

### Estrutura

```
src/
└── components/
    └── Button/
        ├── Button.tsx
        └── __tests__/
            └── Button.test.tsx
```

### Exemplo

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## 🎨 Estilo de Código

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string
  name: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Evitar
function getUser(id: any): any {
  // ...
}
```

### React

```tsx
// ✅ Bom - Componente funcional com hooks
export function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0)
  
  return <div>{title}: {count}</div>
}

// ❌ Evitar - Class components
export class MyComponent extends React.Component {
  // ...
}
```

### Imports

```typescript
// Ordem preferida:
import { useState } from 'react'           // React
import { useRouter } from 'next/navigation' // Next.js
import { Button } from '@/components/ui'   // Internos
import { logger } from '@/lib/logger'      // Libs
import type { User } from '@/types'        // Types
```

## 🔐 Segurança

- **Nunca** commite `.env.local`
- **Sempre** use variáveis de ambiente para secrets
- **Valide** inputs do usuário
- **Use** RLS no Supabase
- **Sanitize** dados antes de exibir

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

## ❓ Ajuda

- Issues no GitHub
- Email: gabrielgomesdevbr@gmail.com
