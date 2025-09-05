import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/ui/Navigation'
import DecisionHistory from '@/components/history/DecisionHistory'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentPage="history" />

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