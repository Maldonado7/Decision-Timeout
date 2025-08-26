import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MockDecisionCreator from '@/components/demo/MockDecisionCreator'

export default async function DemoPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                Decision Timeout - Demo Mode
              </h1>
            </Link>
            
            <div className="flex gap-6 items-center">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 font-medium transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-yellow-100 rounded-lg border border-yellow-300">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="text-sm text-yellow-800 font-medium">
                  🚧 Demo Mode Active
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
        <MockDecisionCreator />
      </main>
      
      <div className="fixed bottom-6 right-6 max-w-sm">
        <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🛠️</div>
            <div>
              <div className="font-semibold text-gray-800 mb-1">Demo Mode</div>
              <div className="text-sm text-gray-600 mb-3">
                Test all psychological features without database. Run setup_database.sql to enable full features.
              </div>
              <Link 
                href="/dashboard"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Main App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}