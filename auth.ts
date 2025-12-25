import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { dbQuery } from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Match your DB schema: EMAIL, NAME, OPERATOR_NAME, CREATED_AT
        const existingUsers = await dbQuery<{ EMAIL: string }>(
          `SELECT email FROM users WHERE email = :email`,
          { email: user.email }
        );

        if (existingUsers.length === 0) {
          await dbQuery(
            `INSERT INTO users (email, name) VALUES (:email, :name)`,
            { 
              email: user.email,
              name: user.name || 'Unknown' 
            }
          );
        }
        return true;
      } catch (error) {
        console.error('SignIn Error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
        if (token.email) {
            try {
                // Fetch only columns that actually exist: OPERATOR_NAME
                const dbUser = await dbQuery<{ OPERATOR_NAME: string }>(
                    `SELECT operator_name FROM users WHERE email = :email`,
                    { email: token.email }
                );
                if (dbUser.length > 0) {
                    token.operator_name = dbUser[0].OPERATOR_NAME;
                }
            } catch (error) {
                console.error('JWT Error:', error);
            }
        }
        return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.operator_name = token.operator_name as string;
      }
      return session;
    },
  },
});