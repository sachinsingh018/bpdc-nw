import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, getAllCommunities, requestCommunityMembership, getUserCommunityMembership } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const communities = await getAllCommunities();
        return NextResponse.json({ communities });
    } catch (error) {
        console.error('Error fetching communities:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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
        const body = await request.json();
        const { communityId } = body;

        if (!communityId) {
            return NextResponse.json({ error: 'Community ID is required' }, { status: 400 });
        }

        // Check if user already has a membership
        const existingMembership = await getUserCommunityMembership(userId, communityId);
        if (existingMembership) {
            return NextResponse.json({
                error: 'Already a member of this community'
            }, { status: 400 });
        }

        // Join community (automatically approved)
        await requestCommunityMembership(userId, communityId);

        return NextResponse.json({ message: 'Successfully joined community' });
    } catch (error) {
        console.error('Error requesting community membership:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 