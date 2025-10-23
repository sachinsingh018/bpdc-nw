import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/queries';
import { anonymousComment, anonymousCommentLike, user, anonymousPost } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { checkContentNSFW } from '@/lib/utils/nsfw-filter';

export async function GET(
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

        // Get all comments for the post with user information
        const comments = await db
            .select({
                id: anonymousComment.id,
                content: anonymousComment.content,
                created_at: anonymousComment.created_at,
                user_id: anonymousComment.user_id,
                user_name: user.name,
                is_anonymous: anonymousComment.is_anonymous
            })
            .from(anonymousComment)
            .leftJoin(user, eq(anonymousComment.user_id, user.id))
            .where(eq(anonymousComment.post_id, postId))
            .orderBy(anonymousComment.created_at);

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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
        const body = await request.json();
        const { content, is_anonymous = false } = body;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Check content for inappropriate language
        const contentValidation = checkContentNSFW(content.trim());
        if (!contentValidation.isValid) {
            return NextResponse.json({
                error: contentValidation.reason,
                suggestions: contentValidation.suggestions
            }, { status: 400 });
        }

        // Get current user
        const currentUser = await db.select().from(user).where(eq(user.email, userEmail));
        if (!currentUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = currentUser[0].id;

        // Check if the post exists
        const post = await db.select().from(anonymousPost).where(eq(anonymousPost.id, postId));
        if (!post.length) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Create the comment
        const [newComment] = await db
            .insert(anonymousComment)
            .values({
                post_id: postId,
                user_id: userId,
                content: content.trim(),
                is_anonymous: is_anonymous,
                created_at: new Date()
            })
            .returning();

        // Get user information for the response
        const userInfo = await db
            .select({
                name: user.name
            })
            .from(user)
            .where(eq(user.id, userId));

        const commentWithUser = {
            ...newComment,
            user_name: userInfo[0]?.name
        };

        return NextResponse.json({ comment: commentWithUser });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 