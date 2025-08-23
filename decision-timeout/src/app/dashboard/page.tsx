import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DecisionCreator from '@/components/decision/DecisionCreator'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Decision Timeout</h1>
          <div className="flex gap-4">
            <a
              href="/history"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              History
            </a>
            <form action="/auth/signout" method="post">
              <button className="text-gray-600 hover:text-gray-800">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Make a Decision. Fast.
            </h2>
            <p className="text-xl text-gray-600">
              Combat analysis paralysis with forced decision-making
            </p>
          </div>

          <DecisionCreator 
            userId={user.id}
            onDecisionComplete={() => window.location.reload()}
          />
        </div>
      </main>
    </div>
  )
}