import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

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

        // Usar service role key para buscar usuários (bypass RLS)
        const supabaseAdmin = createAdminClient()

        const url = new URL(request.url)
        const filter = url.searchParams.get('filter') || 'all'

        let query = supabaseAdmin
            .from('users')
            .select('id, email, name, created_at, access_status, user_type')
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('access_status', filter)
        }

        const { data: users, error } = await query

        if (error) {
            console.error('Error fetching users:', error)
            throw error
        }

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error in /api/admin/users:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
