import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// GET /api/goals - Listar metas do usuário/família
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

    // 3. Buscar metas da família com informações de progresso
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: false })

    if (goalsError) {
      console.error('Erro ao buscar metas:', goalsError)
      return NextResponse.json(
        { error: 'Erro ao buscar metas' },
        { status: 500 }
      )
    }

    // 4. Para cada meta, calcular progresso e depósitos
    const goalsWithProgress = await Promise.all(
      (goals || []).map(async (goal: any) => {
        // Buscar depósitos da meta
        const { data: deposits } = await supabase
          .from('goal_deposits')
          .select('*')
          .eq('goal_id', goal.id)
          .order('created_at', { ascending: false })

        // Calcular percentual
        const percentage =
          goal.target_amount > 0
            ? (goal.current_amount / goal.target_amount) * 100
            : 0

        // Calcular dias restantes
        let daysRemaining = null
        if (goal.deadline) {
          const deadline = new Date(goal.deadline)
          const today = new Date()
          const diffTime = deadline.getTime() - today.getTime()
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return {
          ...goal,
          percentage: Math.round(percentage * 100) / 100,
          remaining_amount: Math.max(goal.target_amount - goal.current_amount, 0),
          days_remaining: daysRemaining,
          total_deposits: deposits?.length || 0,
          last_deposit_date: deposits?.[0]?.created_at || null,
          deposits: deposits || [],
        }
      })
    )

    return NextResponse.json({
      success: true,
      goals: goalsWithProgress,
    })
  } catch (error) {
    console.error('Erro na API de metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Criar nova meta
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
    const { name, description, target_amount, deadline, current_amount = 0 } = body

    // 4. Validar campos obrigatórios
    if (!name || !target_amount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, target_amount' },
        { status: 400 }
      )
    }

    // 5. Validar tipos e valores
    if (typeof target_amount !== 'number' || target_amount <= 0) {
      return NextResponse.json(
        { error: 'target_amount deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    if (
      current_amount !== undefined &&
      (typeof current_amount !== 'number' || current_amount < 0)
    ) {
      return NextResponse.json(
        { error: 'current_amount deve ser um número maior ou igual a zero' },
        { status: 400 }
      )
    }

    if (current_amount > target_amount) {
      return NextResponse.json(
        { error: 'current_amount não pode ser maior que target_amount' },
        { status: 400 }
      )
    }

    // 6. Validar deadline se fornecido
    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json({ error: 'Deadline inválido' }, { status: 400 })
      }

      // Verificar se deadline não é no passado
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        return NextResponse.json(
          { error: 'Deadline não pode ser no passado' },
          { status: 400 }
        )
      }
    }

    // 7. Inserir meta
    const { data: goal, error: insertError } = await supabase
      .from('goals')
      .insert({
        family_id: familyMember.family_id,
        user_id: user.id,
        name,
        description: description || null,
        target_amount,
        current_amount,
        deadline: deadline || null,
        status: 'active',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Erro ao criar meta:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar meta' },
        { status: 500 }
      )
    }

    // 8. Calcular dados adicionais
    const percentage =
      goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0

    let daysRemaining = null
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline)
      const today = new Date()
      const diffTime = deadlineDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json(
      {
        success: true,
        goal: {
          ...goal,
          percentage: Math.round(percentage * 100) / 100,
          remaining_amount: Math.max(goal.target_amount - goal.current_amount, 0),
          days_remaining: daysRemaining,
          total_deposits: 0,
          deposits: [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro na API de metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
