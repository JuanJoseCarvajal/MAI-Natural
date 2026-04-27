import type { NextAuthConfig } from 'next-auth';

const authConfig: NextAuthConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        (session.user as { id: string; role?: string }).role = token.role as
          | string
          | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { id: string; role?: string }).role;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
};

export default authConfig;
