import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, getCommunityById, getCommunityMembers, getCommunityPosts, getUserCommunityMembership } from '@/lib/db/queries';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: communityId } = await context.params;

        // Get community details
        const community = await getCommunityById(communityId);
        if (!community) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        // Get community members
        const members = await getCommunityMembers(communityId);

        // Get community posts
        const posts = await getCommunityPosts(communityId);

        // Get user membership status if logged in
        let userMembership = null;
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (userEmail) {
            const users = await getUser(userEmail);
            if (users.length > 0) {
                userMembership = await getUserCommunityMembership(users[0].id, communityId);
            }
        }

        return NextResponse.json({
            community,
            members,
            posts,
            userMembership,
        });
    } catch (error) {
        console.error('Error fetching community details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 