import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, getUserById, getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookies (same as other parts of the app)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - No user email found' }, { status: 401 });
        }

        // Get user ID
        const [user] = await getUser(userEmail);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user conversations
        const conversations = await getUserConversations(user.id);

        // Populate user details for each conversation
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const [otherUser] = await getUserById(conv.other_user_id);
                return {
                    ...conv,
                    otherUser: otherUser || null,
                };
            })
        );

        return NextResponse.json({ conversations: populatedConversations });
    } catch (error) {
        console.error('Error getting user conversations:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'Failed to get conversations', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 