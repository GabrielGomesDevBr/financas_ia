# Assistente Financeiro Familiar com IA

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Público-Alvo e Modelo de Negócio](#público-alvo-e-modelo-de-negócio)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Arquitetura do Sistema](#arquitetura-do-sistema)
5. [Schema do Banco de Dados](#schema-do-banco-de-dados)
6. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
7. [Integração com LLM](#integração-com-llm)
8. [Estrutura do Projeto](#estrutura-do-projeto)
9. [Fluxos de Usuário](#fluxos-de-usuário)
10. [UI/UX Guidelines](#uiux-guidelines)
11. [Segurança e Privacidade](#segurança-e-privacidade)
12. [Cronograma de Implementação](#cronograma-de-implementação)
13. [Custos Estimados](#custos-estimados)
14. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral

### Proposta de Valor

Assistente financeiro familiar que usa inteligência artificial para tornar o controle de gastos simples, automático e inteligente através de conversação natural.

### Diferencial Competitivo

1. **Conversação natural verdadeira** - Interface por chat com LLM, não apenas formulários
2. **Automação máxima** - OCR, categorização inteligente, insights proativos
3. **Experiência familiar completa** - Gestão colaborativa com controles de acesso
4. **Insights acionáveis** - Não apenas mostra dados, mas sugere ações concretas
5. **Educação financeira** - LLM explica conceitos e dá dicas personalizadas

---

## 👥 Público-Alvo e Modelo de Negócio

### Público-Alvo

- **Primário**: Famílias de classe média e alta (renda familiar 5k-25k+)
- **Secundário**: Casais sem filhos, profissionais liberais
- **Características**:
  - Buscam organização financeira
  - Confortáveis com tecnologia
  - Valorizam automação e praticidade
  - Querem insights, não apenas planilhas

### Modelo de Negócio

**Assinatura Mensal:**

- **Free Tier** (até 50 transações/mês)
  - 1 usuário
  - Funcionalidades básicas
  - Relatórios mensais

- **Individual** - R$ 19,90/mês
  - 1 usuário
  - Transações ilimitadas
  - OCR ilimitado
  - Relatórios semanais
  - Todas as funcionalidades

- **Familiar** - R$ 34,90/mês
  - Até 5 membros
  - Tudo do Individual
  - Gestão compartilhada
  - Controles de acesso por membro

- **Premium** - R$ 49,90/mês
  - Até 10 membros
  - Tudo do Familiar
  - Suporte prioritário
  - Consultoria financeira por IA (mensal)
  - Exportações avançadas

---

## 🛠️ Stack Tecnológica

### Frontend
```
- Framework: Next.js 14+ (App Router)
- Linguagem: TypeScript
- UI: Tailwind CSS + shadcn/ui
- Gráficos: Recharts ou Chart.js
- Estado: React Context + Zustand (opcional)
- Validação: Zod
```

### Backend
```
- API: Next.js API Routes + Server Actions
- Runtime: Node.js 20+
- Validação: Zod
- ORM: Prisma (opcional, pode usar direto Supabase client)
```

### Database & Auth
```
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (Google OAuth)
- Storage: Supabase Storage (notas fiscais)
- Realtime: Supabase Realtime (sync familiar)
```

### IA & Automação
```
- LLM: OpenAI GPT-5 / GPT-5-mini
- OCR: GPT-5 Vision
- Embeddings: text-embedding-3-small (futuro - busca semântica)
```

### Serviços Externos
```
- Email: Resend
- Deploy: Vercel
- Cache: Upstash Redis (opcional, para chat history)
- Monitoring: Vercel Analytics + Sentry (erros)
- Cron Jobs: Vercel Cron (emails semanais/mensais)
```

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │  Chat UI     │  │  Relatórios  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Orçamentos  │  │  Metas       │  │  Família     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API LAYER (Next.js API Routes)             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │         LLM Orchestrator (OpenAI GPT-5)          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │  │
│  │  │ Categorizar │  │   Análise   │  │ Insights │ │  │
│  │  │  Despesas   │  │  Padrões    │  │  Proat.  │ │  │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │ OCR Vision  │  │  Sugestões  │               │  │
│  │  │ (Notas)     │  │  Economia   │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Transações  │  │  Orçamentos  │  │   Família    │ │
│  │   Service    │  │   Service    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │ │
│  │   Database   │  │ (OAuth)      │  │ (Imagens)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  Realtime    │  │  Row Level   │                   │
│  │   (Sync)     │  │  Security    │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Resend     │  │ Vercel Cron  │  │   Upstash    │ │
│  │  (Emails)    │  │ (Scheduler)  │  │   (Cache)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Usuário** envia mensagem no chat: "Gastei R$50 no Uber"
2. **Frontend** envia para API `/api/chat`
3. **API** processa com GPT-5-mini (categorização rápida)
4. **LLM** retorna: `{ type: "expense", amount: 50, category: "transporte", subcategory: "uber" }`
5. **API** valida e salva no Supabase
6. **API** consulta orçamento da categoria
7. **API** retorna resposta contextualizada
8. **Supabase Realtime** notifica outros membros da família
9. **Frontend** atualiza UI em tempo real

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

```sql
-- ====================================
-- FAMÍLIAS E USUÁRIOS
-- ====================================

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free', -- free, individual, familiar, premium
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member', -- admin, member, dependent
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- CATEGORIAS
-- ====================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- emoji ou nome do ícone
  color VARCHAR(7), -- hex color
  type VARCHAR(20) NOT NULL, -- expense, income
  is_default BOOLEAN DEFAULT false, -- categorias do sistema
  family_id UUID REFERENCES families(id) ON DELETE CASCADE, -- NULL = sistema, UUID = customizada
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categorias padrão serão inseridas via seed:
-- Despesas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Outros
-- Receitas: Salário, Freelance, Investimentos, Outros

-- ====================================
-- TRANSAÇÕES
-- ====================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  type VARCHAR(20) NOT NULL, -- expense, income
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,

  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,

  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurring_config JSONB, -- { frequency: 'monthly', day: 5, end_date: '2025-12-31' }
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE, -- se foi gerada por recorrência

  -- Metadados
  source VARCHAR(50), -- chat, ocr, manual, import, email
  confidence_score DECIMAL(3, 2), -- 0.00-1.00 (confiança da categorização por IA)
  ai_suggested_category UUID REFERENCES categories(id), -- categoria sugerida pela IA
  user_confirmed BOOLEAN DEFAULT true, -- usuário confirmou a categoria?

  -- Anexos
  receipt_url TEXT, -- URL do Supabase Storage

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_family_date ON transactions(family_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);

-- ====================================
-- ORÇAMENTOS
-- ====================================

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,

  amount DECIMAL(12, 2) NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, yearly

  start_date DATE NOT NULL,
  end_date DATE, -- NULL = indefinido

  alert_threshold DECIMAL(3, 2) DEFAULT 0.80, -- alertar quando atingir 80%

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(family_id, category_id, period, start_date)
);

-- ====================================
-- METAS FINANCEIRAS
-- ====================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,

  deadline DATE,
  category VARCHAR(100), -- viagem, emergência, compra, educação, etc

  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- HISTÓRICO DE CONVERSAS (CHAT)
-- ====================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,

  -- Metadados da ação realizada
  action_type VARCHAR(50), -- create_transaction, update_budget, generate_insight, etc
  action_metadata JSONB, -- dados da ação executada

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_family_date ON chat_messages(family_id, created_at DESC);

-- ====================================
-- INSIGHTS E SUGESTÕES
-- ====================================

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL, -- alert, suggestion, pattern, achievement
  title VARCHAR(255) NOT NULL,
  description TEXT,

  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high

  -- Ação sugerida
  action_label VARCHAR(100), -- ex: "Reduzir gastos com delivery"
  action_data JSONB, -- dados para executar a ação

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  valid_until DATE, -- insights podem expirar

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_insights_family_date ON insights(family_id, created_at DESC);

-- ====================================
-- NOTIFICAÇÕES E EMAILS
-- ====================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL, -- budget_alert, goal_progress, weekly_report, etc
  title VARCHAR(255) NOT NULL,
  message TEXT,

  is_read BOOLEAN DEFAULT false,

  -- Email
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_date ON notifications(user_id, created_at DESC);

-- ====================================
-- CONFIGURAÇÕES DA FAMÍLIA
-- ====================================

CREATE TABLE family_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE UNIQUE,

  -- Preferências de email
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day VARCHAR(10) DEFAULT 'monday',
  monthly_report_enabled BOOLEAN DEFAULT true,
  monthly_report_day INTEGER DEFAULT 1, -- dia do mês

  -- Preferências de notificações
  budget_alerts_enabled BOOLEAN DEFAULT true,
  goal_alerts_enabled BOOLEAN DEFAULT true,
  insights_enabled BOOLEAN DEFAULT true,

  -- Timezone
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Moeda
  currency VARCHAR(3) DEFAULT 'BRL',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- Policies (exemplo para transactions)
CREATE POLICY "Usuários podem ver transações da própria família"
  ON transactions FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir transações na própria família"
  ON transactions FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM users WHERE id = auth.uid()
    )
  );

-- Policies similares devem ser criadas para todas as tabelas
```

---

## ⚙️ Funcionalidades Detalhadas

### 1. Autenticação e Gestão Familiar

#### 1.1 Cadastro e Login
- Login com Google OAuth (Supabase Auth)
- Ao fazer primeiro login, usuário cria ou entra em uma família
- Admin da família pode gerar link de convite para outros membros

#### 1.2 Roles e Permissões

| Ação | Admin | Member | Dependent |
|------|-------|--------|-----------|
| Ver todas as transações | ✅ | ✅ | ❌ (só suas) |
| Criar transação própria | ✅ | ✅ | ✅ |
| Editar/deletar qualquer transação | ✅ | ❌ (só suas) | ❌ (só suas) |
| Criar/editar orçamentos | ✅ | ✅ | ❌ |
| Ver orçamentos | ✅ | ✅ | ✅ |
| Criar/editar metas | ✅ | ✅ | ❌ |
| Ver relatórios completos | ✅ | ✅ | ❌ (simplificado) |
| Gerenciar membros | ✅ | ❌ | ❌ |
| Alterar plano | ✅ | ❌ | ❌ |

### 2. Chat com IA (Interface Principal)

#### 2.1 Capacidades do Chat

**Registro de Despesas:**
```
👤 "Gastei 85 reais no Uber Eats"
🤖 "✅ Registrado: R$ 85,00 em Delivery (Alimentação)

    📊 Orçamento de Alimentação: R$ 1.285 / R$ 2.000 (64%)
    Ainda restam R$ 715 para os próximos 18 dias."
```

**Registro de Receitas:**
```
👤 "Recebi meu salário hoje, 5500"
🤖 "✅ Receita registrada: R$ 5.500,00 - Salário

    💰 Receita total do mês: R$ 5.500,00
    💸 Despesas até agora: R$ 2.340,00
    ✨ Saldo: +R$ 3.160,00"
```

**Consultas:**
```
👤 "Quanto gastei com mercado este mês?"
🤖 "Este mês você gastou R$ 847,50 em Mercado.

    📈 Comparado ao mês passado: +12% (R$ 756,00)
    🎯 Orçamento: R$ 847,50 / R$ 1.000,00 (85%)

    Principais compras:
    • 15/11 - Pão de Açúcar - R$ 234,50
    • 08/11 - Carrefour - R$ 189,00
    • 03/11 - Extra - R$ 156,00"
```

**Criação de Orçamentos:**
```
👤 "Quero gastar no máximo 800 reais em lazer por mês"
🤖 "✅ Orçamento criado para Lazer: R$ 800,00/mês

    📊 Gasto atual em Lazer este mês: R$ 320,00 (40%)

    Vou te alertar quando atingir 80% do limite (R$ 640)."
```

**Metas Financeiras:**
```
👤 "Quero juntar 10 mil reais para viajar em julho"
🤖 "✅ Meta criada: Viagem - R$ 10.000,00 até julho/2025

    📅 Faltam 8 meses
    💰 Você precisa economizar R$ 1.250,00/mês

    Com base no seu histórico de gastos, sugestões:
    • Reduzir delivery de R$ 400 para R$ 200 (+R$ 200/mês)
    • Cancelar Netflix e Spotify, assinar YouTube Premium (+R$ 15/mês)
    • Limitar lazer a R$ 600 (+R$ 200/mês)

    Total economizado: R$ 415/mês
    Ainda faltam: R$ 835/mês para atingir a meta."
```

**OCR de Nota Fiscal:**
```
👤 [envia foto de nota fiscal]
🤖 "📸 Analisando nota fiscal...

    Encontrei:
    🏪 Estabelecimento: Supermercado Zona Sul
    💰 Valor total: R$ 234,89
    📅 Data: 15/11/2024

    Itens principais:
    • Frutas e verduras - R$ 45,30
    • Carnes - R$ 89,50
    • Laticínios - R$ 38,20
    • Limpeza - R$ 41,89
    • Outros - R$ 20,00

    Sugestão de categoria: Mercado (Alimentação)

    Confirma o registro?"

👤 "Confirmo"
🤖 "✅ Despesa registrada!
    Nota fiscal salva para referência futura."
```

#### 2.2 Tools/Functions do LLM

```typescript
// Funções que o GPT-5 pode chamar

const tools = [
  {
    name: "registrar_transacao",
    description: "Registra uma nova despesa ou receita",
    parameters: {
      type: "expense" | "income",
      amount: number,
      description: string,
      category: string,
      subcategory?: string,
      date?: string, // ISO format
      is_recurring?: boolean,
      recurring_config?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly",
        interval: number,
        end_date?: string
      }
    }
  },
  {
    name: "buscar_transacoes",
    description: "Busca transações com filtros",
    parameters: {
      type?: "expense" | "income",
      category?: string,
      start_date?: string,
      end_date?: string,
      min_amount?: number,
      max_amount?: number,
      limit?: number
    }
  },
  {
    name: "criar_orcamento",
    description: "Cria ou atualiza um orçamento para uma categoria",
    parameters: {
      category: string,
      amount: number,
      period: "weekly" | "monthly" | "yearly",
      alert_threshold?: number // 0.0 - 1.0
    }
  },
  {
    name: "criar_meta",
    description: "Cria uma meta financeira",
    parameters: {
      name: string,
      target_amount: number,
      deadline?: string,
      category?: string
    }
  },
  {
    name: "analisar_gastos",
    description: "Analisa padrões de gastos e gera insights",
    parameters: {
      period?: "week" | "month" | "quarter" | "year",
      category?: string,
      comparison?: boolean // comparar com período anterior
    }
  },
  {
    name: "sugerir_economia",
    description: "Gera sugestões personalizadas de economia",
    parameters: {
      target_amount?: number, // quanto quer economizar
      categories_to_analyze?: string[]
    }
  },
  {
    name: "processar_ocr",
    description: "Processa imagem de nota fiscal com OCR",
    parameters: {
      image_url: string
    }
  }
];
```

### 3. Dashboard

#### 3.1 Visão Geral (Home)

```
┌─────────────────────────────────────────────────────────┐
│  Olá, Gabriel! 👋                          Novembro 2024 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  💰 Resumo do Mês                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Receitas   │  │  Despesas   │  │   Saldo     │    │
│  │ R$ 8.500,00 │  │ R$ 5.234,78 │  │ +R$ 3.265,22│    │
│  │   +5% ↗     │  │   -8% ↘     │  │   +18% ↗    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                           │
│  📊 Despesas por Categoria                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │    [Gráfico Pizza ou Barras]                      │  │
│  │                                                     │  │
│  │    Alimentação    35%  R$ 1.832,00  [Progress]    │  │
│  │    Moradia        25%  R$ 1.308,00  [Progress]    │  │
│  │    Transporte     15%  R$   785,00  [Progress]    │  │
│  │    Lazer          12%  R$   628,00  [Progress]    │  │
│  │    Outros         13%  R$   681,78  [Progress]    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  🎯 Orçamentos                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Alimentação    R$ 1.832 / R$ 2.000  [▓▓▓▓▓░] 92%│  │
│  │  Transporte     R$   785 / R$ 1.000  [▓▓▓▓░░] 79%│  │
│  │  Lazer          R$   628 / R$   800  [▓▓▓▓░░] 79%│  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ⭐ Insights da IA                                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🔔 Você está gastando 15% a mais em delivery    │  │
│  │     este mês comparado à média.                   │  │
│  │     [Ver detalhes]                                 │  │
│  │                                                     │  │
│  │  💡 Se você reduzir gastos com café para R$100,  │  │
│  │     pode atingir sua meta de viagem 2 meses      │  │
│  │     mais cedo!                                     │  │
│  │     [Aplicar sugestão]                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### 3.2 Transações (Lista)

- Filtros: período, categoria, tipo, membro da família
- Busca por texto
- Ordenação: data, valor, categoria
- Ações rápidas: editar, deletar, duplicar
- Export: CSV, PDF

#### 3.3 Orçamentos

- Cards por categoria com progresso visual
- Alertas quando ultrapassar threshold
- Sugestões de ajuste baseadas em histórico
- Comparativo com meses anteriores

#### 3.4 Metas

- Cards com progresso visual
- Timeline até deadline
- Sugestões de quanto poupar por mês
- Celebração quando atingir meta

### 4. Relatórios

#### 4.1 Relatório Semanal (Email)

**Enviado toda segunda-feira, 8h**

```
Assunto: 💰 Seu resumo financeiro da semana | 11-17 Nov

Olá Gabriel,

Aqui está o resumo da sua semana:

📊 RESUMO GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💸 Despesas: R$ 847,50
💰 Receitas: R$ 0,00
📉 Comparado à semana passada: -12%

🏆 DESTAQUE DA SEMANA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parabéns! Você reduziu gastos com delivery em 40%

📈 MAIORES GASTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mercado      R$ 234,50  (Pão de Açúcar)
2. Gasolina     R$ 180,00  (Posto Ipiranga)
3. Restaurante  R$ 125,00  (Sushi da Praça)

💡 INSIGHT DA SEMANA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Você costuma gastar mais nos finais de semana.
Que tal planejar atividades gratuitas para o próximo?

🎯 AÇÃO SUGERIDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Você está a R$ 152,50 de atingir seu orçamento de
Alimentação. Considere cozinhar em casa nos próximos dias.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Ver relatório completo] [Conversar com IA]

💙 Assistente Financeiro IA
```

#### 4.2 Relatório Mensal (Email)

**Enviado no dia 1º de cada mês, 9h**

- Análise completa do mês
- Comparativo com meses anteriores
- Progresso de metas
- Top 10 maiores gastos
- Insights de tendências
- Previsão para o próximo mês
- Sugestões de economia personalizadas

### 5. Despesas Recorrentes

#### 5.1 Criação Automática

```
👤 "Pago Netflix todo dia 15, são 39,90"
🤖 "✅ Despesa recorrente criada: Netflix

    💰 Valor: R$ 39,90
    📅 Repetição: Mensalmente, dia 15
    🏷️ Categoria: Assinaturas (Lazer)

    Vou criar automaticamente essa despesa todo mês.
    Quer definir uma data final?"
```

#### 5.2 Gestão

- Lista de todas recorrências ativas
- Previsão de gastos futuros
- Alertas de assinaturas não utilizadas (com base em padrões)
- Sugestões de otimização (ex: "Você tem Spotify e YouTube Premium, considere cancelar um")

### 6. Insights e Sugestões Proativas

#### 6.1 Tipos de Insights

**Alertas:**
- Orçamento próximo do limite (80%, 90%, 100%)
- Gasto incomum detectado ("Você gastou R$ 500 em eletrônicos, isso é 3x sua média")
- Meta em risco ("Nesse ritmo, você não vai atingir sua meta de viagem")

**Padrões:**
- "Você sempre gasta mais em delivery nas sextas-feiras"
- "Seus gastos com Uber aumentam 40% quando chove"
- "Você economiza mais nos meses que recebe freelances"

**Sugestões:**
- "Se você trocar o plano do Spotify Individual (R$ 21,90) para Família (R$ 34,90) e dividir com 5 pessoas, economiza R$ 15/mês"
- "Seus gastos com café externo são R$ 180/mês. Comprando café para fazer em casa, economizaria ~R$ 130/mês"

**Conquistas:**
- "🎉 Parabéns! Você ficou dentro do orçamento de Alimentação pela primeira vez em 3 meses!"
- "⭐ Meta atingida! Você juntou os R$ 10.000 para a viagem!"

#### 6.2 Entrega de Insights

- **No chat:** Insights aparecem naturalmente na conversa
- **Dashboard:** Seção dedicada "Insights da IA"
- **Notificações push:** Alertas importantes
- **Email:** Incluídos nos relatórios semanais/mensais

---

## 🤖 Integração com LLM

### Estratégia de Modelos

#### GPT-5-mini (90% dos casos)
**Custo: $0.25/1M input | $2.00/1M output**

Usar para:
- Categorização simples de despesas
- Extração de dados estruturados de mensagens
- Respostas rápidas a consultas
- Validações e confirmações
- Chat conversacional básico

Exemplo de uso:
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    {
      role: "system",
      content: `Você é um assistente financeiro. Extraia os dados da despesa.

      Responda em JSON:
      {
        "type": "expense" | "income",
        "amount": number,
        "description": string,
        "category": string,
        "subcategory": string | null,
        "date": string | null,
        "confidence": number (0-1)
      }`
    },
    {
      role: "user",
      content: "Gastei 85 reais no Uber Eats ontem"
    }
  ],
  response_format: { type: "json_object" }
});
```

#### GPT-5 (10% dos casos)
**Custo: $1.25/1M input | $10.00/1M output**

Usar para:
- Análises complexas de padrões
- Geração de insights sofisticados
- Sugestões de economia personalizadas
- Educação financeira (explicações detalhadas)
- OCR de notas fiscais (Vision)
- Relatórios mensais elaborados

Exemplo de uso:
```typescript
const analysis = await openai.chat.completions.create({
  model: "gpt-5",
  messages: [
    {
      role: "system",
      content: `Você é um especialista em análise financeira.
      Analise o histórico de gastos e gere insights acionáveis.`
    },
    {
      role: "user",
      content: `Histórico dos últimos 3 meses:
      ${JSON.stringify(transactions)}`
    }
  ]
});
```

### Prompts System

#### Prompt Principal (Chat)

```typescript
const SYSTEM_PROMPT = `Você é um assistente financeiro pessoal inteligente e amigável.

CONTEXTO:
- Usuário: ${user.name}
- Família: ${family.name}
- Membros: ${family.members.length}
- Plano: ${family.plan}

SUAS CAPACIDADES:
1. Registrar despesas e receitas em linguagem natural
2. Categorizar transações automaticamente
3. Criar e gerenciar orçamentos
4. Criar e acompanhar metas financeiras
5. Analisar padrões de gastos
6. Gerar insights e sugestões personalizadas
7. Processar notas fiscais por foto (OCR)
8. Responder dúvidas sobre finanças

DIRETRIZES:
- Seja conciso e objetivo
- Use emojis com moderação (apenas para highlights)
- Sempre mostre contexto financeiro relevante (ex: orçamento restante)
- Confirme ações importantes antes de executar
- Quando identificar despesas, pergunte se está correto antes de salvar
- Sugira categorização, mas permita que o usuário corrija
- Seja proativo em alertar sobre gastos anormais ou próximos de limites
- Celebre conquistas (metas atingidas, orçamento respeitado)
- Use linguagem brasileira casual mas profissional

FORMATO DE RESPOSTA:
- Para despesas: mostre valor, categoria, e impacto no orçamento
- Para consultas: seja direto, use bullets quando listar múltiplos itens
- Para insights: explique o "porquê" e sugira uma ação concreta

CATEGORIAS DISPONÍVEIS:
${categories.map(c => `- ${c.name}: ${c.subcategories.join(', ')}`).join('\n')}

ORÇAMENTOS ATIVOS:
${budgets.map(b => `- ${b.category}: R$ ${b.spent} / R$ ${b.limit} (${b.percentage}%)`).join('\n')}

METAS ATIVAS:
${goals.map(g => `- ${g.name}: R$ ${g.current} / R$ ${g.target} (${g.percentage}%) - Prazo: ${g.deadline}`).join('\n')}

Use as ferramentas disponíveis para executar ações quando necessário.`;
```

#### Prompt para Categorização

```typescript
const CATEGORIZATION_PROMPT = `Analise a descrição da transação e sugira a melhor categoria.

HISTÓRICO DO USUÁRIO:
${userCategorizations} // últimas 50 categorizações do usuário

ESTABELECIMENTOS CONHECIDOS:
- Uber, 99, Cabify → Transporte > Uber/App
- iFood, Uber Eats, Rappi → Alimentação > Delivery
- Carrefour, Pão de Açúcar, Extra → Alimentação > Mercado
- Netflix, Spotify, Prime → Lazer > Assinaturas
- etc.

Retorne:
{
  "category": "nome da categoria",
  "subcategory": "nome da subcategoria ou null",
  "confidence": 0.0-1.0,
  "reasoning": "breve explicação"
}`;
```

#### Prompt para Insights

```typescript
const INSIGHTS_PROMPT = `Você é um analista financeiro especializado em finanças pessoais.

Analise o histórico financeiro e identifique:
1. Padrões de comportamento
2. Anomalias ou gastos incomuns
3. Oportunidades de economia
4. Riscos (orçamentos em perigo, metas difíceis de atingir)
5. Conquistas (progressos positivos)

Para cada insight:
- Seja específico (use números reais)
- Explique o impacto
- Sugira uma ação concreta
- Priorize por relevância

DADOS:
Período: ${period}
Transações: ${transactions.length}
Gasto total: R$ ${totalExpense}
Receita total: R$ ${totalIncome}
Categorias: ${categoriesBreakdown}
Orçamentos: ${budgets}
Metas: ${goals}

Retorne até 5 insights em ordem de prioridade.`;
```

### Otimização de Custos

#### 1. Cache de Conversas
```typescript
// Usar Redis/Upstash para cachear conversas recentes
const getChatHistory = async (familyId: string) => {
  const cached = await redis.get(`chat:${familyId}`);
  if (cached) return JSON.parse(cached);

  const messages = await db.chat_messages
    .where('family_id', familyId)
    .orderBy('created_at', 'desc')
    .limit(20);

  await redis.setex(`chat:${familyId}`, 3600, JSON.stringify(messages));
  return messages;
};
```

#### 2. Structured Outputs
```typescript
// Usar structured outputs para reduzir tokens de resposta
const response = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "transaction",
      schema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["expense", "income"] },
          amount: { type: "number" },
          category: { type: "string" }
        },
        required: ["type", "amount", "category"]
      }
    }
  }
});
```

#### 3. Batch Processing
```typescript
// Para relatórios mensais, processar em batch
const monthlyInsights = await generateInsightsForAllFamilies();
// Mais barato que gerar sob demanda
```

#### 4. Fallback Inteligente
```typescript
// Usar GPT-5-mini primeiro, escalar para GPT-5 se necessário
let model = "gpt-5-mini";
if (requiresComplexAnalysis(message)) {
  model = "gpt-5";
}
```

---

## 📁 Estrutura do Projeto

```
contas_com_ia/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx          # Criar/entrar família
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Layout com sidebar
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx
│   │   │   ├── goals/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── family/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # Chat endpoint
│   │   │   ├── transactions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── budgets/
│   │   │   │   └── route.ts
│   │   │   ├── goals/
│   │   │   │   └── route.ts
│   │   │   ├── insights/
│   │   │   │   └── route.ts
│   │   │   ├── ocr/
│   │   │   │   └── route.ts          # OCR processing
│   │   │   ├── cron/
│   │   │   │   ├── weekly-reports/
│   │   │   │   │   └── route.ts
│   │   │   │   └── monthly-reports/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── supabase/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputArea.tsx
│   │   │   └── SuggestedActions.tsx
│   │   ├── dashboard/
│   │   │   ├── OverviewCard.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── BudgetProgress.tsx
│   │   │   └── InsightCard.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── TransactionFilters.tsx
│   │   │   └── TransactionForm.tsx
│   │   ├── budgets/
│   │   │   ├── BudgetCard.tsx
│   │   │   └── BudgetForm.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   └── GoalForm.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente Supabase browser
│   │   │   ├── server.ts             # Cliente Supabase server
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── openai/
│   │   │   ├── client.ts
│   │   │   ├── chat.ts               # Chat functions
│   │   │   ├── categorization.ts     # Categorização
│   │   │   ├── insights.ts           # Geração de insights
│   │   │   ├── ocr.ts                # OCR Vision
│   │   │   └── prompts.ts            # System prompts
│   │   ├── resend/
│   │   │   ├── client.ts
│   │   │   └── templates/
│   │   │       ├── weekly-report.tsx
│   │   │       └── monthly-report.tsx
│   │   ├── utils/
│   │   │   ├── currency.ts           # Formatação BRL
│   │   │   ├── date.ts               # Formatação datas
│   │   │   ├── calculations.ts       # Cálculos financeiros
│   │   │   └── validators.ts         # Validações Zod
│   │   └── constants.ts
│   │
│   ├── services/
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── goals.ts
│   │   ├── insights.ts
│   │   ├── analytics.ts
│   │   └── notifications.ts
│   │
│   ├── types/
│   │   ├── database.ts               # Types do Supabase
│   │   ├── models.ts                 # Models da aplicação
│   │   └── api.ts                    # Request/Response types
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_rls_policies.sql
│   │   └── 003_seed_categories.sql
│   ├── functions/                    # Edge Functions (se necessário)
│   └── config.toml
│
├── public/
│   ├── images/
│   └── icons/
│
├── emails/                           # Email templates (React Email)
│   ├── WeeklyReport.tsx
│   └── MonthlyReport.tsx
│
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🎨 UI/UX Guidelines

### Design System

#### Cores

```css
/* Paleta principal */
--primary: #6366F1;        /* Indigo - ações principais */
--primary-dark: #4F46E5;
--primary-light: #818CF8;

--success: #10B981;        /* Verde - receitas, metas atingidas */
--warning: #F59E0B;        /* Amarelo - alertas */
--danger: #EF4444;         /* Vermelho - despesas, limites */

--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #4B5563;
--gray-900: #111827;

/* Categorias (cores sugeridas) */
--cat-alimentacao: #F59E0B;
--cat-transporte: #3B82F6;
--cat-moradia: #8B5CF6;
--cat-saude: #EF4444;
--cat-educacao: #10B981;
--cat-lazer: #EC4899;
--cat-compras: #F97316;
```

#### Tipografia

```css
/* Font: Inter (Google Fonts) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Tamanhos */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

#### Espaçamentos

```css
/* Sistema de 8pt */
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
--space-6: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
```

### Princípios de UX

1. **Entrada de dados facilitada**
   - Chat como método primário (menos fricção)
   - OCR para notas fiscais
   - Formulários rápidos como alternativa
   - Sugestões inteligentes (autocomplete)

2. **Feedback imediato**
   - Confirmações visuais claras
   - Loading states informativos
   - Animações sutis (não exageradas)
   - Toasts para ações importantes

3. **Hierarquia de informação**
   - Dados mais importantes em destaque
   - Progressive disclosure (mostrar detalhes sob demanda)
   - Cards para agrupar informações relacionadas

4. **Mobile-first**
   - Responsivo desde o início
   - Touch targets de pelo menos 44x44px
   - Navegação simples (bottom tab bar no mobile)

5. **Acessibilidade**
   - Contraste adequado (WCAG AA)
   - Labels descritivos
   - Navegação por teclado
   - Screen reader friendly

### Componentes Principais

#### Chat Interface
```
┌─────────────────────────────────────────┐
│  💬 Assistente Financeiro          [⚙️] │
├─────────────────────────────────────────┤
│                                         │
│  [Avatar IA] Olá! Como posso ajudar?   │
│                                   10:30 │
│                                         │
│              Gastei 50 no Uber [Avatar]│
│         10:31                           │
│                                         │
│  [Avatar IA] ✅ Registrado: R$ 50,00   │
│              em Transporte              │
│                                         │
│              Orçamento de Transporte:   │
│              R$ 785 / R$ 1.000 (79%)   │
│                                   10:31 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 💡 Sugestões rápidas:           │   │
│  │ • Quanto gastei em lazer?       │   │
│  │ • Criar orçamento               │   │
│  │ • Resumo do mês                 │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  [📎] [Digite uma mensagem...]    [📤] │
└─────────────────────────────────────────┘
```

#### Dashboard Cards
```
┌─────────────────────────────────┐
│  💰 Resumo do Mês               │
│  ─────────────────────────────  │
│                                 │
│  Receitas        R$ 8.500,00 ↗ │
│  Despesas        R$ 5.234,78 ↘ │
│  ─────────────────────────────  │
│  Saldo          +R$ 3.265,22    │
│                       +18% ↗    │
└─────────────────────────────────┘
```

#### Budget Progress
```
┌────────────────────────────────────────┐
│  🍔 Alimentação               [⋮]     │
│  ────────────────────────────────────  │
│  R$ 1.832,00 / R$ 2.000,00            │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░]  92%          │
│                                        │
│  Restam R$ 168,00 para 13 dias        │
│  ⚠️ Cuidado! Você está perto do limite│
└────────────────────────────────────────┘
```

---

## 🔒 Segurança e Privacidade

### Autenticação e Autorização

1. **Supabase Auth**
   - OAuth com Google (sign-in social)
   - JWT tokens gerenciados pelo Supabase
   - Refresh tokens automáticos
   - Session management

2. **Row Level Security (RLS)**
   - Políticas a nível de banco de dados
   - Usuários só acessam dados da própria família
   - Roles (admin, member, dependent) controlam permissões

3. **API Security**
   - Rate limiting (Vercel Edge)
   - CORS configurado
   - Validação de input com Zod
   - Sanitização de dados

### Proteção de Dados

1. **Dados em trânsito**
   - HTTPS obrigatório (Vercel)
   - Certificados SSL automáticos

2. **Dados em repouso**
   - Supabase com criptografia at-rest
   - Backups automáticos diários

3. **Dados sensíveis**
   - Notas fiscais armazenadas com acesso restrito (Supabase Storage)
   - URLs assinadas com expiração
   - Sem armazenamento de dados bancários (cartões, senhas)

### LGPD Compliance

1. **Consentimento**
   - Termos de uso claros no onboarding
   - Política de privacidade acessível
   - Opt-in para emails marketing

2. **Direitos do usuário**
   - Export de dados (CSV/JSON)
   - Deletar conta (e todos os dados)
   - Atualizar informações pessoais

3. **Transparência**
   - Explicar uso de IA nas categorizações
   - Informar que dados são processados pela OpenAI
   - Política de retenção de dados clara

### Boas Práticas de Código

1. **Environment variables**
   ```env
   # .env.local (nunca commitar!)
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   OPENAI_API_KEY=
   RESEND_API_KEY=
   ```

2. **Secrets management**
   - Usar Vercel Environment Variables
   - Diferentes chaves para dev/staging/prod
   - Rotação de chaves periodicamente

3. **Logging e Monitoring**
   - Logs de ações sensíveis (criar/deletar conta)
   - Monitoring de erros (Sentry)
   - Alertas de atividades suspeitas

---

## 📅 Cronograma de Implementação

### Fase 1: Setup e Fundação (Semana 1-2)

**Semana 1:**
- [ ] Setup do projeto Next.js + TypeScript
- [ ] Configuração Tailwind + shadcn/ui
- [ ] Setup Supabase (database + auth)
- [ ] Schema inicial do banco
- [ ] Políticas RLS básicas
- [ ] Seed de categorias padrão

**Semana 2:**
- [ ] Autenticação com Google OAuth
- [ ] Fluxo de onboarding (criar/entrar família)
- [ ] Layout base (sidebar, header)
- [ ] Navegação
- [ ] Integração OpenAI (setup inicial)

**Entregável:** Aplicação funcional com auth + estrutura base

---

### Fase 2: Core Features - Transações (Semana 3-4)

**Semana 3:**
- [ ] Service de transações
- [ ] API endpoints (CRUD)
- [ ] Interface chat básica
- [ ] Integração GPT-5-mini para categorização
- [ ] Registro de despesas via chat
- [ ] Registro de receitas via chat

**Semana 4:**
- [ ] Dashboard home (resumo do mês)
- [ ] Gráficos de categorias
- [ ] Lista de transações
- [ ] Filtros e busca
- [ ] Editar/deletar transações
- [ ] Realtime sync (Supabase)

**Entregável:** Usuários conseguem registrar e visualizar transações

---

### Fase 3: Orçamentos e Metas (Semana 5-6)

**Semana 5:**
- [ ] Service de orçamentos
- [ ] API endpoints
- [ ] Criar orçamento via chat
- [ ] Criar orçamento via formulário
- [ ] Página de orçamentos
- [ ] Budget progress components
- [ ] Alertas de orçamento (80%, 90%, 100%)

**Semana 6:**
- [ ] Service de metas
- [ ] API endpoints
- [ ] Criar meta via chat
- [ ] Criar meta via formulário
- [ ] Página de metas
- [ ] Progress tracking
- [ ] Sugestões de economia (GPT-5)

**Entregável:** Sistema completo de orçamentos e metas

---

### Fase 4: Despesas Recorrentes (Semana 7)

- [ ] Modelo de recorrência no banco
- [ ] Criar despesa recorrente via chat
- [ ] Job para gerar despesas automáticas (Vercel Cron)
- [ ] Gerenciar recorrências (editar, pausar, deletar)
- [ ] Previsão de gastos futuros
- [ ] Alertas de assinaturas não utilizadas

**Entregável:** Sistema de recorrências funcionando

---

### Fase 5: OCR e Insights (Semana 8-9)

**Semana 8:**
- [ ] Upload de imagens (Supabase Storage)
- [ ] OCR com GPT-5 Vision
- [ ] Extração estruturada de dados
- [ ] Interface para foto de nota fiscal
- [ ] Confirmação antes de salvar

**Semana 9:**
- [ ] Service de insights
- [ ] Análise de padrões (GPT-5)
- [ ] Detecção de anomalias
- [ ] Sugestões de economia
- [ ] Celebração de conquistas
- [ ] Dashboard de insights

**Entregável:** OCR funcional + Sistema de insights

---

### Fase 6: Relatórios e Emails (Semana 10-11)

**Semana 10:**
- [ ] Templates de email (React Email)
- [ ] Integração Resend
- [ ] Geração de relatório semanal
- [ ] Geração de relatório mensal
- [ ] Preview de emails no dashboard

**Semana 11:**
- [ ] Vercel Cron Jobs setup
- [ ] Job semanal (segundas, 8h)
- [ ] Job mensal (dia 1, 9h)
- [ ] Configurações de email (usuário opt-out)
- [ ] Notificações in-app

**Entregável:** Sistema completo de relatórios

---

### Fase 7: Polimento e Gestão Familiar (Semana 12-13)

**Semana 12:**
- [ ] Página de família
- [ ] Convidar membros (link de convite)
- [ ] Gerenciar permissões (roles)
- [ ] Visualizar gastos por membro
- [ ] Notificações familiares

**Semana 13:**
- [ ] Página de configurações
- [ ] Exportação de dados (CSV)
- [ ] Deletar conta
- [ ] Testes de usabilidade
- [ ] Ajustes de UI/UX
- [ ] Acessibilidade

**Entregável:** App completo e polido

---

### Fase 8: Testes e Deploy (Semana 14)

- [ ] Testes end-to-end (Playwright)
- [ ] Testes de carga (estimativa de custos OpenAI)
- [ ] Fix de bugs críticos
- [ ] Documentação técnica
- [ ] Deploy em produção (Vercel)
- [ ] Monitoramento configurado (Sentry)
- [ ] Landing page (opcional)

**Entregável:** Aplicação em produção

---

## 💰 Custos Estimados

### Custos de Desenvolvimento (14 semanas)

**Estimativa conservadora:**
- 1 desenvolvedor full-stack
- 40h/semana
- 14 semanas
- **Total:** 560 horas

### Custos Operacionais Mensais (estimativa para 100 usuários ativos)

#### Infraestrutura

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Pro | $20/mês |
| Supabase | Pro | $25/mês |
| Upstash Redis | Pay-as-you-go | ~$5/mês |
| **Subtotal** | | **$50/mês** |

#### APIs e Serviços

**OpenAI (estimativa):**

Assumindo por usuário/mês:
- 100 mensagens no chat (90% GPT-5-mini, 10% GPT-5)
- 1 relatório mensal (GPT-5)
- 2 uploads OCR (GPT-5 Vision)

```
GPT-5-mini (90 msgs):
- Input: ~90k tokens x $0.25/1M = $0.023
- Output: ~20k tokens x $2.00/1M = $0.040

GPT-5 (10 msgs + 1 relatório):
- Input: ~50k tokens x $1.25/1M = $0.063
- Output: ~15k tokens x $10.00/1M = $0.150

GPT-5 Vision (2 OCR):
- ~40k tokens x $1.25/1M = $0.050

Total por usuário: ~$0.33/mês
100 usuários: ~$33/mês
```

**Resend:**
- 100 usuários
- 4 emails/usuário/mês (semanais)
- Free tier: 3.000 emails/mês → **$0**
- (Pro: $20/mês se ultrapassar)

**Total APIs:** ~$33/mês (OpenAI)

#### Total Operacional

| Item | Custo |
|------|-------|
| Infraestrutura | $50/mês |
| OpenAI | $33/mês |
| Resend | $0/mês (free tier) |
| **TOTAL** | **$83/mês** |

### Receita Estimada (100 usuários)

Assumindo distribuição:
- 40% Free (0 receita)
- 35% Individual (R$ 19,90) = 35 usuários
- 20% Familiar (R$ 34,90) = 20 usuários
- 5% Premium (R$ 49,90) = 5 usuários

```
Receita mensal:
35 × R$ 19,90 = R$ 696,50
20 × R$ 34,90 = R$ 698,00
5 × R$ 49,90 = R$ 249,50
─────────────────────────
Total: R$ 1.644,00/mês (~$330 USD)
```

**Margem bruta:** $330 - $83 = **$247/mês** (75% de margem)

### Escalabilidade

| Usuários Ativos | Custo OpenAI | Infra | Total Custo | Receita (estimada) | Margem |
|-----------------|--------------|-------|-------------|-------------------|--------|
| 100 | $33 | $50 | $83 | $330 | $247 (75%) |
| 500 | $165 | $100 | $265 | $1.650 | $1.385 (84%) |
| 1.000 | $330 | $150 | $480 | $3.300 | $2.820 (85%) |
| 5.000 | $1.650 | $400 | $2.050 | $16.500 | $14.450 (88%) |

*Margem melhora com escala devido a custos fixos de infra diluídos.*

---

## 📊 Métricas de Sucesso

### Métricas de Produto

**Engajamento:**
- [ ] DAU/MAU ratio > 30% (usuários voltam frequentemente)
- [ ] Média de 5+ interações/usuário/semana com o chat
- [ ] Taxa de retenção D7 > 40%
- [ ] Taxa de retenção D30 > 25%

**Adoção de Funcionalidades:**
- [ ] 80%+ dos usuários cadastram pelo menos 10 transações/mês
- [ ] 60%+ criam pelo menos 1 orçamento
- [ ] 40%+ criam pelo menos 1 meta
- [ ] 30%+ usam OCR pelo menos 1x/mês

**Conversão:**
- [ ] Free → Paid: 15%+ em 30 dias
- [ ] Churn mensal < 5%

### Métricas Técnicas

**Performance:**
- [ ] Tempo de resposta do chat < 2s (p95)
- [ ] Uptime > 99.5%
- [ ] Core Web Vitals (green)

**Custos:**
- [ ] CAC (custo de aquisição) < R$ 50
- [ ] LTV/CAC ratio > 3:1
- [ ] Custo de IA por usuário < R$ 2/mês

### Métricas de Impacto (Qualitativas)

- [ ] NPS (Net Promoter Score) > 40
- [ ] 90%+ dos usuários reportam "organização financeira melhorou"
- [ ] Feedback positivo sobre insights de IA (úteis e acionáveis)

---

## 📚 Referências e Inspirações

### Apps de Referência (Brasil)

1. **Mobills**
   - Forte em categorização automática
   - Boa UX mobile
   - Insights simples mas efetivos

2. **Organizze**
   - Interface limpa e intuitiva
   - Gestão familiar bem implementada
   - Relatórios completos

3. **GuiaBolso** (descontinuado, mas era referência)
   - Integração bancária (Open Finance)
   - Insights baseados em dados

### Apps Internacionais

1. **YNAB (You Need A Budget)**
   - Filosofia de orçamento zero-based
   - Educação financeira integrada
   - Comunidade engajada

2. **Mint**
   - Automação máxima
   - Dashboards visuais
   - Alertas inteligentes

3. **Copilot (Money)**
   - Chat natural com IA
   - Design excepcional
   - Insights contextualizados

---

## 🚀 Próximos Passos

### Imediato (Pré-desenvolvimento)

1. **Validação:**
   - [ ] Criar landing page simples
   - [ ] Coletar emails de interessados (waitlist)
   - [ ] Validar pricing (pesquisa rápida)

2. **Setup técnico:**
   - [ ] Criar contas (Vercel, Supabase, OpenAI, Resend)
   - [ ] Definir naming (nome do app, domínio)
   - [ ] Setup do repositório Git

3. **Design:**
   - [ ] Criar wireframes de telas principais
   - [ ] Definir identidade visual (logo, cores)
   - [ ] Protótipo Figma (opcional, mas recomendado)

### Durante Desenvolvimento

1. **Testes contínuos:**
   - Alpha test com 5-10 usuários (amigos/família)
   - Iterar com base em feedback
   - Ajustar prompts de IA conforme necessário

2. **Documentação:**
   - Manter README atualizado
   - Documentar decisões técnicas importantes
   - Criar guia de uso para beta testers

### Pós-MVP

1. **Beta pública:**
   - Lançar para waitlist
   - Coletar feedback estruturado
   - Monitorar métricas de perto

2. **Marketing:**
   - Conteúdo educativo (blog, YouTube)
   - Redes sociais (dicas financeiras)
   - Parcerias (influencers de finanças)

3. **Roadmap futuro:**
   - Integração Open Finance (contas bancárias)
   - App mobile nativo (React Native)
   - Planejamento financeiro avançado
   - Investimentos (tracking de carteira)

---

## 📝 Notas Finais

Este documento é um **guia vivo** e deve ser atualizado conforme o projeto evolui.

**Lembre-se:**
- Validar com usuários reais o quanto antes
- Priorizar features que trazem mais valor
- Não over-engineer (MVP primeiro, escalar depois)
- Medir tudo (dados guiam decisões)
- Segurança e privacidade são não-negociáveis

**Sucesso é:**
- Usuários economizando dinheiro de verdade
- Famílias com mais controle financeiro
- Produto sustentável financeiramente
- Código de qualidade e manutenível

---

**Versão:** 1.0
**Última atualização:** 2024-11-17
**Autor:** Gabriel + Claude Code

---

Bora construir! 🚀💙
