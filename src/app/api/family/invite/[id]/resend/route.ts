import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

// POST /api/family/invite/[id]/resend - Resend invite email
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
            .select('family_id, role, name')
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
            .select('id, family_id, status, email, token')
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

        // Update invite with new token and expiration
        const { error: updateError } = await supabase
            .from('family_invites')
            .update({
                token: newToken,
                expires_at: newExpiresAt.toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            logger.error('Resend Invite', 'Error updating invite:', updateError)
            return NextResponse.json(
                { error: 'Erro ao reenviar convite' },
                { status: 500 }
            )
        }

        // Send email with new invite link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${newToken}`
        const { success: emailSuccess, error: emailError } = await sendInviteEmail(
            invite.email,
            inviteLink,
            userData.name || user.email
        )

        if (!emailSuccess) {
            logger.error('Resend Invite', 'Error sending email:', emailError)
            return NextResponse.json({
                message: 'Convite atualizado, mas houve um erro ao enviar o e-mail',
                invite: {
                    id,
                    email: invite.email,
                    token: newToken,
                    expires_at: newExpiresAt.toISOString(),
                },
            }, { status: 201 })
        }

        logger.info('Resend Invite', `Invite ${id} resent to ${invite.email} `)

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
        logger.error('Resend Invite', 'Error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
