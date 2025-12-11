import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { dailyInterviews, user } from '../lib/db/schema';
import { eq, and, gte, lt, sql } from 'drizzle-orm';

// Get PostgreSQL connection URL
const POSTGRES_URL = process.env.BPDC_POSTGRES_URL || process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/bpdc?sslmode=require&channel_binding=require';

function getBpdcConnectionUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        urlObj.pathname = '/bpdc';
        return urlObj.toString();
    } catch (error) {
        return url;
    }
}

async function testQuery() {
    const connectionUrl = getBpdcConnectionUrl(POSTGRES_URL);
    const client = postgres(connectionUrl);
    const db = drizzle(client);

    try {
        console.log('Testing database connection and queries...\n');

        // Test 1: Check if we can query the daily_interviews table
        console.log('1. Testing daily_interviews table query...');
        const allInterviews = await db.select().from(dailyInterviews).limit(5);
        console.log(`   ✅ Successfully queried daily_interviews. Found ${allInterviews.length} records.`);

        // Test 2: Check if we can query the user table
        console.log('\n2. Testing user table query...');
        const testUsers = await db.select({ id: user.id, email: user.email }).from(user).limit(5);
        console.log(`   ✅ Successfully queried user table. Found ${testUsers.length} users.`);
        if (testUsers.length > 0) {
            console.log(`   Sample user: ${testUsers[0].email} (${testUsers[0].id})`);
        }

        // Test 3: Test the actual eligibility query with a sample user
        if (testUsers.length > 0) {
            const testUserId = testUsers[0].id;
            console.log(`\n3. Testing eligibility query for user: ${testUsers[0].email}...`);

            const now = new Date();
            const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

            const todayInterview = await db
                .select()
                .from(dailyInterviews)
                .where(
                    and(
                        eq(dailyInterviews.userId, testUserId),
                        gte(dailyInterviews.interviewDate, todayStart),
                        lt(dailyInterviews.interviewDate, tomorrowStart)
                    )
                )
                .limit(1);

            console.log(`   ✅ Eligibility query successful. Found ${todayInterview.length} interview(s) for today.`);

            // Test 4: Test count query
            const totalInterviews = await db
                .select({ count: sql<number>`count(*)` })
                .from(dailyInterviews)
                .where(eq(dailyInterviews.userId, testUserId));

            console.log(`   ✅ Count query successful. Total interviews: ${Number(totalInterviews[0]?.count || 0)}`);
        }

        // Test 4: Check table structure
        console.log('\n4. Verifying table structure...');
        const tableInfo = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'daily_interviews'
      ORDER BY ordinal_position;
    `;
        console.log(`   ✅ Table has ${tableInfo.length} columns`);
        tableInfo.forEach((col: any) => {
            console.log(`      - ${col.column_name}: ${col.data_type}`);
        });

        console.log('\n✅ All tests passed! Database connection and queries are working correctly.');

    } catch (error: any) {
        console.error('\n❌ Error during testing:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
        });
        throw error;
    } finally {
        await client.end();
    }
}

testQuery()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });

