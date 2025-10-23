import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, getUserSkillBadges } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookie (your app's auth system)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database using email
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = users[0].id;
        const skillBadges = await getUserSkillBadges(userId);

        return NextResponse.json({ skillBadges });
    } catch (error) {
        console.error('Error fetching user skill badges:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 