# 💰 Assistente Financeiro IA

> Aplicação moderna de gestão financeira pessoal e familiar com inteligência artificial integrada

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple)](https://openai.com/)

## 🚀 Features

- 💬 **Chat com IA** - Converse naturalmente para registrar transações usando GPT-4o
- 📊 **Dashboard Interativo** - Visualize suas finanças em tempo real
- 👨‍👩‍👧‍👦 **Gestão Familiar** - Compartilhe finanças com sua família
- 📧 **Sistema de Convites** - Convide membros para sua família com links seguros
- 🗑️ **Deleção de Conta** - Soft delete com período de recuperação de 30 dias
- 📱 **PWA Mobile-First** - Instalável e responsivo em todos os dispositivos
- 🔐 **Controle de Acesso** - Sistema de waitlist e aprovação de usuários
- 📈 **Métricas e Analytics** - Painel admin com insights detalhados
-🎯 **Metas Financeiras** - Defina e acompanhe objetivos
- 💳 **Orçamentos** - Controle de gastos por categoria
- 🔔 **Notificações** - Alertas personalizados
- 🔄 **Sincronização Automática** - Family members sync em criação de família

## 🏗️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- React Hooks
- PWA Support

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + Auth)
- OpenAI GPT-4o
- Row Level Security (RLS)

**Deploy:**
- Vercel
- Supabase Cloud

## 📚 Documentação

- [🏛️ Arquitetura](docs/ARCHITECTURE.md) - Visão geral da arquitetura
- [💾 Banco de Dados](docs/DATABASE.md) - Schema e migrações
- [🔌 API](docs/API.md) - Documentação das APIs
- [💻 Desenvolvimento](docs/DEVELOPMENT.md) - Setup local e desenvolvimento
- [🚀 Deploy](docs/DEPLOYMENT.md) - Guia de deploy no Vercel
- [✨ Funcionalidades](docs/FEATURES.md) - Detalhes das features
- [🔧 Troubleshooting](docs/TROUBLESHOOTING.md) - Problemas comuns

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta OpenAI

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/assistente-financeiro-ia.git
cd assistente-financeiro-ia

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute as migrações do banco
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔑 Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Resend (Email)
RESEND_API_KEY=your_resend_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin
SUPER_ADMIN_EMAIL=your_email@example.com
SUPPORT_EMAIL=support@example.com

# Cron (opcional - para auto-cleanup de contas deletadas)
CRON_SECRET=your_secret_here

# Database (opcional - para scripts)
DATABASE_URL=postgresql://...
```

Veja [.env.example](.env.example) para documentação completa.

## 📖 Como Usar

1. **Login** - Faça login com sua conta Google
2. **Onboarding** - Configure sua família e perfil
3. **Chat** - Converse com a IA: "Gastei 50 reais no mercado"
4. **Dashboard** - Visualize suas finanças
5. **Explore** - Descubra todas as funcionalidades!

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
npm run db:migrate   # Executar migrações
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico de mudanças.

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Gabriel Gomes**
- Email: gabrielgomesdevbr@gmail.com
- GitHub: [@GabrielGomesDevBr](https://github.com/GabrielGomesDevBr)

## 🙏 Agradecimentos

- OpenAI pela API GPT-4o
- Supabase pela infraestrutura
- Vercel pelo hosting
- Comunidade Next.js

---

**Feito com ❤️ e ☕ no Brasil**
