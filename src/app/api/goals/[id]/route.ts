import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// PUT /api/goals/[id] - Atualizar meta
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

    // 2. Verificar se a meta existe e pertence ao usuário
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('user_id, family_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário é o dono da meta
    if (existingGoal.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta meta' },
        { status: 403 }
      )
    }

    // 3. Extrair dados do body
    const body = await request.json()
    const { name, description, target_amount, deadline, status } = body

    // 4. Validar campos se fornecidos
    if (target_amount !== undefined) {
      if (typeof target_amount !== 'number' || target_amount <= 0) {
        return NextResponse.json(
          { error: 'target_amount deve ser um número maior que zero' },
          { status: 400 }
        )
      }
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'status deve ser active, completed ou cancelled' },
          { status: 400 }
        )
      }
    }

    // 5. Validar deadline se fornecido
    if (deadline !== undefined && deadline !== null) {
      const deadlineDate = new Date(deadline)
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json({ error: 'Deadline inválido' }, { status: 400 })
      }
    }

    // 6. Atualizar meta
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (target_amount !== undefined) updateData.target_amount = target_amount
    if (deadline !== undefined) updateData.deadline = deadline
    if (status !== undefined) {
      updateData.status = status
      // Se marcar como completed, atualizar completed_at
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    const { data: goal, error: updateError } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar meta:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar meta' },
        { status: 500 }
      )
    }

    // 7. Calcular dados adicionais
    const { data: deposits } = await supabase
      .from('goal_deposits')
      .select('*')
      .eq('goal_id', goal.id)
      .order('created_at', { ascending: false })

    const percentage =
      goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0

    let daysRemaining = null
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline)
      const today = new Date()
      const diffTime = deadlineDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      success: true,
      goal: {
        ...goal,
        percentage: Math.round(percentage * 100) / 100,
        remaining_amount: Math.max(goal.target_amount - goal.current_amount, 0),
        days_remaining: daysRemaining,
        total_deposits: deposits?.length || 0,
        last_deposit_date: deposits?.[0]?.created_at || null,
        deposits: deposits || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Excluir meta
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

    // 2. Verificar se a meta existe e pertence ao usuário
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário é o dono da meta
    if (existingGoal.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta meta' },
        { status: 403 }
      )
    }

    // 3. Excluir meta (os depósitos serão excluídos em cascata)
    const { error: deleteError } = await supabase.from('goals').delete().eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir meta:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir meta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Meta excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
