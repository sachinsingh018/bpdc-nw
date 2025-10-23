// app/api/users/friends/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
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
    const { query, email } = await req.json();

    if (!query || !email) {
        return NextResponse.json({ error: 'Missing query or email' }, { status: 400 });
    }

    // Full-text search across relevant fields, excluding the current user
    // Concatenate fields: name, linkedinInfo, goals, strengths, interests, profilemetrics, linkedinURL, FacebookURL, phone
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
                        coalesce("linkedinURL",'') || ' ' ||
                        coalesce("FacebookURL",'') || ' ' ||
                        coalesce("phone",'')
                    ),
                    plainto_tsquery('english', ${query})
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
                        coalesce("linkedinURL",'') || ' ' ||
                        coalesce("FacebookURL",'') || ' ' ||
                        coalesce("phone",'')
                    ) @@ plainto_tsquery('english', ${query})
            ORDER BY rank DESC
            LIMIT 10;
        `
    );

    return NextResponse.json(results);
}
