import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        console.log('=== NOTIFICATIONS API DEBUG ===');
        console.log('Request URL:', request.url);
        console.log('Search params:', request.nextUrl.searchParams.toString());

        const userEmail = request.nextUrl.searchParams.get('userEmail');
        console.log('User email from params:', userEmail);

        if (!userEmail) {
            console.log('No user email provided, returning 400');
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        // Decode the email in case it's encoded
        const decodedEmail = decodeURIComponent(userEmail);
        console.log('Decoded email:', decodedEmail);

        // Also try to decode again in case it's double-encoded
        const doubleDecodedEmail = decodeURIComponent(decodedEmail);
        console.log('Double decoded email:', doubleDecodedEmail);

        // Use the email that looks more like a valid email
        const finalEmail = doubleDecodedEmail.includes('@') ? doubleDecodedEmail : decodedEmail;
        console.log('Final email to use:', finalEmail);

        // Get user ID from email
        const [user] = await getUser(finalEmail);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const notifications = await getNotifications(user.id);
        const unreadCount = await getUnreadNotificationCount(user.id);

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { notificationId } = await req.json();

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        await markNotificationAsRead(notificationId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
} 