import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await currentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-8 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="block">Decision</span>
                  <span className="block text-blue-600">Timeout</span>
                </h1>
                <p className="mt-4 text-lg text-gray-500 sm:mt-5 sm:text-xl sm:max-w-xl sm:mx-auto md:mt-5 lg:mx-0 lg:text-xl leading-relaxed">
                  Stop overthinking. Make decisions fast. Combat analysis paralysis with forced time limits that auto-decide when you can&apos;t.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/sign-in"
                      className="w-full flex items-center justify-center px-8 py-4 min-h-[48px] border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors touch-manipulation md:py-4 md:text-lg md:px-10"
                    >
                      Start Making Decisions
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-blue-600 sm:h-64 md:h-80 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center p-6 sm:p-8">
              <div className="text-5xl sm:text-6xl font-bold mb-3 sm:mb-4">⏰</div>
              <div className="text-xl sm:text-2xl font-semibold">5:00</div>
              <div className="text-base sm:text-lg opacity-75">Time to decide</div>
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
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
