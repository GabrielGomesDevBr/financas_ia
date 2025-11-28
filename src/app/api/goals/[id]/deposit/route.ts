import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// POST /api/goals/[id]/deposit - Adicionar depósito à meta
export async function POST(
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

    const { id: goalId } = await params

    // 2. Verificar se a meta existe e pertence à família do usuário
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('id, family_id, status, current_amount, target_amount')
      .eq('id', goalId)
      .single()

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingGoal.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para adicionar depósito nesta meta' },
        { status: 403 }
      )
    }

    // 3. Verificar se a meta está ativa
    if (existingGoal.status !== 'active') {
      return NextResponse.json(
        {
          error: `Não é possível adicionar depósito em meta com status ${existingGoal.status}`,
        },
        { status: 400 }
      )
    }

    // 4. Extrair dados do body
    const body = await request.json()
    const { amount, note } = body

    // 5. Validar campos obrigatórios
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    // 6. Verificar se o depósito não ultrapassa muito o target
    // (permitir pequena margem, mas avisar)
    const newCurrentAmount = existingGoal.current_amount + amount
    if (newCurrentAmount > existingGoal.target_amount * 1.5) {
      return NextResponse.json(
        {
          error:
            'O valor do depósito excede muito a meta. Verifique o valor digitado.',
        },
        { status: 400 }
      )
    }

    // 7. Inserir depósito (trigger irá atualizar current_amount automaticamente)
    const { data: deposit, error: insertError } = await supabase
      .from('goal_deposits')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        amount,
        note: note || null,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Erro ao criar depósito:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar depósito' },
        { status: 500 }
      )
    }

    // 8. Buscar meta atualizada
    const { data: updatedGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    // 9. Buscar todos os depósitos
    const { data: deposits } = await supabase
      .from('goal_deposits')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })

    // 10. Calcular dados adicionais
    const percentage =
      updatedGoal!.target_amount > 0
        ? (updatedGoal!.current_amount / updatedGoal!.target_amount) * 100
        : 0

    let daysRemaining = null
    if (updatedGoal!.deadline) {
      const deadlineDate = new Date(updatedGoal!.deadline)
      const today = new Date()
      const diffTime = deadlineDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json(
      {
        success: true,
        deposit,
        goal: {
          ...updatedGoal,
          percentage: Math.round(percentage * 100) / 100,
          remaining_amount: Math.max(
            updatedGoal!.target_amount - updatedGoal!.current_amount,
            0
          ),
          days_remaining: daysRemaining,
          total_deposits: deposits?.length || 0,
          last_deposit_date: deposits?.[0]?.created_at || null,
          deposits: deposits || [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro na API de depósito de meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
