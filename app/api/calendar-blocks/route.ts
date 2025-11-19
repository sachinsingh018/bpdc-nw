import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

// Get Monday of the current week
function getWeekStart(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// GET: Fetch calendar blocks for a week
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const weekStartParam = searchParams.get('weekStart');
        const userEmailParam = searchParams.get('userEmail');
        const weekStart = weekStartParam ? new Date(weekStartParam) : getWeekStart();

        // Get user email - either from param (viewing someone else's calendar) or from cookie (viewing own)
        const cookieStore = await cookies();
        const userEmail = userEmailParam || cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user ID
        const userResult = await pool.query('SELECT id FROM "User" WHERE email = $1', [userEmail]);
        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userId = userResult.rows[0].id;

        // Get calendar blocks for the week
        const weekStartStr = formatDate(weekStart);
        const blocksResult = await pool.query(
            `SELECT day_of_week, start_time, end_time, is_blocked 
             FROM user_calendar_blocks 
             WHERE user_id = $1 AND week_start_date::date = $2 
             ORDER BY day_of_week, start_time`,
            [userId, weekStartStr]
        );

        // Get user's default working hours
        const userResult2 = await pool.query(
            'SELECT time_zone, working_hours FROM "User" WHERE email = $1',
            [userEmail]
        );
        const timeZone = userResult2.rows[0]?.time_zone || 'America/New_York';
        const workingHours = userResult2.rows[0]?.working_hours || '09:00-17:00';

        return NextResponse.json({
            weekStart: formatDate(weekStart),
            timeZone,
            workingHours,
            blocks: blocksResult.rows,
        });
    } catch (error) {
        console.error('Error fetching calendar blocks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Save calendar blocks for a week
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { weekStart, blocks, timeZone, workingHours } = body;

        if (!weekStart || !Array.isArray(blocks)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        // Get user ID
        const userResult = await pool.query('SELECT id FROM "User" WHERE email = $1', [userEmail]);
        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userId = userResult.rows[0].id;

        // Update timezone and working hours if provided
        if (timeZone || workingHours) {
            const updateFields: string[] = [];
            const updateValues: any[] = [];
            let paramCount = 1;

            if (timeZone) {
                updateFields.push(`time_zone = $${paramCount}`);
                updateValues.push(timeZone);
                paramCount++;
            }
            if (workingHours) {
                updateFields.push(`working_hours = $${paramCount}`);
                updateValues.push(workingHours);
                paramCount++;
            }
            updateValues.push(userEmail);

            await pool.query(
                `UPDATE "User" SET ${updateFields.join(', ')} WHERE email = $${paramCount}`,
                updateValues
            );
        }

        // Delete existing blocks for this week
        await pool.query(
            'DELETE FROM user_calendar_blocks WHERE user_id = $1 AND week_start_date::date = $2',
            [userId, weekStart]
        );

        // Insert new blocks
        if (blocks.length > 0) {
            for (const block of blocks) {
                await pool.query(
                    `INSERT INTO user_calendar_blocks (user_id, week_start_date, day_of_week, start_time, end_time, is_blocked) 
                     VALUES ($1, $2::date, $3, $4, $5, $6)
                     ON CONFLICT (user_id, week_start_date, day_of_week, start_time, end_time) 
                     DO UPDATE SET is_blocked = EXCLUDED.is_blocked, updated_at = NOW()`,
                    [userId, weekStart, block.dayOfWeek, block.startTime, block.endTime, block.isBlocked]
                );
            }
        }

        // Update last_calendar_reset
        await pool.query(
            'UPDATE "User" SET last_calendar_reset = NOW() WHERE email = $1',
            [userEmail]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving calendar blocks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

