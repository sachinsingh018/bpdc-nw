import { NextRequest, NextResponse } from 'next/server';
import { sendConnectionRequest, checkConnectionStatus, createNotification, getUserById } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { receiverId, message } = await request.json();

        if (!receiverId) {
            return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
        }

        // Check if connection already exists
        const existingConnection = await checkConnectionStatus({
            senderId: session.user.id,
            receiverId,
        });

        if (existingConnection) {
            return NextResponse.json(
                { error: 'Connection request already exists' },
                { status: 400 }
            );
        }

        // Send connection request
        const connectionResult = await sendConnectionRequest({
            senderId: session.user.id,
            receiverId,
            message,
        });

        // Get receiver details for notification
        const [receiver] = await getUserById(receiverId);
        if (receiver) {
            // Create notification for receiver
            await createNotification({
                userId: receiverId,
                type: 'connection_request',
                title: 'New Connection Request',
                message: `${session.user.name || 'Someone'} wants to connect with you`,
                relatedUserId: session.user.id,
                relatedConnectionId: connectionResult[0]?.id,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending connection request:', error);
        return NextResponse.json(
            { error: 'Failed to send connection request' },
            { status: 500 }
        );
    }
} 