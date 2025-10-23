import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookie
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        // Debug logging
        console.log('=== USER PROFILE API DEBUG ===');
        console.log('User email:', userEmail);
        console.log('User found:', !!user);
        console.log('User role:', user.role);
        console.log('User role type:', typeof user.role);
        console.log('Full user object:', JSON.stringify(user, null, 2));

        // Return user profile data including role
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // ✅ Role field from database
            headline: user.headline,
            avatarUrl: user.avatarUrl,
            linkedinURL: user.linkedinURL,
            phone: user.phone,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
