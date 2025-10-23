import { NextRequest, NextResponse } from 'next/server';
import { sendUserMessage, getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get user email from cookies (same as other parts of the app)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - No user email found' }, { status: 401 });
        }

        // Get sender user ID
        const [sender] = await getUser(userEmail);
        if (!sender) {
            return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
        }

        const { receiverEmail, message } = await request.json();

        if (!receiverEmail || !message) {
            return NextResponse.json({ error: 'Receiver email and message are required' }, { status: 400 });
        }

        // Get receiver user ID
        const [receiver] = await getUser(receiverEmail);
        if (!receiver) {
            return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
        }

        // Send the message
        const result = await sendUserMessage({
            senderId: sender.id,
            receiverId: receiver.id,
            message,
        });

        return NextResponse.json({ success: true, messageId: result[0]?.id });
    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        );
    }
} 