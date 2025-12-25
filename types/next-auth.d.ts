import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      operator_name?: string | null;
      role?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
      operator_name?: string | null;
      role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    operator_name?: string | null;
    role?: string | null;
  }
}
