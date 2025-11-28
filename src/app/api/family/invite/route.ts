import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/email'

// POST /api/family/invite - Send family invite
export async function POST(request: Request) {
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

    // Get user's family and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if user has a family
    if (!userData.family_id) {
      return NextResponse.json(
        { error: 'Você precisa estar em uma família para enviar convites' },
        { status: 403 }
      )
    }

    // Only admins can send invites
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem enviar convites' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, family_id')
      .eq('email', email)
      .single()

    if (existingUser) {
      if (existingUser.family_id === userData.family_id) {
        return NextResponse.json(
          { error: 'Este usuário já é membro da sua família' },
          { status: 409 }
        )
      } else if (existingUser.family_id) {
        return NextResponse.json(
          { error: 'Este usuário já pertence a outra família' },
          { status: 409 }
        )
      }
    }

    // Check if invite already exists and is pending
    const { data: existingInvite } = await supabase
      .from('family_invites')
      .select('id, status')
      .eq('family_id', userData.family_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Já existe um convite pendente para este email' },
        { status: 409 }
      )
    }

    // Create invite token
    const inviteToken = crypto.randomUUID()
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`

    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from('family_invites')
      .insert({
        family_id: userData.family_id,
        email,
        invited_by: user.id,
        token: inviteToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json(
        { error: 'Erro ao criar convite' },
        { status: 500 }
      )
    }

    // Send email
    const { success: emailSuccess, error: emailError } = await sendInviteEmail(
      email,
      inviteLink,
      user.user_metadata.name || user.email
    )

    if (!emailSuccess) {
      console.error('Error sending invite email:', emailError)
      // Note: We don't rollback the invite creation, but we warn the user
      return NextResponse.json({
        message: 'Convite criado, mas houve um erro ao enviar o e-mail. Tente reenviar.',
        invite: {
          id: invite.id,
          email: invite.email,
          token: inviteToken,
          expires_at: invite.expires_at,
        },
      }, { status: 201 }) // Still 201 created
    }

    return NextResponse.json({
      message: 'Convite enviado com sucesso',
      invite: {
        id: invite.id,
        email: invite.email,
        token: inviteToken,
        expires_at: invite.expires_at,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/family/invite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/family/invite - List pending invites
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
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.family_id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou sem família' },
        { status: 404 }
      )
    }

    // Get pending invites
    const { data: invites, error: invitesError } = await supabase
      .from('family_invites')
      .select(
        `
        id,
        email,
        status,
        created_at,
        expires_at,
        invited_by_user:users!family_invites_invited_by_fkey(name, email)
      `
      )
      .eq('family_id', userData.family_id)
      .order('created_at', { ascending: false })

    if (invitesError) {
      console.error('Error fetching invites:', invitesError)
      return NextResponse.json(
        { error: 'Erro ao buscar convites' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error in GET /api/family/invite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
