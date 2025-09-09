export interface DecisionForm {
  question: string
  timerMinutes: number
}

export type DecisionStep = 'setup' | 'timer' | 'result'

export type DecisionResult = 'YES' | 'NO' | null

export interface DecisionData {
  id?: string
  user_id: string
  question: string
  pros: string[]
  cons: string[]
  result: 'YES' | 'NO'
  locked_until: string
  time_saved: number
  created_at?: string
  updated_at?: string
}

export interface DecisionCreatorState {
  currentStep: DecisionStep
  pros: string[]
  cons: string[]
  currentPro: string
  currentCon: string
  starredPro: number | null
  starredCon: number | null
  isTimerActive: boolean
  timeRemaining: number
  decisionResult: DecisionResult
  validationError: string
  isLoading: boolean
}

export interface DecisionFormProps {
  onSubmit: (data: DecisionForm) => void
  pros: string[]
  cons: string[]
  currentPro: string
  currentCon: string
  starredPro: number | null
  starredCon: number | null
  validationError: string
  isLoading: boolean
  onProChange: (value: string) => void
  onConChange: (value: string) => void
  onAddPro: () => void
  onAddCon: () => void
  onRemovePro: (index: number) => void
  onRemoveCon: (index: number) => void
  onStarPro: (index: number | null) => void
  onStarCon: (index: number | null) => void
  isTimerActive: boolean
}

export interface DecisionTimerProps {
  timeRemaining: number
  pros: string[]
  cons: string[]
  onCancel: () => void
  formatTime: (seconds: number) => string
}

export interface ProsConsListProps {
  pros: string[]
  cons: string[]
  currentPro: string
  currentCon: string
  starredPro: number | null
  starredCon: number | null
  onProChange: (value: string) => void
  onConChange: (value: string) => void
  onAddPro: () => void
  onAddCon: () => void
  onRemovePro: (index: number) => void
  onRemoveCon: (index: number) => void
  onStarPro: (index: number | null) => void
  onStarCon: (index: number | null) => void
  isTimerActive: boolean
}

export interface DecisionResultProps {
  result: 'YES' | 'NO'
  decisionLogic: string
  onReset: () => void
  onViewHistory: () => void
}

export interface DecisionActionsProps {
  isLoading: boolean
  onSubmit: () => void
  canSubmit: boolean
}

export interface ProgressIndicatorProps {
  currentStep: DecisionStep
}

export interface ProConsItemProps {
  item: string
  index: number
  isStarred: boolean
  onStar: (index: number | null) => void
  onRemove: (index: number) => void
  type: 'pro' | 'con'
  canEdit: boolean
}

export interface TimerSettingsProps {
  register: unknown
  errors: unknown
}

export interface ValidationErrorProps {
  error: string
}

export interface SocialProofProps {
  count: number
}

export interface TestimonialProps {
  quote: string
  author: string
}

export interface HelpTextProps {
  shortcuts: string[]
}