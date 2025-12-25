import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
} else {
    console.warn("⚠️ Google Client ID/Secret missing. Auth will not work.");
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
