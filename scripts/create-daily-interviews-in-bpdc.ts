import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Get PostgreSQL connection URL from environment or use provided URL
// If POSTGRES_URL is set, it will be used and automatically converted to bpdc database
// Otherwise, you can set BPDC_POSTGRES_URL directly
const POSTGRES_URL = process.env.BPDC_POSTGRES_URL || process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
    console.error('Error: POSTGRES_URL or BPDC_POSTGRES_URL environment variable is not set');
    process.exit(1);
}

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

async function createTables() {
    if (!POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not set');
    }
    const connectionUrl = getBpdcConnectionUrl(POSTGRES_URL);
    const sql = postgres(connectionUrl);

    try {
        console.log('Creating daily_interviews table...');

        // Create daily_interviews table
        await sql`
      CREATE TABLE IF NOT EXISTS daily_interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        interview_date TIMESTAMP NOT NULL,
        category VARCHAR(50),
        completed_at TIMESTAMP,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

        console.log('Creating indexes for daily_interviews...');

        // Create unique index to ensure one interview per user per day
        await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_user_interview_date 
      ON daily_interviews(user_id, interview_date);
    `;

        // Create indexes for faster queries
        await sql`
      CREATE INDEX IF NOT EXISTS idx_daily_interviews_user_id 
      ON daily_interviews(user_id);
    `;

        await sql`
      CREATE INDEX IF NOT EXISTS idx_daily_interviews_date 
      ON daily_interviews(interview_date);
    `;

        await sql`
      CREATE INDEX IF NOT EXISTS idx_daily_interviews_completed 
      ON daily_interviews(is_completed);
    `;

        console.log('Creating interview_progress table...');

        // Create interview_progress table
        await sql`
      CREATE TABLE IF NOT EXISTS interview_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        daily_interview_id UUID NOT NULL REFERENCES daily_interviews(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        question_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        ai_feedback TEXT,
        answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

        console.log('Creating indexes for interview_progress...');

        // Create unique index to ensure one answer per question per interview
        await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_interview_question 
      ON interview_progress(daily_interview_id, question_id);
    `;

        // Create indexes for faster queries
        await sql`
      CREATE INDEX IF NOT EXISTS idx_interview_progress_daily_interview 
      ON interview_progress(daily_interview_id);
    `;

        await sql`
      CREATE INDEX IF NOT EXISTS idx_interview_progress_user_id 
      ON interview_progress(user_id);
    `;

        console.log('✅ Tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

createTables()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });

