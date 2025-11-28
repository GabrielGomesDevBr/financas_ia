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

async function testExportQuery() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Get a family_id to test with (from the first user found)
        const userRes = await client.query('SELECT family_id FROM users WHERE family_id IS NOT NULL LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('No user with family_id found to test.');
            return;
        }
        const familyId = userRes.rows[0].family_id;
        console.log('Testing with family_id:', familyId);

        // 2. Try to fetch transactions with joins manually to see if tables/FKs exist
        // We can't use Supabase client syntax here easily with pg client, but we can check the schema relations.

        console.log('\nChecking relationships...');

        // Check foreign keys on transactions table
        const fkRes = await client.query(`
      SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='transactions';
    `);

        fkRes.rows.forEach(row => {
            console.log(`FK: ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name} (${row.constraint_name})`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

testExportQuery();
