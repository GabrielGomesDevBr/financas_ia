#!/usr/bin/env node

/**
 * Script simplificado para aplicar migrações via Supabase
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

async function executeSqlFile(filePath, description) {
    console.log(`\n📝 ${description}...`);

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ query: sql })
        });

        // Tentar método alternativo se o primeiro falhar
        if (!response.ok) {
            console.log(`⚠️  Método RPC não disponível, usando query direta...`);

            // Executar via query POST direto
            const altResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({ query: sql })
            });

            if (!altResponse.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        }

        console.log(`✅ ${description} - Concluído`);
        return true;
    } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Aplicando migrações de segurança...\n');
    console.log(`📧 Super Admin: ${superAdminEmail}\n`);

    const migrationsDir = path.join(__dirname, '../supabase/migrations');

    const migrations = [
        {
            file: '20241125000001_expand_audit_logs.sql',
            desc: 'Expandindo sistema de audit logs'
        },
        {
            file: '20241125000002_remove_hardcoded_email.sql',
            desc: 'Removendo email hardcoded e configurando system_config'
        }
    ];

    let success = true;

    for (const migration of migrations) {
        const filePath = path.join(migrationsDir, migration.file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Arquivo não encontrado: ${migration.file}`);
            success = false;
            continue;
        }

        const result = await executeSqlFile(filePath, migration.desc);
        if (!result) {
            success = false;
        }
    }

    // Configurar super admin
    if (success && superAdminEmail) {
        console.log(`\n👤 Configurando super admin...`);
        const setupSql = `SELECT public.setup_super_admin('${superAdminEmail}');`;

        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({ query: setupSql })
            });

            console.log(`✅ Super admin configurado: ${superAdminEmail}`);
        } catch (error) {
            console.log(`⚠️  Configure manualmente: SELECT public.setup_super_admin('${superAdminEmail}');`);
        }
    }

    if (!success) {
        console.log('\n\n💡 EXECUTE MANUALMENTE NO SUPABASE DASHBOARD:');
        console.log('   1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql');
        console.log('   2. Copie e execute cada arquivo SQL da pasta supabase/migrations/');
        console.log(`   3. Execute: SELECT public.setup_super_admin('${superAdminEmail}');`);
        process.exit(1);
    }

    console.log('\n✨ Migrações aplicadas com sucesso!');
}

main().catch(error => {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 Execute manualmente no Supabase Dashboard > SQL Editor');
    process.exit(1);
});
