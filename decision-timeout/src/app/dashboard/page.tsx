import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Decision Timeout</h1>
            <Link href="/history" className="text-slate-600 hover:text-slate-900">History</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome back, {user.firstName || 'Decision Maker'}! 👋
          </h1>
          <p className="text-xl text-slate-600">
            Ready to tackle another decision?
          </p>
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
