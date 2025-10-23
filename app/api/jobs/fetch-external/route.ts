import { NextRequest, NextResponse } from 'next/server';
import fetchTechJobsToCSV from '@/lib/jobs/fetchTechJobsToCSV';
import fetchRemoteJobsMENA from '@/lib/jobs/fetchRemoteJobsMENA';

export async function POST(request: NextRequest) {
    try {
        console.log('Starting external job fetch...');

        // Run both fetch functions in parallel
        const [techJobsResult, remoteJobsResult] = await Promise.allSettled([
            fetchTechJobsToCSV(),
            fetchRemoteJobsMENA()
        ]);

        const results = {
            techJobs: {
                status: techJobsResult.status,
                error: techJobsResult.status === 'rejected' ? techJobsResult.reason?.message : null
            },
            remoteJobs: {
                status: remoteJobsResult.status,
                error: remoteJobsResult.status === 'rejected' ? remoteJobsResult.reason?.message : null
            }
        };

        // Check if both succeeded
        const allSucceeded = techJobsResult.status === 'fulfilled' && remoteJobsResult.status === 'fulfilled';

        if (allSucceeded) {
            console.log('✅ Successfully fetched external jobs');
            return NextResponse.json({
                success: true,
                message: 'External jobs fetched successfully',
                results
            });
        } else {
            console.error('❌ Some job fetching failed:', results);
            return NextResponse.json({
                success: false,
                message: 'Some job fetching failed',
                results
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in fetch-external endpoint:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Allow GET for testing
export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger job fetching',
        endpoint: '/api/jobs/fetch-external'
    });
}
