import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/family/members - Get family members
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user's family
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.family_id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem família' },
        { status: 404 }
      )
    }

    // Get family info
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name, created_at')
      .eq('id', userData.family_id)
      .single()

    if (familyError || !family) {
      return NextResponse.json(
        { error: 'Família não encontrada' },
        { status: 404 }
      )
    }

    // Get family members with transaction count
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        name,
        avatar_url,
        role,
        created_at
      `
      )
      .eq('family_id', userData.family_id)
      .order('created_at', { ascending: true })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json(
        { error: 'Erro ao buscar membros' },
        { status: 500 }
      )
    }

    // Get transaction counts for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const { count } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', member.id)

        return {
          id: member.id,
          email: member.email,
          name: member.name,
          avatar_url: member.avatar_url,
          role: member.role,
          joined_at: member.created_at,
          transactions_count: count || 0,
        }
      })
    )

    // Get total transactions count for the family
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', userData.family_id)

    return NextResponse.json({
      family: {
        id: family.id,
        name: family.name,
        created_at: family.created_at,
        members_count: members.length,
        transactions_count: totalTransactions || 0,
      },
      members: membersWithStats,
    })
  } catch (error) {
    console.error('Error in GET /api/family/members:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
