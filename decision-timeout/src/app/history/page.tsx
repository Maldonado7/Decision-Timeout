import { currentUser } from '@clerk/nextjs/server'
import { isClerkEnabled } from '@/lib/clerk'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DecisionHistory from '@/components/history/DecisionHistory'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
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
                href="/dashboard"
                className="group flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 font-medium transition-all duration-200 hover:shadow-md text-sm md:text-base"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Decision</span>
                <span className="sm:hidden">New</span>
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
      </nav>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Decision History
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Track your decision-making progress and see how forced timeouts have helped you overcome analysis paralysis.
            </p>
          </div>
          
          <DecisionHistory />
        </div>
      </main>
    </div>
  )
}