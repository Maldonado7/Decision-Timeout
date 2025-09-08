import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// In development or when Clerk keys are not configured, bypass Clerk middleware
// so the app can run locally without valid credentials.
const hasValidClerkKeys = Boolean(
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY) &&
  process.env.CLERK_SECRET_KEY &&
  !String(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY)
    .toLowerCase()
    .includes('dummy')
);

const middleware = hasValidClerkKeys ? clerkMiddleware() : (() => NextResponse.next());

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};