import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Verificar se é super admin usando o cliente normal
        const supabase = await createClient()
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

        // Usar service role key para buscar todos os usuários da waitlist (bypass RLS)
        const supabaseAdmin = createAdminClient()

        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, created_at, access_status')
            .eq('access_status', 'waitlist')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching waitlist:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
