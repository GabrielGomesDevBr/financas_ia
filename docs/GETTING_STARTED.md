# 🚀 Getting Started

**Bem-vindo!** Este guia te coloca rodando em **10 minutos**.

---

## ⚡ Quick Start (5 passos)

### 1. Clone e Instale
```bash
git clone <repo-url>
cd contas_com_ia
npm install
```

### 2. Configure Ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
- Supabase: [supabase.com](https://supabase.com) → Project Settings → API
- OpenAI: [platform.openai.com](https://platform.openai.com) → API Keys
- Resend: [resend.com](https://resend.com) → API Keys

### 3. Configure Database
```bash
# Via Supabase Dashboard:
# 1. Vá em SQL Editor
# 2. Execute migrations em ordem (ver supabase/migrations/README.md)
```

### 4. Rode Localmente
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

### 5. Faça Login
- Login com Google → Onboarding → Criar Família
- Pronto! Já pode usar budget, goals, chat, etc.

---

## 📁 Estrutura do Projeto (Onde encontrar X)

```
contas_com_ia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, onboarding
│   │   ├── (dashboard)/       # Páginas principais (budget, goals, chat)
│   │   ├── admin/             # Painel admin
│   │   ├── api/               # 🔌 APIs (aqui você adiciona novos endpoints)
│   │   └── invite/            # Aceitar convites
│   │
│   ├── components/            # 🎨 Componentes React
│   │   ├── ui/               # Primitivos (button, card, dialog)
│   │   ├── chat/             # Chat com IA
│   │   ├── budgets/          # Budget cards e modals
│   │   └── goals/            # Goals cards e modals
│   │
│   ├── lib/                   # 🛠️ Utilitários
│   │   ├── supabase/         # Client Supabase
│   │   ├── openai/           # Client OpenAI
│   │   ├── schemas/          # Zod validation
│   │   └── logger.ts         # Logger profissional
│   │
│   ├── utils/                 # 🔧 Helpers (NEW!)
│   │   ├── formatters.ts     # Moeda, datas
│   │   ├── validators.ts     # Email, CPF, etc
│   │   └── helpers.ts        # Misc utilities
│   │
│   ├── types/                 # 📝 TypeScript types
│   │   ├── database.ts       # DB types (Supabase)
│   │   ├── api.ts            # API responses
│   │   ├── chat.ts           # Chat types
│   │   └── family.ts         # Family/invites
│   │
│   └── constants/             # 🔒 Constantes (NEW!)
│       ├── errors.ts         # Mensagens de erro
│       ├── dates.ts          # Formatos, períodos
│       └── limits.ts         # Limites da app
│
├── supabase/migrations/       # 📊 Migrações do banco
├── scripts/                   # 🔨 Scripts utilitários
├── docs/                      # 📚 Documentação completa
└── public/                    # Arquivos estáticos (icons, etc)
```

---

## 🏗️ Arquitetura em 1 Página

### Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth)
- **IA**: OpenAI GPT-4o
- **Email**: Resend
- **Deploy**: Vercel

### Fluxo de Dados
```
User → Component → API Route → Supabase → RLS → PostgreSQL
                      ↓
                  OpenAI (chat)
```

### Principais Features
1. **Chat com IA** - Registra transações via linguagem natural
2. **Gestão Familiar** - Multi-usuário com convites
3. **Budget/Goals** - Controle financeiro
4. **Soft Delete** - Deleção com 30 dias de recuperação
5. **PWA** - Instalável como app mobile

---

## 📖 Onde Encontrar...

### "Quero adicionar uma nova API"
→ `src/app/api/[nome]/route.ts`
- Ver exemplos em `api/budgets/route.ts` ou `api/goals/route.ts`
- Sempre validar autenticação: `await createClient().auth.getUser()`

### "Quero criar um novo componente"
→ `src/components/[categoria]/NomeComponente.tsx`
- Ver padrão em `components/budgets/BudgetCard.tsx`
- Usar componentes UI de `components/ui/`

### "Quero adicionar uma migração"
→ `supabase/migrations/YYYYMMDDXXXXXX_descricao.sql`
- Ver formato em migrations existentes
- Sempre adicionar RLS policies
- Documentar em `supabase/migrations/README.md`

### "Quero entender o banco de dados"
→ `docs/DATABASE.md`
- Schema completo com diagrama Mermaid
- RLS policies
- Funções e triggers

### "Quero entender as APIs"
→ `docs/API.md`
- Todos os endpoints documentados
- Request/Response examples
- Error codes

---

## 🐛 Problemas Comuns

Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para lista completa.

**Quick fixes**:
- **404 em Budget/Goals**: Ver [Troubleshooting #1](TROUBLESHOOTING.md#1-budget-retorna-404)
- **Convite não funciona**: Ver [Troubleshooting #2](TROUBLESHOOTING.md#2-convite-não-funciona)
- **Build Error**: Limpar cache `rm -rf .next && npm run build`

---

## 🧪 Testando

```bash
# Rodar testes
npm test

# Testes em watch mode
npm run test:watch

# Lint
npm run lint
npm run lint:fix
```

---

## 📚 Documentação Completa

- [🏛️ Arquitetura](docs/ARCHITECTURE.md)
- [💾 Database](docs/DATABASE.md)
- [🔌 API](docs/API.md)
- [📧 Sistema de Convites](docs/INVITE_SYSTEM.md)
- [🗑️ Deleção de Conta](docs/ACCOUNT_DELETION.md)
- [🔧 Troubleshooting](docs/TROUBLESHOOTING.md)

---

## 🎯 Próximos Passos

1. **Explore o código**: Comece por `src/app/api/` para entender as APIs
2. **Leia DATABASE.md**: Entenda o schema antes de fazer mudanças
3. **Teste localmente**: Crie transações, budgets, goals
4. **Faça seu primeiro PR**: Escolha uma issue pequena

---

## 💡 Dicas de Desenvolvimento

### Hot Tips
- Use `logger.info()` em vez de `console.log()`
- Sempre adicione JSDoc em funções públicas
- Teste RLS policies no Supabase SQL Editor
- Use `formatCurrency()` de `utils/formatters` para moeda

### Debugging
```bash
# Verificar DB
node scripts/utils/check_db.js

# Ver schema
node scripts/utils/check_schema_details.js

# Testar RLS
node scripts/testing/test-rls.js
```

### Code Style
- Components: PascalCase (`BudgetCard.tsx`)
- Utils/hooks: camelCase (`formatCurrency`, `useNotifications`)
- Files: kebab-case para routes (`delete-account/route.ts`)

---

## 🚨 Antes de Commitar

```bash
npm run lint          # Sem erros
npm run type-check    # Sem erros de tipo
npm test             # Testes passando
```

---

## 🆘 Precisa de Ajuda?

1. **Documentação**: Sempre comece pelos docs em `docs/`
2. **Troubleshooting**: Veja problemas conhecidos
3. **Code**: Procure exemplos em código existente
4. **Issues**: Abra uma issue no GitHub

---

**Bem-vindo ao time! Happy coding! 🎉**
