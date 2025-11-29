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

        // Buscar estatísticas básicas
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [
            activeUsersResult,
            waitlistUsersResult,
            blockedUsersResult,
            inactiveUsersResult,
            monthlyMessagesResult,
            monthlyTransactionsResult,
            activeFamiliesResult,
        ] = await Promise.all([
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'active'),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'waitlist'),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'blocked'),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'inactive'),
            supabaseAdmin.from('chat_messages').select('id', { count: 'exact' }).gte('created_at', monthStart),
            supabaseAdmin.from('transactions').select('id', { count: 'exact' }).gte('created_at', monthStart),
            supabaseAdmin.from('families').select('id', { count: 'exact' }),
        ])

        // Buscar crescimento de usuários (últimos 30 dias)
        const userGrowth = []
        for (let i = 4; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - (i * 7)) // Cada 7 dias
            const dateStr = date.toISOString()

            const { count } = await supabaseAdmin
                .from('users')
                .select('id', { count: 'exact' })
                .lte('created_at', dateStr)

            userGrowth.push({
                date: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
                users: count || 0
            })
        }

        // Buscar mensagens por dia da semana (últimos 7 dias)
        const messagesByDay = []
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
            const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()

            const { count } = await supabaseAdmin
                .from('chat_messages')
                .select('id', { count: 'exact' })
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)

            const dayIndex = new Date(date).getDay()
            messagesByDay.push({
                day: dayNames[dayIndex],
                messages: count || 0
            })
        }

        // Distribuição de usuários
        const userDistribution = [
            { name: 'Ativos', value: activeUsersResult.count || 0 },
            { name: 'Waitlist', value: waitlistUsersResult.count || 0 },
            { name: 'Bloqueados', value: blockedUsersResult.count || 0 },
            { name: 'Inativos', value: inactiveUsersResult.count || 0 },
        ]

        // Buscar atividade recente real do banco
        const { data: recentLogins } = await supabaseAdmin
            .from('users')
            .select('name, updated_at')
            .eq('access_status', 'active')
            .order('updated_at', { ascending: false })
            .limit(1)

        const { data: recentWaitlist } = await supabaseAdmin
            .from('users')
            .select('created_at')
            .eq('access_status', 'waitlist')
            .order('created_at', { ascending: false })
            .limit(5)

        const { data: recentMessages } = await supabaseAdmin
            .from('chat_messages')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1)

        // Montar atividade recente com dados reais
        const recentActivity = []

        if (recentLogins && recentLogins.length > 0) {
            const timeDiff = Date.now() - new Date(recentLogins[0].updated_at).getTime()
            const minutesAgo = Math.floor(timeDiff / 60000)
            recentActivity.push({
                icon: '✅',
                title: `Usuário ${recentLogins[0].name} fez login`,
                time: minutesAgo < 60 ? `${minutesAgo} min atrás` : `${Math.floor(minutesAgo / 60)} horas atrás`,
                type: 'success'
            })
        }

        if (recentMessages && recentMessages.length > 0) {
            const timeDiff = Date.now() - new Date(recentMessages[0].created_at).getTime()
            const minutesAgo = Math.floor(timeDiff / 60000)
            recentActivity.push({
                icon: '💬',
                title: 'Nova mensagem no chat IA',
                time: minutesAgo < 60 ? `${minutesAgo} min atrás` : `${Math.floor(minutesAgo / 60)} horas atrás`,
                type: 'info'
            })
        }

        if (recentWaitlist && recentWaitlist.length > 0) {
            recentActivity.push({
                icon: '👥',
                title: `${recentWaitlist.length} novos usuários na waitlist`,
                time: 'Hoje',
                type: 'info'
            })
        }

        // Verificar se custo OpenAI está alto
        const messagesCount = monthlyMessagesResult.count || 0
        const estimatedTokens = messagesCount * 500
        const openaiCost = (estimatedTokens / 1000) * 0.0015

        if (openaiCost > 10) {
            recentActivity.push({
                icon: '⚠️',
                title: 'Custo OpenAI acima de $10',
                time: 'Este mês',
                type: 'warning'
            })
        }

        // Adicionar placeholder se não houver atividade
        if (recentActivity.length === 0) {
            recentActivity.push({
                icon: 'ℹ️',
                title: 'Nenhuma atividade recente',
                time: 'Agora',
                type: 'info'
            })
        }

        return NextResponse.json({
            activeUsers: activeUsersResult.count || 0,
            waitlistUsers: waitlistUsersResult.count || 0,
            monthlyMessages: messagesCount,
            monthlyTransactions: monthlyTransactionsResult.count || 0,
            activeFamilies: activeFamiliesResult.count || 0,
            openaiCost,
            userGrowth,
            messagesByDay,
            userDistribution,
            recentActivity,
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
