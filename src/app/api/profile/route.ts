import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// GET /api/profile - Obter perfil do usuário
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

    // 2. Buscar dados do usuário no banco
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Erro ao buscar usuário:', dbError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 500 }
      )
    }

    // 3. Buscar informações da família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, role, families(id, name, plan)')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || dbUser?.name || '',
        avatar_url: user.user_metadata.avatar_url || dbUser?.avatar_url || null,
        phone: user.phone || dbUser?.phone || null,
        created_at: user.created_at,
        family: familyMember
          ? {
              id: familyMember.family_id,
              name: Array.isArray(familyMember.families)
                ? familyMember.families[0]?.name
                : (familyMember.families as any)?.name,
              plan: Array.isArray(familyMember.families)
                ? familyMember.families[0]?.plan
                : (familyMember.families as any)?.plan,
              role: familyMember.role,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Erro na API de profile:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Atualizar perfil do usuário
export async function PUT(request: Request) {
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

    // 2. Extrair dados do body
    const body = await request.json()
    const { full_name, phone } = body

    // 3. Atualizar user_metadata no auth
    const updateData: any = {}
    if (full_name !== undefined) {
      updateData.data = { full_name }
    }
    if (phone !== undefined) {
      updateData.phone = phone
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser(updateData)

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar perfil' },
          { status: 500 }
        )
      }
    }

    // 4. Atualizar tabela users (se existir)
    const dbUpdateData: any = {}
    if (full_name !== undefined) dbUpdateData.name = full_name
    if (phone !== undefined) dbUpdateData.phone = phone

    if (Object.keys(dbUpdateData).length > 0) {
      // Verificar se usuário existe na tabela
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingUser) {
        await supabase.from('users').update(dbUpdateData).eq('id', user.id)
      } else {
        // Criar registro se não existir
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          ...dbUpdateData,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de profile:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
