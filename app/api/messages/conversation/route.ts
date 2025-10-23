import { NextRequest, NextResponse } from 'next/server';
import { getConversationMessages, getUser, markMessagesAsRead } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookies (same as other parts of the app)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - No user email found' }, { status: 401 });
        }

        // Get current user ID
        const [currentUser] = await getUser(userEmail);
        if (!currentUser) {
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const otherUserEmail = searchParams.get('email');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!otherUserEmail) {
            return NextResponse.json({ error: 'Other user email is required' }, { status: 400 });
        }

        // Get other user ID
        const [otherUser] = await getUser(otherUserEmail);
        if (!otherUser) {
            return NextResponse.json({ error: 'Other user not found' }, { status: 404 });
        }

        // Get conversation messages
        const messages = await getConversationMessages({
            userId1: currentUser.id,
            userId2: otherUser.id,
            limit,
            offset,
        });

        // Mark messages as read (only for messages sent to current user)
        await markMessagesAsRead({
            receiverId: currentUser.id,
            senderId: otherUser.id,
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error getting conversation messages:', error);
        return NextResponse.json(
            { error: 'Failed to get conversation messages' },
            { status: 500 }
        );
    }
} 