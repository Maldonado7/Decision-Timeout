'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { PRICING_PLANS } from '@/lib/subscription'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (priceId: string) => {
    if (!user) {
      // Redirect to sign up
      window.location.href = '/sign-up'
      return
    }

    setLoading(priceId)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
              ← Back to home
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Pricing</h1>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more decisions and advanced features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {PRICING_PLANS.free.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">
                  ${PRICING_PLANS.free.price}
                </span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
              <p className="text-slate-600">Perfect for trying out the app</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PRICING_PLANS.free.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block w-full text-center py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-indigo-600 text-white rounded-2xl p-8 relative transform hover:scale-105 transition-transform">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                {PRICING_PLANS.premium.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  ${PRICING_PLANS.premium.price}
                </span>
                <span className="opacity-75 ml-2">/month</span>
              </div>
              <p className="opacity-90">For serious decision-makers</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PRICING_PLANS.premium.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-200 mr-3 mt-1">✓</span>
                  <span className="text-white">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(PRICING_PLANS.premium.priceId!)}
              disabled={loading === PRICING_PLANS.premium.priceId}
              className="w-full bg-white text-indigo-600 py-3 rounded-lg hover:bg-indigo-50 font-medium transition-colors disabled:opacity-50"
            >
              {loading === PRICING_PLANS.premium.priceId ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Start Free Trial'
              )}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="cursor-pointer font-medium text-slate-900 hover:text-indigo-600">
                Can I cancel anytime?
              </summary>
              <div className="mt-4 text-slate-600">
                Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="cursor-pointer font-medium text-slate-900 hover:text-indigo-600">
                Is there a free trial?
              </summary>
              <div className="mt-4 text-slate-600">
                Yes! All premium plans come with a 7-day free trial. You can cancel before the trial ends without being charged.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="cursor-pointer font-medium text-slate-900 hover:text-indigo-600">
                What happens to my data if I downgrade?
              </summary>
              <div className="mt-4 text-slate-600">
                Your decision history is always preserved. If you downgrade, you'll just lose access to premium features like unlimited decisions and advanced analytics.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-slate-200 p-6">
              <summary className="cursor-pointer font-medium text-slate-900 hover:text-indigo-600">
                How does the AI insight feature work?
              </summary>
              <div className="mt-4 text-slate-600">
                Our AI analyzes your decision context, pros/cons, and emotional state to provide personalized reflection questions and reframes to help you think more clearly.
              </div>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to stop overthinking?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands making faster, better decisions
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-slate-100"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}