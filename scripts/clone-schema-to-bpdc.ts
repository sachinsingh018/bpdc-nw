import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set');
    process.exit(1);
}

async function cloneSchema() {
    // Connect to the database
    const sql = postgres(POSTGRES_URL);

    try {
        console.log('Starting schema clone from public to bpdc...');

        // Step 1: Create the bpdc schema if it doesn't exist
        console.log('Creating bpdc schema...');
        await sql`CREATE SCHEMA IF NOT EXISTS bpdc`;
        console.log('✓ Schema bpdc created');

        // Step 2: Get all tables from public schema
        console.log('Fetching tables from public schema...');
        const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
        console.log(`✓ Found ${tables.length} tables to clone`);

        // Step 3: Clone each table structure and data
        for (const table of tables) {
            const tableName = table.tablename;
            console.log(`\nCloning table: ${tableName}...`);

            // Use raw SQL for dynamic table names
            // First, drop the table if it exists (in case of re-run)
            await sql.unsafe(`DROP TABLE IF EXISTS bpdc."${tableName}" CASCADE`);

            // Clone table structure with INCLUDING ALL (includes indexes, constraints, defaults, etc.)
            await sql.unsafe(`
        CREATE TABLE bpdc."${tableName}" 
        (LIKE public."${tableName}" INCLUDING ALL)
      `);

            // Copy data
            const result = await sql.unsafe(`
        INSERT INTO bpdc."${tableName}" 
        SELECT * FROM public."${tableName}"
      `);
            console.log(`  ✓ Cloned table structure and data`);
        }

        // Step 4: Update foreign key constraints to reference bpdc schema tables
        console.log('\nUpdating foreign key constraints to reference bpdc schema...');
        const foreignKeys = await sql`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND ccu.table_schema = 'public'
    `;

        // Drop and recreate foreign keys to point to bpdc schema
        for (const fk of foreignKeys) {
            try {
                // Drop the existing FK (it was cloned but points to public schema)
                await sql.unsafe(`
          ALTER TABLE bpdc."${fk.table_name}" 
          DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"
        `);

                // Recreate FK pointing to bpdc schema
                await sql.unsafe(`
          ALTER TABLE bpdc."${fk.table_name}" 
          ADD CONSTRAINT "${fk.constraint_name}"
          FOREIGN KEY ("${fk.column_name}")
          REFERENCES bpdc."${fk.foreign_table_name}"("${fk.foreign_column_name}")
        `);
            } catch (err) {
                console.log(`  ⚠ Could not update FK ${fk.constraint_name} on ${fk.table_name}: ${err}`);
            }
        }
        console.log(`✓ Updated ${foreignKeys.length} foreign key constraints`);

        // Step 5: Verify sequences (they should be cloned with INCLUDING ALL)
        console.log('\nVerifying sequences...');
        const bpdcSequences = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.sequences
      WHERE sequence_schema = 'bpdc'
    `;
        console.log(`✓ Found ${bpdcSequences[0].count} sequences in bpdc schema`);

        // Step 6: Verify the clone
        console.log('\nVerifying clone...');
        const bpdcTables = await sql`
      SELECT COUNT(*) as count
      FROM pg_tables 
      WHERE schemaname = 'bpdc'
    `;
        console.log(`✓ bpdc schema now has ${bpdcTables[0].count} tables`);

        console.log('\n✅ Schema clone completed successfully!');
        console.log('\nNext steps:');
        console.log('1. The connection will be updated to use bpdc schema');
        console.log('2. Your public schema remains untouched');

    } catch (error) {
        console.error('Error cloning schema:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

// Run the clone
cloneSchema()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

