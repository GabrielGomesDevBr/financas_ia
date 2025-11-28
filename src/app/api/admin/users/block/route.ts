import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { userId } = await request.json()

        // Verificar se é super admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: adminData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single()

        if (adminData?.user_type !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Usar service role key para fazer o UPDATE (bypass RLS)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Bloquear usuário
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ access_status: 'blocked' })
            .eq('id', userId)

        if (updateError) {
            console.error('Error blocking user:', updateError)
            throw updateError
        }

        // Registrar audit log
        await supabaseAdmin.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'BLOCK_USER',
            target_user_id: userId,
            details: { timestamp: new Date().toISOString() }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error blocking user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
