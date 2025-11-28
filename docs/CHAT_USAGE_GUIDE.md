# Guia de Uso - Chat com IA

## 🚀 Começando

### Acessando o Chat

1. Faça login no sistema
2. Navegue para `/chat`
3. Você verá a lista de conversas anteriores à esquerda
4. Clique em "Nova Conversa" para começar

---

## 💬 Como Usar

### Registrando Despesas

**Exemplos de comandos:**

```
✅ "gastei 30 reais no mercado"
✅ "comprei pães por 25 reais"
✅ "paguei 50 de uber"
✅ "abasteci o carro, gastei 100 reais"
✅ "almoço hoje foi 45"
```

**A IA vai:**
1. Identificar que é uma despesa
2. Extrair o valor
3. Categorizar automaticamente
4. Pedir confirmação (se necessário)
5. Registrar no banco de dados

---

### Registrando Receitas

**Exemplos de comandos:**

```
✅ "recebi salário de 5000 reais"
✅ "ganhei 200 de freela"
✅ "vendi algo por 150"
```

---

### Múltiplas Transações

**Você pode mencionar várias transações em uma mensagem:**

```
✅ "hoje gastei 20 no café da manhã e 50 no almoço"
✅ "comprei pão (10 reais) e leite (8 reais)"
```

A IA vai registrar **cada transação separadamente**.

---

### Consultando Gastos

**Exemplos de perguntas:**

```
✅ "quanto gastei hoje?"
✅ "quais foram minhas despesas esta semana?"
✅ "mostre meus gastos com alimentação"
✅ "qual meu gasto total do mês?"
```

---

### Datas Específicas

**Você pode especificar a data:**

```
✅ "ontem gastei 40 no mercado"
✅ "semana passada paguei 100 de internet"
✅ "no dia 15 comprei roupas por 200"
```

Se não mencionar a data, **usa a data atual**.

---

## 🎯 Categorização Automática

A IA categoriza automaticamente baseada na descrição:

| Descrição | Categoria | Subcategoria |
|-----------|-----------|--------------|
| "mercado", "supermercado" | Alimentação | Mercado |
| "uber", "taxi", "transporte" | Transporte | Uber/App |
| "gasolina", "abastecimento" | Transporte | Combustível |
| "café", "lanche", "almoço" | Alimentação | Restaurante |
| "internet", "luz", "água" | Moradia | Contas |

### Categorias Disponíveis

**Despesas (expense):**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Outros

**Receitas (income):**
- Salário
- Freela
- Investimentos
- Outros

---

## ✅ Boas Práticas

### ✅ Fazer:

1. **Seja natural:** "gastei 30 no mercado" funciona melhor que "registrar despesa 30"
2. **Use confirmações:** Se a IA pedir confirmação, responda "sim" ou "não"
3. **Uma mensagem por vez:** Aguarde a resposta antes de enviar nova mensagem
4. **Nova conversa para novo dia:** Crie nova thread para cada dia/contexto

### ❌ Evitar:

1. **Não repita transações:** Se já registrou, não mencione novamente
2. **Não edite via chat:** Para editar, use a página de Transações
3. **Não use valores muito grandes sem vírgula:** Prefira "1.500" a "1500"
4. **Não misture contextos:** Uma conversa para despesas, outra para consultas

---

## 🔧 Recursos Avançados

### Criando Orçamentos

```
"crie um orçamento de 500 reais para alimentação"
"defina limite de 200 para transporte este mês"
```

### Criando Metas

```
"criar meta de juntar 5000 para viagem até dezembro"
"meta de economizar 1000 para emergências"
```

### Resumos Financeiros

```
"resumo do mês"
"quanto gastei esta semana?"
"saldo atual"
```

---

## 🎨 Interface

### Lista de Conversas (Sidebar)

- **Nova Conversa:** Cria thread nova
- **Threads Anteriores:** Clique para reabrir
- **Deletar:** Ícone de lixeira para remover thread

### Área de Chat

- **Mensagens do usuário:** Alinhadas à direita, fundo azul
- **Mensagens da IA:** Alinhadas à esquerda, fundo cinza
- **Loading:** Animação "Pensando..." enquanto processa

### Ações Sugeridas

Clique nos botões de ação rápida:
- "Registrar despesa"
- "Ver gastos do mês"
- "Criar orçamento"

---

## 🛡️ Proteções do Sistema

