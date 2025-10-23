import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId, getUser } from '@/lib/db/queries';
import { getCookie } from 'cookies-next';

export async function GET(request: Request) {
  const session = await auth();
  console.log('SESSION DEBUG:', session);
  if (request.headers) {
    console.log('COOKIES DEBUG:', request.headers.get('cookie'));
  }

  let userId: string | null = null;

  // Try NextAuth session first
  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    // Fallback to cookie-based authentication
    const userEmail = getCookie('userEmail', { req: request as any });
    if (userEmail && typeof userEmail === 'string') {
      try {
        const [user] = await getUser(userEmail);
        if (user?.id) {
          userId = user.id;
        }
      } catch (error) {
        console.error('Error fetching user by email:', error);
      }
    }
  }

  if (!userId) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const chats = await getChatsByUserId({ id: userId });
  return Response.json(chats);
}
