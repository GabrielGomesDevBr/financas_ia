import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// GET /api/budgets - Listar orçamentos da família
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

    // 3. Buscar orçamentos da família com informações da categoria
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

    // 4. Transformar dados
    const transformedBudgets = (budgets || []).map((budget: any) => ({
      ...budget,
      category: Array.isArray(budget.category)
        ? budget.category[0]
        : budget.category,
    }))

    return NextResponse.json({
      success: true,
      budgets: transformedBudgets,
    })
  } catch (error) {
    console.error('Erro na API de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Criar novo orçamento
export async function POST(request: Request) {
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

    // 3. Extrair dados do body
    const body = await request.json()
    const {
      category_id,
      limit_amount,
      period,
      start_date,
      end_date,
      alert_threshold = 80,
    } = body

    // 4. Validar campos obrigatórios
    if (!category_id || !limit_amount || !period || !start_date || !end_date) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: category_id, limit_amount, period, start_date, end_date',
        },
        { status: 400 }
      )
    }

    // 5. Validar tipos e valores
    if (typeof limit_amount !== 'number' || limit_amount <= 0) {
      return NextResponse.json(
        { error: 'limit_amount deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'period deve ser monthly, weekly ou yearly' },
        { status: 400 }
      )
    }

    if (
      alert_threshold &&
      (typeof alert_threshold !== 'number' ||
        alert_threshold <= 0 ||
        alert_threshold > 100)
    ) {
      return NextResponse.json(
        { error: 'alert_threshold deve ser um número entre 1 e 100' },
        { status: 400 }
      )
    }

    // 6. Validar datas
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Datas inválidas' },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'end_date deve ser posterior a start_date' },
        { status: 400 }
      )
    }

    // 7. Validar se categoria existe
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // 8. Inserir orçamento
    const { data: budget, error: insertError } = await supabase
      .from('budgets')
      .insert({
        family_id: familyMember.family_id,
        category_id,
        limit_amount,
        period,
        start_date,
        end_date,
        alert_threshold,
      })
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
      .single()

    if (insertError) {
      console.error('Erro ao criar orçamento:', insertError)

      // Verificar erro de duplicata (unique constraint)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe um orçamento para esta categoria neste período' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar orçamento' },
        { status: 500 }
      )
    }

    // 9. Transformar dados
    const transformedBudget = {
      ...budget,
      category: Array.isArray(budget.category)
        ? budget.category[0]
        : budget.category,
    }

    return NextResponse.json(
      {
        success: true,
        budget: transformedBudget,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro na API de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
