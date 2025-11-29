import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30d'

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

        // Calcular datas baseado no período
        const now = new Date()
        let startDate = new Date()
        let previousStartDate = new Date()

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7)
                previousStartDate.setDate(now.getDate() - 14)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                previousStartDate.setDate(now.getDate() - 60)
                break
            case '90d':
                startDate.setDate(now.getDate() - 90)
                previousStartDate.setDate(now.getDate() - 180)
                break
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1)
                previousStartDate.setFullYear(now.getFullYear() - 2)
                break
            default:
                startDate.setDate(now.getDate() - 30)
                previousStartDate.setDate(now.getDate() - 60)
        }

        const supabaseAdmin = createAdminClient()

        // === USUÁRIOS & CRESCIMENTO ===
        const [currentUsers, previousUsers, totalUsers, activeUsers, waitlistUsers] = await Promise.all([
            supabaseAdmin.from('users').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
            supabaseAdmin.from('users').select('id', { count: 'exact' }),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'active'),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('access_status', 'waitlist'),
        ])

        const newUsers = currentUsers.count || 0
        const prevNewUsers = previousUsers.count || 0
        const userGrowthRate = prevNewUsers > 0 ? ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(1) : '0'

        // === ENGAJAMENTO ===
        const [currentMessages, previousMessages, currentTransactions, previousTransactions] = await Promise.all([
            supabaseAdmin.from('chat_messages').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
            supabaseAdmin.from('chat_messages').select('id', { count: 'exact' }).gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
            supabaseAdmin.from('transactions').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
            supabaseAdmin.from('transactions').select('id', { count: 'exact' }).gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
        ])

        const messages = currentMessages.count || 0
        const prevMessages = previousMessages.count || 0
        const messageGrowthRate = prevMessages > 0 ? ((messages - prevMessages) / prevMessages * 100).toFixed(1) : '0'

        const transactions = currentTransactions.count || 0
        const prevTransactions = previousTransactions.count || 0
        const transactionGrowthRate = prevTransactions > 0 ? ((transactions - prevTransactions) / prevTransactions * 100).toFixed(1) : '0'

        // === FINANCEIRO ===
        const { data: transactionsData } = await supabaseAdmin
            .from('transactions')
            .select('amount, type, category, created_at')
            .gte('created_at', startDate.toISOString())

        const totalRevenue = transactionsData?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
        const totalExpenses = transactionsData?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
        const netBalance = totalRevenue - totalExpenses

        // Top categorias
        const categoryMap = new Map()
        transactionsData?.forEach(t => {
            const cat = t.category || 'Sem categoria'
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount))
        })
        const topCategories = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, amount]) => ({ category, amount }))

        // === CHAT IA ===
        const estimatedCost = (messages * 500 * 0.0015) / 1000 // 500 tokens/msg, $0.0015/1K tokens
        const costPerUser = activeUsers.count ? (estimatedCost / activeUsers.count).toFixed(4) : '0'

        // Mensagens por personalidade
        const { data: messagesWithPersonality } = await supabaseAdmin
            .from('chat_messages')
            .select('id')
            .gte('created_at', startDate.toISOString())
            .limit(1000)

        // === METAS & ORÇAMENTOS ===
        const [goals, budgets] = await Promise.all([
            supabaseAdmin.from('goals').select('id, status', { count: 'exact' }).gte('created_at', startDate.toISOString()),
            supabaseAdmin.from('budgets').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
        ])

        const completedGoals = goals.data?.filter(g => g.status === 'completed').length || 0
        const totalGoals = goals.count || 0
        const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : '0'

        // === DADOS PARA GRÁFICOS ===

        // Usuários ao longo do tempo (últimos 30 dias)
        const userTimeline = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            const { count } = await supabaseAdmin
                .from('users')
                .select('id', { count: 'exact' })
                .lte('created_at', date.toISOString())

            userTimeline.push({
                date: dateStr,
                users: count || 0
            })
        }

        // Mensagens e transações por dia
        const activityTimeline = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
            const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()

            const [msgs, txns] = await Promise.all([
                supabaseAdmin.from('chat_messages').select('id', { count: 'exact' }).gte('created_at', startOfDay).lte('created_at', endOfDay),
                supabaseAdmin.from('transactions').select('id', { count: 'exact' }).gte('created_at', startOfDay).lte('created_at', endOfDay),
            ])

            activityTimeline.push({
                date: date.toISOString().split('T')[0],
                messages: msgs.count || 0,
                transactions: txns.count || 0
            })
        }

        return NextResponse.json({
            period,
            dateRange: {
                start: startDate.toISOString(),
                end: now.toISOString(),
            },

            overview: {
                totalUsers: totalUsers.count || 0,
                activeUsers: activeUsers.count || 0,
                newUsers,
                userGrowthRate: `${userGrowthRate}%`,
                messages,
                messageGrowthRate: `${messageGrowthRate}%`,
                transactions,
                transactionGrowthRate: `${transactionGrowthRate}%`,
                estimatedCost,
                costPerUser,
            },

            users: {
                total: totalUsers.count || 0,
                active: activeUsers.count || 0,
                waitlist: waitlistUsers.count || 0,
                new: newUsers,
                growthRate: userGrowthRate,
                timeline: userTimeline.slice(-15), // Últimos 15 dias para não sobrecarregar
            },

            engagement: {
                messages,
                transactions,
                messagesPerUser: activeUsers.count ? (messages / activeUsers.count).toFixed(1) : '0',
                transactionsPerUser: activeUsers.count ? (transactions / activeUsers.count).toFixed(1) : '0',
                timeline: activityTimeline.slice(-15),
            },

            financial: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                netBalance,
                transactionCount: transactions,
                avgTransactionValue: transactions > 0 ? (totalRevenue + totalExpenses) / transactions : 0,
                topCategories,
            },

            chatAI: {
                totalMessages: messages,
                estimatedCost,
                costPerUser,
                costPerMessage: messages > 0 ? (estimatedCost / messages).toFixed(4) : '0',
                avgMessagesPerUser: activeUsers.count ? (messages / activeUsers.count).toFixed(1) : '0',
            },

            goalsAndBudgets: {
                goalsCreated: totalGoals,
                goalsCompleted: completedGoals,
                goalCompletionRate: `${goalCompletionRate}%`,
                budgetsCreated: budgets.count || 0,
            },
        })
    } catch (error) {
        console.error('Error fetching metrics:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
