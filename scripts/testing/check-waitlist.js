require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTANDO')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'OK' : 'FALTANDO')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkWaitlist() {
    console.log('🔍 Verificando usuários na waitlist...\n')

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, access_status, created_at')
        .eq('access_status', 'waitlist')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ Erro:', error)
        return
    }

    console.log(`📊 Total de usuários na waitlist: ${users?.length || 0}\n`)

    if (users && users.length > 0) {
        console.log('Usuários encontrados:')
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name || 'Sem nome'}`)
            console.log(`   Email: ${user.email}`)
            console.log(`   Status: ${user.access_status}`)
            console.log(`   Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`)
        })
    } else {
        console.log('✅ Nenhum usuário na waitlist (todos aprovados ou bloqueados)')
    }

    // Verificar todos os usuários recentes
    console.log('\n\n🔍 Últimos 10 usuários cadastrados (qualquer status):\n')

    const { data: allUsers } = await supabase
        .from('users')
        .select('id, email, name, access_status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

    if (allUsers && allUsers.length > 0) {
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} - Status: ${user.access_status} - ${new Date(user.created_at).toLocaleDateString('pt-BR')}`)
        })
    }

    console.log('\n✅ Verificação completa!')
}

checkWaitlist().catch(console.error)
