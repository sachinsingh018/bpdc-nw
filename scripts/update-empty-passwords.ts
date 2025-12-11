import postgres from 'postgres';

// Database connection URL - modify to use bpdc database
const DB_URL = 'postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Password hash to set
const PASSWORD_HASH = '$2a$10$cXSr8ZNa6nh3s2YmLDEAfuOm27o6rBtAZLLEPZ35yoyAyjTo5dWIe';

// Helper function to ensure we're connecting to bpdc database
function getBpdcConnectionUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        // Update the database name in the path to 'bpdc'
        urlObj.pathname = '/bpdc';
        return urlObj.toString();
    } catch (error) {
        console.warn('Failed to parse database URL, using as-is');
        return url;
    }
}

async function main() {
    const connectionUrl = getBpdcConnectionUrl(DB_URL);
    const sql = postgres(connectionUrl);

    try {
        console.log('🔌 Connecting to database...');
        console.log('   Database:', connectionUrl.replace(/:[^:@]+@/, ':****@'));

        // Check current database
        const dbName = await sql`SELECT current_database() as db`;
        console.log('   Current database:', dbName[0]?.db);

        // Step 1: Count users with empty/null passwords
        console.log('\n📊 Step 1: Checking users with empty passwords...');
        const emptyPasswordCount = await sql`
            SELECT COUNT(*) as count 
            FROM "User" 
            WHERE password IS NULL OR password = ''
        `;
        console.log(`   Found ${emptyPasswordCount[0]?.count || 0} users with empty/null passwords`);

        // Step 2: Show sample of users that will be updated
        console.log('\n📋 Step 2: Sample users to be updated:');
        const sampleUsers = await sql`
            SELECT email, name, password 
            FROM "User" 
            WHERE password IS NULL OR password = ''
            LIMIT 5
        `;
        sampleUsers.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.email} - ${user.name || 'No name'} (password: ${user.password || 'NULL'})`);
        });

        // Step 3: Update passwords
        console.log('\n💾 Step 3: Updating passwords...');
        const updateResult = await sql`
            UPDATE "User" 
            SET password = ${PASSWORD_HASH}
            WHERE password IS NULL OR password = ''
        `;
        console.log(`   ✅ Password update query executed`);

        // Step 4: Verify the update
        console.log('\n✅ Step 4: Verifying update...');
        const remainingEmpty = await sql`
            SELECT COUNT(*) as count 
            FROM "User" 
            WHERE password IS NULL OR password = ''
        `;
        console.log(`   Users with empty passwords remaining: ${remainingEmpty[0]?.count || 0}`);

        // Show verification sample
        const updatedSample = await sql`
            SELECT email, name, 
                   CASE 
                       WHEN password = ${PASSWORD_HASH} THEN 'Updated ✓'
                       WHEN password IS NULL THEN 'NULL'
                       WHEN password = '' THEN 'Empty'
                       ELSE 'Has different password'
                   END as password_status
            FROM "User" 
            LIMIT 5
        `;
        console.log('\n   Verification sample (first 5 users):');
        updatedSample.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.email} - ${user.name || 'No name'} (${user.password_status})`);
        });

        const totalUsers = await sql`SELECT COUNT(*) as count FROM "User"`;
        console.log(`\n📊 Total users in database: ${totalUsers[0]?.count || 0}`);

        console.log('\n✅ Password update completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during password update:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

main()
    .then(() => {
        console.log('\n🎉 Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });

