import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { uploads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Ensure file belongs to the user
    const existing = await db
      .select()
      .from(uploads)
      .where(and(eq(uploads.userEmail, userEmail), eq(uploads.fileUrl, fileUrl)));

    if (!existing.length) {
      return NextResponse.json({ error: 'File not found or not owned by user' }, { status: 403 });
    }

    // Delete from DB
    await db.delete(uploads).where(and(eq(uploads.userEmail, userEmail), eq(uploads.fileUrl, fileUrl)));

    // Extract full key after domain — robust for any format
    const key = fileUrl.split('.amazonaws.com/')[1];
    if (!key) {
      console.warn('Unable to extract key from URL:', fileUrl);
    } else {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      }));
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
