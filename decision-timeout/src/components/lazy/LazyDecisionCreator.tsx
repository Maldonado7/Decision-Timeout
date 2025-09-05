'use client'

import dynamic from 'next/dynamic'

// Lazy load the DecisionCreator component with loading state
const DecisionCreatorComponent = dynamic(
  () => import('@/components/decision/DecisionCreator'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          
          {/* Form skeleton */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function LazyDecisionCreator() {
  return <DecisionCreatorComponent />
}