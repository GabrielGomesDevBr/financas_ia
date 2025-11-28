import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// GET /api/budgets/status - Obter status dos orçamentos (gastos vs limite)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Buscar family_id do usuário
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma família' },
        { status: 404 }
      )
    }

    // 3. Buscar orçamentos da família
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select(
        `
        id,
        family_id,
        category_id,
        limit_amount,
        period,
        start_date,
        end_date,
        alert_threshold,
        created_at,
        updated_at,
        category:categories!budgets_category_id_fkey(id, name, type)
      `
      )
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: false })

    if (budgetsError) {
      console.error('Erro ao buscar orçamentos:', budgetsError)
      return NextResponse.json(
        { error: 'Erro ao buscar orçamentos' },
        { status: 500 }
      )
    }

    // 4. Para cada orçamento, calcular gastos no período
    const budgetsWithStatus = await Promise.all(
      (budgets || []).map(async (budget: any) => {
        // Buscar transações da categoria no período
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('family_id', budget.family_id)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .gte('date', budget.start_date)
          .lte('date', budget.end_date)

        if (transactionsError) {
          console.error('Erro ao buscar transações:', transactionsError)
          return null
        }

        // Calcular total gasto
        const spentAmount = (transactions || []).reduce(
          (sum: number, t: any) => sum + Number(t.amount),
          0
        )

        // Calcular percentual usado
        const percentageUsed =
          budget.limit_amount > 0
            ? (spentAmount / budget.limit_amount) * 100
            : 0

        // Valor restante
        const remainingAmount = budget.limit_amount - spentAmount

        // Determinar status
        let status: 'ok' | 'warning' | 'exceeded' = 'ok'
        if (spentAmount > budget.limit_amount) {
          status = 'exceeded'
        } else if (
          spentAmount >=
          (budget.limit_amount * budget.alert_threshold) / 100
        ) {
          status = 'warning'
        }

        return {
          budget_id: budget.id,
          family_id: budget.family_id,
          category_id: budget.category_id,
          category_name: Array.isArray(budget.category)
            ? budget.category[0]?.name
            : budget.category?.name,
          limit_amount: budget.limit_amount,
          period: budget.period,
          start_date: budget.start_date,
          end_date: budget.end_date,
          alert_threshold: budget.alert_threshold,
          spent_amount: spentAmount,
          percentage_used: Math.round(percentageUsed * 100) / 100,
          remaining_amount: remainingAmount,
          status,
          created_at: budget.created_at,
          updated_at: budget.updated_at,
        }
      })
    )

    // Filtrar nulls (erros)
    const validBudgets = budgetsWithStatus.filter((b) => b !== null)

    return NextResponse.json({
      success: true,
      budgets: validBudgets,
    })
  } catch (error) {
    console.error('Erro na API de status de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
