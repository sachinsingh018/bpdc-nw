import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/db/queries';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        await markNotificationAsRead(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
} 