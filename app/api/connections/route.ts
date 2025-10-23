import { NextRequest, NextResponse } from 'next/server';
import { getConnections, getConnectionRequests, getAllPendingRequests, getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        console.log('=== CONNECTIONS API DEBUG ===');

        // Get user email from query params or headers
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail') || request.headers.get('x-user-email');

        console.log('Connections API - User email:', userEmail);

        if (!userEmail) {
            console.log('Connections API - No user email provided');
            return NextResponse.json({ error: 'User email is required' }, { status: 400 });
        }

        // Get user ID from email
        const [user] = await getUser(userEmail);
        if (!user) {
            console.log('Connections API - User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('Connections API - User ID:', user.id);

        const type = searchParams.get('type');
        console.log('Connections API - Request type:', type);

        if (type === 'requests') {
            console.log('Connections API - Getting all pending requests for user:', user.id);
            const requests = await getAllPendingRequests(user.id);
            console.log('Connections API - Raw requests from DB:', requests);
            console.log('Connections API - Requests length:', requests.length);
            console.log('Connections API - First request sample:', requests[0]);
            return NextResponse.json({ requests });
        } else {
            const connections = await getConnections(user.id);
            console.log('Connections API - Connections:', connections);
            console.log('Connections API - Connections length:', connections.length);
            console.log('Connections API - Returning response:', { connections });
            return NextResponse.json({ connections });
        }
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch connections' },
            { status: 500 }
        );
    }
} 