import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// GET /api/family/invite/[token] - Get invite details by token
export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = await createClient()

        // Fetch invite by token
        const { data: invite, error: inviteError } = await supabase
            .from('family_invites')
            .select(
                `
        id,
        email,
        status,
        created_at,
        expires_at,
        family:families!family_invites_family_id_fkey(id, name),
        invited_by_user:users!family_invites_invited_by_fkey(name, email)
      `
            )
            .eq('token', token)
            .single()

        if (inviteError || !invite) {
            logger.error('Invite Token', 'Invite not found:', inviteError)
            return NextResponse.json(
                { error: 'Convite não encontrado' },
                { status: 404 }
            )
        }

        // Check if invite is still valid
        if (invite.status !== 'pending') {
            return NextResponse.json(
                { error: `Este convite já foi ${invite.status === 'accepted' ? 'aceito' : 'cancelado'}` },
                { status: 400 }
            )
        }

        // Check if invite is expired
        const expiresAt = new Date(invite.expires_at)
        if (expiresAt < new Date()) {
            // Auto-expire the invite
            await supabase
                .from('family_invites')
                .update({ status: 'expired' })
                .eq('id', invite.id)

            return NextResponse.json(
                { error: 'Este convite expirou' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            invite: {
                id: invite.id,
                email: invite.email,
                family: invite.family,
                invited_by: invite.invited_by_user,
                expires_at: invite.expires_at,
            },
        })
    } catch (error) {
        logger.error('Invite Token', 'Error fetching invite:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST /api/family/invite/[token] - Accept invite
export async function POST(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = await createClient()

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Fetch invite
        const { data: invite, error: inviteError } = await supabase
            .from('family_invites')
            .select('*')
            .eq('token', token)
            .single()

        if (inviteError || !invite) {
            logger.error('Accept Invite', 'Invite not found:', inviteError)
            return NextResponse.json(
                { error: 'Convite não encontrado' },
                { status: 404 }
            )
        }

        // Validate invite
        if (invite.status !== 'pending') {
            return NextResponse.json(
                { error: 'Este convite não está mais disponível' },
                { status: 400 }
            )
        }

        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'Este convite expirou' },
                { status: 400 }
            )
        }

        // Verify email matches
        if (invite.email !== user.email) {
            return NextResponse.json(
                { error: 'Este convite foi enviado para outro email' },
                { status: 403 }
            )
        }

        // Check if user already belongs to a family
        const { data: existingUser } = await supabase
            .from('users')
            .select('family_id')
            .eq('id', user.id)
            .single()

        if (existingUser?.family_id) {
            return NextResponse.json(
                { error: 'Você já pertence a uma família' },
                { status: 400 }
            )
        }

        // Update user with new family_id
        const { error: updateError } = await supabase
            .from('users')
            .update({
                family_id: invite.family_id,
                role: 'member',
            })
            .eq('id', user.id)

        if (updateError) {
            logger.error('Accept Invite', 'Error updating user:', updateError)
            return NextResponse.json(
                { error: 'Erro ao aceitar convite' },
                { status: 500 }
            )
        }

        // Create family_members record
        // This is critical for budgets and goals to work
        const { error: memberError } = await supabase
            .from('family_members')
            .insert({
                family_id: invite.family_id,
                user_id: user.id,
                role: 'member',
            })

        if (memberError) {
            logger.error('Accept Invite', 'Error creating family member:', memberError)
            // Don't fail the entire operation, but log the error
        } else {
            logger.info('Accept Invite', `Created family_members record for user ${user.id}`)
        }

        // Update invite status
        const { error: inviteUpdateError } = await supabase
            .from('family_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id)

        if (inviteUpdateError) {
            logger.error('Accept Invite', 'Error updating invite status:', inviteUpdateError)
        }

        logger.info('Accept Invite', `User ${user.id} accepted invite to family ${invite.family_id}`)

        return NextResponse.json({
            success: true,
            message: 'Convite aceito com sucesso!',
        })
    } catch (error) {
        logger.error('Accept Invite', 'Error accepting invite:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
