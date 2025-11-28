import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PUT /api/family/members/[id] - Update member role
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user's family and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.family_id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem família' },
        { status: 404 }
      )
    }

    // Only admins can update member roles
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar roles' },
        { status: 403 }
      )
    }

    // Cannot change own role
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode alterar seu próprio role' },
        { status: 400 }
      )
    }

    const { role } = await request.json()

    if (!role || !['admin', 'member', 'dependent'].includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      )
    }

    // Check if member exists and belongs to the same family
    const { data: member, error: memberError } = await supabase
      .from('users')
      .select('id, family_id, role')
      .eq('id', id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    if (member.family_id !== userData.family_id) {
      return NextResponse.json(
        { error: 'Este membro não pertence à sua família' },
        { status: 403 }
      )
    }

    // Update member role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar role do membro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Role atualizado com sucesso',
      member: { id, role },
    })
  } catch (error) {
    console.error('Error in PUT /api/family/members/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/family/members/[id] - Remove member from family
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user's family and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.family_id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem família' },
        { status: 404 }
      )
    }

    // Only admins can remove members
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem remover membros' },
        { status: 403 }
      )
    }

    // Cannot remove self
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode remover a si mesmo da família' },
        { status: 400 }
      )
    }

    // Check if member exists and belongs to the same family
    const { data: member, error: memberError } = await supabase
      .from('users')
      .select('id, family_id, role')
      .eq('id', id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    if (member.family_id !== userData.family_id) {
      return NextResponse.json(
        { error: 'Este membro não pertence à sua família' },
        { status: 403 }
      )
    }

    // Remove member from family (set family_id to null)
    const { error: updateError } = await supabase
      .from('users')
      .update({ family_id: null, role: 'member' })
      .eq('id', id)

    if (updateError) {
      console.error('Error removing member:', updateError)
      return NextResponse.json(
        { error: 'Erro ao remover membro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Membro removido com sucesso' })
  } catch (error) {
    console.error('Error in DELETE /api/family/members/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
