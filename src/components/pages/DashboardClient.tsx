'use client'

import { useRouter } from 'next/navigation'
import PullToRefresh from '@/components/ui/PullToRefresh'
import DecisionCreator from '@/components/decision/DecisionCreator'

export default function DashboardClient() {
  const router = useRouter()

  const handleRefresh = async () => {
    // Refresh the page data
    router.refresh()
    
    // Add a small delay to show the refresh animation
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Make a Decision. Fast.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Combat analysis paralysis with forced decision-making. Set a timer, weigh your options, and let the system decide when time runs out.
            </p>
          </div>

          <DecisionCreator />
        </div>
      </main>
    </PullToRefresh>
  )
}