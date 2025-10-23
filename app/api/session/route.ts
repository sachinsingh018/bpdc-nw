import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Await the cookies promise before accessing the cookieStore
    const cookieStore = await cookies();
    
    // Retrieve the 'user_session' cookie
    const userSessionCookie = cookieStore.get('user_session')?.value;

    // Check if the cookie value exists and parse it
    const userSession = userSessionCookie ? JSON.parse(userSessionCookie) : null;

    // If no session found, return an error message
    if (!userSession) {
      return NextResponse.json({ error: 'User session not found' }, { status: 404 });
    }

    // Return the user session data as JSON
    return NextResponse.json(userSession);

  } catch (error) {
    console.error('Error retrieving user session:', error);
    return NextResponse.json({ error: 'Unable to fetch user data' }, { status: 500 });
  }
}
