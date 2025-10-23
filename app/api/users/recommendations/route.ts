import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user } from '@/lib/db/schema';
import { ne, desc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
        }

        // Fetch first 10 users excluding the current user
        const users = await db
            .select()
            .from(user)
            .where(ne(user.email, email))
            .orderBy(desc(user.createdAt))
            .limit(10);

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
