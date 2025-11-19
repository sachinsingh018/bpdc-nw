import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { findBestOverlapSlot } from '@/lib/utils/overlapWorkingHours';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userA, userBEmail, date } = body;

        if (!userA || !userBEmail || !date) {
            return NextResponse.json({ error: 'Missing userA, userBEmail, or date.' }, { status: 400 });
        }

        const result = await pool.query(
            'SELECT name, time_zone, working_hours FROM "User" WHERE email = $1',
            [userBEmail]
        );


        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User B not found.' }, { status: 404 });
        }

        const userB = {
            name: result.rows[0].name,
            timeZone: result.rows[0].time_zone,
            workingHours: result.rows[0].working_hours,
        };

        if (!userB.timeZone || !userB.workingHours) {
            return NextResponse.json({ error: 'User B missing timezone or working hours.' }, { status: 400 });
        }

        // Get user B's blocked times for the requested date
        const userBResult = await pool.query(
            'SELECT id FROM "User" WHERE email = $1',
            [userBEmail]
        );
        const userBId = userBResult.rows[0]?.id;

        // Get the week start date for the requested date
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();
        const weekStartDate = new Date(requestedDate);
        weekStartDate.setDate(requestedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const weekStartStr = weekStartDate.toISOString().split('T')[0];
        const requestedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0=Monday, 6=Sunday

        // Get blocked times for user B on the requested day
        const blockedTimesResult = await pool.query(
            `SELECT start_time, end_time 
             FROM user_calendar_blocks 
             WHERE user_id = $1 AND week_start_date = $2 AND day_of_week = $3 AND is_blocked = true`,
            [userBId, weekStartStr, requestedDayOfWeek]
        );

        interface BlockedSlot {
            start: string;
            end: string;
        }

        const blockedSlots: BlockedSlot[] = blockedTimesResult.rows.map((row: any) => ({
            start: row.start_time,
            end: row.end_time,
        }));

        const slots = await findBestOverlapSlot(userA, userB, date);

        if (!slots) {
            return NextResponse.json({ error: 'No overlapping slots found.' }, { status: 404 });
        }

        // Filter out slots that overlap with blocked times
        const availableSlots = slots.filter((slot) => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            const slotStartTime = slotStart.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS
            const slotEndTime = slotEnd.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS

            // Check if this slot overlaps with any blocked time
            return !blockedSlots.some((blocked: BlockedSlot) => {
                // Simple time comparison (assuming same day)
                return (
                    (slotStartTime >= blocked.start && slotStartTime < blocked.end) ||
                    (slotEndTime > blocked.start && slotEndTime <= blocked.end) ||
                    (slotStartTime <= blocked.start && slotEndTime >= blocked.end)
                );
            });
        });

        if (availableSlots.length === 0) {
            return NextResponse.json({ error: 'No available slots found (all blocked).' }, { status: 404 });
        }

        return NextResponse.json({ slots: availableSlots, userB, blockedSlots });
    } catch (err) {
        console.error('❌ Meeting scheduler error:', err); // ✅ Logs error to terminal
        return NextResponse.json(
            {
                error: 'Server error',
                details: (err as Error).message,
            },
            { status: 500 }
        );
    }

} 