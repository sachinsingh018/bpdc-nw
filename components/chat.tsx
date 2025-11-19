'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getCookie } from 'cookies-next';

import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote, Chat } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from 'next-auth';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useSession } from 'next-auth/react';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import Link from 'next/link';
import { IoMdInformation } from 'react-icons/io';
import { AiOutlineRobot } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const userEmail = getCookie('userEmail');
  if (!userEmail) return null;

  try {
    const response = await fetch('/profile/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await response.json();
    return data?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Helper function to get time ago
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to track activity
const trackActivity = async (actionType: string, actionCategory: string, metadata?: any) => {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    await fetch('/api/activity/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        actionType,
        actionCategory,
        resourceType: 'chat',
        metadata: {
          ...metadata,
          pagePath: '/chat',
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(console.error);
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};


export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  isLoggedin,
  userId,
  user,
  onChatSelect,
  onNewChat,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isLoggedin: boolean;
  userId: string;
  user?: User | null;
  onChatSelect?: (chatId: string, messages: UIMessage[]) => void;
  onNewChat?: () => void;
}) {
  const { mutate } = useSWRConfig();
  console.log('userId (in chat.tsx):', userId);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [emaili, setEmaili] = useState<string | null>(null);
  const previousUserMessageCountRef = useRef(0);

  useEffect(() => {
    const fetchEmail = async () => {
      const email = await getCookie('userEmail');
      setEmaili(email ?? 'sachintest@gmail.com');
    };

    fetchEmail();

    // Initialize ref with initial message count
    previousUserMessageCountRef.current = initialMessages.filter(m => m.role === 'user').length;
  }, [initialMessages]);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: () => {
      toast.error('An error occurred, please try again!');
    },
  });

  // Track user messages when they're added
  useEffect(() => {
    const currentUserMessageCount = messages.filter(m => m.role === 'user').length;

    // Only track if a new user message was added (not initial messages)
    if (currentUserMessageCount > previousUserMessageCountRef.current && currentUserMessageCount > initialMessages.filter(m => m.role === 'user').length) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        trackActivity('chat_message_sent', 'content', {
          feature: 'chat',
          chatId: id,
          chatModel: selectedChatModel,
          messageLength: typeof lastUserMessage.content === 'string' ? lastUserMessage.content.length : 0,
          messageCount: currentUserMessageCount,
          visibilityType: selectedVisibilityType,
        });
      }
    }

    // Update ref for next comparison
    previousUserMessageCountRef.current = currentUserMessageCount;
  }, [messages, id, selectedChatModel, selectedVisibilityType, initialMessages]);

  const safeReload = async (
    chatRequestOptions?: Parameters<typeof reload>[0]
  ): Promise<string | null | undefined> => {
    try {
      return await reload(chatRequestOptions);
    } catch (err: any) {
      if (err?.response?.status === 429 || err?.message?.includes('429')) {
        toast.warning('Rate limit hit. Retrying in 3 seconds...');
        return new Promise((resolve) =>
          setTimeout(() => {
            reload(chatRequestOptions).then(resolve).catch(() => resolve(null));
          }, 3000)
        );
      } else {
        toast.error('Something went wrong.');
        return null;
      }
    }
  };



  const { data: votes = [] } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  // Fetch chat history for the floating widget
  const { data: chatHistory = [], isLoading: isLoadingHistory } = useSWR<Array<Chat>>(
    user ? `/api/history?userId=${user.id}` : null,
    fetcher,
    {
      fallbackData: [],
    }
  );
  const [flaggedExpiresAt, setFlaggedExpiresAt] = useState<Date | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);

  useEffect(() => {
    if (!emaili) {
      console.log('⛔ emaili is null or undefined, skipping flagged expiry fetch');
      return;
    }

    console.log('📨 Fetching flagged expiry for email:', emaili);

    const fetchFlaggedExpiry = async () => {
      try {
        const res = await fetch('/api/flagged-expiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emaili }),
        });

        console.log('📬 Response status from /api/flagged-expiry:', res.status);

        const text = await res.text();
        console.log('📦 Raw flagged expiry response:', text);

        if (!res.ok) {
          console.error('❌ Non-200 response from /api/flagged-expiry:', text);
          return;
        }

        if (text && text !== 'null') {
          const parsedDate = new Date(text);
          if (Number.isNaN(parsedDate.getTime())) {
            console.warn('⚠️ Received invalid date string:', text);
          } else {
            setFlaggedExpiresAt(parsedDate);
            console.log('✅ Parsed and set flaggedExpiresAt:', parsedDate.toISOString());

            // 💡 Calculate and store isFlagged immediately
            const now = new Date();
            const diffMs = parsedDate.getTime() - now.getTime();
            const hoursRemaining = diffMs / (1000 * 60 * 60);
            const flagged = hoursRemaining > 0 && hoursRemaining < 24;

            setIsFlagged(flagged);
            console.log('🚨 isFlagged:', flagged, 'Hours remaining:', hoursRemaining.toFixed(2));
          }
        } else {
          console.log('ℹ️ flaggedChatExpiresAt is null or empty string.');
          setIsFlagged(false); // No expiry means not flagged
        }
      } catch (err) {
        console.error('❌ Error fetching flagged expiry:', err);
      }
    };

    fetchFlaggedExpiry();
  }, [emaili]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  // const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const userMessageCount = useMemo(() => {
    return messages.filter((m) => m.role === 'user').length;
  }, [messages]);

  // Dynamically set the limit based on login status
  // const messageLimit = isLoggedin ? 5 : 3;
  const messageLimit = 7;
  // Above is just a placeholder till demo
  const reachedLimit = userMessageCount >= messageLimit;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust the delay if needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastMessageDate = localStorage.getItem('lastMessageDate');

    // Reset cookies if logged in
    if (isLoggedin) {
      localStorage.removeItem('messageLimitReached');
      document.cookie = "messageLimitReached=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    // Refresh daily quota if date changed
    if (lastMessageDate !== today) {
      localStorage.removeItem('messageLimitReached');
      localStorage.setItem('lastMessageDate', today);
      document.cookie = "messageLimitReached=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    // ✅ THIS SHOULD RUN REGARDLESS OF LOGIN
    if (reachedLimit) {
      console.log('⚠️ Reached limit, triggering lock');

      localStorage.setItem('messageLimitReached', 'true');
      localStorage.setItem('lastMessageDate', today);

      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      document.cookie = `messageLimitReached=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      fetch('/api/timestamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emaili,
          flaggedChatExpiresAt: expiryDate.toISOString(),
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Timestamp API response:', data);
        })
        .catch(err => {
          console.error('❌ Timestamp API call failed:', err);
        });
    }
  }, [isLoggedin, reachedLimit]);


  // const effectiveReadonly =
  const cookieBlocked =
    typeof document !== 'undefined' &&
    (document.cookie.includes('messageLimitReached=true') ||
      localStorage.getItem('messageLimitReached') === 'true');

  const effectiveReadonly = reachedLimit || cookieBlocked;
  useEffect(() => {
    const cookieBlocked =
      typeof document !== 'undefined' && document.cookie.includes('messageLimitReached=true');

    if (cookieBlocked && messages.length === 0) {
      // They opened a new empty chat to bypass — redirect!
      // router.push('/limit-reached'); // Or show a message inline
    }
  }, [messages]);

  const [cookieBlockedState, setCookieBlockedState] = useState(false);

  useEffect(() => {
    const cookieBlocked =
      typeof document !== 'undefined' &&
      document.cookie.includes('messageLimitReached=true');

    setCookieBlockedState(cookieBlocked);

    if (cookieBlocked && messages.length === 0) {
      // router.push('/limit-reached'); // Optional redirect
    }
  }, [messages]);

  // Above is just a placeholder till demo
  if (isLoading) {
    return (
      <div className="relative flex flex-col min-w-0 h-dvh overflow-hidden" style={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
          linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
        `
      }}>
        {/* Dynamic Vibrant Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Deep Royal Blue */}
          <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
          <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

          {/* Bright Golden Yellow */}
          <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
          <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

          {/* Crimson Red */}
          <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
          <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

          {/* Charcoal Black */}
          <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

          {/* Light Gray */}
          <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

          {/* Mid-tone Blue */}
          <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

          {/* Warm Golden Glow */}
          <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

          {/* Vibrant Red */}
          <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

          {/* Neon Purple */}
          <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
          <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
              borderColor: 'rgba(255, 215, 0, 0.8)',
              borderTopColor: 'transparent'
            }} />
            <h2 className="text-xl font-bold text-black mb-2">
              Loading AI Chat...
            </h2>
            <p className="text-black font-medium">
              Preparing your AI assistant
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col min-w-0 h-dvh overflow-hidden" style={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
          linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
        `
      }}>
        {/* Dynamic Vibrant Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Deep Royal Blue */}
          <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
          <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

          {/* Bright Golden Yellow */}
          <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
          <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

          {/* Crimson Red */}
          <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
          <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

          {/* Charcoal Black */}
          <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

          {/* Light Gray */}
          <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

          {/* Mid-tone Blue */}
          <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

          {/* Warm Golden Glow */}
          <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

          {/* Vibrant Red */}
          <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

          {/* Neon Purple */}
          <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
          <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
        </div>
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={safeReload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {effectiveReadonly || isFlagged ? (
            <div className="w-full flex justify-center px-4">
              <div className="w-full max-w-3xl bg-[#0E0B1E] text-black text-center py-6 px-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-sm sm:text-base font-medium tracking-wide leading-snug sm:max-w-none w-full">
                    🚫 You&apos;ve reached your daily 7-message limit. But don&apos;t stop now — explore more features and complete your profile to unlock better connections!
                  </p>
                </div>

                <div
                  className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-black font-semibold px-4 py-2 rounded-md transition shadow cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  🚀 Go to My Profile
                </div>
              </div>
            </div>



          ) : (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={safeReload}
        votes={votes}
        isReadonly={isReadonly}
      />

      {/* Chat History Floating Widget */}
      {user && (
        <div className="hidden lg:block fixed right-4 top-24 w-80 z-40 max-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-md rounded-2xl p-4 border-2 shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 248, 220, 0.25) 50%, rgba(255, 255, 255, 0.3) 100%)',
              borderColor: 'rgba(70, 130, 180, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 30px rgba(255, 215, 0, 0.05)',
            }}
          >
            <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-600" />
              Chat History
            </h2>
            <div className="overflow-y-auto max-h-[calc(70vh-80px)] space-y-2 pr-2 scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {isLoadingHistory ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : chatHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No chat history yet
                </p>
              ) : (
                chatHistory.map((chat) => {
                  const isSelected = id === chat.id;
                  const timeAgo = getTimeAgo(chat.createdAt);

                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600'
                        : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(70, 130, 180, 0.15) 0%, rgba(70, 130, 180, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 248, 220, 0.15) 100%)',
                        borderColor: isSelected ? 'rgba(70, 130, 180, 0.4)' : 'rgba(70, 130, 180, 0.15)',
                      }}
                      onClick={async () => {
                        if (onChatSelect) {
                          try {
                            const response = await fetch(`/api/chat/${chat.id}/messages`);
                            if (response.ok) {
                              const data = await response.json();
                              onChatSelect(chat.id, data.messages || []);
                            } else {
                              toast.error('Failed to load chat messages');
                            }
                          } catch (error) {
                            console.error('Error loading chat:', error);
                            toast.error('Failed to load chat messages');
                          }
                        }
                      }}
                    >
                      <div
                        className="p-2 rounded-full flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.9) 0%, rgba(25, 25, 112, 0.8) 100%)',
                        }}
                      >
                        <MessageSquare size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black dark:text-white truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {timeAgo}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            {onNewChat && (
              <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/10">
                <Button
                  onClick={onNewChat}
                  className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/20 hover:bg-white/30 dark:hover:bg-black/30 text-black dark:text-white text-sm font-medium"
                  variant="ghost"
                >
                  <Plus className="size-4 mr-2" />
                  New Chat
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Floating "Powered by Networkqy" Bubble */}
      <a
        href="https://www.networkqy.com/about"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
      >
        <div className="bg-white/80 text-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white transition cursor-pointer">
          Powered by{' '}
          <span style={{ color: '#0E0B1E' }} className="font-semibold">
            Networkqy
          </span>
        </div>
      </a>

      {/* Style for streaming text */}
      <style jsx global>{`
  @keyframes float {
   0% {
     transform: translateY(0) translateX(0);
   }
   50% {
     transform: translateY(-20px) translateX(10px);
   }
   100% {
     transform: translateY(0) translateX(0);
   }
 }

 .animate-float-slow {
   animation: float 12s ease-in-out infinite;
 }

 .animate-float-medium {
   animation: float 8s ease-in-out infinite;
 }

 .animate-float-fast {
   animation: float 6s ease-in-out infinite;
 }

 .scrollbar-hide::-webkit-scrollbar {
   display: none;
 }
`}</style>
      <style jsx>{`
        .streaming-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: streamText 5s steps(40) 1 normal forwards;
        }

        @keyframes streamText {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .streaming-text {
            display: block;
            white-space: normal;
            animation: none;
          }
        }
      `}</style>
    </>
  );
}