import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  // console.log("user session plz",session?.user);
  //   const cookieOptions = {
  //   maxAge: 60 * 60 * 24 * 7, // 7 days
  //   path: '/',
  // };
  // Store user session in cookies
  // if (session?.user) {
  //   cookieStore.set('user_session', JSON.stringify(session?.user), cookieOptions);
  // }

  return (
    <>
      {/* Pyodide for your app */}
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />

      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
