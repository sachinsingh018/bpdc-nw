import { NextRequest, NextResponse } from 'next/server';
import { sendConnectionRequest, createNotification, getUser, checkConnectionStatus } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
    try {
        const { senderEmail, receiverEmail, message } = await req.json();

        if (!senderEmail || !receiverEmail) {
            return NextResponse.json({ error: 'Sender and receiver emails are required' }, { status: 400 });
        }

        // Get user IDs from emails
        const [sender] = await getUser(senderEmail);
        const [receiver] = await getUser(receiverEmail);

        if (!sender || !receiver) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if connection already exists
        const existingConnection = await checkConnectionStatus({
            senderId: sender.id,
            receiverId: receiver.id,
        });

        if (existingConnection) {
            if (existingConnection.status === 'pending') {
                return NextResponse.json({ error: 'Connection request already sent' }, { status: 409 });
            } else if (existingConnection.status === 'accepted') {
                return NextResponse.json({ error: 'Already connected' }, { status: 409 });
            }
        }

        // Send connection request
        const connectionResult = await sendConnectionRequest({
            senderId: sender.id,
            receiverId: receiver.id,
            message,
        });

        // Create notification for receiver
        await createNotification({
            userId: receiver.id,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${sender.name || sender.email} wants to connect with you`,
            relatedUserId: sender.id,
            relatedConnectionId: connectionResult[0]?.id,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Connection request error:', error);
        return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }
} 