// app/api/users/friends/route.ts
import { NextResponse } from 'next/server';
import { db, getUsersWithConnectionStatuses, getUser } from '@/lib/db/queries';
import { sql } from 'drizzle-orm';

// Simple stop words/phrases removal and keyword extraction
function cleanQuery(query: string): string {
    // Remove common phrases
    let cleaned = query.replace(/\b(find me|show me|search for|look for|please|can you|i want|connect me with|who is|show|find|search|look|connect|me|with|for|to|the|a|an|please|can|you|i|want)\b/gi, '');
    // Remove extra spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    // If the cleaned query is empty, fall back to the original
    if (!cleaned) return query.trim();
    return cleaned;
}

export async function POST(req: Request) {
    try {
        const { query, email, page = 1, limit = 10 } = await req.json();

        if (!query || !email) {
            return NextResponse.json({ error: 'Missing query or email' }, { status: 400 });
        }

        // Get current user ID
        const [currentUser] = await getUser(email);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const cleanedQuery = cleanQuery(query);
        const offset = (page - 1) * limit;

        // Full-text search using the indexed GIN index for fast performance
        const results = await db.execute(
            sql`
                SELECT *,
                    ts_rank(
                        to_tsvector('english',
                            coalesce("name",'') || ' ' ||
                            coalesce("linkedinInfo",'') || ' ' ||
                            coalesce("goals",'') || ' ' ||
                            coalesce("strengths",'') || ' ' ||
                            coalesce("interests",'') || ' ' ||
                            coalesce("profilemetrics",'') || ' ' ||
                            coalesce("headline",'')
                        ),
                        plainto_tsquery('english', ${cleanedQuery})
                    ) AS rank
                FROM "User"
                WHERE "email" != ${email}
                  AND to_tsvector('english',
                            coalesce("name",'') || ' ' ||
                            coalesce("linkedinInfo",'') || ' ' ||
                            coalesce("goals",'') || ' ' ||
                            coalesce("strengths",'') || ' ' ||
                            coalesce("interests",'') || ' ' ||
                            coalesce("profilemetrics",'') || ' ' ||
                            coalesce("headline",'')
                        ) @@ plainto_tsquery('english', ${cleanedQuery})
                ORDER BY rank DESC
                LIMIT ${limit} OFFSET ${offset};
            `
        );

        // Get connection statuses for all results in a single query
        const userIds = results.map((u: any) => u.id);
        const connectionStatuses = await getUsersWithConnectionStatuses(currentUser.id, userIds);

        // Attach connection statuses to results
        const resultsWithStatuses = results.map((u: any) => ({
            ...u,
            connectionStatus: connectionStatuses[u.id] || null,
        }));

        return NextResponse.json({
            results: resultsWithStatuses,
            page,
            limit,
            hasMore: results.length === limit,
        });
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
