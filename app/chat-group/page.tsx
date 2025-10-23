import { cookies } from 'next/headers';
// import Footer from '@/components/footer';
import { auth } from '../(auth)/auth'; // Adjust path if needed

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';


export default async function Page() {


  const id = generateUUID();
  const session = await auth(); // Get user session

  const userId = session?.user?.id ?? ''; // Fallback if not logged in
  const isLoggedin = true; // true if userId is not empty, false if it is empty

  console.log("USER ID FOR THIS SESSION IS", userId);
  console.log("Isloggedin FOR THIS SESSION IS", isLoggedin);

  // console.log('User Session (in page.tsx):', session); // Log session
  // console.log('User ID (in page.tsx):', userId); // Log userId
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  // const userId = "some-unique-user-id"; // Replace this with your logic for fetching userId

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          userId={userId}
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="public"
          isReadonly={false}
          isLoggedin={isLoggedin}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        userId={userId}
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={DEFAULT_CHAT_MODEL}
        selectedVisibilityType="public"
        isReadonly={false}
        isLoggedin={isLoggedin}
      />
      <DataStreamHandler id={id} />

    </>

  );


}
