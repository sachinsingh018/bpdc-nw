import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { connection } from '@/lib/db/schema';
import { or, eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail');

        if (!userEmail) {
            return NextResponse.json({ error: 'User email is required' }, { status: 400 });
        }

        // Get user ID from email
        const [user] = await getUser(userEmail);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all connections where user is either sender or receiver
        const allConnections = await db
            .select()
            .from(connection)
            .where(
                or(
                    eq(connection.sender_id, user.id),
                    eq(connection.receiver_id, user.id)
                )
            );

        return NextResponse.json({ connections: allConnections });
    } catch (error) {
        console.error('Error fetching all connections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch connections' },
            { status: 500 }
        );
    }
} 