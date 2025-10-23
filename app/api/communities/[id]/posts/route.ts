import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, createCommunityPost, getUserCommunityMembership } from '@/lib/db/queries';

export async function POST(request: Request): Promise<Response> {
    try {
        // Extract communityId from the URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const communityIndex = pathParts.indexOf('communities');
        const communityId = pathParts[communityIndex + 1];

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
        const { content, type } = body;

        if (!content || !type || !['event', 'update'].includes(type)) {
            return NextResponse.json({ error: 'Content and valid type (event or update) are required' }, { status: 400 });
        }

        // Check if user is a member of the community
        const membership = await getUserCommunityMembership(userId, communityId);
        console.log('Membership check:', { userId, communityId, membership });
        if (!membership || membership.status !== 'approved') {
            return NextResponse.json({
                error: 'You must be an approved member to post in this community',
                membership: membership,
                userId: userId,
                communityId: communityId
            }, { status: 403 });
        }

        // Create the post
        await createCommunityPost({
            communityId,
            userId,
            content,
            type: type as 'event' | 'update',
        });

        return NextResponse.json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating community post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 