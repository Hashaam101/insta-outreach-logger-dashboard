import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { dbQuerySingleCached } from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token }) {
      if (token.email && !token.operator_name) {
        try {
          const dbUser = await dbQuerySingleCached<{ OPR_NAME: string }>(
            `SELECT OPR_NAME FROM OPERATORS WHERE OPR_EMAIL = :email`,
            { email: token.email },
            `user:op:${token.email}`
          );
          if (dbUser?.OPR_NAME) {
            token.operator_name = dbUser.OPR_NAME;
          }
        } catch (error) {
          console.error('JWT Error:', error);
          // Continue without operator_name
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.operator_name = (token.operator_name as string) || '';
      }
      return session;
    },
  },
});
