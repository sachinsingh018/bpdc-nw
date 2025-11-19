import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, getCommunityById, getCommunityMembers, getCommunityPosts, getUserCommunityMembership, deleteCommunity, isCommunityAdmin } from '@/lib/db/queries';

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

        // Get user membership status and admin status if logged in
        let userMembership = null;
        let isUserAdmin = false;
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (userEmail) {
            const users = await getUser(userEmail);
            if (users.length > 0) {
                const userId = users[0].id;
                userMembership = await getUserCommunityMembership(userId, communityId);
                isUserAdmin = await isCommunityAdmin(userId, communityId);
            }
        }

        return NextResponse.json({
            community,
            members,
            posts,
            userMembership,
            isUserAdmin,
        });
    } catch (error) {
        console.error('Error fetching community details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: communityId } = await context.params;

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

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                error: 'Forbidden - Admin access required'
            }, { status: 403 });
        }

        // Verify community exists
        const community = await getCommunityById(communityId);
        if (!community) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        // Delete the community (cascade will handle memberships and posts)
        await deleteCommunity(communityId);

        return NextResponse.json({
            message: 'Community deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting community:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 