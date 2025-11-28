import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * DELETE /api/user/delete-account
 * 
 * Marks user account for deletion with 30-day recovery period (soft delete).
 * User is immediately signed out after marking for deletion.
 * 
 * @route DELETE /api/user/delete-account
 * @access Private (authenticated users only)
 * 
 * @body {string} reason - Optional reason for deletion
 * 
 * @returns {200} Account marked for deletion
 * @returns {200}.success {boolean} - Operation success
 * @returns {200}.deletion_date {string} - ISO date when account will be permanently deleted
 * @returns {200}.is_admin_with_members {boolean} - If user is admin with other family members
 * @returns {200}.family_members {array} - Other family members (if admin)
 * 
 * @throws {401} User not authenticated
 * @throws {404} User not found
 * @throws {400} Account already marked for deletion
 * @throws {500} Internal server error
 * 
 * @example
 * // Request
 * DELETE /api/user/delete-account
 * { "reason": "No longer needed" }
 * 
 * // Response
 * {
 *   "success": true,
 *   "deletion_date": "2024-12-28T10:00:00Z",
 *   "is_admin_with_members": false
 * }
 */
export async function DELETE(request: Request) {
    try {
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

        // Get deletion reason from request (optional)
        const { reason } = await request.json().catch(() => ({ reason: null }))

        // Get user data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, family_id, role, deleted_at')
            .eq('id', user.id)
            .single()

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            )
        }

        // Check if already marked for deletion
        if (userData.deleted_at) {
            return NextResponse.json(
                { error: 'Conta já está marcada para deleção' },
                { status: 400 }
            )
        }

        // Check if user is family admin with other members
        let isAdminWithMembers = false
        let familyMembers: any[] = []

        if (userData.family_id) {
            const { data: members } = await supabase
                .from('family_members')
                .select('user_id, role, users!family_members_user_id_fkey(name, email)')
                .eq('family_id', userData.family_id)

            familyMembers = members || []
            const otherMembers = familyMembers.filter((m) => m.user_id !== user.id)
            isAdminWithMembers = userData.role === 'admin' && otherMembers.length > 0
        }

        // Calculate deletion date (30 days from now)
        const deletionDate = new Date()
        deletionDate.setDate(deletionDate.getDate() + 30)

        // Mark user for deletion (soft delete)
        const { error: updateError } = await supabase
            .from('users')
            .update({
                deleted_at: new Date().toISOString(),
                deletion_scheduled_at: deletionDate.toISOString(),
                deletion_reason: reason,
            })
            .eq('id', user.id)

        if (updateError) {
            logger.error('Delete Account', 'Error marking account for deletion:', updateError)
            return NextResponse.json(
                { error: 'Erro ao marcar conta para deleção' },
                { status: 500 }
            )
        }

        // Log the action
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'account_deletion_requested',
            details: {
                email: user.email,
                deleted_at: new Date().toISOString(),
                deletion_scheduled_at: deletionDate.toISOString(),
                family_id: userData.family_id,
                role: userData.role,
                reason: reason,
                is_admin_with_members: isAdminWithMembers,
            },
        })

        logger.info('Delete Account', `User ${user.id} marked for deletion on ${deletionDate.toISOString()}`)

        // Sign out the user
        await supabase.auth.signOut()

        return NextResponse.json({
            success: true,
            message: 'Conta marcada para deleção',
            deletion_date: deletionDate.toISOString(),
            is_admin_with_members: isAdminWithMembers,
            family_members: isAdminWithMembers ? familyMembers.filter(m => m.user_id !== user.id) : [],
        })
    } catch (error) {
        logger.error('Delete Account', 'Error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/user/delete-account
 * 
 * Reactivates a user account that was marked for deletion.
 * Only works within 30-day recovery period.
 * 
 * @route POST /api/user/delete-account
 * @access Private (authenticated users only)
 * 
 * @returns {200} Account reactivated successfully
 * @returns {200}.success {boolean} - Operation success
 * @returns {200}.message {string} - Success message
 * 
 * @throws {401} User not authenticated
 * @throws {404} User not found
 * @throws {400} Account not marked for deletion
 * @throws {400} Recovery period expired (>30 days)
 * @throws {500} Internal server error
 * 
 * @example
 * // Request
 * POST /api/user/delete-account
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Conta reativada com sucesso"
 * }
 */
export async function POST(request: Request) {
    try {
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

        // Get user data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, deleted_at, deletion_scheduled_at')
            .eq('id', user.id)
            .single()

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            )
        }

        // Check if account is marked for deletion
        if (!userData.deleted_at) {
            return NextResponse.json(
                { error: 'Conta não está marcada para deleção' },
                { status: 400 }
            )
        }

        // Check if deletion period has expired
        const scheduledDate = new Date(userData.deletion_scheduled_at)
        if (scheduledDate < new Date()) {
            return NextResponse.json(
                { error: 'Período de recuperação expirado (30 dias)' },
                { status: 400 }
            )
        }

        // Reactivate account (remove soft delete)
        const { error: updateError } = await supabase
            .from('users')
            .update({
                deleted_at: null,
                deletion_scheduled_at: null,
                deletion_reason: null,
            })
            .eq('id', user.id)

        if (updateError) {
            logger.error('Reactivate Account', 'Error reactivating account:', updateError)
            return NextResponse.json(
                { error: 'Erro ao reativar conta' },
                { status: 500 }
            )
        }

        // Log the action
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'account_reactivated',
            details: {
                email: user.email,
                reactivated_at: new Date().toISOString(),
                original_deletion_date: userData.deletion_scheduled_at,
            },
        })

        logger.info('Reactivate Account', `User ${user.id} reactivated their account`)

        return NextResponse.json({
            success: true,
            message: 'Conta reativada com sucesso',
        })
    } catch (error) {
        logger.error('Reactivate Account', 'Error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
