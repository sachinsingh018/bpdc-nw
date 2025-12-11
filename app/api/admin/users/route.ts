import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user } from '@/lib/db/schema';
import { ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const batchYear = searchParams.get('batchYear') || '';
        const profile = searchParams.get('profile') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Build query conditions
        let conditions: any[] = [];

        // Search filter
        if (search) {
            conditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )!
            );
        }

        // Get all users with education field parsed
        let query = db
            .select({
                id: user.id,
                email: user.email,
                name: user.name,
                education: user.education,
                createdAt: user.createdAt,
                headline: user.headline,
                avatarUrl: user.avatarUrl,
            })
            .from(user);

        // Apply search conditions
        if (conditions.length > 0) {
            query = query.where(or(...conditions)!);
        }

        // Get total count for pagination
        const allUsers = await query;
        
        // Filter by batch year and profile from education JSONB
        let filteredUsers = allUsers.map(u => {
            let batch_year = '';
            let userProfile = 'student'; // default

            // Extract batch_year and profile from education JSONB
            if (u.education && typeof u.education === 'object') {
                const education = u.education as any;
                // Check if education is an array
                if (Array.isArray(education) && education.length > 0) {
                    const latestEducation = education[education.length - 1];
                    batch_year = latestEducation?.batch_year || latestEducation?.year || latestEducation?.graduationYear || '';
                    userProfile = latestEducation?.profile || latestEducation?.type || 'student';
                } else if (education.batch_year || education.year || education.graduationYear) {
                    batch_year = education.batch_year || education.year || education.graduationYear || '';
                    userProfile = education.profile || education.type || 'student';
                }
            }

            return {
                ...u,
                batch_year,
                profile: userProfile.toLowerCase(),
            };
        });

        // Apply batch year filter
        if (batchYear && batchYear !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.batch_year === batchYear);
        }

        // Apply profile filter
        if (profile && profile !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.profile === profile.toLowerCase());
        }

        // Get total count after filtering
        const total = filteredUsers.length;

        // Apply pagination
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);

        return NextResponse.json({
            users: paginatedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

