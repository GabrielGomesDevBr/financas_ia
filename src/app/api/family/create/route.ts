import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { familyName } = await request.json()

    if (!familyName || !familyName.trim()) {
      return NextResponse.json(
        { error: 'Nome da família é obrigatório' },
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

    // Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name: familyName.trim(),
        plan: 'free'
      })
      .select()
      .single()

    if (familyError) {
      logger.error('App', 'Erro ao criar família:', familyError)
      return NextResponse.json(
        { error: familyError.message || 'Erro ao criar família' },
        { status: 500 }
      )
    }

    // Update user with family_id and set as admin
    logger.debug('Family Create', user.id, 'com family_id:', family.id)
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        family_id: family.id,
        role: 'admin'
      })
      .eq('id', user.id)
      .select()

    if (updateError) {
      logger.error('Family Create', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Erro ao atualizar usuário' },
        { status: 500 }
      )
    }

    logger.debug('Family Create', updatedUser)

    // Create family_members record
    // This is required for budget and goals APIs to work properly
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        role: 'admin'
      })

    if (memberError) {
      logger.error('Family Create', 'Error creating family member:', memberError)
      // Don't fail the entire operation, but log the error
      // The user can still use most features, but budgets/goals might not work
    } else {
      logger.info('Family Create', `Created family_members record for user ${user.id}`)
    }

    return NextResponse.json({ success: true, family })
  } catch (error: any) {
    logger.error('App', 'Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
