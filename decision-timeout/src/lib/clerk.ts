export function isClerkEnabled(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    return false;
  }

  const lower = String(publishableKey).toLowerCase();
  if (lower.includes('dummy')) {
    return false;
  }

  return true;
}

