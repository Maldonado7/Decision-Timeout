import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const user = await currentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-900">Decision Timeout</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/sign-in"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/sign-up"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Make decisions
              <span className="block text-slate-500">without the paralysis</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Stop overthinking. Set a timer, evaluate options, and commit. 
              A simple tool for decisive action.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Start deciding now →
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Try demo
              </Link>
            </div>

            <div className="flex justify-center items-center gap-8 text-sm text-slate-500">
              <span>✓ Free to start</span>
              <span>✓ No signup required for demo</span>
              <span>✓ 2-minute setup</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Should I accept this job offer?</h3>
                  <span className="text-sm bg-slate-800 px-3 py-1 rounded-full">High stakes</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">5:00</div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Pros</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span>
                        <span className="text-slate-600">30% salary increase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span>
                        <span className="text-slate-600">Remote work flexibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span>
                        <span className="text-slate-600">Better growth opportunities</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">Cons</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">-</span>
                        <span className="text-slate-600">Longer commute</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">-</span>
                        <span className="text-slate-600">Unknown team culture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">-</span>
                        <span className="text-slate-600">Less PTO initially</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Accept Offer
                  </button>
                  <button className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Decline Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Three simple steps
            </h2>
            <p className="text-xl text-slate-600">
              From paralysis to decision in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-slate-900">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Frame your decision</h3>
              <p className="text-slate-600">
                Define what you&apos;re deciding, list your options, and identify pros and cons for each choice.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-slate-900">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Set your timer</h3>
              <p className="text-slate-600">
                Choose how much time you need. The countdown creates urgency and prevents endless deliberation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-slate-900">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Commit and move on</h3>
              <p className="text-slate-600">
                When time&apos;s up, make your choice. Save it to review later and learn from your decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">5 decisions per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Basic timer features</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Decision history (7 days)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">No credit card required</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block w-full text-center py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                Start free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                Most popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Unlimited decisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Full decision history</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Analytics & insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Export your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Priority support</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block w-full text-center py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                Start 14-day free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">How does the decision timer work?</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pt-4 pb-2 text-slate-600">
                Set a timer for your decision (typically 2-10 minutes), list your options with pros and cons, 
                and when the timer ends, you commit to a choice. The time pressure helps you trust your instincts 
                and avoid endless deliberation.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Is there really a free plan?</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pt-4 pb-2 text-slate-600">
                Yes! The free plan includes 5 decisions per month and basic features. No credit card required. 
                You can also try the demo without even signing up.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Can I export my decision history?</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pt-4 pb-2 text-slate-600">
                Pro and Team plans include full export capabilities. You can download your decision history 
                as CSV or JSON to analyze patterns and improve your decision-making over time.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">What if I need more time?</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pt-4 pb-2 text-slate-600">
                You can pause the timer once during a decision session if you need to gather more information. 
                However, the goal is to work with the time constraint to overcome analysis paralysis.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Can I change my plan anytime?</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pt-4 pb-2 text-slate-600">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes take effect 
                at the start of your next billing cycle.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stop overthinking. Start deciding.
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands who&apos;ve broken free from analysis paralysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Start free trial →
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Try demo first
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#how-it-works" className="text-slate-600 hover:text-slate-900">How it works</Link></li>
                <li><Link href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link></li>
                <li><Link href="/demo" className="text-slate-600 hover:text-slate-900">Demo</Link></li>
                <li><Link href="#faq" className="text-slate-600 hover:text-slate-900">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-slate-600 hover:text-slate-900">About</Link></li>
                <li><Link href="/blog" className="text-slate-600 hover:text-slate-900">Blog</Link></li>
                <li><Link href="/careers" className="text-slate-600 hover:text-slate-900">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-600 hover:text-slate-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-slate-600 hover:text-slate-900">Documentation</Link></li>
                <li><Link href="/guides" className="text-slate-600 hover:text-slate-900">Guides</Link></li>
                <li><Link href="/help" className="text-slate-600 hover:text-slate-900">Help Center</Link></li>
                <li><Link href="/api" className="text-slate-600 hover:text-slate-900">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-slate-600 hover:text-slate-900">Privacy</Link></li>
                <li><Link href="/terms" className="text-slate-600 hover:text-slate-900">Terms</Link></li>
                <li><Link href="/security" className="text-slate-600 hover:text-slate-900">Security</Link></li>
                <li><Link href="/cookies" className="text-slate-600 hover:text-slate-900">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900">Decision Timeout</span>
            </div>
            <p className="text-slate-600 text-sm">
              © 2024 Decision Timeout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}