import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

// Database connection URL - modify to use bpdc database
const DB_URL = 'postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

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

// Parse CSV file
function parseCSV(filePath: string): Array<{
    email: string;
    firstName: string;
    lastName: string;
    enrollmentYear: number;
    status: string;
    degreeProgram: string;
}> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Skip header row (line 1) and process from line 2 onwards
    const data: Array<{
        email: string;
        firstName: string;
        lastName: string;
        enrollmentYear: number;
        status: string;
        degreeProgram: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handling commas within quoted fields)
        const columns: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                columns.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        columns.push(current.trim()); // Add last column

        if (columns.length >= 6) {
            const email = columns[0].trim();
            const firstName = columns[1].trim();
            const lastName = columns[2].trim() || ''; // Handle empty last names
            const enrollmentYear = parseInt(columns[3].trim(), 10);
            const status = columns[4].trim();
            const degreeProgram = columns[5].trim();

            // Validate required fields
            if (email && email.includes('@') && !isNaN(enrollmentYear) && enrollmentYear > 2000 && enrollmentYear < 2100) {
                data.push({
                    email,
                    firstName,
                    lastName,
                    enrollmentYear,
                    status,
                    degreeProgram,
                });
            } else {
                console.warn(`Skipping invalid row: ${email || 'no email'} (year: ${enrollmentYear})`);
            }
        } else {
            console.warn(`Skipping row with insufficient columns (${columns.length}): ${line.substring(0, 50)}...`);
        }
    }

    return data;
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

        // Step 1: Check if student_status column exists, add if not
        console.log('\n📋 Step 1: Checking user table schema...');
        const columnCheck = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name = 'student_status';
        `;

        if (columnCheck.length === 0) {
            console.log('   Adding student_status column...');
            await sql`
                ALTER TABLE "User" 
                ADD COLUMN student_status VARCHAR(20);
            `;
            console.log('   ✅ student_status column added');
        } else {
            console.log('   ✅ student_status column already exists');
        }

        // Step 2: Count existing users
        console.log('\n📊 Step 2: Checking existing data...');
        const existingCount = await sql`SELECT COUNT(*) as count FROM "User"`;
        console.log(`   Found ${existingCount[0]?.count || 0} existing users`);

        // Step 3: Clear all existing users
        console.log('\n🗑️  Step 3: Clearing existing users...');
        console.log('   ⚠️  WARNING: This will delete ALL existing users!');

        // Try to delete users. Some foreign key constraints might prevent this.
        // If deletion fails due to foreign keys, we'll need to handle related tables first.
        try {
            // First, try to delete users that might have foreign key constraints
            // We'll use CASCADE if possible, but PostgreSQL doesn't support CASCADE in DELETE directly
            // Instead, we'll try the delete and handle errors

            // Delete users - this might fail if there are foreign key constraints without CASCADE
            const deleteResult = await sql`DELETE FROM "User"`;
            console.log(`   ✅ Cleared all existing users`);
        } catch (error: any) {
            // If deletion fails due to foreign key constraints, try to handle it
            if (error.message && error.message.includes('foreign key')) {
                console.log('   ⚠️  Foreign key constraint detected. Attempting to delete related records first...');

                // Delete in correct order to handle foreign key constraints
                // Note: This is a destructive operation - be careful!
                try {
                    console.log('   Deleting messages and related data...');

                    // Helper function to safely delete from a table (ignores if table doesn't exist)
                    const safeDelete = async (deleteFn: () => Promise<any>, tableName: string) => {
                        try {
                            await deleteFn();
                        } catch (err: any) {
                            if (err.message && (err.message.includes('does not exist') || err.message.includes('relation'))) {
                                console.log(`   ⚠️  Table ${tableName} does not exist, skipping...`);
                            } else {
                                throw err;
                            }
                        }
                    };

                    // Delete in order: child tables first, then parent tables
                    // 1. Delete messages (Message_v2 references Chat)
                    await safeDelete(() => sql`DELETE FROM "Message_v2" WHERE "chatId" IN (SELECT id FROM "Chat")`, 'Message_v2');
                    await safeDelete(() => sql`DELETE FROM "Message" WHERE "chatId" IN (SELECT id FROM "Chat")`, 'Message');

                    // 2. Delete votes
                    await safeDelete(() => sql`DELETE FROM "Vote_v2" WHERE "chatId" IN (SELECT id FROM "Chat")`, 'Vote_v2');
                    await safeDelete(() => sql`DELETE FROM "Vote" WHERE "chatId" IN (SELECT id FROM "Chat")`, 'Vote');

                    // 3. Delete chats (Chat references User)
                    await safeDelete(() => sql`DELETE FROM "Chat" WHERE "userId" IN (SELECT id FROM "User")`, 'Chat');

                    // 4. Delete other tables that reference User
                    await safeDelete(() => sql`DELETE FROM "connection" WHERE sender_id IN (SELECT id FROM "User") OR receiver_id IN (SELECT id FROM "User")`, 'connection');
                    await safeDelete(() => sql`DELETE FROM "notification" WHERE user_id IN (SELECT id FROM "User") OR related_user_id IN (SELECT id FROM "User")`, 'notification');
                    await safeDelete(() => sql`DELETE FROM "password_reset_tokens" WHERE user_id IN (SELECT id FROM "User")`, 'password_reset_tokens');
                    await safeDelete(() => sql`DELETE FROM "user_messages" WHERE sender_id IN (SELECT id FROM "User") OR receiver_id IN (SELECT id FROM "User")`, 'user_messages');
                    await safeDelete(() => sql`DELETE FROM "anonymous_post_like" WHERE user_id IN (SELECT id FROM "User")`, 'anonymous_post_like');
                    await safeDelete(() => sql`DELETE FROM "anonymous_comment_like" WHERE user_id IN (SELECT id FROM "User")`, 'anonymous_comment_like');
                    await safeDelete(() => sql`DELETE FROM "anonymous_comment" WHERE user_id IN (SELECT id FROM "User")`, 'anonymous_comment');
                    await safeDelete(() => sql`DELETE FROM "anonymous_post" WHERE user_id IN (SELECT id FROM "User")`, 'anonymous_post');
                    await safeDelete(() => sql`DELETE FROM "skill_attempts" WHERE user_id IN (SELECT id FROM "User")`, 'skill_attempts');
                    await safeDelete(() => sql`DELETE FROM "interview_rounds" WHERE application_id IN (SELECT id FROM "job_applications" WHERE email IN (SELECT email FROM "User"))`, 'interview_rounds');
                    await safeDelete(() => sql`DELETE FROM "job_applications" WHERE email IN (SELECT email FROM "User")`, 'job_applications');
                    await safeDelete(() => sql`DELETE FROM "Document" WHERE "userId" IN (SELECT id FROM "User")`, 'Document');
                    await safeDelete(() => sql`DELETE FROM "Suggestion" WHERE "userId" IN (SELECT id FROM "User")`, 'Suggestion');
                    await safeDelete(() => sql`DELETE FROM "community_posts" WHERE user_id IN (SELECT id FROM "User")`, 'community_posts');
                    await safeDelete(() => sql`DELETE FROM "community_memberships" WHERE user_id IN (SELECT id FROM "User")`, 'community_memberships');
                    await safeDelete(() => sql`DELETE FROM "communities" WHERE created_by IN (SELECT id FROM "User")`, 'communities');
                    await safeDelete(() => sql`DELETE FROM "user_activity_logs" WHERE user_id IN (SELECT id FROM "User")`, 'user_activity_logs');
                    await safeDelete(() => sql`DELETE FROM "page_views" WHERE user_id IN (SELECT id FROM "User")`, 'page_views');
                    await safeDelete(() => sql`DELETE FROM "feature_usage" WHERE user_id IN (SELECT id FROM "User")`, 'feature_usage');
                    await safeDelete(() => sql`DELETE FROM "user_sessions" WHERE user_id IN (SELECT id FROM "User")`, 'user_sessions');
                    await safeDelete(() => sql`DELETE FROM "user_calendar_blocks" WHERE user_id IN (SELECT id FROM "User")`, 'user_calendar_blocks');
                    await safeDelete(() => sql`DELETE FROM "interview_progress" WHERE user_id IN (SELECT id FROM "User")`, 'interview_progress');
                    await safeDelete(() => sql`DELETE FROM "daily_interviews" WHERE user_id IN (SELECT id FROM "User")`, 'daily_interviews');

                    // 5. Finally, delete users
                    await sql`DELETE FROM "User"`;
                    console.log(`   ✅ Cleared all existing users (after handling foreign keys)`);
                } catch (secondError: any) {
                    console.error(`   ❌ Failed to delete users: ${secondError.message}`);
                    throw new Error(`Cannot delete users due to foreign key constraints: ${secondError.message}`);
                }
            } else {
                throw error;
            }
        }

        // Step 4: Parse CSV file
        console.log('\n📄 Step 4: Parsing CSV file...');
        const csvPath = path.join(process.cwd(), 'public', 'NQY_DataSheet.csv');
        const students = parseCSV(csvPath);
        console.log(`   ✅ Parsed ${students.length} student records`);

        // Step 5: Insert students into database
        console.log('\n💾 Step 5: Inserting students into database...');
        let successCount = 0;
        let errorCount = 0;

        for (const student of students) {
            try {
                // Combine first and last name (handle empty last names)
                const fullName = student.lastName
                    ? `${student.firstName} ${student.lastName}`.trim()
                    : student.firstName.trim();

                // Calculate end year (2 years after enrollment)
                const endYear = student.enrollmentYear + 2;

                // Create education JSON
                const education = [{
                    degree: student.degreeProgram,
                    end_year: endYear,
                    start_year: student.enrollmentYear,
                    school_name: "BITS Pilani Dubai Campus",
                    field_of_study: null
                }];

                // Normalize status: "Current" -> "student", "Alumni" -> "alumni"
                const studentStatus = student.status.toLowerCase() === 'current' ? 'student' : 'alumni';

                // Insert user
                await sql`
                    INSERT INTO "User" (
                        email,
                        name,
                        student_status,
                        education,
                        "createdAt"
                    ) VALUES (
                        ${student.email},
                        ${fullName},
                        ${studentStatus},
                        ${JSON.stringify(education)}::jsonb,
                        NOW()
                    )
                `;

                successCount++;
            } catch (error: any) {
                errorCount++;
                console.error(`   ⚠️  Error inserting ${student.email}:`, error.message);
            }
        }

        console.log(`\n✅ Insertion complete:`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Step 6: Verify final count
        console.log('\n📊 Step 6: Verifying final data...');
        const finalCount = await sql`SELECT COUNT(*) as count FROM "User"`;
        console.log(`   Total users in database: ${finalCount[0]?.count || 0}`);

        // Show sample of inserted data
        const sample = await sql`
            SELECT email, name, student_status, education 
            FROM "User" 
            LIMIT 3
        `;
        console.log('\n   Sample records:');
        sample.forEach((record, idx) => {
            console.log(`   ${idx + 1}. ${record.email} - ${record.name} (${record.student_status})`);
        });

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during migration:', error);
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

