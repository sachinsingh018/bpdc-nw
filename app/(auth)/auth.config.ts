import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/profile',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const publicPaths = [
        '/',
        '/landing-page',
        '/about',
        '/onboarding',
        '/connect-setup',
        '/matches',
        '/faq',
        '/job-board'
      ];

      const isOnPublicPage = publicPaths.some((p) => path.startsWith(p));
      const isOnLogin = path.startsWith('/login');
      const isOnRegister = path.startsWith('/register');
      const isOnHome = path === '/';

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnLogin || isOnRegister || isOnPublicPage) {
        return true; // Always allow public and auth pages
      }

      if (!isLoggedIn) {
        return false; // Block access to private pages
      }

      return true; // Logged in and accessing private content
    },
  },

} satisfies NextAuthConfig;