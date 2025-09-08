import { User } from '@clerk/nextjs/server'

export type UserPlan = 'guest' | 'free' | 'premium'

export interface SubscriptionInfo {
  plan: UserPlan
  isActive: boolean
  stripeCustomerId?: string
  subscriptionId?: string
  subscriptionStatus?: string
}

export function getUserSubscriptionInfo(user: User | null): SubscriptionInfo {
  if (!user) {
    return {
      plan: 'guest',
      isActive: false,
    }
  }

  const privateMetadata = user.privateMetadata as Record<string, unknown>
  const planType = privateMetadata?.planType || 'free'
  const subscriptionStatus = privateMetadata?.subscriptionStatus

  return {
    plan: planType as UserPlan,
    isActive: subscriptionStatus === 'active',
    stripeCustomerId: privateMetadata?.stripeCustomerId,
    subscriptionId: privateMetadata?.subscriptionId,
    subscriptionStatus: subscriptionStatus,
  }
}

export function getTimerLimits(plan: UserPlan): number[] {
  switch (plan) {
    case 'guest':
      return [5] // 5 minutes max for guests
    case 'free':
      return [3, 5] // 3-5 minutes for free users
    case 'premium':
      return [3, 5, 10, 15, 0] // Up to 15 min or unlimited for premium
    default:
      return [5]
  }
}

export function getDecisionLimits(plan: UserPlan) {
  switch (plan) {
    case 'guest':
      return {
        monthly: 0,
        storage: false,
        aiInsights: false,
        export: false,
      }
    case 'free':
      return {
        monthly: 10,
        storage: true,
        aiInsights: true,
        export: false,
      }
    case 'premium':
      return {
        monthly: Infinity,
        storage: true,
        aiInsights: true,
        export: true,
      }
    default:
      return {
        monthly: 0,
        storage: false,
        aiInsights: false,
        export: false,
      }
  }
}

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '10 decisions per month',
      'Basic timer (up to 5 min)',
      '7-day history',
      'Basic AI insights',
    ],
  },
  premium: {
    name: 'Premium',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Unlimited decisions',
      'Extended timers (up to 15 min)',
      'Full history & analytics',
      'Advanced AI insights',
      'Export decisions',
      'Priority support',
    ],
  },
}