### Proteção Contra Duplicatas

**O sistema previne duplicatas automaticamente:**

```
Você: "gastei 50 em abastecimento"
IA: [registra]

Você: "gastei 50 em abastecimento" [repetindo sem querer]
IA: "Já registrei essa transação anteriormente"
```

**Janela de proteção:** 5 minutos

---

### Confirmações

**Para valores altos ou categorias ambíguas, a IA pede confirmação:**

```
Você: "gastei 1000"
IA: "Quer registrar despesa de R$ 1.000 em qual categoria?"
Você: "alimentação"
IA: [registra]
```

---

## 🐛 Solução de Problemas

### "Transação não aparece na lista"

**Possíveis causas:**
1. A IA não chamou a função de registro
2. Erro na categorização
3. Transação foi detectada como duplicata

**Solução:**
- Verifique a resposta da IA
- Vá em `/transactions` e verifique manualmente
- Tente reformular a mensagem

---

### "IA não entende meu comando"

**Dicas:**
1. Seja mais específico: "gastei X em Y"
2. Use valores numéricos: "30" em vez de "trinta"
3. Mencione a categoria se necessário

---

### "Categoria errada"

**Solução:**
1. Vá em `/transactions`
2. Clique no ícone de edição
3. Corrija a categoria manualmente

**Ou mencione a categoria explicitamente:**
```
"gastei 30 no mercado, categoria alimentação"
```

---

## 📱 Dicas de Uso Diário

### Rotina Matinal

```
1. Abrir nova conversa: "Gastos de hoje"
2. Ao longo do dia: mencionar cada gasto
3. Fim do dia: "resumo de hoje"
```

### Controle Semanal

```
Segunda-feira: "resumo da semana passada"
Durante a semana: registrar conforme gasta
Domingo: "qual meu saldo desta semana?"
```

### Planejamento Mensal

```
Dia 1: "criar orçamento de 2000 para alimentação"
Durante o mês: acompanhar gastos
Fim do mês: "quanto gastei em alimentação?"
```

---

## 🎓 Exemplos Práticos

### Cenário 1: Dia Normal

```
Você: "bom dia"
IA: "Bom dia! Como posso ajudar?"

Você: "tomei café na padaria, gastei 15 reais"
IA: "Registrei R$ 15,00 em Alimentação > Padaria ✓"

Você: "peguei uber pro trabalho, 25 reais"
IA: "Registrei R$ 25,00 em Transporte > Uber ✓"

Você: "quanto já gastei hoje?"
IA: "Hoje você gastou R$ 40,00:
- Alimentação: R$ 15,00
- Transporte: R$ 25,00"
```

---

### Cenário 2: Compras do Mês

```
Você: "fiz compras no mercado"
IA: "Quanto você gastou nas compras?"

Você: "foram 350 reais"
IA: "Registrei R$ 350,00 em Alimentação > Mercado ✓
Seu gasto com alimentação este mês está em R$ 850,00"
```

---

### Cenário 3: Planejamento

```
Você: "quero criar uma meta"
IA: "Claro! Me conte sobre sua meta"

Você: "juntar 10 mil para viagem até julho"
IA: "Meta criada: 'Viagem' com alvo de R$ 10.000,00 até julho ✓"

Você: "quantos meses faltam?"
IA: "Faltam 6 meses. Você precisa economizar R$ 1.666,67 por mês"
```

---

## 🔄 Atualizações Recentes

### Versão 1.1.0 (18/11/2025)

**Melhorias:**
- ✅ Sistema de deduplicação implementado
- ✅ Histórico otimizado (2 mensagens)
- ✅ Categorização mais precisa
- ✅ Proteção contra duplicatas (5min)

**Bugs Corrigidos:**
- ✅ Transações duplicadas de mensagens antigas
- ✅ Categorias aparecendo como "Sem categoria"
- ✅ Timeout em conversas longas

---

## 📞 Suporte

**Problemas persistentes?**
- Verifique o [Changelog](../CHANGELOG_CHAT_FIX.md)
- Consulte a [Arquitetura Técnica](./ARCHITECTURE_CHAT.md)
- Reporte bugs abrindo uma issue

---

## 🎉 Aproveite!

O chat foi projetado para ser natural e intuitivo.
**Quanto mais você usar, melhor ele entende seu padrão de gastos!**

---

**Última atualização:** 18/11/2025
