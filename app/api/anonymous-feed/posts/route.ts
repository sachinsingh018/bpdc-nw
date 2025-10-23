import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/queries';
import { anonymousPost, anonymousPostLike, user } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { checkUsernameNSFW, checkContentNSFW } from '@/lib/utils/nsfw-filter';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user
        const currentUser = await db.select().from(user).where(eq(user.email, userEmail));
        if (!currentUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = currentUser[0].id;

        // Get all posts with user information and like status
        const posts = await db
            .select({
                id: anonymousPost.id,
                content: anonymousPost.content,
                image_url: anonymousPost.image_url,
                is_anonymous: anonymousPost.is_anonymous,
                company_name: anonymousPost.company_name,
                industry: anonymousPost.industry,
                topic: anonymousPost.topic,
                likes_count: anonymousPost.likes_count,
                comments_count: anonymousPost.comments_count,
                created_at: anonymousPost.created_at,
                user_id: anonymousPost.user_id,
                user_name: user.name,
                user_email: user.email,
                anonymous_username: user.anonymous_username,
                anonymous_avatar: user.anonymous_avatar,
            })
            .from(anonymousPost)
            .leftJoin(user, eq(anonymousPost.user_id, user.id))
            .orderBy(desc(anonymousPost.created_at));

        // Get like status for current user
        const userLikes = await db
            .select({ post_id: anonymousPostLike.post_id })
            .from(anonymousPostLike)
            .where(eq(anonymousPostLike.user_id, userId));

        const likedPostIds = new Set(userLikes.map(like => like.post_id));

        // Add like status to posts
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id),
        }));

        return NextResponse.json({ posts: postsWithLikeStatus });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, image_url, is_anonymous, topic, company_name, industry } = body;

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

        // Create new post
        const [newPost] = await db
            .insert(anonymousPost)
            .values({
                user_id: userId,
                content: content.trim(),
                image_url: image_url || null,
                is_anonymous: is_anonymous ?? true,
                topic: topic || 'general',
                company_name: company_name || null,
                industry: industry || null,
            })
            .returning();

        return NextResponse.json({ post: newPost }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 