import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// S3 Client configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        // Check if user is admin
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getUser(userEmail);
        if (!users.length || users[0].role !== 'admin') {
            return NextResponse.json({ error: 'Access denied - Admin role required' }, { status: 403 });
        }

        // Check environment variables
        const requiredEnvVars = {
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_REGION: process.env.AWS_REGION,
            S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        };

        const missingEnvVars = Object.entries(requiredEnvVars)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingEnvVars.length > 0) {
            console.error('Missing environment variables:', missingEnvVars);
            return NextResponse.json({
                error: 'Server configuration error. Please contact support.',
                details: `Missing: ${missingEnvVars.join(', ')}`
            }, { status: 500 });
        }

        // Get the file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            return NextResponse.json({
                error: 'Invalid file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
                success: 0,
                failed: 0,
                errors: ['Invalid file format']
            }, { status: 400 });
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload file to S3
        const uniqueFileName = `companies/${uuidv4()}_${file.name}`;
        let s3Url: string;

        try {
            // Upload to S3
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: file.type || (fileName.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            }));

            // Generate S3 URL
            s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
            console.log('Company file uploaded to S3:', s3Url);
        } catch (s3Error) {
            console.error('S3 upload error:', s3Error);
            const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error';
            return NextResponse.json({
                error: 'Failed to upload file to storage. Please try again.',
                details: errorMessage
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'File uploaded to S3 successfully',
            fileUrl: s3Url,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Error uploading companies:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

// GET endpoint to list all uploaded company files
export async function GET(request: NextRequest) {
    try {
        // Check if user is admin
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getUser(userEmail);
        if (!users.length || users[0].role !== 'admin') {
            return NextResponse.json({ error: 'Access denied - Admin role required' }, { status: 403 });
        }

        // Check environment variables
        if (!process.env.S3_BUCKET_NAME) {
            return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
        }

        // List all files in the companies/ folder
        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: process.env.S3_BUCKET_NAME!,
                Prefix: 'companies/',
            });

            const response = await s3.send(listCommand);

            const files = (response.Contents || []).map((object) => {
                const fileName = object.Key?.split('/').pop() || '';
                // Extract original filename (remove UUID prefix)
                const originalFileName = fileName.includes('_')
                    ? fileName.substring(fileName.indexOf('_') + 1)
                    : fileName;

                return {
                    key: object.Key,
                    fileName: originalFileName,
                    fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`,
                    size: object.Size || 0,
                    lastModified: object.LastModified?.toISOString() || '',
                };
            }).sort((a, b) => {
                // Sort by last modified, newest first
                return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
            });

            return NextResponse.json({
                files,
                count: files.length,
            });
        } catch (s3Error) {
            console.error('S3 list error:', s3Error);
            const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error';
            return NextResponse.json({
                error: 'Failed to list files',
                details: errorMessage
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error listing company files:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

