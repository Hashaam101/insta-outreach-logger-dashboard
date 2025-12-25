import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { dbQuery, dbQuerySingleCached } from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const existingUser = await dbQuerySingleCached<{ EMAIL: string }>(
          `SELECT email FROM users WHERE email = :email`,
          { email: user.email },
          `user:${user.email}`
        );

        if (!existingUser) {
          await dbQuery(
            `INSERT INTO users (email, name) VALUES (:email, :name)`,
            { email: user.email, name: user.name || 'Unknown' }
          );
        }
        return true;
      } catch (error) {
        console.error('SignIn Error:', error);
        // Allow sign-in even if DB fails - user just won't have operator_name
        return true;
      }
    },
    async jwt({ token }) {
      if (token.email && !token.operator_name) {
        try {
          const dbUser = await dbQuerySingleCached<{ OPERATOR_NAME: string }>(
            `SELECT operator_name FROM users WHERE email = :email`,
            { email: token.email },
            `user:op:${token.email}`
          );
          if (dbUser?.OPERATOR_NAME) {
            token.operator_name = dbUser.OPERATOR_NAME;
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
