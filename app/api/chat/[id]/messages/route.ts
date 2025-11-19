import { NextRequest, NextResponse } from 'next/server';
import { getMessagesByChatId, getChatById, getUser } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { getCookie } from 'cookies-next';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Try NextAuth session first
        const session = await auth();
        let userId: string | null = null;

        if (session?.user?.id) {
            userId = session.user.id;
        } else {
            // Fallback to cookie-based authentication
            const userEmail = getCookie('userEmail', { req: request as any });
            if (userEmail && typeof userEmail === 'string') {
                try {
                    const [user] = await getUser(userEmail);
                    if (user?.id) {
                        userId = user.id;
                    }
                } catch (error) {
                    console.error('Error fetching user by email:', error);
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify chat exists and belongs to user
        const chat = await getChatById({ id });
        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        if (chat.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get messages
        const messagesFromDb = await getMessagesByChatId({ id });

        // Convert DB messages to UI messages
        function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
            return messages.map((message) => ({
                id: message.id,
                parts: message.parts as UIMessage['parts'],
                role: message.role as UIMessage['role'],
                content: '',
                createdAt: message.createdAt,
                experimental_attachments:
                    (message.attachments as Array<Attachment>) ?? [],
            }));
        }

        const uiMessages = convertToUIMessages(messagesFromDb);

        return NextResponse.json({
            messages: uiMessages,
            chat: {
                id: chat.id,
                title: chat.title,
                createdAt: chat.createdAt,
                visibility: chat.visibility,
            },
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

