import postgres from 'postgres';

// Get PostgreSQL connection URL from environment or use provided URL
const POSTGRES_URL = process.env.BPDC_POSTGRES_URL || process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/bpdc?sslmode=require&channel_binding=require';

// Helper function to ensure we're connecting to bpdc database
function getBpdcConnectionUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        // Update the database name in the path to 'bpdc'
        urlObj.pathname = '/bpdc';
        return urlObj.toString();
    } catch (error) {
        console.warn('Failed to parse POSTGRES_URL, using as-is');
        return url;
    }
}

async function verifyTables() {
    const connectionUrl = getBpdcConnectionUrl(POSTGRES_URL);
    const sql = postgres(connectionUrl);

    try {
        console.log('Connecting to database:', connectionUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

        // Check if daily_interviews table exists
        const dailyInterviewsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_interviews'
      );
    `;

        console.log('\n📊 Table Verification Results:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (dailyInterviewsCheck[0]?.exists) {
            console.log('✅ daily_interviews table: EXISTS');

            // Get table structure
            const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'daily_interviews'
        ORDER BY ordinal_position;
      `;

            console.log('\n   Columns:');
            columns.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
            });

            // Check indexes
            const indexes = await sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'daily_interviews';
      `;

            console.log('\n   Indexes:');
            indexes.forEach(idx => {
                console.log(`   - ${idx.indexname}`);
            });

            // Count rows
            const rowCount = await sql`SELECT COUNT(*) as count FROM daily_interviews`;
            console.log(`\n   Row count: ${rowCount[0]?.count || 0}`);
        } else {
            console.log('❌ daily_interviews table: DOES NOT EXIST');
        }

        // Check if interview_progress table exists
        const interviewProgressCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'interview_progress'
      );
    `;

        if (interviewProgressCheck[0]?.exists) {
            console.log('\n✅ interview_progress table: EXISTS');

            // Get table structure
            const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'interview_progress'
        ORDER BY ordinal_position;
      `;

            console.log('\n   Columns:');
            columns.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
            });

            // Check indexes
            const indexes = await sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'interview_progress';
      `;

            console.log('\n   Indexes:');
            indexes.forEach(idx => {
                console.log(`   - ${idx.indexname}`);
            });

            // Count rows
            const rowCount = await sql`SELECT COUNT(*) as count FROM interview_progress`;
            console.log(`\n   Row count: ${rowCount[0]?.count || 0}`);
        } else {
            console.log('\n❌ interview_progress table: DOES NOT EXIST');
        }

        // Check current database
        const dbName = await sql`SELECT current_database() as db`;
        console.log('\n📌 Current database:', dbName[0]?.db);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error verifying tables:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

verifyTables()
    .then(() => {
        console.log('\n✅ Verification completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });

