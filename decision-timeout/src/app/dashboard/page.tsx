import { currentUser } from '@clerk/nextjs/server'
import { isClerkEnabled } from '@/lib/clerk'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  if (!isClerkEnabled()) {
    redirect('/')
  }

  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="group">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                Decision Timeout
              </h1>
            </Link>
            
            <div className="flex gap-2 md:gap-6 items-center">
              <Link
                href="/history"
                className="group flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-medium transition-all duration-200 hover:shadow-md text-sm md:text-base"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">History</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}</span>
                </div>
              </div>
              
              <div className="relative">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full ring-2 ring-white shadow-lg hover:ring-4 transition-all duration-200",
                      userButtonPopoverCard: "shadow-2xl border-0 rounded-xl",
                      userButtonPopoverActions: "space-y-1"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Ready to make decisions
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Make a Decision. Fast.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Combat analysis paralysis with forced decision-making. Set a timer, weigh the pros and cons, then let the clock decide.
            </p>
          </div>

          <DashboardClient userId={user.id} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
            Start Making Better Decisions
          </h2>
          
          <Link
            href="/new-decision"
            className="block w-full bg-indigo-600 text-white text-center py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
          >
            Start New Decision Process
          </Link>
        </div>
      </div>
    </div>
  )
}
