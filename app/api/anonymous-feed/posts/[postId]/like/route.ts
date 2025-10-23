import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/queries';
import { anonymousPost, anonymousPostLike, user } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ postId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await context.params;

        // Get current user
        const currentUser = await db.select().from(user).where(eq(user.email, userEmail));
        if (!currentUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = currentUser[0].id;

        // Check if user already liked the post
        const existingLike = await db
            .select()
            .from(anonymousPostLike)
            .where(and(eq(anonymousPostLike.post_id, postId), eq(anonymousPostLike.user_id, userId)));

        if (existingLike.length > 0) {
            // Unlike the post
            await db
                .delete(anonymousPostLike)
                .where(and(eq(anonymousPostLike.post_id, postId), eq(anonymousPostLike.user_id, userId)));

            // Decrease like count
            await db
                .update(anonymousPost)
                .set({
                    likes_count: sql`${anonymousPost.likes_count} - 1`,
                })
                .where(eq(anonymousPost.id, postId));

            return NextResponse.json({ liked: false });
        } else {
            // Like the post
            await db
                .insert(anonymousPostLike)
                .values({
                    post_id: postId,
                    user_id: userId,
                });

            // Increase like count
            await db
                .update(anonymousPost)
                .set({
                    likes_count: sql`${anonymousPost.likes_count} + 1`,
                })
                .where(eq(anonymousPost.id, postId));

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling post like:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 