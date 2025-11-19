import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, isCommunityAdmin, removeCommunityMember, getCommunityById } from '@/lib/db/queries';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string; membershipId: string }> }
) {
    try {
        const { id: communityId, membershipId } = await context.params;

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

        const userId = users[0].id;

        // Verify community exists
        const community = await getCommunityById(communityId);
        if (!community) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        // Check if user is community admin
        const userIsAdmin = await isCommunityAdmin(userId, communityId);
        if (!userIsAdmin) {
            return NextResponse.json({
                error: 'Forbidden - Community admin access required'
            }, { status: 403 });
        }

        // Remove the member
        await removeCommunityMember(membershipId);

        return NextResponse.json({
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Error removing community member:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

