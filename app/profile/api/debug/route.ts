// app/profile/api/debug/route.ts
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET() {
    try {
        const [user] = await getUser('sachintest@gmail.com');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}   
