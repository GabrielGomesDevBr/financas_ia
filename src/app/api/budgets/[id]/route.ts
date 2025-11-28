import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// PUT /api/budgets/[id] - Atualizar orçamento
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 2. Verificar se o orçamento existe e pertence à família do usuário
    const { data: existingBudget, error: fetchError } = await supabase
      .from('budgets')
      .select('family_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingBudget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingBudget.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este orçamento' },
        { status: 403 }
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
      alert_threshold,
    } = body

    // 4. Validar campos se fornecidos
    if (limit_amount !== undefined) {
      if (typeof limit_amount !== 'number' || limit_amount <= 0) {
        return NextResponse.json(
          { error: 'limit_amount deve ser um número maior que zero' },
          { status: 400 }
        )
      }
    }

    if (period !== undefined) {
      if (!['monthly', 'weekly', 'yearly'].includes(period)) {
        return NextResponse.json(
          { error: 'period deve ser monthly, weekly ou yearly' },
          { status: 400 }
        )
      }
    }

    if (alert_threshold !== undefined) {
      if (
        typeof alert_threshold !== 'number' ||
        alert_threshold <= 0 ||
        alert_threshold > 100
      ) {
        return NextResponse.json(
          { error: 'alert_threshold deve ser um número entre 1 e 100' },
          { status: 400 }
        )
      }
    }

    // 5. Validar datas se fornecidas
    if (start_date !== undefined || end_date !== undefined) {
      // Se apenas uma data foi fornecida, buscar a outra do registro existente
      const { data: currentBudget } = await supabase
        .from('budgets')
        .select('start_date, end_date')
        .eq('id', id)
        .single()

      const finalStartDate = new Date(start_date || currentBudget!.start_date)
      const finalEndDate = new Date(end_date || currentBudget!.end_date)

      if (isNaN(finalStartDate.getTime()) || isNaN(finalEndDate.getTime())) {
        return NextResponse.json(
          { error: 'Datas inválidas' },
          { status: 400 }
        )
      }

      if (finalEndDate <= finalStartDate) {
        return NextResponse.json(
          { error: 'end_date deve ser posterior a start_date' },
          { status: 400 }
        )
      }
    }

    // 6. Validar category_id se fornecido
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        )
      }
    }

    // 7. Atualizar orçamento
    const updateData: any = {}
    if (category_id !== undefined) updateData.category_id = category_id
    if (limit_amount !== undefined) updateData.limit_amount = limit_amount
    if (period !== undefined) updateData.period = period
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (alert_threshold !== undefined)
      updateData.alert_threshold = alert_threshold

    const { data: budget, error: updateError } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
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

    if (updateError) {
      console.error('Erro ao atualizar orçamento:', updateError)

      // Verificar erro de duplicata (unique constraint)
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe um orçamento para esta categoria neste período' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar orçamento' },
        { status: 500 }
      )
    }

    // 8. Transformar dados
    const transformedBudget = {
      ...budget,
      category: Array.isArray(budget.category)
        ? budget.category[0]
        : budget.category,
    }

    return NextResponse.json({
      success: true,
      budget: transformedBudget,
    })
  } catch (error) {
    console.error('Erro na API de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id] - Excluir orçamento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 2. Verificar se o orçamento existe e pertence à família do usuário
    const { data: existingBudget, error: fetchError } = await supabase
      .from('budgets')
      .select('family_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingBudget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingBudget.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir este orçamento' },
        { status: 403 }
      )
    }

    // 3. Excluir orçamento
    const { error: deleteError } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir orçamento:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir orçamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Orçamento excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de orçamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
