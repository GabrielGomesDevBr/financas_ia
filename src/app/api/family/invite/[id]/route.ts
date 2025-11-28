import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/family/invite/[id] - Cancel invite
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

    // Only admins can cancel invites
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem cancelar convites' },
        { status: 403 }
      )
    }

    // Check if invite exists and belongs to user's family
    const { data: invite, error: inviteError } = await supabase
      .from('family_invites')
      .select('id, family_id, status')
      .eq('id', id)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    if (invite.family_id !== userData.family_id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para cancelar este convite' },
        { status: 403 }
      )
    }

    // Update invite status to cancelled
    const { error: updateError } = await supabase
      .from('family_invites')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (updateError) {
      console.error('Error cancelling invite:', updateError)
      return NextResponse.json(
        { error: 'Erro ao cancelar convite' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Convite cancelado com sucesso' })
  } catch (error) {
    console.error('Error in DELETE /api/family/invite/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/family/invite/[id]/resend - Resend invite
export async function POST(
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

    // Only admins can resend invites
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem reenviar convites' },
        { status: 403 }
      )
    }

    // Check if invite exists and belongs to user's family
    const { data: invite, error: inviteError } = await supabase
      .from('family_invites')
      .select('id, family_id, status, email')
      .eq('id', id)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    if (invite.family_id !== userData.family_id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para reenviar este convite' },
        { status: 403 }
      )
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Apenas convites pendentes podem ser reenviados' },
        { status: 400 }
      )
    }

    // Generate new token and extend expiration
    const newToken = crypto.randomUUID()
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Update invite
    const { error: updateError } = await supabase
      .from('family_invites')
      .update({
        token: newToken,
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error resending invite:', updateError)
      return NextResponse.json(
        { error: 'Erro ao reenviar convite' },
        { status: 500 }
      )
    }

    // Note: Email sending is now handled in the dedicated resend endpoint
    // at /api/family/invite/[id]/resend/route.ts

    return NextResponse.json({
      message: 'Convite reenviado com sucesso',
      invite: {
        id,
        email: invite.email,
        token: newToken,
        expires_at: newExpiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error in POST /api/family/invite/[id]/resend:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
