import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { getUser, createGoogleUser, getUserByGoogleId } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

// Fallback secret for development/testing
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  secret: NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) {
          return null;
        }
        const storedHash = users[0].password!;
        let passwordsMatch = false;
        try {
          passwordsMatch = await compare(password, storedHash);
        } catch (err) {
          console.log('[AUTH DEBUG] Error comparing password:', err);
        }
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { email, name, image } = user;
        const googleId = profile?.sub;

        if (!email || !googleId) {
          console.error('Missing email or googleId for Google sign in');
          return false;
        }

        try {
          // Check if user exists by Google ID
          const existingUserByGoogleId = await getUserByGoogleId(googleId);

          if (existingUserByGoogleId) {
            console.log('Existing Google user found:', existingUserByGoogleId.email);
            return true; // Return true to allow sign in
          }

          // Check if user exists by email
          const existingUserByEmail = await getUser(email);

          if (existingUserByEmail.length > 0) {
            console.log('Existing user found by email, linking Google account');
            // TODO: Add function to link Google account to existing user
            return true; // Return true to allow sign in
          }

          // Create new user with minimal profile data
          console.log('Creating new Google user:', email);
          const newUser = await createGoogleUser({
            email,
            name: name || '',
            googleId,
            avatarUrl: image || '',
            provider: 'google',
            // Set profile fields to undefined - user can update later
            linkedinInfo: undefined,
            goals: undefined,
            profilemetrics: undefined,
            strengths: undefined,
            interests: undefined,
            linkedinURL: '',
            phone: '',
            referral_code: '',
          });

          console.log('New Google user created successfully');

          // Get the created user to return proper user object
          const createdUser = await getUser(email);
          if (createdUser.length > 0) {
            return true; // Return true to allow sign in
          }

          return false;
        } catch (error) {
          console.error('Error in Google sign in:', error);
          return false;
        }
      }

      return true; // Allow other providers
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
});
