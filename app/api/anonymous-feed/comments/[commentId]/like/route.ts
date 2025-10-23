import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/queries';
import { anonymousComment, anonymousCommentLike, user } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ commentId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { commentId } = await context.params;

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        // Get current user
        const currentUser = await db.select().from(user).where(eq(user.email, userEmail));
        if (!currentUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = currentUser[0].id;

        // Check if user already liked the comment
        const existingLike = await db
            .select()
            .from(anonymousCommentLike)
            .where(and(eq(anonymousCommentLike.comment_id, commentId), eq(anonymousCommentLike.user_id, userId)));

        if (existingLike.length > 0) {
            // Unlike the comment
            await db
                .delete(anonymousCommentLike)
                .where(and(eq(anonymousCommentLike.comment_id, commentId), eq(anonymousCommentLike.user_id, userId)));

            // Decrease like count
            await db
                .update(anonymousComment)
                .set({
                    likes_count: sql`${anonymousComment.likes_count} - 1`,
                })
                .where(eq(anonymousComment.id, commentId));

            return NextResponse.json({ liked: false });
        } else {
            // Like the comment
            await db
                .insert(anonymousCommentLike)
                .values({
                    comment_id: commentId,
                    user_id: userId,
                });

            // Increase like count
            await db
                .update(anonymousComment)
                .set({
                    likes_count: sql`${anonymousComment.likes_count} + 1`,
                })
                .where(eq(anonymousComment.id, commentId));

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling comment like:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 