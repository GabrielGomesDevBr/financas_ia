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

async function checkUserSettings() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Check if user_settings table exists
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
      );
    `);

        console.log('\nuser_settings table exists:', tableCheck.rows[0].exists);

        if (tableCheck.rows[0].exists) {
            // Check columns
            const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'user_settings'
        ORDER BY ordinal_position;
      `);

            console.log('\nColumns:');
            columns.rows.forEach(row => {
                console.log(`- ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default || ''}`);
            });

            // Check constraints
            const constraints = await client.query(`
        SELECT conname, contype, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'user_settings'::regclass;
      `);

            console.log('\nConstraints:');
            constraints.rows.forEach(row => {
                console.log(`- ${row.conname} (${row.contype}): ${row.pg_get_constraintdef}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUserSettings();
