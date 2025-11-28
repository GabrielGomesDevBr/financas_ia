require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testando acesso à tabela users via RLS...\n')

// Simular acesso como usuário admin
const supabaseUser = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminAccess() {
    // Verificar se seu usuário é super_admin
    console.log('1️⃣ Verificando seu usuário (gabrielgomesdevbr@gmail.com):\n')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id, email, user_type, access_status')
        .eq('email', 'gabrielgomesdevbr@gmail.com')
        .single()

    if (adminUser) {
        console.log(`   Email: ${adminUser.email}`)
        console.log(`   Tipo: ${adminUser.user_type}`)
        console.log(`   Status: ${adminUser.access_status}`)
        console.log(`   ID: ${adminUser.id}\n`)
    } else {
        console.log('   ❌ Usuário não encontrado!\n')
        return
    }

    // Testar acesso com service role
    console.log('2️⃣ Testando acesso com Service Role Key (bypass RLS):\n')
    const { data: usersServiceRole, error: errorService } = await supabaseAdmin
        .from('users')
        .select('email, access_status')
        .eq('access_status', 'waitlist')

    if (errorService) {
        console.log(`   ❌ Erro: ${errorService.message}\n`)
    } else {
        console.log(`   ✅ Sucesso! ${usersServiceRole.length} usuário(s) encontrado(s)`)
        usersServiceRole.forEach(u => console.log(`      - ${u.email}`))
        console.log('')
    }

    console.log('✅ Teste completo!')

    console.log('\n💡 RESUMO:')
    console.log('   - Seu usuário é super_admin? ' + (adminUser.user_type === 'super_admin' ? '✅ SIM' : '❌ NÃO'))
    console.log('   - Consegue ver waitlist? ' + (!errorService ? '✅ SIM (com service key)' : '❌ NÃO'))
}

testAdminAccess().catch(console.error)
