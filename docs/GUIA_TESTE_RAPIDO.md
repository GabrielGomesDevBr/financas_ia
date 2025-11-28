# 🧪 Guia de Teste Rápido - Fase 1 MVP

Este guia ajuda você a testar todas as funcionalidades implementadas na Fase 1.

---

## ⚠️ PRÉ-REQUISITOS

### 1. Executar Scripts SQL no Supabase

**IMPORTANTE:** Antes de testar, você DEVE executar estes scripts no SQL Editor do Supabase:

1. Acesse: https://supabase.com/dashboard/project/SEU_PROJETO/sql/new
2. Execute os scripts nesta ordem:

   **Script 1: Budgets**
   ```bash
   # Copie e execute: /scripts/create_budgets_table.sql
   ```

   **Script 2: Goals**
   ```bash
   # Copie e execute: /scripts/create_goals_table.sql
   ```

3. Verifique se as tabelas foram criadas:
   ```sql
   SELECT * FROM budgets LIMIT 1;
   SELECT * FROM goals LIMIT 1;
   SELECT * FROM goal_deposits LIMIT 1;
   ```

### 2. Iniciar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📝 Teste 1: Transações CRUD

### Criar Transação
1. Faça login na aplicação
2. Vá para **Transações** (menu lateral ou /transactions)
3. Clique em **"Nova Transação"**
4. Preencha:
   - Tipo: Despesa
   - Descrição: "Mercado"
   - Valor: 150.00
   - Data: Hoje
   - Categoria: Alimentação
5. Clique em **"Salvar"**
6. ✅ Verifique: Toast "Transação criada com sucesso!"
7. ✅ Verifique: Transação aparece na lista
8. ✅ Verifique: Cards de resumo atualizados

### Editar Transação
1. Clique no ícone de **lápis** na transação criada
2. Altere o valor para: 175.00
3. Clique em **"Salvar"**
4. ✅ Verifique: Toast "Transação atualizada com sucesso!"
5. ✅ Verifique: Valor atualizado na lista

### Excluir Transação
1. Clique no ícone de **lixeira**
2. Confirme a exclusão
3. ✅ Verifique: Toast "Transação excluída com sucesso!"
4. ✅ Verifique: Transação removida da lista

---

## 💰 Teste 2: Orçamentos (Budgets)

### Criar Orçamento
1. Vá para **Orçamentos** (/budgets)
2. Clique em **"Novo Orçamento"**
3. Preencha:
   - Categoria: Alimentação
   - Valor Limite: 500.00
   - Período: Mensal
   - (datas preenchidas automaticamente)
   - Alerta em: 80% (ajuste o slider)
4. Clique em **"Salvar"**
5. ✅ Verifique: Toast "Orçamento criado com sucesso!"
6. ✅ Verifique: Card do orçamento aparece
7. ✅ Verifique: Barra de progresso visível
8. ✅ Verifique: Cards de resumo atualizados

### Testar Status do Orçamento
1. Crie algumas transações de Alimentação (total > R$ 400)
2. Volte para Orçamentos
3. ✅ Verifique: Barra amarela (warning) quando > 80%
4. ✅ Verifique: Status "Atenção: Próximo do limite"

### Criar Orçamento Excedido
1. Crie transações de Alimentação até ultrapassar R$ 500
2. Volte para Orçamentos
3. ✅ Verifique: Barra vermelha
4. ✅ Verifique: Status "Orçamento excedido"
5. ✅ Verifique: Valor negativo em "Restante"

### Editar Orçamento
1. Clique no ícone de **lápis** no card
2. Altere o limite para: 800.00
3. Salve
4. ✅ Verifique: Barra volta para verde (ok)

### Excluir Orçamento
1. Clique no ícone de **lixeira**
2. Confirme
3. ✅ Verifique: Orçamento removido

---

## 🎯 Teste 3: Metas (Goals)

### Criar Meta Simples
1. Vá para **Metas** (/goals)
2. Clique em **"Nova Meta"**
3. Preencha:
   - Nome: "Viagem para Paris"
   - Descrição: "Férias de verão 2025"
   - Valor da Meta: 10000.00
   - Valor Inicial: 0
   - Prazo: 31/12/2025
4. Clique em **"Salvar"**
5. ✅ Verifique: Toast "Meta criada com sucesso!"
6. ✅ Verifique: Card da meta aparece
7. ✅ Verifique: Progresso em 0%
8. ✅ Verifique: Dias restantes calculados
9. ✅ Verifique: Card de resumo atualizado

### Adicionar Depósito
1. No card da meta, clique no ícone **+** (verde)
2. Digite: 1000.00
3. Observe o preview:
   - Novo saldo: R$ 1.000,00
   - Progresso: 10%
   - Faltam: R$ 9.000,00
4. Adicione observação: "Primeiro depósito"
5. Clique em **"Adicionar Depósito"**
6. ✅ Verifique: Toast "Depósito adicionado com sucesso!"
7. ✅ Verifique: Barra de progresso em 10%
8. ✅ Verifique: Total de "1 depósitos"

### Adicionar Mais Depósitos
1. Adicione mais alguns depósitos (ex: 500, 1500, 2000)
2. ✅ Verifique: Barra de progresso atualizando
3. ✅ Verifique: Contador de depósitos aumentando
4. ✅ Verifique: Cores da barra mudando conforme progresso:
   - 0-25%: Laranja
   - 25-50%: Amarelo
   - 50-75%: Azul
   - 75-100%: Verde

