import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DecisionHistory from '@/components/history/DecisionHistory'

export default async function HistoryPage() {
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
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              New Decision
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
        <DecisionHistory userId={user.id} />
      </main>
    </div>
  )
}