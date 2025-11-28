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

async function checkSchema() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Check budgets columns
        const resBudgets = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'budgets'
      ORDER BY ordinal_position;
    `);

        console.log('\nColumns in budgets table:');
        resBudgets.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        // Check family_invites constraints
        const resConstraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'family_invites'::regclass;
    `);

        console.log('\nConstraints on family_invites table:');
        resConstraints.rows.forEach(row => {
            console.log(`- ${row.conname} (${row.contype}): ${row.pg_get_constraintdef}`);
        });

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
