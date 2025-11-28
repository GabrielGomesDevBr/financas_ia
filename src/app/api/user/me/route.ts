import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      logger.error('API /user/me', userError)
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }

    logger.debug('API /user/me', userData)
    logger.debug('API /user/me', userData?.family_id)

    // Get family data if user has one
    let familyData = null
    if (userData?.family_id) {
      const { data, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', userData.family_id)
        .single()

      if (familyError) {
        logger.error('App', 'Erro ao buscar família:', familyError)
      } else {
        familyData = data
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        dbData: userData
      },
      family: familyData
    })
  } catch (error: any) {
    logger.error('App', 'Erro na API /user/me:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
