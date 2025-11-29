import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

        // Usar admin client para exportar dados
        const supabaseAdmin = createAdminClient()

        // Exportar dados de todas as tabelas principais
        const [
            usersData,
            familiesData,
            transactionsData,
            categoriesData,
            goalsData,
            budgetsData,
            chatMessagesData,
            settingsData,
        ] = await Promise.all([
            supabaseAdmin.from('users').select('*').limit(10000),
            supabaseAdmin.from('families').select('*').limit(10000),
            supabaseAdmin.from('transactions').select('*').limit(10000),
            supabaseAdmin.from('categories').select('*').limit(10000),
            supabaseAdmin.from('goals').select('*').limit(10000),
            supabaseAdmin.from('budgets').select('*').limit(10000),
            supabaseAdmin.from('chat_messages').select('*').limit(10000),
            supabaseAdmin.from('user_settings').select('*').limit(10000),
        ])

        // Preparar dados do backup
        const backupData = {
            metadata: {
                backupDate: new Date().toISOString(),
                version: '1.0',
                exportedBy: user.email,
            },
            data: {
                users: usersData.data || [],
                families: familiesData.data || [],
                transactions: transactionsData.data || [],
                categories: categoriesData.data || [],
                goals: goalsData.data || [],
                budgets: budgetsData.data || [],
                chat_messages: chatMessagesData.data || [],
                user_settings: settingsData.data || [],
            },
            statistics: {
                totalUsers: usersData.data?.length || 0,
                totalFamilies: familiesData.data?.length || 0,
                totalTransactions: transactionsData.data?.length || 0,
                totalCategories: categoriesData.data?.length || 0,
                totalGoals: goalsData.data?.length || 0,
                totalBudgets: budgetsData.data?.length || 0,
                totalMessages: chatMessagesData.data?.length || 0,
                totalSettings: settingsData.data?.length || 0,
            },
        }

        // Retornar como JSON para download
        const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        })
    } catch (error) {
        console.error('Error creating backup:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to create backup',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 })
    }
}
