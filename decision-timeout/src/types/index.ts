// Re-export types from various modules
export type { Decision } from '@/lib/supabase'

// Application-specific types
export interface UserStats {
  totalDecisions: number
  yesDecisions: number
  noDecisions: number
  goodOutcomes: number
  badOutcomes: number
  pendingOutcomes: number
  totalTimeSaved: number
}

export interface DecisionFormData {
  question: string
  pros: string[]
  cons: string[]
}

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  isCompleted: boolean
}