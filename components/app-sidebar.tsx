'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { isToday } from 'date-fns';
import { fetcher } from '@/lib/utils';
import type { Chat } from '@/lib/db/schema';
import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { setCookie } from 'cookies-next';

import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useState } from 'react';
import { differenceInCalendarDays, isSameDay } from 'date-fns';

function getStreak(history: Array<Chat>): number {
  if (!history || history.length === 0) return 0;

  const sortedDates = history
    .map(chat => new Date(chat.createdAt))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let today = new Date();

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);

    if (isSameDay(currentDate, expectedDate)) {
      streak++;
    } else if (differenceInCalendarDays(expectedDate, currentDate) > 0) {
      break;
    }
  }

  return streak;
}

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  const { data: history = [], isLoading } = useSWR<Array<Chat>>(
    user ? `/api/history?userId=${user.id}` : null,
    fetcher
  );

  const latestChat = history[0];
  const streak = getStreak(history);

  if (typeof window !== 'undefined') {
    setCookie('userStreak', streak.toString(), {
      maxAge: 60 * 60 * 24,
      path: '/',
    });
  }

  const isLatestChatToday = latestChat && isToday(new Date(latestChat.createdAt));
  const [isRedirectingToForm, setIsRedirectingToForm] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Bubble Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute size-72 bg-purple-500 rounded-full opacity-20 blur-2xl animate-pulse top-10 left-1/2 -translate-x-1/2" />
        <div className="absolute size-56 bg-blue-400 rounded-full opacity-10 blur-2xl animate-spin-slow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute size-72 bg-pink-500 rounded-full opacity-10 blur-2xl animate-pulse bottom-10 left-1/2 -translate-x-1/2" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10">
        <Sidebar className="group-data-[side=left]:border-r-0">
          <SidebarHeader>
            <SidebarMenu>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between items-center">
                  <Link
                    href="/chat"
                    onClick={() => setOpenMobile(false)}
                    className="flex flex-row gap-3 items-center"
                  >
                    <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                      Networkqy
                    </span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          type="button"
                          className="p-2 h-fit hover:bg-muted"
                          onClick={() => {
                            setOpenMobile(false);
                            router.push('/chat');
                          }}
                        >
                          <PlusIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent align="end">
                        New Chat
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {user && streak > 0 && (
                  <div className="text-sm text-muted-foreground ml-2 mt-1">
                    🔥 Current Streak: <span className="font-semibold">{streak} day{streak > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarHistory user={user} />
          </SidebarContent>

          <SidebarFooter>
            {user && <SidebarUserNav user={user} />}
            {user && (
              <div className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2 w-4/5 space-y-3">
                <div
                  className="w-full bg-[#0E0B1E] text-white text-center py-2 px-4 rounded-lg shadow-lg shadow-purple-500/50 z-50 cursor-pointer"
                  onClick={() => {
                    setIsRedirectingToForm(true);
                    router.push('/register-for-premium');
                  }}
                >
                  <p className="text-sm font-bold flex justify-center items-center gap-2">
                    🚀 {isRedirectingToForm ? 'Redirecting to the form...' : 'Premium version coming soon! Register Now!'}
                  </p>
                </div>
              </div>
            )}

            {!user && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 space-y-4">
                <div
                  className="w-full bg-[#0E0B1E] text-white text-center py-2 px-4 rounded-lg shadow-lg shadow-purple-500/50 z-50 cursor-pointer"
                  onClick={() => {
                    setIsRedirectingToForm(true);
                    router.push('/register-for-premium');
                  }}
                >
                  <p className="text-sm font-bold flex justify-center items-center gap-2">
                    🚀 {isRedirectingToForm ? 'Redirecting to the form...' : 'Premium version coming soon! Register Now!'}
                  </p>
                </div>

                <Button
                  className="w-full bg-white text-black hover:bg-gray-100 font-semibold shadow-md"
                  onClick={async () => {
                    setIsLoadingRegister(true);
                    await router.push('/register');
                  }}
                  disabled={isLoadingRegister}
                >
                  {isLoadingRegister ? 'Redirecting...' : 'Sign Up'}
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Global styles for animation */}
      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
