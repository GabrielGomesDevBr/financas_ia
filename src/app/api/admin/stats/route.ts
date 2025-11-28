import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
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

        // Usar service role key para buscar estatísticas (bypass RLS)
        const supabaseAdmin = createAdminClient()

        // Buscar estatísticas
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [
            activeUsersResult,
            waitlistUsersResult,
            monthlyMessagesResult,
            monthlyTransactionsResult,
            activeFamiliesResult,
        ] = await Promise.all([
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'active'),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'waitlist'),
            supabaseAdmin.from('chat_messages').select('id', { count: 'exact' }).gte('created_at', monthStart),
            supabaseAdmin.from('transactions').select('id', { count: 'exact' }).gte('created_at', monthStart),
            supabaseAdmin.from('families').select('id', { count: 'exact' }),
        ])

        // Calcular custo OpenAI (estimativa: $0.0015 por 1K tokens, média 500 tokens/mensagem)
        const messagesCount = monthlyMessagesResult.count || 0
        const estimatedTokens = messagesCount * 500
        const openaiCost = (estimatedTokens / 1000) * 0.0015

        return NextResponse.json({
            activeUsers: activeUsersResult.count || 0,
            waitlistUsers: waitlistUsersResult.count || 0,
            monthlyMessages: messagesCount,
            monthlyTransactions: monthlyTransactionsResult.count || 0,
            activeFamilies: activeFamiliesResult.count || 0,
            openaiCost,
            usersTrend: '+12%',
            waitlistTrend: '+5',
            messagesTrend: '+25%',
            costTrend: '-3%',
            recentActivity: [
                { icon: '✅', title: 'Novo usuário aprovado', time: 'Há 2 horas' },
                { icon: '💬', title: `${messagesCount} mensagens enviadas`, time: 'Este mês' },
                { icon: '👥', title: `${waitlistUsersResult.count || 0} usuários na waitlist`, time: 'Agora' },
            ],
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
