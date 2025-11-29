import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

        // Usar admin client para suspender
        const supabaseAdmin = createAdminClient()
        const { error } = await supabaseAdmin
            .from('users')
            .update({ access_status: 'inactive' })
            .eq('id', userId)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error suspending user:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to suspend user',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
