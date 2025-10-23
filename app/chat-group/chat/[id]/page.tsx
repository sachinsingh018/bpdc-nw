import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();
  const isLoggedIn = session?.user?.id !== '1a17769c-5827-4325-94da-71ddeb5b6279';


  const messagesFromDb = await getMessagesByChatId({ id });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  // Ensure that prompt is generated regardless of login status
  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie?.value ?? DEFAULT_CHAT_MODEL}
        selectedVisibilityType={chat.visibility}
        isReadonly   // Read-only if user isn't the owner
        isLoggedin={isLoggedIn} // Pass isLoggedIn as a prop
        // userId={session?.user?.id} 
        userId={session?.user?.id ?? ''}

      />
      <DataStreamHandler id={id} />
    </>
  );
}
