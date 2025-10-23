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

        const slots = await findBestOverlapSlot(userA, userB, date);

        if (!slots) {
            return NextResponse.json({ error: 'No overlapping slots found.' }, { status: 404 });
        }

        return NextResponse.json({ slots, userB });
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