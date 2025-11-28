import { createClient } from '@/lib/supabase/server'
import { tools } from '@/lib/openai/tools'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { sendBudgetAlertEmail, sendTransactionAlertEmail } from '@/lib/email'
import { getPersonalityPrompt } from '@/lib/openai/personalities'
import { trackMetric } from '@/lib/tracking'
import { logger } from '@/lib/logger'

// Aumentar timeout para 60 segundos (chamadas à OpenAI podem demorar)
export const maxDuration = 60

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    logger.debug('Chat API', )
    const { message, familyId, threadId, conversationId } = await request.json()
    logger.debug('Chat API', message)
    logger.debug('Chat API', familyId)
    logger.debug('Chat API', conversationId)

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Get effectiveFamilyId from request or from user's profile
    let effectiveFamilyId = familyId
    if (!effectiveFamilyId) {
      const { data: userData } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single()

      effectiveFamilyId = userData?.family_id
    }

    if (!effectiveFamilyId) {
      return NextResponse.json(
        { error: 'FamilyId não encontrado' },
        { status: 400 }
      )
    }

    logger.debug('Chat API', effectiveFamilyId)

    // Get family info and recent chat history
    const { data: family } = await supabase
      .from('families')
      .select('*')
      .eq('id', effectiveFamilyId)
      .single()

    // Load recent messages - GPT-5 precisa de mais contexto para function calling
    let messagesQuery = supabase
      .from('chat_messages')
      .select('role, content')
      .eq('family_id', effectiveFamilyId)

    if (conversationId) {
      messagesQuery = messagesQuery.eq('conversation_id', conversationId)
    } else if (threadId) {
      messagesQuery = messagesQuery.eq('thread_id', threadId)
    }

    const { data: recentMessages } = await messagesQuery
      .order('created_at', { ascending: false })
      .limit(8)  // GPT-5 precisa de mais contexto para entender o fluxo conversacional

    // Get categories for context
    const { data: categories } = await supabase
      .from('categories')
      .select('name, type, subcategories(name)')
      .or(`is_default.eq.true,family_id.eq.${effectiveFamilyId}`)

    const categoriesContext = categories?.map(cat =>
      `${cat.name} (${cat.type}): ${cat.subcategories?.map((sub: any) => sub.name).join(', ')}`
    ).join('\n')

    // Get user's personality preference
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('assistant_personality')
      .eq('user_id', user.id)
      .single()

    const personalityKey = userSettings?.assistant_personality || 'padrao'
    const personalityPrompt = getPersonalityPrompt(personalityKey)

    // Build messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: `${personalityPrompt}

Você é um assistente financeiro. Quando o usuário mencionar uma despesa ou receita, você deve:

1. Se a categoria não estiver clara, pergunte qual categoria
2. Quando tiver: tipo (expense/income), valor, descrição e categoria - CHAME A FUNÇÃO registrar_transacao
3. Após registrar, confirme com sua personalidade

**FORMATAÇÃO DAS RESPOSTAS:**
- Use **negrito** para destacar valores e informações importantes
- Use emojis relevantes para dar emoção às respostas (💰 💸 🎯 ⚠️ ✅ 🚀 etc.)
- Seja expressivo e engajante
- Mantenha sua personalidade em TODAS as respostas

CATEGORIAS DISPONÍVEIS:
${categoriesContext}

DATA ATUAL: ${new Date().toLocaleDateString('pt-BR')}

