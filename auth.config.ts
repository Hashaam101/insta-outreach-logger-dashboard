import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
} else {
    console.warn("⚠️ Google Client ID/Secret missing. Auth will not work.");
}

// Dev Mode Credentials Provider
if (process.env.NODE_ENV === "development") {
    providers.push(Credentials({
        id: "dev-login",
        name: "Dev Mode",
        credentials: {
            email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
            if (credentials?.email) {
                return {
                    id: "dev-user",
                    name: (credentials.email as string).split('@')[0],
                    email: credentials.email as string,
                };
            }
            return null;
        },
    }));
}

export const authConfig = {
  providers,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isLoginRoute = nextUrl.pathname.startsWith('/login');
      const isPublicRoute = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/static');

      // Always allow auth routes (signin, callback, etc.)
      if (isAuthRoute || isPublicRoute) {
        return true;
      }

      if (isLoginRoute) {
        // If already logged in, redirect to dashboard
        if (isLoggedIn) {
           return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Protect all other routes
      return isLoggedIn;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors back to login
  },
} satisfies NextAuthConfig;
