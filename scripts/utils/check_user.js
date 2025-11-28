const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkUser() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        const email = 'gabrielgomesdevbr@gmail.com';

        // Check if user exists
        const userCheck = await client.query(`
      SELECT id, email, name, role, family_id, created_at
      FROM public.users
      WHERE email = $1;
    `, [email]);

        if (userCheck.rows.length > 0) {
            console.log('✅ Usuário encontrado:');
            console.log(JSON.stringify(userCheck.rows[0], null, 2));

            // Check if has family
            if (userCheck.rows[0].family_id) {
                const familyCheck = await client.query(`
          SELECT id, name, created_at
          FROM public.families
          WHERE id = $1;
        `, [userCheck.rows[0].family_id]);

                console.log('\n✅ Família associada:');
                console.log(JSON.stringify(familyCheck.rows[0], null, 2));
            }

            // Check transactions count
            const transactionsCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM public.transactions
        WHERE user_id = $1;
      `, [userCheck.rows[0].id]);

            console.log('\n📊 Transações registradas:', transactionsCheck.rows[0].count);

            // Check chat messages count
            const messagesCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM public.chat_messages
        WHERE user_id = $1;
      `, [userCheck.rows[0].id]);

            console.log('💬 Mensagens de chat:', messagesCheck.rows[0].count);

        } else {
            console.log('❌ Usuário não encontrado no banco de dados');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();
