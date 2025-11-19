import { NextResponse } from 'next/server';
import { getRecommendedUsers, getUsersWithConnectionStatuses, getUser } from '@/lib/db/queries';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get('email');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const randomize = url.searchParams.get('randomize') !== 'false'; // Default to true

        if (!email) {
            return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
        }

        // Get current user ID
        const [currentUser] = await getUser(email);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get recommended users with optimized query
        const users = await getRecommendedUsers(email, limit, randomize);

        // Get connection statuses for all users in a single query
        const userIds = users.map((u: any) => u.id);
        const connectionStatuses = await getUsersWithConnectionStatuses(currentUser.id, userIds);

        // Attach connection statuses to users
        const usersWithStatuses = users.map((u: any) => ({
            ...u,
            connectionStatus: connectionStatuses[u.id] || null,
        }));

        return NextResponse.json({ users: usersWithStatuses });
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
