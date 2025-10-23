import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Basic email validation
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // TODO: Replace with actual email service integration
        // Current implementation: Log to console and write to local file for development

        console.log(`New subscription: ${email}`);

        // For development: Write to a local JSON file
        // In production, integrate with:
        // - Mailchimp
        // - Resend
        // - Supabase
        // - Or your preferred email service

        // Example integration structure:
        /*
        const response = await fetch('https://api.mailchimp.com/3.0/lists/{list-id}/members', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
            merge_fields: {
              SOURCE: 'token-landing-page'
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to subscribe to mailing list');
        }
        */

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Successfully subscribed',
                email: email
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Subscription error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: 'Failed to process subscription'
            },
            { status: 500 }
        );
    }
}

// Optional: Add GET method to check subscription status
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json(
            { error: 'Email parameter is required' },
            { status: 400 }
        );
    }

    // TODO: Check if email is already subscribed
    // This would typically query your email service or database

    return NextResponse.json(
        {
            email: email,
            subscribed: false, // Placeholder - implement actual check
            message: 'Subscription status checked'
        },
        { status: 200 }
    );
}
