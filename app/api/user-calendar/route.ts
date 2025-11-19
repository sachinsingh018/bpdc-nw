import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, timeZone, workingHours } = body;

        // If email is provided, use it; otherwise get from cookie
        const cookieStore = await cookies();
        const userEmail = email || cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // If timeZone and workingHours are provided, update the user's calendar
        if (timeZone !== undefined || workingHours !== undefined) {
            const updateFields: string[] = [];
            const updateValues: any[] = [];
            let paramCount = 1;

            if (timeZone !== undefined) {
                updateFields.push(`time_zone = $${paramCount}`);
                updateValues.push(timeZone);
                paramCount++;
            }

            if (workingHours !== undefined) {
                updateFields.push(`working_hours = $${paramCount}`);
                updateValues.push(workingHours);
                paramCount++;
            }

            updateValues.push(userEmail);

            const updateQuery = `
                UPDATE "User" 
                SET ${updateFields.join(', ')} 
                WHERE email = $${paramCount}
                RETURNING name, time_zone, working_hours
            `;

            const updateResult = await pool.query(updateQuery, updateValues);

            if (updateResult.rowCount === 0) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const user = updateResult.rows[0];

            return NextResponse.json({
                success: true,
                name: user.name,
                timeZone: user.time_zone || null,
                workingHours: user.working_hours || null,
                hasCalendarInfo: !!(user.time_zone && user.working_hours)
            });
        }

        // Otherwise, fetch the user's calendar info
        const result = await pool.query(
            'SELECT name, time_zone, working_hours FROM "User" WHERE email = $1',
            [userEmail]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = result.rows[0];

        return NextResponse.json({
            name: user.name,
            timeZone: user.time_zone || null,
            workingHours: user.working_hours || null,
            hasCalendarInfo: !!(user.time_zone && user.working_hours)
        });
    } catch (err) {
        console.error('Error with user calendar:', err);
        return NextResponse.json(
            {
                error: 'Server error',
                details: (err as Error).message,
            },
            { status: 500 }
        );
    }
}
