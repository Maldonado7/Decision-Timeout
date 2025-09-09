'use client'

import { useUser, useAuth, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, isLoaded } = useUser()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(300)
  const [isRunning, setIsRunning] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, user, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting state for authenticated users
  if (isLoaded && isSignedIn && user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">DT</span>
            </div>
            <span className="font-semibold text-lg">Decision Timeout</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-gray-600 hover:text-black">How it works</a>
            <a href="#pricing" className="text-gray-600 hover:text-black">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-black">FAQ</a>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Dashboard
                </Link>
                <SignOutButton redirectUrl="/">
                  <button className="text-gray-600 hover:text-black text-sm">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <>
                <Link href="/sign-in" className="text-gray-600 hover:text-black">Log in</Link>
                <Link href="/sign-up" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Try free
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded-md"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-3">
              <a 
                href="#how" 
                className="block py-2 text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a 
                href="#pricing" 
                className="block py-2 text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                className="block py-2 text-gray-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              {user ? (
                <div className="space-y-2">
                  <Link 
                    href="/dashboard" 
                    className="block py-3 px-4 bg-black text-white rounded-md text-center hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <SignOutButton redirectUrl="/">
                    <button className="block w-full py-2 text-gray-600 hover:text-black text-center transition-colors">
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/sign-in" 
                    className="block py-2 text-gray-600 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/sign-up" 
                    className="block py-3 px-4 bg-black text-white rounded-md text-center hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Try free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Make decisions<br/>
            <span className="text-gray-500">without the paralysis</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop overthinking. Set a timer, evaluate options, and commit. A simple tool for decisive action.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link href={user ? "/new-decision" : "/sign-up"} className="px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Start deciding now →
            </Link>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Try demo
            </button>
          </div>
          
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>✓ Free to start</span>
            <span>✓ No signup required for demo</span>
            <span>✓ 2-minute setup</span>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900 text-white rounded-xl p-8">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium">Should I accept this job offer?</h3>
                <span className="text-sm text-gray-400">High stakes</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</div>
              </div>
            </div>
            
            <div className="h-2 bg-gray-700 rounded-full mb-8">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all"
                style={{ width: `${((300 - timeLeft) / 300) * 100}%` }}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-green-400 font-medium mb-3">Pros</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• 30% salary increase</li>
                  <li>• Remote work flexibility</li>
                  <li>• Better growth opportunities</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-red-400 font-medium mb-3">Cons</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Longer commute</li>
                  <li>• Unknown team culture</li>
                  <li>• Less PTO initially</li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium">
                Accept Offer
              </button>
              <button className="py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium">
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Three simple steps</h2>
          <p className="text-center text-gray-600 mb-12">From paralysis to decision in minutes</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h3 className="font-semibold mb-2">Frame your decision</h3>
              <p className="text-sm text-gray-600">Define what you're deciding, list your options, and identify pros and cons for each choice.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h3 className="font-semibold mb-2">Set your timer</h3>
              <p className="text-sm text-gray-600">Choose how much time you need. The countdown creates urgency and prevents endless deliberation.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h3 className="font-semibold mb-2">Commit and move on</h3>
              <p className="text-sm text-gray-600">When time's up, make your choice. Save it to review later and learn from your decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-600 mb-12">Start free, upgrade when you need more</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-6">$0</div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li>✓ 5 decisions per month</li>
                <li>✓ Basic timer features</li>
                <li>✓ Decision history (7 days)</li>
                <li>✓ No credit card required</li>
              </ul>
              <Link href={user ? "/dashboard" : "/sign-up"} className="block text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                {user ? "Go to Dashboard" : "Start free"}
              </Link>
            </div>
            
            <div className="border-2 border-black rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                Most popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-6">$9<span className="text-lg font-normal text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li>✓ Unlimited decisions</li>
                <li>✓ Full decision history</li>
                <li>✓ Analytics & insights</li>
                <li>✓ Export your data</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href={user ? "/pricing" : "/sign-up"} className="block text-center py-3 bg-black text-white rounded-lg hover:bg-gray-800">
                {user ? "Upgrade to Pro" : "Start 14-day free trial"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6">
              <summary className="font-medium cursor-pointer">How does the decision timer work?</summary>
              <p className="mt-4 text-gray-600">
                Set a timer between 2-30 minutes. The countdown creates healthy pressure that helps you focus on what matters and prevents endless overthinking. When time's up, you commit to your choice.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-medium cursor-pointer">Is there really a free plan?</summary>
              <p className="mt-4 text-gray-600">
                Yes! The free plan includes 5 decisions per month with basic timer features. No credit card required. Perfect for trying the tool or occasional decision-making.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-medium cursor-pointer">Can I export my decision history?</summary>
              <p className="mt-4 text-gray-600">
                Pro users can export their complete decision history as CSV or JSON files. This includes all decisions, pros/cons, timestamps, and outcomes for your personal analysis.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-medium cursor-pointer">What if I need more time?</summary>
              <p className="mt-4 text-gray-600">
                You can pause the timer once per decision for up to 5 minutes. This gives you flexibility while maintaining the core principle of time-boxed decision-making.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-medium cursor-pointer">Can I change my plan anytime?</summary>
              <p className="mt-4 text-gray-600">
                Absolutely. Upgrade, downgrade, or cancel anytime. No long-term contracts or hidden fees. Changes take effect at your next billing cycle.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Stop overthinking. Start deciding.</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands who've broken free from analysis paralysis</p>
          <div className="flex justify-center gap-4">
            <Link href={user ? "/new-decision" : "/sign-up"} className="px-6 py-3 bg-white text-black rounded-md hover:bg-gray-100">
              Start free trial →
            </Link>
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 border border-gray-700 rounded-md hover:border-gray-600"
            >
              Try demo first
            </button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">DT</span>
            </div>
            <span className="text-sm text-gray-600">© 2024 Decision Timeout</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}