Seja direto, objetivo e EXPRESSIVO!`
      }
    ]

    // Add recent chat history (reversed to chronological order)
    if (recentMessages && recentMessages.length > 0) {
      messages.push(...recentMessages.reverse())
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    })

    // Call OpenAI with function calling
    logger.debug('Chat API', )
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 800
    })
    logger.debug('Chat API', )

    // Track metric
    await trackMetric(user.id, effectiveFamilyId, 'chat_message', {
      model: 'gpt-4o-mini',
      tokens: completion.usage?.total_tokens,
      has_tool_calls: !!completion.choices[0].message.tool_calls
    })

    const responseMessage = completion.choices[0].message
    const toolCalls = responseMessage.tool_calls

    logger.debug('Chat API', responseMessage.content)
    logger.debug('Chat API', toolCalls ? toolCalls.length : 'NENHUMA')

    // Se o modelo chamou funções, executá-las
    if (toolCalls && toolCalls.length > 0) {
      logger.debug('Chat API', )
      const functionResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          const functionName = toolCall.function.name
          const functionArgs = JSON.parse(toolCall.function.arguments)

          logger.debug('App', `Executando função: ${functionName}`, functionArgs)

          let result: any = {}

          switch (functionName) {
            case 'registrar_transacao':
              result = await registerTransaction(supabase, effectiveFamilyId, user.id, functionArgs)
              break
            case 'buscar_transacoes':
              result = await searchTransactions(supabase, effectiveFamilyId, functionArgs)
              break
            case 'criar_orcamento':
              result = await createBudget(supabase, effectiveFamilyId, functionArgs)
              break
            case 'criar_meta':
              result = await createGoal(supabase, effectiveFamilyId, functionArgs)
              break
            case 'resumo_financeiro':
              result = await getFinancialSummary(supabase, effectiveFamilyId, functionArgs)
              break
            case 'deletar_transacao':
              // 1. Buscar a transação para confirmar e fazer backup
              let query = supabase
                .from('transactions')
                .select('*')
                .eq('family_id', effectiveFamilyId)
                .ilike('description', `%${functionArgs.description}%`)
                .limit(1)

              if (functionArgs.amount) {
                query = query.eq('amount', functionArgs.amount)
              }

              if (functionArgs.date) {
                query = query.eq('date', functionArgs.date)
              }

              const { data: transactions, error: searchError } = await query

              if (searchError || !transactions || transactions.length === 0) {
                result = {
                  success: false,
                  error: 'Transação não encontrada. Verifique a descrição e o valor.'
                }
                break
              }

              const transactionToDelete = transactions[0]

              // 2. Salvar no log de auditoria
              const { error: auditError } = await supabase
                .from('audit_logs')
                .insert({
                  user_id: user.id,
                  action: 'DELETE',
                  entity_type: 'transactions',
                  entity_id: transactionToDelete.id,
                  old_data: transactionToDelete
                })

              if (auditError) {
                logger.error('App', 'Erro ao criar log de auditoria:', auditError)
                result = {
                  success: false,
                  error: 'Erro ao registrar auditoria. A transação não foi apagada por segurança.'
                }
                break
              }

              // 3. Deletar a transação
              const { error: deleteError } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionToDelete.id)

              if (deleteError) {
                result = {
                  success: false,
                  error: 'Erro ao apagar transação.'
                }
              } else {
                result = {
                  success: true,
                  message: `Transação "${transactionToDelete.description}" de R$ ${transactionToDelete.amount} apagada com sucesso.`,
                  deleted_transaction: transactionToDelete
                }
              }
              break
            case 'explicar_funcionalidade':
              const helpData = getHelpContent(functionArgs.funcionalidade, functionArgs.tipo);
              result = {
                success: true,
                data: helpData,
                message: `Aqui está uma ajuda sobre ${functionArgs.funcionalidade}:`
              }
              break
            default:
              result = { error: 'Função não implementada' }
          }

          return {
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            name: functionName,
            content: JSON.stringify(result)
          }
        })
      )

      const secondCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...messages,
          responseMessage,
          ...functionResults
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const finalResponse = secondCompletion.choices[0].message.content

      // Save messages to database
      await saveMessages(supabase, effectiveFamilyId, user.id, threadId, message, finalResponse || '', conversationId)

      // Retornar com detalhes das ações executadas para transparência
      return NextResponse.json({
        message: finalResponse,
        actions: toolCalls.map((tc, index) => {
          const result = JSON.parse(functionResults[index].content)
          return {
            type: tc.function.name,
            parameters: JSON.parse(tc.function.arguments),
            success: result.success !== false,
            wasDuplicate: result.wasDuplicate || false,
            result: result
          }
        })
      })
    }

    // Se não chamou funções, retornar resposta direta
    const assistantMessage = responseMessage.content

    // Save messages to database
    await saveMessages(supabase, effectiveFamilyId, user.id, threadId, message, assistantMessage || '', conversationId)

    return NextResponse.json({ message: assistantMessage })

  } catch (error: any) {
    logger.error('Chat API', )
    logger.error('Chat API', error.constructor.name)
    logger.error('Chat API', error.message)
    logger.error('Chat API', error.stack)
    logger.error('Chat API', error)

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Helper functions
async function registerTransaction(supabase: any, effectiveFamilyId: string, userId: string, args: any) {
  // Find category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .ilike('name', args.category)
    .eq('type', args.type)
    .or(`is_default.eq.true,family_id.eq.${effectiveFamilyId}`)
    .single()

  logger.debug('registerTransaction', args.category, 'tipo:', args.type)
  logger.debug('registerTransaction', category)

  if (categoryError) {
    logger.debug('registerTransaction', categoryError)
  }

  if (!category) {
    // Se não encontrou, listar categorias disponíveis
    const { data: availableCategories } = await supabase
      .from('categories')
      .select('name, type')
      .eq('type', args.type)
      .or(`is_default.eq.true,family_id.eq.${effectiveFamilyId}`)

    logger.debug('registerTransaction', args.type, ':', availableCategories)

    return {
      success: false,
      error: `Categoria "${args.category}" não encontrada. Categorias disponíveis: ${availableCategories?.map((c: any) => c.name).join(', ')}`
    }
  }

  // Find subcategory if provided
  let subcategoryId = null
  if (args.subcategory && category) {
    const { data: subcategory } = await supabase
      .from('subcategories')
      .select('id')
      .eq('name', args.subcategory)
      .eq('category_id', category.id)
      .single()

    subcategoryId = subcategory?.id
  }

  const transactionData = {
    family_id: effectiveFamilyId,
    user_id: userId,
    type: args.type,
    amount: args.amount,
    description: args.description,
    category_id: category.id,
    subcategory_id: subcategoryId,
    date: args.date || new Date().toISOString().split('T')[0],
    source: 'chat'
  }

  // DEDUPLICAÇÃO: Verificar se já existe transação similar nos últimos 5 minutos
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: existingTransactions } = await supabase
    .from('transactions')
    .select('id, amount, description, created_at')
    .eq('family_id', effectiveFamilyId)
    .eq('amount', args.amount)
    .eq('description', args.description)
    .eq('source', 'chat')
    .gte('created_at', fiveMinutesAgo)

  if (existingTransactions && existingTransactions.length > 0) {
    logger.debug('registerTransaction', )
    logger.debug('registerTransaction', existingTransactions[0])
    return {
      success: true,
      transaction: existingTransactions[0],
      wasDuplicate: true
    }
  }

  logger.debug('registerTransaction', transactionData)

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single()

  if (error) {
    logger.error('registerTransaction', error)
    throw error
  }

  logger.debug('registerTransaction', data)

  // EMAIL ALERTS LOGIC
  try {
    // 1. Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    const userEmail = (await supabase.auth.getUser()).data.user?.email
    const userName = (await supabase.auth.getUser()).data.user?.user_metadata?.name || 'Usuário'

    if (settings && userEmail) {
      // 2. Transaction Alert
      if (settings.transaction_alerts) {
        await sendTransactionAlertEmail(userEmail, userName, data)
      }

      // 3. Budget Alert
      if (settings.budget_alerts && data.type === 'expense') {
        // Check if there is a budget for this category
        const { data: budget } = await supabase
          .from('budgets')
          .select('*')
          .eq('family_id', effectiveFamilyId)
          .eq('category_id', data.category_id)
          .single()

        if (budget) {
          // Calculate total expenses for this category in the current period
          const startDate = budget.start_date
          const endDate = budget.end_date || new Date().toISOString() // Fallback

          const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('family_id', effectiveFamilyId)
            .eq('category_id', data.category_id)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)

          const totalExpenses = expenses?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

          if (totalExpenses > budget.limit_amount) {
            await sendBudgetAlertEmail(
              userEmail,
              userName,
              category.name,
              totalExpenses,
              budget.limit_amount
            )
          }
        }
      }
    }
  } catch (alertError) {
    logger.error('registerTransaction', alertError)
    // Don't fail the transaction if email fails
  }

  return { success: true, transaction: data }
}

async function searchTransactions(supabase: any, effectiveFamilyId: string, args: any) {
  let query = supabase
    .from('transactions')
    .select('id, type, amount, description, date, categories!transactions_category_id_fkey(name), subcategories!transactions_subcategory_id_fkey(name)')
    .eq('family_id', effectiveFamilyId)

  if (args.type && args.type !== 'all') {
    query = query.eq('type', args.type)
  }

  if (args.category) {
    query = query.eq('categories.name', args.category)
  }

  if (args.start_date) {
    query = query.gte('date', args.start_date)
  }

  if (args.end_date) {
    query = query.lte('date', args.end_date)
  }

  query = query
    .order('date', { ascending: false })
    .limit(args.limit || 10)

  const { data, error } = await query

  if (error) throw error

  return { transactions: data }
}

async function createBudget(supabase: any, effectiveFamilyId: string, args: any) {
  // Find category
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', args.category)
    .eq('type', 'expense')
    .or(`is_default.eq.true,family_id.eq.${effectiveFamilyId}`)
    .single()

  if (!category) {
    throw new Error(`Categoria "${args.category}" não encontrada`)
  }

  const period = args.period || 'monthly'
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      family_id: effectiveFamilyId,
      category_id: category.id,
      amount: args.amount,
      period,
      start_date: startDate
    }, {
      onConflict: 'family_id,category_id,period,start_date'
    })
    .select()
    .single()

  if (error) throw error

  return { success: true, budget: data }
}

async function createGoal(supabase: any, effectiveFamilyId: string, args: any) {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      family_id: effectiveFamilyId,
      name: args.name,
      target_amount: args.target_amount,
      deadline: args.deadline,
      category: args.category,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error

  return { success: true, goal: data }
}

async function getFinancialSummary(supabase: any, effectiveFamilyId: string, args: any) {
  const period = args.period || 'month'
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(0) // All time
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('family_id', effectiveFamilyId)
    .gte('date', startDate.toISOString().split('T')[0])

  const income = transactions?.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
  const expenses = transactions?.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

  return {
    period,
    income,
    expenses,
    balance: income - expenses,
    transactionCount: transactions?.length || 0
  }
}

async function saveMessages(supabase: any, effectiveFamilyId: string, userId: string, threadId: string | undefined, userMessage: string, assistantMessage: string, conversationId?: string) {
  await supabase.from('chat_messages').insert([
    {
      family_id: effectiveFamilyId,
      user_id: userId,
      thread_id: threadId || null,
      conversation_id: conversationId || null,
      role: 'user',
      content: userMessage
    },
    {
      family_id: effectiveFamilyId,
      user_id: userId,
      thread_id: threadId || null,
      conversation_id: conversationId || null,
      role: 'assistant',
      content: assistantMessage
    }
  ])
}

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
