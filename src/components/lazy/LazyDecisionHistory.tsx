'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Lazy load the DecisionHistory component
const DecisionHistoryComponent = dynamic(
  () => import('@/components/history/DecisionHistory'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

type DecisionHistoryProps = ComponentProps<typeof DecisionHistoryComponent>

export default function LazyDecisionHistory(props: DecisionHistoryProps) {
  return <DecisionHistoryComponent {...props} />
}