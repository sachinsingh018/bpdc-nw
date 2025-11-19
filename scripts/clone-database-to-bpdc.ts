import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set');
    process.exit(1);
}

// Parse the connection URL to extract components
function parseConnectionUrl(url: string) {
    try {
        const urlObj = new URL(url);
        const user = urlObj.username;
        const password = urlObj.password;
        const host = urlObj.hostname;
        const port = urlObj.port || '5432';
        const searchParams = urlObj.searchParams;

        // Get the database name from the pathname (remove leading /)
        const currentDb = urlObj.pathname.slice(1);

        return {
            user,
            password,
            host,
            port,
            currentDb,
            searchParams,
            baseUrl: `postgresql://${user}:${password}@${host}:${port}`
        };
    } catch (error) {
        console.error('Error parsing connection URL:', error);
        throw error;
    }
}

async function cloneDatabase() {
    const connInfo = parseConnectionUrl(POSTGRES_URL);

    // Connect to the default postgres database to manage databases
    const adminUrl = `${connInfo.baseUrl}/postgres?${connInfo.searchParams.toString()}`;
    const adminSql = postgres(adminUrl);

    try {
        console.log('🚀 Starting database clone from "public" to "bpdc"...\n');

        // Step 1: Check available databases
        console.log('📋 Checking available databases...');
        const allDbs = await adminSql`
            SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname
        `;
        console.log('Available databases:');
        allDbs.forEach((db: any) => console.log(`  - ${db.datname}`));

        const dbCheck = allDbs.find((db: any) => db.datname === 'public');
        const sourceDbName = dbCheck ? 'public' : connInfo.currentDb;

        if (sourceDbName !== 'public') {
            console.log(`\n⚠ Note: "public" database not found. Will clone from: "${sourceDbName}"`);
        } else {
            console.log('✓ "public" database found');
        }

        // Step 2: Check if bpdc already exists and drop it
        const bpdcExists = allDbs.find((db: any) => db.datname === 'bpdc');
        if (bpdcExists) {
            console.log('\n⚠ Database "bpdc" already exists. Dropping it...');
            try {
                // Terminate all connections to bpdc
                await adminSql.unsafe(`
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = 'bpdc'
                    AND pid <> pg_backend_pid()
                `);
                await adminSql.unsafe('DROP DATABASE bpdc');
                console.log('✓ Existing "bpdc" database dropped');
            } catch (error: any) {
                console.error('Error dropping existing database:', error.message);
                throw error;
            }
        }

        // Step 3: Try to create bpdc using TEMPLATE (PostgreSQL native method)
        console.log('\n📦 Creating "bpdc" database using TEMPLATE method...');
        console.log('   (This is the fastest and most reliable method)');

        try {
            // Terminate connections to source database (except current)
            console.log('   Terminating connections to source database...');
            const terminated = await adminSql.unsafe(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = ${sourceDbName}
                AND pid <> pg_backend_pid()
            `);
            console.log(`   ✓ Terminated connections`);

            // Create database using template
            await adminSql.unsafe(`CREATE DATABASE bpdc WITH TEMPLATE ${sourceDbName}`);
            console.log('✅ Database "bpdc" created successfully using TEMPLATE method!');

            await adminSql.end();

            // Verify
            console.log('\n🔍 Verifying clone...');
            const verifyUrl = `${connInfo.baseUrl}/bpdc?${connInfo.searchParams.toString()}`;
            const verifySql = postgres(verifyUrl);

            const tables = await verifySql`
                SELECT COUNT(*) as count
                FROM information_schema.tables 
                WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_toast_temp_1')
            `;

            console.log(`✓ "bpdc" database has ${tables[0].count} tables`);
            await verifySql.end();

            console.log('\n✅ Database clone completed successfully!');
            return;

        } catch (error: any) {
            console.log('⚠ TEMPLATE method failed');
            console.log(`   Error: ${error.message}`);
            console.log('\n💡 This usually happens when there are active connections to the source database.');
            console.log('   For Neon databases, you may need to use pg_dump instead.\n');

            // Provide instructions for manual cloning
            console.log('📝 To clone manually, run these commands:');
            console.log('');
            console.log(`   # Export the source database`);
            console.log(`   pg_dump "${connInfo.baseUrl}/${sourceDbName}?${connInfo.searchParams.toString()}" > dump.sql`);
            console.log('');
            console.log(`   # Create the target database (if not exists)`);
            console.log(`   psql "${connInfo.baseUrl}/postgres?${connInfo.searchParams.toString()}" -c "CREATE DATABASE bpdc"`);
            console.log('');
            console.log(`   # Import into target database`);
            console.log(`   psql "${connInfo.baseUrl}/bpdc?${connInfo.searchParams.toString()}" < dump.sql`);
            console.log('');
            console.log('   Or use the connection string you provided:');
            console.log(`   psql '${POSTGRES_URL.replace(connInfo.currentDb, 'postgres')}' -c "CREATE DATABASE bpdc"`);
            console.log(`   pg_dump '${POSTGRES_URL.replace(connInfo.currentDb, sourceDbName)}' > dump.sql`);
            console.log(`   psql '${POSTGRES_URL.replace(connInfo.currentDb, 'bpdc')}' < dump.sql`);

            throw new Error('TEMPLATE method failed. Please use pg_dump method shown above.');
        }

    } catch (error: any) {
        console.error('\n❌ Error cloning database:', error.message);
        if (!error.message.includes('TEMPLATE method failed')) {
            throw error;
        }
    } finally {
        try {
            await adminSql.end();
        } catch (e) {
            // Ignore
        }
    }
}

// Run the clone
cloneDatabase()
    .then(() => {
        console.log('\n🎉 Done!');
        console.log('\n📌 Next steps:');
        console.log('1. Update POSTGRES_URL in .env.local to point to "bpdc" database');
        console.log('2. Remove schema search_path from connection strings (in lib/db/queries.ts and drizzle.config.ts)');
        console.log('3. Your source database remains untouched');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Fatal error:', error.message);
        process.exit(1);
    });
