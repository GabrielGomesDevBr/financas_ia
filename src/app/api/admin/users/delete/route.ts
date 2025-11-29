import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()

        // Verificar se é super admin
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single()

        if (userData?.user_type !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // Verificar se não está tentando deletar outro super admin
        const supabaseAdmin = createAdminClient()
        const { data: targetUser } = await supabaseAdmin
            .from('users')
            .select('user_type')
            .eq('id', userId)
            .single()

        if (targetUser?.user_type === 'super_admin') {
            return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 })
        }

        // Deletar usuário e todos os dados relacionados (CASCADE)
        // A ordem é importante para respeitar foreign keys
        await supabaseAdmin.from('chat_messages').delete().eq('user_id', userId)
        await supabaseAdmin.from('transactions').delete().eq('user_id', userId)
        await supabaseAdmin.from('goals').delete().eq('user_id', userId)
        await supabaseAdmin.from('budgets').delete().eq('user_id', userId)
        await supabaseAdmin.from('user_settings').delete().eq('user_id', userId)
        await supabaseAdmin.from('family_members').delete().eq('user_id', userId)

        // Deletar o usuário
        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to delete user',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
