import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk session handling. Next 16 calls this file `proxy.ts`; it is what
 * `middleware.ts` was. It reads the session cookie and makes `auth()` available
 * to the routes below — it does not decide who may see what. That decision is
 * `app/(app)/layout.tsx` (no seat, no workspace) and `requireSession()` in every
 * data module, action and route handler.
 *
 * It runs on public routes too, so that `<SignIn />` can complete a handshake,
 * but it never touches the database and does not change how a route renders.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
