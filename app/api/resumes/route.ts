import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getBpdcPostgresClient } from '@/lib/db/connection';
import { uploads } from '@/lib/db/schema';
import { eq, inArray, desc, and } from 'drizzle-orm';

const client = getBpdcPostgresClient();
const db = drizzle(client);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileTypes = ['cv', 'cover-letter'];

    const userUploads = await db
      .select()
      .from(uploads)
      .where(and(
        eq(uploads.userEmail, userEmail),
        inArray(uploads.fileType, fileTypes)
      ))
      .orderBy(desc(uploads.createdAt));

    return NextResponse.json(userUploads);
  } catch (error) {
    console.error('Failed to fetch uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
