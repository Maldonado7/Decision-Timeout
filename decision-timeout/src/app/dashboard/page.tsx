import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/ui/Navigation'
import DashboardClient from '@/components/pages/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentPage="dashboard" />
      <DashboardClient />
    </div>
  )
}