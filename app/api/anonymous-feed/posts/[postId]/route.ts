import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/queries';
import { anonymousPost, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { checkContentNSFW } from '@/lib/utils/nsfw-filter';

export async function DELETE(
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

        // Check if the post exists and belongs to the current user
        const post = await db
            .select()
            .from(anonymousPost)
            .where(and(eq(anonymousPost.id, postId), eq(anonymousPost.user_id, userId)));

        if (!post.length) {
            return NextResponse.json({ error: 'Post not found or you do not have permission to delete it' }, { status: 404 });
        }

        // Delete the post (comments and likes will be automatically deleted due to CASCADE)
        await db
            .delete(anonymousPost)
            .where(eq(anonymousPost.id, postId));

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
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
        const { content, topic, company_name, industry } = body;

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

        // Check if post exists and belongs to the user
        const existingPost = await db
            .select()
            .from(anonymousPost)
            .where(and(
                eq(anonymousPost.id, postId),
                eq(anonymousPost.user_id, userId)
            ));

        if (!existingPost.length) {
            return NextResponse.json({ error: 'Post not found or you do not have permission to edit it' }, { status: 404 });
        }

        // Update the post
        const [updatedPost] = await db
            .update(anonymousPost)
            .set({
                content: content.trim(),
                topic: topic || existingPost[0].topic,
                company_name: company_name || null,
                industry: industry || null,
                updated_at: new Date(),
            })
            .where(eq(anonymousPost.id, postId))
            .returning();

        return NextResponse.json({ post: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 