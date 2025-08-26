import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const user = await currentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Decision</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Timeout</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
                  Stop overthinking. Make decisions fast. Combat analysis paralysis with forced time limits that auto-decide when you can&apos;t.
                </p>
                <div className="mt-5 sm:mt-8">
                  <div className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto lg:mx-0">
                    <Link
                      href="/sign-in"
                      className="w-full flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 md:py-5 md:text-xl md:px-12 transition-all duration-300 transform hover:scale-105"
                    >
                      🚀 Get Started
                    </Link>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 text-center lg:text-left">
                    New user? You&apos;ll be able to sign up on the next page
                  </p>
                </div>
                <p className="mt-6 text-sm text-gray-500 text-center lg:text-left max-w-md flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    🆓 <span>Free to use</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    💳 <span>No credit card required</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    ⚡ <span>Start in seconds</span>
                  </span>
                </p>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center relative overflow-hidden">
            <div className="text-white text-center p-8 relative z-10">
              <div className="text-7xl font-bold mb-6">⏰</div>
              <div className="text-3xl font-bold mb-2">5:00</div>
              <div className="text-xl opacity-90">Time to decide</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Three simple steps to overcome analysis paralysis
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Create Decision</h3>
                <p className="mt-2 text-gray-500">
                  Enter your question, add pros and cons (max 5 each), set a timer (5-15 minutes)
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-green-500 text-white mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Timer Countdown</h3>
                <p className="mt-2 text-gray-500">
                  Watch the timer count down. When it hits zero, the decision is made automatically
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-purple-500 text-white mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Locked Result</h3>
                <p className="mt-2 text-gray-500">
                  Decision is locked for 30 days. Track your success rate and time saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Stop Wasting Time on Decisions
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">47h</div>
                <div className="text-lg text-gray-600">Average time saved per month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">85%</div>
                <div className="text-lg text-gray-600">Decisions rated as good</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">30</div>
                <div className="text-lg text-gray-600">Days decision lock period</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}