### Completar Meta
1. Adicione um depósito que complete a meta
   - Ex: Se falta R$ 5.000, adicione R$ 5.000
2. No preview, veja: "🎉 Você vai atingir sua meta!"
3. Clique em **"Adicionar Depósito"**
4. ✅ Verifique: Toast "🎉 Parabéns! Você atingiu sua meta!"
5. ✅ Verifique: Status muda para "Concluída"
6. ✅ Verifique: Badge verde com "Concluída"
7. ✅ Verifique: Meta move para seção "Metas Concluídas"

### Criar Meta com Valor Inicial
1. Crie nova meta
2. Defina:
   - Meta: R$ 5.000
   - Valor Inicial: R$ 2.000
3. ✅ Verifique: Já começa com 40% de progresso

### Editar Meta
1. Clique no ícone de **lápis**
2. Altere o nome
3. Altere o status para "Cancelada"
4. Salve
5. ✅ Verifique: Status atualizado
6. ✅ Verifique: Badge cinza "Cancelada"

### Excluir Meta
1. Clique no ícone de **lixeira**
2. Confirme
3. ✅ Verifique: Meta e todos os depósitos excluídos

---

## 🚪 Teste 4: Logout

1. Clique no ícone de **saída** (LogOut) no header
2. ✅ Verifique: Toast "Saindo..."
3. ✅ Verifique: Toast "Logout realizado com sucesso!"
4. ✅ Verifique: Redirecionado para /login
5. ✅ Verifique: Não consegue acessar /dashboard sem login

---

## 🔄 Teste 5: Fluxo Completo

### Cenário: Usuário planejando viagem

1. **Login** na aplicação

2. **Criar Orçamento de Economia**
   - Categoria: Lazer
   - Limite: R$ 500/mês
   - Para não gastar muito

3. **Criar Meta de Viagem**
   - Nome: "Viagem Paris"
   - Meta: R$ 15.000
   - Prazo: 6 meses
   - Valor inicial: R$ 2.000

4. **Adicionar Transações**
   - 5 despesas de Alimentação (testar orçamento)
   - 2 receitas de Salário
   - 3 despesas de Lazer (ultrapassar orçamento)

5. **Verificar Orçamento**
   - Status vermelho em Lazer (excedido)
   - Ajustar limite ou reduzir gastos

6. **Fazer Depósitos na Meta**
   - Depósito mensal: R$ 2.000
   - Ver progresso aumentando
   - Continuar até completar

7. **Completar Meta**
   - Último depósito
   - 🎉 Mensagem de parabéns
   - Meta marcada como concluída

8. **Logout**
   - Sair com sucesso

---

## 🐛 Checklist de Problemas Comuns

### Erro: "Orçamento não encontrado"
- ✅ Executou o script `/scripts/create_budgets_table.sql`?

### Erro: "Meta não encontrada"
- ✅ Executou o script `/scripts/create_goals_table.sql`?

### Transação não aparece na lista
- ✅ Atualize a página
- ✅ Verifique se há erros no console (F12)

### Orçamento mostra "R$ 0,00 gasto" mesmo com transações
- ✅ Verifique se as transações têm a mesma categoria
- ✅ Verifique se as datas estão no período do orçamento
- ✅ Verifique se são do tipo "expense"

### Meta não completa automaticamente
- ✅ Trigger instalado? (script SQL executado?)
- ✅ Valor do depósito realmente atingiu o target?

### Toasts não aparecem
- ✅ Verifique se o `<Toaster />` está no layout
- ✅ Verifique se importou `toast` de 'react-hot-toast'

---

## 📊 Validações Esperadas

### Transações
- ❌ Não permite amount <= 0
- ❌ Não permite campos vazios
- ✅ Permite transações sem categoria
- ✅ Permite editar qualquer campo

### Orçamentos
- ❌ Não permite limit_amount <= 0
- ❌ Não permite end_date <= start_date
- ❌ Não permite duplicata (mesma categoria/período)
- ❌ Não permite threshold < 0 ou > 100
- ✅ Auto-calcula datas baseado no período

### Metas
- ❌ Não permite target_amount <= 0
- ❌ Não permite current_amount > target_amount (na criação)
- ❌ Não permite deadline no passado
- ❌ Não permite depósito em meta cancelada/concluída
- ❌ Não permite depósito > 150% do target
- ✅ Auto-completa ao atingir target
- ✅ Permite meta sem deadline

---

## ✅ Checklist Final

Após testar tudo:

- [ ] Transações: criar, editar, excluir ✅
- [ ] Orçamentos: criar, ver status, editar, excluir ✅
- [ ] Metas: criar, depositar, completar, editar, excluir ✅
- [ ] Logout funcional ✅
- [ ] Toasts em todas as operações ✅
- [ ] Loading states visíveis ✅
- [ ] Empty states visíveis ✅
- [ ] Cards de resumo atualizando ✅
- [ ] Sem erros no console ✅
- [ ] Mobile responsivo ✅

---

## 🎉 Pronto!

Se tudo funcionou, a **Fase 1 está 100% operacional**!

Próximo passo: Continuar para Fase 2 com:
- Categories CRUD
- Profile management
- Family features
- E muito mais!

**Boa sorte nos testes! 🚀**
