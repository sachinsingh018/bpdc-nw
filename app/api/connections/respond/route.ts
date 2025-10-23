import { NextRequest, NextResponse } from 'next/server';
import { updateConnectionStatus, getConnectionById, createNotification, getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
    try {
        // Get user email from request body or headers
        const { connectionId, status, userEmail } = await request.json();

        // If userEmail is not in body, try to get it from headers
        const emailFromHeaders = request.headers.get('x-user-email');
        const email = userEmail || emailFromHeaders;

        console.log('Connection response request:', { connectionId, status, userEmail: email });

        if (!email) {
            return NextResponse.json({ error: 'User email is required' }, { status: 401 });
        }

        if (!connectionId || !status) {
            return NextResponse.json({ error: 'Connection ID and status are required' }, { status: 400 });
        }

        if (!['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Status must be either "accepted" or "rejected"' }, { status: 400 });
        }

        // Get user ID from email
        const [user] = await getUser(email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('Found user:', { id: user.id, email: user.email });

        // Get connection details
        const connection = await getConnectionById(connectionId);
        console.log('Found connection:', connection);

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // Check if connection is already in the requested status
        console.log('Checking connection status:', { currentStatus: connection.status, requestedStatus: status });
        if (connection.status === status) {
            console.log(`Connection already ${status}, returning early`);
            return NextResponse.json({
                success: true,
                message: `Connection already ${status}`,
                alreadyProcessed: true
            });
        }

        // Verify the current user is the receiver
        if (connection.receiver_id !== user.id) {
            console.log('Authorization failed:', { receiverId: connection.receiver_id, userId: user.id });
            return NextResponse.json({ error: 'Unauthorized to respond to this connection' }, { status: 403 });
        }

        // Update connection status
        console.log('Updating connection status to:', status);
        await updateConnectionStatus({
            connectionId,
            status: status as 'accepted' | 'rejected',
        });
        console.log('Connection status updated successfully');

        // Create notification for sender
        const notificationType = status === 'accepted' ? 'connection_accepted' : 'connection_rejected';
        const notificationTitle = status === 'accepted' ? 'Connection Accepted' : 'Connection Rejected';
        const notificationMessage = status === 'accepted'
            ? `${user.name || 'Someone'} accepted your connection request`
            : `${user.name || 'Someone'} rejected your connection request`;

        console.log('Creating notification for sender:', connection.sender_id);
        await createNotification({
            userId: connection.sender_id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedUserId: user.id,
            relatedConnectionId: connectionId,
        });
        console.log('Notification created successfully');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error responding to connection request:', error);
        return NextResponse.json({ error: 'Failed to respond to connection request' }, { status: 500 });
    }
} 