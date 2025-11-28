# Roadmap de Finalização - Contas com IA

**Documento:** Plano de Implementação Completo
**Data:** 2025-01-18
**Versão:** 1.0
**Status Atual:** 30% Backend | 100% Frontend
**Objetivo:** Aplicação 100% Funcional em Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Fase 1: MVP Funcional (Crítico)](#fase-1-mvp-funcional-crítico)
3. [Fase 2: Features Completas](#fase-2-features-completas)
4. [Fase 3: User Experience](#fase-3-user-experience)
5. [Fase 4: Polish & Production](#fase-4-polish--production)
6. [Fase 5: Extras & Otimizações](#fase-5-extras--otimizações)
7. [Checklist Final](#checklist-final)
8. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral

### Objetivo Final:
Transformar a aplicação de **30% funcional** para **100% funcional e pronta para produção**.

### Esforço Total Estimado:
**70-90 horas** distribuídas em 5 fases

### Priorização:
```
🔴 Fase 1 (Crítico):  20-26h → MVP Funcional
🟡 Fase 2 (Alto):     18-24h → Features Completas
🟢 Fase 3 (Médio):    12-16h → User Experience
🔵 Fase 4 (Baixo):    10-14h → Polish & Production
⚪ Fase 5 (Opcional): 10-15h → Extras
```

### Cronograma Sugerido:
- **Fase 1:** Semana 1-2 (MVP em 2 semanas)
- **Fase 2:** Semana 3-4 (Features em 2 semanas)
- **Fase 3:** Semana 5 (UX em 1 semana)
- **Fase 4:** Semana 6 (Polish em 1 semana)
- **Fase 5:** Opcional (pós-lançamento)

**Total:** 6 semanas para lançamento

---

## 🔴 Fase 1: MVP Funcional (Crítico)

**Objetivo:** Usuário consegue gerenciar suas finanças completamente

**Duração:** 20-26 horas
**Prioridade:** CRÍTICA
**Resultado:** Aplicação MINIMAMENTE UTILIZÁVEL

---

### 1.1 Transactions CRUD Completo (4-6h)

**Status Atual:** ⚠️ Apenas leitura

#### Backend - API Routes

**Arquivo:** `/src/app/api/transactions/route.ts`

```typescript
// POST /api/transactions - Criar transação manual
export async function POST(request: Request) {
  // 1. Validar autenticação
  // 2. Extrair dados do body
  // 3. Validar campos obrigatórios
  // 4. Buscar family_id do usuário
  // 5. Inserir no Supabase
  // 6. Retornar transação criada
}

// PUT /api/transactions/[id] - Editar transação
// DELETE /api/transactions/[id] - Excluir transação
```

**Validações:**
- Amount > 0
- Type: 'income' | 'expense'
- Description não vazio
- Date válida
- Category_id existe (opcional)

#### Frontend - Integration

**Arquivo:** `/src/components/transactions/TransactionModal.tsx`

**Mudanças:**
1. Conectar form ao backend
2. Submit handler com fetch
3. Loading states
4. Error handling
5. Success feedback (toast)
6. Recarregar lista após ação

**Exemplo:**
```typescript
const handleSubmit = async (data: TransactionForm) => {
  setLoading(true)
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Erro ao salvar')

    toast.success('Transação salva com sucesso!')
    onSuccess()
  } catch (error) {
    toast.error('Erro ao salvar transação')
  } finally {
    setLoading(false)
  }
}
```

#### Testes
- [ ] Criar transação de receita
- [ ] Criar transação de despesa
- [ ] Editar transação existente
- [ ] Excluir transação
- [ ] Validações de campos
- [ ] Atualização da lista

**Arquivos a Modificar:**
- `src/app/api/transactions/route.ts` (CRIAR)
- `src/app/api/transactions/[id]/route.ts` (CRIAR)
- `src/components/transactions/TransactionModal.tsx` (MODIFICAR)
- `src/app/(dashboard)/transactions/page.tsx` (MODIFICAR - recarregar)

---

### 1.2 Budgets - Sistema Completo (8-10h)

**Status Atual:** ❌ 0% implementado

#### Database Schema

**Arquivo:** Supabase SQL Editor

```sql
-- Tabela de orçamentos
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, weekly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold BETWEEN 0 AND 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_budgets_family ON budgets(family_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_active ON budgets(is_active);

-- RLS Policies
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family budgets"
  ON budgets FOR SELECT
  USING (family_id IN (
    SELECT family_id FROM family_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage budgets"
  ON budgets FOR ALL
  USING (family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/budgets/route.ts`

```typescript
// GET /api/budgets - Listar orçamentos
export async function GET(request: Request) {
  // 1. Buscar family_id
  // 2. Query budgets com JOIN em categories
  // 3. Calcular spent (sum de transactions do período)
  // 4. Calcular percentage e remaining
  // 5. Retornar com status (ok, warning, exceeded)
}

// POST /api/budgets - Criar orçamento
export async function POST(request: Request) {
  // 1. Validar campos
  // 2. Verificar se já existe para categoria/período
  // 3. Inserir no Supabase
  // 4. Retornar budget criado
}
```

**Arquivo:** `/src/app/api/budgets/[id]/route.ts`

```typescript
// PUT /api/budgets/[id] - Atualizar
// DELETE /api/budgets/[id] - Excluir
```

**Arquivo:** `/src/app/api/budgets/status/route.ts`

```typescript
// GET /api/budgets/status - Resumo geral
export async function GET() {
  // Retorna:
  // - total_budgeted
  // - total_spent
  // - total_remaining
  // - budgets_exceeded (count)
  // - budgets_warning (count)
}
```

#### Frontend - Páginas e Componentes

**Arquivo:** `/src/app/(dashboard)/budgets/page.tsx`

**Mudanças:**
1. Buscar budgets reais do backend
2. Calcular totais (orçado, gasto, restante)
3. Lista de budgets com progress bar
4. Cores dinâmicas (verde < 70%, amarelo 70-100%, vermelho > 100%)

**Componentes a Criar:**

**1. BudgetCard.tsx**
```typescript
interface BudgetCardProps {
  budget: {
    id: string
    name: string
    category: string
    amount: number
    spent: number
    percentage: number
    period: string
  }
  onEdit: () => void
  onDelete: () => void
}
```

**2. BudgetModal.tsx**
```typescript
// Form para criar/editar orçamento
// Campos:
// - Categoria (select)
// - Valor limite
// - Período (mensal, semanal, anual)
// - Data início/fim
// - Threshold de alerta (%)
```

**3. BudgetAlerts.tsx**
```typescript
// Component de alertas
// Mostra budgets que ultrapassaram 80%
```

#### Funcionalidades Especiais

**1. Cálculo de Gastos:**
```typescript
// Calcular gasto no período do budget
const calculateSpent = async (budgetId: string) => {
  const budget = await getBudget(budgetId)

  const { data } = await supabase
    .from('transactions')
    .select('amount')
    .eq('family_id', budget.family_id)
    .eq('category_id', budget.category_id)
    .eq('type', 'expense')
    .gte('date', budget.start_date)
    .lte('date', budget.end_date || 'infinity')

  return data.reduce((sum, t) => sum + t.amount, 0)
}
```

**2. Sistema de Alertas:**
```typescript
// Trigger para criar notificação quando ultrapassar threshold
CREATE OR REPLACE FUNCTION check_budget_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular % gasto
  -- Se > alert_threshold, criar notificação
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Testes
- [ ] Criar orçamento mensal
- [ ] Editar orçamento existente
- [ ] Excluir orçamento
- [ ] Visualizar gastos em tempo real
- [ ] Alertas quando ultrapassar 80%
- [ ] Progress bar correto
- [ ] Cores por status (verde/amarelo/vermelho)

**Arquivos a Criar:**
- Supabase: tabela `budgets`
- `src/app/api/budgets/route.ts`
- `src/app/api/budgets/[id]/route.ts`
- `src/app/api/budgets/status/route.ts`
- `src/components/budgets/BudgetCard.tsx`
- `src/components/budgets/BudgetModal.tsx`
- `src/components/budgets/BudgetAlerts.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/budgets/page.tsx`

---

### 1.3 Goals - Sistema Completo (8-10h)

**Status Atual:** ❌ 0% implementado

#### Database Schema

```sql
-- Tabela de metas
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL = meta da família
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10, 2) DEFAULT 0 CHECK (current_amount >= 0),
  icon VARCHAR(50), -- emoji ou nome do ícone
  color VARCHAR(20) DEFAULT 'blue',
  deadline DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de depósitos
CREATE TABLE goal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_family ON goals(family_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goal_deposits_goal ON goal_deposits(goal_id);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family goals"
  ON goals FOR SELECT
  USING (family_id IN (
    SELECT family_id FROM family_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their goals"
  ON goals FOR ALL
  USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    AND (user_id = auth.uid() OR user_id IS NULL)
  );
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/goals/route.ts`

```typescript
// GET /api/goals - Listar metas
export async function GET() {
  // Retornar metas com:
  // - Dados básicos
  // - Percentage (current / target * 100)
  // - Remaining (target - current)
  // - Days remaining (deadline - today)
  // - Status: on_track | at_risk | completed
}

// POST /api/goals - Criar meta
```

**Arquivo:** `/src/app/api/goals/[id]/route.ts`

```typescript
// PUT /api/goals/[id] - Atualizar
// DELETE /api/goals/[id] - Excluir
```

**Arquivo:** `/src/app/api/goals/[id]/deposit/route.ts`

```typescript
// POST /api/goals/[id]/deposit - Adicionar valor
export async function POST(request: Request, { params }) {
  const { amount, description } = await request.json()

  // 1. Validar amount > 0
  // 2. Criar registro em goal_deposits
  // 3. Atualizar current_amount da meta
  // 4. Verificar se completou (current >= target)
  // 5. Se completou, marcar is_completed = true
  // 6. Criar notificação de conquista

  return { success: true, goal: updatedGoal }
}
```

#### Frontend - Páginas e Componentes

**Componentes a Criar:**

**1. GoalCard.tsx**
```typescript
interface GoalCardProps {
  goal: {
    id: string
    name: string
    icon: string
    target_amount: number
    current_amount: number
    percentage: number
    deadline: string
    daysRemaining: number
  }
  onDeposit: () => void
  onEdit: () => void
  onDelete: () => void
}

// Visual:
// - Progress circular ou linear
// - Cores: < 30% (vermelho), 30-70% (amarelo), > 70% (verde)
// - Botão "Depositar" em destaque
```

**2. GoalModal.tsx**
```typescript
// Form criar/editar meta
// Campos:
// - Nome da meta
// - Descrição (opcional)
// - Valor alvo
// - Ícone/Emoji
// - Cor
// - Prazo (opcional)
// - Tipo: pessoal ou familiar
```

**3. DepositModal.tsx**
```typescript
// Form adicionar valor à meta
// Campos:
// - Valor
// - Descrição (opcional)
// Mostra: valor atual, valor alvo, % de progresso
```

**4. GoalProgress.tsx**
```typescript
// Component visual de progresso
// Pode ser circular ou linear
// Animado quando atualizar
```

**5. GoalSuggestions.tsx**
```typescript
// Cards de sugestões predefinidas
// Templates:
// - Fundo de Emergência (6 meses de despesas)
// - Viagem dos Sonhos
// - Aposentadoria
// - Carro/Casa
```

#### Funcionalidades Especiais

**1. Auto-cálculo de Meta Inteligente:**
```typescript
// Sugerir valor baseado em histórico
const suggestEmergencyFund = async (familyId: string) => {
  // Calcular média de despesas dos últimos 3 meses
  // Multiplicar por 6
  // Sugerir como meta de fundo de emergência
}
```

**2. Gamificação:**
```typescript
// Celebração ao completar meta
// - Confetti animation
// - Notificação especial
// - Badge de conquista
```

**3. Timeline de Depósitos:**
```typescript
// Mostrar histórico de contribuições
// Gráfico de evolução ao longo do tempo
```

#### Testes
- [ ] Criar meta pessoal
- [ ] Criar meta familiar
- [ ] Adicionar depósito à meta
- [ ] Progress bar atualiza
- [ ] Completar meta (100%)
- [ ] Notificação de conquista
- [ ] Editar meta
- [ ] Excluir meta
- [ ] Visualizar histórico de depósitos

**Arquivos a Criar:**
- Supabase: tabelas `goals` e `goal_deposits`
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/app/api/goals/[id]/deposit/route.ts`
- `src/components/goals/GoalCard.tsx`
- `src/components/goals/GoalModal.tsx`
- `src/components/goals/DepositModal.tsx`
- `src/components/goals/GoalProgress.tsx`
- `src/components/goals/GoalSuggestions.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/goals/page.tsx`

---

### 1.4 Logout Funcional (1-2h)

**Status Atual:** ❌ Botão existe, mas não desconecta

#### Backend - API Route

**Arquivo:** `/src/app/api/auth/logout/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
```

#### Frontend - Integration

**Arquivo:** `/src/app/(dashboard)/menu/page.tsx`

```typescript
const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' })

    if (response.ok) {
      router.push('/login')
      router.refresh()
    }
  } catch (error) {
    toast.error('Erro ao fazer logout')
  }
}
```

**Arquivo:** `/src/components/layout/Header.tsx` (desktop)

Adicionar botão de logout também no header desktop.

#### Testes
- [ ] Logout via menu mobile
- [ ] Logout via header desktop
- [ ] Redirecionamento para /login
- [ ] Sessão realmente encerrada
- [ ] Não consegue acessar rotas protegidas após logout

**Arquivos a Criar:**
- `src/app/api/auth/logout/route.ts`

**Arquivos a Modificar:**
- `src/app/(dashboard)/menu/page.tsx`
- `src/components/layout/Header.tsx`

---

### 📊 Resumo Fase 1

**Total:** 20-26 horas

**Resultado Final:**
```
✅ Usuário pode:
  - Criar, editar e excluir transações manualmente
  - Criar e gerenciar orçamentos mensais
  - Criar e acompanhar metas financeiras
  - Depositar valores em metas
  - Fazer logout da aplicação

✅ Sistema consegue:
  - Calcular gastos por categoria automaticamente
  - Alertar quando orçamento ultrapassar 80%
  - Notificar quando meta for completada
  - Persistir todos os dados no Supabase
```

**Status pós-Fase 1:** MVP FUNCIONAL (50-60% completo)

---

## 🟡 Fase 2: Features Completas

**Objetivo:** Todas as funcionalidades principais implementadas

**Duração:** 18-24 horas
**Prioridade:** ALTA
**Resultado:** Aplicação COMPLETA

---

### 2.1 Categories - CRUD Completo (4-6h)

**Status Atual:** ⚠️ Apenas leitura, dados mockados no frontend

#### Backend - API Routes

**Arquivo:** `/src/app/api/categories/route.ts`

```typescript
// GET /api/categories - Listar (já existe parcialmente)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'expense' | 'income' | null

  const supabase = createClient()

  let query = supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('name')

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  // Adicionar transaction_count para cada categoria
  for (const category of data) {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)

    category.transaction_count = count
  }

  return NextResponse.json(data)
}

// POST /api/categories - Criar categoria
export async function POST(request: Request) {
  const { name, icon, color, type } = await request.json()

  // Validações
  // Inserir no Supabase
  // Retornar categoria criada
}
```

**Arquivo:** `/src/app/api/categories/[id]/route.ts`

```typescript
// PUT /api/categories/[id] - Editar
// DELETE /api/categories/[id] - Excluir (com validação de uso)
```

**Arquivo:** `/src/app/api/subcategories/route.ts`

```typescript
// GET /api/subcategories?category_id=...
// POST /api/subcategories
```

#### Frontend - Mudanças

**Arquivo:** `/src/app/(dashboard)/categories/page.tsx`

**Mudanças:**
1. Buscar categorias reais do backend
2. Mostrar transaction_count real
3. Progress bar baseado em dados reais

**Componentes a Criar:**

**1. CategoryModal.tsx**
```typescript
// Form criar/editar categoria
// Campos:
// - Nome
// - Tipo (despesa/receita)
// - Ícone (picker de emojis)
// - Cor (color picker)
```

**2. CategoryIconPicker.tsx**
```typescript
// Grid de emojis/ícones para escolher
// Categorias sugeridas:
// 🍽️ Alimentação, 🚗 Transporte, 🏠 Moradia
// ❤️ Saúde, 📚 Educação, 🎮 Lazer
```

**3. CategoryColorPicker.tsx**
```typescript
// Palette de cores predefinidas
const colors = [
  'blue', 'red', 'green', 'yellow', 'purple',
  'pink', 'orange', 'gray', 'indigo', 'teal'
]
```

#### Funcionalidades Especiais

**1. Validação de Exclusão:**
```typescript
// Não permitir excluir categoria com transações
const canDeleteCategory = async (categoryId: string) => {
  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  return count === 0
}
```

**2. Categorias Padrão:**
```typescript
// Ao criar família, popular com categorias padrão
const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', icon: '🍽️', color: 'orange', type: 'expense' },
  { name: 'Transporte', icon: '🚗', color: 'blue', type: 'expense' },
  { name: 'Moradia', icon: '🏠', color: 'green', type: 'expense' },
  // ... mais categorias
]
```

#### Testes
- [ ] Listar categorias reais
- [ ] Criar nova categoria
- [ ] Editar categoria existente
- [ ] Excluir categoria sem uso
- [ ] Não excluir categoria com transações
- [ ] Filtrar por tipo (despesa/receita)
- [ ] Transaction count correto

**Arquivos a Criar:**
- `src/app/api/categories/route.ts` (MODIFICAR)
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/subcategories/route.ts`
- `src/components/categories/CategoryModal.tsx`
- `src/components/categories/CategoryIconPicker.tsx`
- `src/components/categories/CategoryColorPicker.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/categories/page.tsx`

---

### 2.2 Profile - Sistema Completo (6-8h)

**Status Atual:** ❌ Interface pronta, sem backend

#### Database Schema

```sql
-- Estender auth.users com perfil
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  cover_url TEXT,
  phone VARCHAR(20),
  birthday DATE,
  location VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());
```

#### Supabase Storage

```sql
-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Criar bucket para covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true);

-- Policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/user/profile/route.ts`

```typescript
// GET /api/user/profile
export async function GET() {
  const supabase = createClient()

  // 1. Buscar user do auth
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Buscar profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 3. Buscar stats
  const { count: transactionsCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return NextResponse.json({
    email: user.email,
    name: user.user_metadata.name,
    ...profile,
    stats: {
      transactions: transactionsCount,
      // ... outras stats
    }
  })
}

// PUT /api/user/profile - Atualizar perfil
export async function PUT(request: Request) {
  const data = await request.json()

  // Validar campos
  // Atualizar user_profiles
  // Atualizar user_metadata se necessário

  return NextResponse.json({ success: true })
}
```

**Arquivo:** `/src/app/api/user/avatar/route.ts`

```typescript
// POST /api/user/avatar - Upload de avatar
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // 1. Validar tipo de arquivo (image/jpeg, image/png)
  // 2. Validar tamanho (max 2MB)
  // 3. Gerar nome único
  const fileName = `${userId}/${Date.now()}.${ext}`

  // 4. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  // 5. Atualizar avatar_url no profile
  const avatarUrl = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName).data.publicUrl

  await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId)

  return NextResponse.json({ avatar_url: avatarUrl })
}
```

**Arquivo:** `/src/app/api/user/cover/route.ts`

Igual ao avatar, mas para cover image.

#### Frontend - Mudanças

**Arquivo:** `/src/app/(dashboard)/profile/page.tsx`

**Mudanças:**
1. Buscar dados reais do backend
2. Upload de avatar funcional
3. Upload de cover funcional
4. Edição inline de campos

**Componentes a Criar:**

**1. AvatarUpload.tsx**
```typescript
// Component de upload com preview
// - Click ou drag & drop
// - Crop antes de upload
// - Preview circular
// - Loading state
```

**2. ProfileEditModal.tsx**
```typescript
// Form de edição de perfil
// Campos editáveis:
// - Nome
// - Telefone
// - Data de nascimento
// - Localização
// - Bio
```

**3. ImageCropper.tsx**
```typescript
// Crop de imagem antes de upload
// Aspect ratio 1:1 para avatar
// Aspect ratio 16:9 para cover
```

#### Testes
- [ ] Visualizar perfil com dados reais
- [ ] Upload de avatar
- [ ] Upload de cover
- [ ] Editar informações pessoais
- [ ] Salvar alterações
- [ ] Stats atualizadas (transações, economizado, metas)

**Arquivos a Criar:**
- Supabase: tabela `user_profiles` e buckets
- `src/app/api/user/profile/route.ts`
- `src/app/api/user/avatar/route.ts`
- `src/app/api/user/cover/route.ts`
- `src/components/profile/AvatarUpload.tsx`
- `src/components/profile/ProfileEditModal.tsx`
- `src/components/profile/ImageCropper.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/profile/page.tsx`

---

### 2.3 Family - Sistema Completo (8-10h)

**Status Atual:** ⚠️ Create existe, gerenciamento não

#### Database Schema

```sql
-- Adicionar campos em family_members
ALTER TABLE family_members ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE family_members ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE family_members ADD COLUMN invitation_token VARCHAR(255) UNIQUE;

-- Tabela de convites pendentes
CREATE TABLE family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON family_invitations(token);
CREATE INDEX idx_invitations_email ON family_invitations(email);
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/family/members/route.ts`

```typescript
// GET /api/family/members - Listar membros
export async function GET() {
  const familyId = await getFamilyId()

  const { data } = await supabase
    .from('family_members')
    .select(`
      *,
      user:auth.users(email, user_metadata)
    `)
    .eq('family_id', familyId)

  // Para cada membro, buscar stats
  for (const member of data) {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', member.user_id)

    member.transactions_count = count
  }

  return NextResponse.json(data)
}
```

**Arquivo:** `/src/app/api/family/invite/route.ts`

```typescript
// POST /api/family/invite - Enviar convite
export async function POST(request: Request) {
  const { email } = await request.json()

  // 1. Validar email
  // 2. Verificar se já é membro
  // 3. Gerar token único
  const token = crypto.randomUUID()

  // 4. Criar convite no DB
  const { data: invitation } = await supabase
    .from('family_invitations')
    .insert({
      family_id: familyId,
      email,
      token,
      invited_by: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    })
    .select()
    .single()

  // 5. Enviar email (Resend API)
  await sendInvitationEmail({
    to: email,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
    familyName: family.name,
    inviterName: user.user_metadata.name,
  })

  return NextResponse.json({ success: true, invitation })
}
```

**Arquivo:** `/src/app/api/family/invite/[token]/route.ts`

```typescript
// GET /api/family/invite/[token] - Verificar convite
export async function GET(req, { params }) {
  // Buscar convite pelo token
  // Verificar se expirou
  // Retornar dados da família
}

// POST /api/family/invite/[token]/accept - Aceitar convite
export async function POST(req, { params }) {
  const { token } = params

  // 1. Buscar convite
  // 2. Validar (não expirado, não aceito)
  // 3. Criar family_member
  // 4. Marcar convite como accepted
  // 5. Criar notificação para quem convidou

  return NextResponse.json({ success: true })
}
```

**Arquivo:** `/src/app/api/family/members/[id]/route.ts`

```typescript
// DELETE /api/family/members/[id] - Remover membro
export async function DELETE(req, { params }) {
  // Validar permissão (apenas admin)
  // Não permitir remover último admin
  // Excluir membro
}

// PUT /api/family/members/[id]/role - Alterar role
export async function PUT(req, { params }) {
  // Validar permissão (apenas admin)
  // Atualizar role
}
```

#### Email Service (Resend)

**Arquivo:** `/src/lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail({
  to,
  inviteUrl,
  familyName,
  inviterName,
}: {
  to: string
  inviteUrl: string
  familyName: string
  inviterName: string
}) {
  await resend.emails.send({
    from: 'Contas com IA <noreply@contascomia.app>',
    to,
    subject: `Você foi convidado para ${familyName}`,
    html: `
      <h1>Convite para ${familyName}</h1>
      <p>${inviterName} convidou você para fazer parte da família no Contas com IA.</p>
      <a href="${inviteUrl}">Aceitar Convite</a>
      <p>Este convite expira em 7 dias.</p>
    `,
  })
}
```

#### Frontend - Mudanças

**Arquivo:** `/src/app/(dashboard)/family/page.tsx`

**Mudanças:**
1. Buscar membros reais
2. Buscar convites pendentes
3. Form de convite funcional
4. Ações de remoção funcionais

**Páginas a Criar:**

**1. `/invite/[token]/page.tsx`**
```typescript
// Página de aceite de convite
// - Verifica token
// - Mostra info da família
// - Botão "Aceitar Convite"
// - Se não logado, redireciona para signup com token
```

**Componentes a Criar:**

**1. MemberCard.tsx**
```typescript
// Card de membro com ações
// - Avatar
// - Nome, email, role
// - Stats (transações)
// - Menu: Alterar role, Remover (se admin)
```

**2. InviteMemberModal.tsx**
```typescript
// Form de convite
// - Input email
// - Validação
// - Feedback de sucesso
```

#### Testes
- [ ] Listar membros reais
- [ ] Enviar convite por email
- [ ] Aceitar convite (novo usuário)
- [ ] Aceitar convite (usuário existente)
- [ ] Remover membro
- [ ] Alterar role (member → admin)
- [ ] Convite expira após 7 dias

**Arquivos a Criar:**
- Supabase: campos em `family_members` e tabela `family_invitations`
- `src/app/api/family/members/route.ts`
- `src/app/api/family/invite/route.ts`
- `src/app/api/family/invite/[token]/route.ts`
- `src/app/api/family/members/[id]/route.ts`
- `src/app/(public)/invite/[token]/page.tsx`
- `src/lib/email/resend.ts`
- `src/components/family/MemberCard.tsx`
- `src/components/family/InviteMemberModal.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/family/page.tsx`

---

### 📊 Resumo Fase 2

**Total:** 18-24 horas

**Resultado Final:**
```
✅ Usuário pode:
  - Gerenciar categorias personalizadas
  - Editar perfil completo com fotos
  - Convidar membros para família
  - Aceitar convites por email
  - Gerenciar membros e roles

✅ Sistema consegue:
  - Upload de imagens (avatar, cover)
  - Enviar emails transacionais
  - Validar convites com expiração
  - Controlar permissões por role
```

**Status pós-Fase 2:** FEATURES COMPLETAS (75-85% completo)

---

## 🟢 Fase 3: User Experience

**Objetivo:** Melhorar experiência do usuário com UX avançado

**Duração:** 12-16 horas
**Prioridade:** MÉDIA
**Resultado:** Experiência EXCEPCIONAL

---

### 3.1 Notifications - Sistema Completo (6-8h)

**Status Atual:** ❌ Interface pronta, sem backend

#### Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- transaction, budget, goal, family, system
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  metadata JSONB, -- dados extras específicos por tipo
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());
```

#### Triggers Automáticos

```sql
-- Notificação quando transação via chat
CREATE OR REPLACE FUNCTION notify_transaction_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source = 'chat' THEN
    INSERT INTO notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.user_id,
      'transaction',
      'Nova transação registrada',
      'Despesa de R$ ' || NEW.amount || ' em ' || (SELECT name FROM categories WHERE id = NEW.category_id),
      '/transactions'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_created_notification
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction_created();

-- Notificação quando orçamento ultrapassar 80%
CREATE OR REPLACE FUNCTION check_budget_threshold()
RETURNS TRIGGER AS $$
DECLARE
  spent DECIMAL;
  budget_amount DECIMAL;
  percentage INTEGER;
  family_members UUID[];
BEGIN
  -- Calcular % gasto
  SELECT SUM(amount) INTO spent
  FROM transactions
  WHERE category_id = NEW.category_id
    AND family_id = NEW.family_id
    AND type = 'expense'
    AND date >= NEW.start_date;

  percentage := (spent / NEW.amount * 100)::INTEGER;

  -- Se ultrapassou threshold, notificar todos da família
  IF percentage >= NEW.alert_threshold THEN
    SELECT array_agg(user_id) INTO family_members
    FROM family_members
    WHERE family_id = NEW.family_id;

    FOREACH member IN ARRAY family_members LOOP
      INSERT INTO notifications (user_id, type, title, message, action_url)
      VALUES (
        member,
        'budget',
        'Orçamento atingindo limite',
        'Você já gastou ' || percentage || '% do orçamento de ' || NEW.name,
        '/budgets'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notificação quando meta completar
CREATE OR REPLACE FUNCTION notify_goal_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND OLD.is_completed = false THEN
    INSERT INTO notifications (user_id, type, title, message, action_url)
    VALUES (
      COALESCE(NEW.user_id, (SELECT user_id FROM family_members WHERE family_id = NEW.family_id LIMIT 1)),
      'goal',
      'Meta alcançada! 🎉',
      'Parabéns! Você completou a meta: ' || NEW.name,
      '/goals'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_completed_notification
  AFTER UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION notify_goal_completed();
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/notifications/route.ts`

```typescript
// GET /api/notifications
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (type) query = query.eq('type', type)
  if (unreadOnly) query = query.eq('read', false)

  const { data } = await query

  return NextResponse.json(data)
}

// PUT /api/notifications/read-all
export async function PUT() {
  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false)

  return NextResponse.json({ success: true })
}
```

**Arquivo:** `/src/app/api/notifications/[id]/route.ts`

```typescript
// PUT /api/notifications/[id] - Marcar como lida
export async function PUT(req, { params }) {
  await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', userId)

  return NextResponse.json({ success: true })
}

// DELETE /api/notifications/[id] - Excluir
```

#### Supabase Realtime

**Arquivo:** `/src/hooks/useNotifications.ts`

```typescript
'use client'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscription para novas notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Toast notification
          toast.info(payload.new.title)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { notifications, unreadCount }
}
```

#### Frontend - Mudanças

**Arquivo:** `/src/app/(dashboard)/notifications/page.tsx`

**Mudanças:**
1. Buscar notificações reais
2. Filtros funcionais
3. Marcar como lida funcional
4. Delete funcional
5. Realtime updates

**Arquivo:** `/src/components/layout/Header.tsx`

Adicionar:
- Badge com unread count no ícone de notificações
- Dropdown com últimas 5 notificações

#### Testes
- [ ] Receber notificação ao criar transação via chat
- [ ] Receber alerta de orçamento
- [ ] Receber notificação de meta completada
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Filtrar por tipo
- [ ] Realtime (nova notificação aparece sem refresh)
- [ ] Badge count atualiza

**Arquivos a Criar:**
- Supabase: tabela `notifications` + triggers
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/hooks/useNotifications.ts`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationDropdown.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/notifications/page.tsx`
- `src/components/layout/Header.tsx`

---

### 3.2 Settings - Sistema Funcional (4-6h)

**Status Atual:** ❌ Toggles visuais, não salvam

#### Database Schema

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notificações
  notifications_enabled BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  goal_alerts BOOLEAN DEFAULT true,
  transaction_alerts BOOLEAN DEFAULT true,

  -- Preferências
  dark_mode BOOLEAN DEFAULT false,
  language VARCHAR(5) DEFAULT 'pt-BR',
  currency VARCHAR(3) DEFAULT 'BRL',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',

  -- Segurança
  two_factor_enabled BOOLEAN DEFAULT false,
  biometric_enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their settings"
  ON user_settings FOR ALL
  USING (user_id = auth.uid());
```

#### Backend - API Routes

**Arquivo:** `/src/app/api/settings/route.ts`

```typescript
// GET /api/settings
export async function GET() {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Se não existe, criar com defaults
  if (!settings) {
    const { data: newSettings } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single()

    return NextResponse.json(newSettings)
  }

  return NextResponse.json(settings)
}

// PUT /api/settings
export async function PUT(request: Request) {
  const updates = await request.json()

  const { data } = await supabase
    .from('user_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  return NextResponse.json(data)
}
```

**Arquivo:** `/src/app/api/user/change-password/route.ts`

```typescript
// POST /api/user/change-password
export async function POST(request: Request) {
  const { currentPassword, newPassword } = await request.json()

  // 1. Verificar senha atual
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return NextResponse.json(
      { error: 'Senha atual incorreta' },
      { status: 400 }
    )
  }

  // 2. Atualizar senha
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
```

**Arquivo:** `/src/app/api/user/export-data/route.ts`

```typescript
// GET /api/user/export-data - Exportar CSV
export async function GET() {
  // 1. Buscar todas as transações
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(name)')
    .eq('user_id', userId)

  // 2. Converter para CSV
  const csv = [
    'Data,Tipo,Categoria,Descrição,Valor',
    ...transactions.map(t =>
      `${t.date},${t.type},${t.category?.name || ''},${t.description},${t.amount}`
    )
  ].join('\n')

  // 3. Retornar como download
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="transacoes.csv"',
    },
  })
}
```

#### Frontend - Mudanças

**Arquivo:** `/src/app/(dashboard)/settings/page.tsx`

**Mudanças:**
1. Buscar settings reais
2. Toggles conectados ao backend
3. Salvam ao mudar
4. Feedback de sucesso

**Componentes a Criar:**

**1. SettingToggle.tsx**
```typescript
// Toggle component reutilizável
interface SettingToggleProps {
  value: boolean
  onChange: (value: boolean) => Promise<void>
  label: string
  description: string
}
```

**2. ChangePasswordModal.tsx**
```typescript
// Form de alteração de senha
// Campos:
// - Senha atual
// - Nova senha
// - Confirmar nova senha
// Validações de senha forte
```

#### Testes
- [ ] Buscar settings do usuário
- [ ] Toggle notifications liga/desliga
- [ ] Alterar idioma (futuro)
- [ ] Alterar moeda (futuro)
- [ ] Alterar senha
- [ ] Exportar dados em CSV
- [ ] Settings persistem após refresh

**Arquivos a Criar:**
- Supabase: tabela `user_settings`
- `src/app/api/settings/route.ts`
- `src/app/api/user/change-password/route.ts`
- `src/app/api/user/export-data/route.ts`
- `src/components/settings/SettingToggle.tsx`
- `src/components/settings/ChangePasswordModal.tsx`

**Arquivos a Modificar:**
- `src/app/(dashboard)/settings/page.tsx`

---

### 3.3 Toast Notifications & Feedback (2-3h)

**Objetivo:** Feedback visual em todas as ações

#### Biblioteca

```bash
npm install react-hot-toast
```

#### Setup Global

**Arquivo:** `/src/app/layout.tsx`

```typescript
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
```

#### Uso em Todas as Ações

```typescript
import toast from 'react-hot-toast'

// Sucesso
toast.success('Transação criada com sucesso!')

// Erro
toast.error('Erro ao salvar orçamento')

// Loading
const toastId = toast.loading('Salvando...')
// ... ação
toast.success('Salvo!', { id: toastId })

// Custom
toast.custom((t) => (
  <div className="bg-blue-500 text-white p-4 rounded-lg">
    Nova notificação!
  </div>
))
```

#### Aplicar em Todos os Forms

- [ ] Transaction create/edit/delete
- [ ] Budget create/edit/delete
- [ ] Goal create/edit/delete/deposit
- [ ] Category create/edit/delete
- [ ] Profile update
- [ ] Avatar upload
- [ ] Family invite
- [ ] Member remove
- [ ] Settings update
- [ ] Password change
- [ ] Logout

---

### 📊 Resumo Fase 3

**Total:** 12-16 horas

**Resultado Final:**
```
✅ Usuário recebe:
  - Notificações automáticas (transações, orçamentos, metas)
  - Notificações em tempo real (Realtime)
  - Configurações salvas e persistentes
  - Feedback visual em todas as ações (toasts)
  - Exportação de dados em CSV

✅ UX Melhorada:
  - Sem mais "cliques sem resposta"
  - Feedback imediato em todas as ações
  - Notificações não invasivas
  - Sistema de alertas inteligente
```

**Status pós-Fase 3:** UX EXCEPCIONAL (85-90% completo)

---

## 🔵 Fase 4: Polish & Production

**Objetivo:** Preparar para produção

**Duração:** 10-14 horas
**Prioridade:** BAIXA (mas necessária)
**Resultado:** PRODUCTION-READY

---

### 4.1 Testes Integrados (4-6h)

#### E2E Testing com Playwright

```bash
npm install -D @playwright/test
```

**Arquivo:** `/tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('should logout successfully', async ({ page }) => {
    // ... login first
    await page.click('[data-testid="menu-button"]')
    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/login')
  })
})
```

**Testes Críticos:**
- [ ] Login/Signup/Logout
- [ ] Create transaction via chat
- [ ] Create transaction manual
- [ ] Create budget
- [ ] Create goal
- [ ] Deposit to goal
- [ ] Invite family member
- [ ] Upload avatar
- [ ] Update settings

#### Unit Tests (Jest)

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**Testes de Utilidades:**
- [ ] formatCurrency
- [ ] formatDate
- [ ] calculatePercentage
- [ ] validateEmail
- [ ] etc.

---

### 4.2 Error Handling & Logging (2-3h)

#### Error Boundary

**Arquivo:** `/src/components/ErrorBoundary.tsx`

```typescript
'use client'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log para serviço de monitoring (Sentry)
    console.error('Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Ops! Algo deu errado</h1>
          <button onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### API Error Handling Padronizado

**Arquivo:** `/src/lib/api/error-handler.ts`

```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

#### Logging Service (Opcional - Sentry)

```bash
npm install @sentry/nextjs
```

---

### 4.3 Performance Optimization (2-3h)

#### Database Indexes

```sql
-- Já criados na maioria, mas verificar:
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
```

#### Image Optimization

- [ ] Usar Next.js `<Image />` em vez de `<img />`
- [ ] Lazy loading em listas longas
- [ ] Avatars com tamanhos múltiplos

#### Bundle Optimization

```typescript
// Dynamic imports para páginas pesadas
const ExpenseChart = dynamic(() => import('@/components/ExpenseChart'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

#### React Query (Opcional)

Para caching e refetching inteligente:

```bash
npm install @tanstack/react-query
```

---

### 4.4 Documentation (2-3h)

#### README.md Completo

```markdown
# Contas com IA

## Features
- Chat IA para registro de transações
- Gerenciamento de orçamentos
- Metas financeiras
- ...

## Tech Stack
- Next.js 15
- Supabase
- OpenAI
- ...

## Setup
1. Clone repo
2. npm install
3. Configure .env
4. npm run dev

## Deploy
Vercel / Netlify / Railway
```

#### API Documentation

**Arquivo:** `/docs/API.md`

Documentar todos os endpoints:
- Auth
- Transactions
- Budgets
- Goals
- etc.

#### User Guide

**Arquivo:** `/docs/USER_GUIDE.md`

Como usar a aplicação:
- Registrar despesas
- Criar orçamentos
- Definir metas
- etc.

---

### 📊 Resumo Fase 4

**Total:** 10-14 horas

**Resultado Final:**
```
✅ Aplicação:
  - Testada (E2E + Unit tests)
  - Error handling robusto
  - Performance otimizada
  - Documentação completa
  - Pronta para deploy

✅ Métricas:
  - 90% de code coverage (testes)
  - < 3s First Contentful Paint
  - < 100ms API responses (média)
  - 0 erros não tratados
```

**Status pós-Fase 4:** PRODUCTION-READY (95-100% completo)

---

## ⚪ Fase 5: Extras & Otimizações (Opcional)

**Objetivo:** Features avançadas pós-lançamento

**Duração:** 10-15 horas
**Prioridade:** OPCIONAL
**Resultado:** PREMIUM EXPERIENCE

---

### 5.1 Help Center - Search Funcional (3-4h)

#### Algolia / MeiliSearch Integration

```bash
npm install algoliasearch
# ou
npm install meilisearch
```

#### Indexação de FAQs

```typescript
// Indexar FAQs no Algolia
const index = client.initIndex('faqs')

await index.saveObjects([
  {
    objectID: '1',
    question: 'Como registrar transação?',
    answer: '...',
    category: 'Chat IA',
    keywords: ['transação', 'registrar', 'despesa'],
  },
  // ...
])
```

#### Search Component

```typescript
const { hits } = await index.search(query)
```

---

### 5.2 Dashboard Analytics Avançado (4-5h)

#### Gráficos Adicionais

1. **Evolução Patrimonial**
   - Line chart de saldo ao longo do tempo
   - Projeção futura baseada em tendências

2. **Gastos por Membro** (família)
   - Pie chart de gastos por pessoa
   - Comparativo mensal

3. **Metas - Timeline**
   - Gantt chart de metas
   - Projeção de conclusão

4. **Orçamentos - Heatmap**
   - Heatmap de categorias mais gastadas
   - Por dia da semana

#### Export de Relatórios

- [ ] PDF mensal
- [ ] Excel com múltiplas sheets
- [ ] Relatório anual

---

### 5.3 Onboarding Flow (3-4h)

#### Tour Guiado

```bash
npm install react-joyride
```

```typescript
const steps = [
  {
    target: '#chat-button',
    content: 'Use o chat para registrar despesas naturalmente!',
  },
  {
    target: '#bottom-nav',
    content: 'Navegue entre as seções principais aqui',
  },
  // ...
]
```

#### Wizard Inicial

Ao criar conta:
1. Bem-vindo!
2. Defina suas categorias favoritas
3. Configure primeiro orçamento
4. Defina primeira meta
5. Convide família (opcional)

---

### 5.4 Gamificação (2-3h)

#### Badges/Conquistas

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50)
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
```

**Conquistas:**
- 🎯 Primeira Meta Concluída
- 💯 10 Transações Registradas
- 📊 Primeiro Orçamento Criado
- 🔥 7 Dias Consecutivos de Registro
- 💰 Economizou R$ 1.000
- etc.

---

### 📊 Resumo Fase 5

**Total:** 10-15 horas

**Resultado Final:**
```
✅ Features Premium:
  - Search inteligente na ajuda
  - Analytics avançados
  - Onboarding guiado
  - Gamificação

✅ Diferencial Competitivo:
  - Experiência superior
  - Engajamento aumentado
  - Retenção melhorada
```

**Status pós-Fase 5:** PREMIUM EXPERIENCE (100%+)

---

## ✅ Checklist Final

### Pre-Launch

**Funcional:**
- [ ] Todas as páginas funcionam
- [ ] Todos os forms salvam dados
- [ ] Todos os botões têm ação
- [ ] Nenhum dado mockado

**Técnico:**
- [ ] Build sem erros
- [ ] Sem warnings críticos
- [ ] Testes passando (>80% coverage)
- [ ] Performance aceitável (Lighthouse >90)

**Segurança:**
- [ ] RLS configurado em todas as tabelas
- [ ] Validação de inputs no backend
- [ ] Rate limiting nas APIs
- [ ] HTTPS obrigatório

**UX:**
- [ ] Loading states em todas as ações
- [ ] Error states com mensagens claras
- [ ] Toast notifications em todas as ações
- [ ] Responsive em todos os breakpoints

**Conteúdo:**
- [ ] Todos os textos revisados
- [ ] Imagens otimizadas
- [ ] SEO metadata configurado
- [ ] Favicon e PWA icons

### Post-Launch

**Monitoring:**
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Uptime monitoring

**Feedback:**
- [ ] Sistema de feedback in-app
- [ ] Email de suporte configurado
- [ ] Documentação de ajuda completa

---

## 📊 Métricas de Sucesso

### Desenvolvimento

| Métrica | Meta |
|---------|------|
| Code Coverage | >80% |
| Build Time | <30s |
| Type Errors | 0 |
| Lint Warnings | <10 |

### Performance

| Métrica | Meta |
|---------|------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| API Response (p95) | <200ms |
| Bundle Size (gzip) | <150kb |

### Qualidade

| Métrica | Meta |
|---------|------|
| Lighthouse Score | >90 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Usuário

| Métrica | Meta (pós-lançamento) |
|---------|------|
| Signup→First Transaction | <2 min |
| Daily Active Users | Crescente |
| Feature Adoption (Chat) | >60% |
| User Retention (D7) | >40% |

---

## 🎯 Cronograma Consolidado

```
Semana 1-2: Fase 1 - MVP Funcional
├─ Transactions CRUD
├─ Budgets completo
├─ Goals completo
└─ Logout

Semana 3-4: Fase 2 - Features Completas
├─ Categories CRUD
├─ Profile completo
└─ Family completo

Semana 5: Fase 3 - User Experience
├─ Notifications
├─ Settings
└─ Toast feedback

Semana 6: Fase 4 - Polish & Production
├─ Testes
├─ Error handling
├─ Performance
└─ Documentation

Pós-lançamento: Fase 5 - Extras (Opcional)
├─ Search
├─ Analytics avançado
├─ Onboarding
└─ Gamificação
```

**Total:** 6 semanas até lançamento
**Horas:** 60-80h (core) + 10-15h (extras)

---

## 💡 Dicas de Implementação

### Ordem Sugerida de Desenvolvimento:

1. **Comece pela Fase 1**
   - É crítico e torna a app utilizável
   - Dá momentum e motivação

2. **Teste Frequentemente**
   - Teste cada feature antes de passar para próxima
   - Usuários reais testando Fase 1 enquanto desenvolve Fase 2

3. **Deploy Incremental**
   - Deploy de Fase 1 em staging
   - Teste com beta users
   - Ajuste antes de continuar

4. **Priorize Feedback**
   - Se usuários pedirem algo da Fase 5, pode antecipar
   - Flexibilidade no roadmap

### Stack Recomendado:

```
Frontend: Next.js 15 (já existe)
Backend: Supabase (já existe)
Email: Resend
Notifications: Supabase Realtime
Search: Algolia (Fase 5)
Monitoring: Sentry (Fase 4)
Analytics: PostHog ou Google Analytics
Hosting: Vercel
```

### Custos Estimados (Mensal):

```
Supabase: $0-25 (free tier até 500MB)
Vercel: $0-20 (free tier + pro se precisar)
Resend: $0 (free tier 100 emails/day)
OpenAI: ~$10-50 (depende do uso)
Algolia: $0 (10k searches/mês free)
Sentry: $0 (5k events/mês free)

Total: $10-95/mês (começando barato!)
```

---

## 🚀 Conclusão

**Situação Atual:** 30% funcional (Frontend 100%, Backend 30%)

**Após Roadmap Completo:** 100% funcional, production-ready

**Esforço Total:** 60-80 horas de desenvolvimento

**Tempo Estimado:** 6 semanas (10-15h/semana)

**Resultado Final:** Aplicação completa, robusta e pronta para escalar

---

**Este documento é um guia vivo.** Ajuste conforme necessário baseado em:
- Feedback de usuários
- Prioridades de negócio
- Recursos disponíveis
- Aprendizados durante desenvolvimento

**Boa sorte na jornada! 🚀**

---

Gerado por Claude Code
Data: 2025-01-18
Versão: 1.0
