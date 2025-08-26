'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, Decision } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastContainer, ToastMessage } from '@/components/Toast'

interface DecisionForm {
  question: string
  timerMinutes: number
}

interface DecisionCreatorProps {
  userId: string
  onDecisionComplete: (decision: Decision) => void
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

interface TimerState {
  isActive: boolean
  timeRemaining: number
  question: string
  pros: string[]
  cons: string[]
  timerMinutes: number
  startTime: number
}

export default function DecisionCreator({ userId, onDecisionComplete }: DecisionCreatorProps) {
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [currentPro, setCurrentPro] = useState('')
  const [currentCon, setCurrentCon] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [decisionResult, setDecisionResult] = useState<'YES' | 'NO' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showConfidenceRating, setShowConfidenceRating] = useState(false)
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm<DecisionForm>({
    defaultValues: {
      timerMinutes: 10
    }
  })

  const watchedTimerMinutes = watch('timerMinutes')
  const watchedQuestion = watch('question')

  // Load persisted timer state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem(`decision-timer-${userId}`)
    if (savedState) {
      try {
        const timerState: TimerState = JSON.parse(savedState)
        const now = Date.now()
        const elapsed = Math.floor((now - timerState.startTime) / 1000)
        const remaining = Math.max(0, timerState.timeRemaining - elapsed)
        
        if (remaining > 0 && timerState.isActive) {
          // Restore state
          setValue('question', timerState.question)
          setValue('timerMinutes', timerState.timerMinutes)
          setPros(timerState.pros)
          setCons(timerState.cons)
          setTimeRemaining(remaining)
          setIsTimerActive(true)
        } else if (timerState.isActive) {
          // Timer expired while away, will handle this later
          setPros(timerState.pros)
          setCons(timerState.cons)
          setValue('question', timerState.question)
          setValue('timerMinutes', timerState.timerMinutes)
          // Note: Auto-decision will be triggered after component loads
          localStorage.removeItem(`decision-timer-${userId}`)
        }
      } catch (error) {
        console.error('Error loading timer state:', error)
        localStorage.removeItem(`decision-timer-${userId}`)
      }
    }
  }, [userId, setValue])

  // Save timer state to localStorage
  const saveTimerState = useCallback(() => {
    if (isTimerActive) {
      const timerState: TimerState = {
        isActive: isTimerActive,
        timeRemaining,
        question: getValues('question'),
        pros,
        cons,
        timerMinutes: getValues('timerMinutes'),
        startTime: Date.now() - (getValues('timerMinutes') * 60 - timeRemaining) * 1000
      }
      localStorage.setItem(`decision-timer-${userId}`, JSON.stringify(timerState))
    } else {
      localStorage.removeItem(`decision-timer-${userId}`)
    }
  }, [isTimerActive, timeRemaining, pros, cons, getValues, userId])

  // Save state whenever relevant data changes
  useEffect(() => {
    saveTimerState()
  }, [saveTimerState])

  const currentProsRef = useRef(pros)
  const currentConsRef = useRef(cons)
  
  // Update refs when pros/cons change
  useEffect(() => {
    currentProsRef.current = pros
  }, [pros])
  
  useEffect(() => {
    currentConsRef.current = cons
  }, [cons])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            makeAutoDecision()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timeRemaining])

  const addPro = () => {
    if (currentPro.trim() && pros.length < 5) {
      setPros([...pros, currentPro.trim()])
      setCurrentPro('')
    }
  }

  const addCon = () => {
    if (currentCon.trim() && cons.length < 5) {
      setCons([...cons, currentCon.trim()])
      setCurrentCon('')
    }
  }

  const removePro = (index: number) => {
    if (!isTimerActive) {
      setPros(pros.filter((_, i) => i !== index))
    }
  }

  const removeCon = (index: number) => {
    if (!isTimerActive) {
      setCons(cons.filter((_, i) => i !== index))
    }
  }

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const newToast = { ...toast, id: generateId() }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const saveDecision = async (result: 'YES' | 'NO') => {
    const { question, timerMinutes } = getValues()
    const lockedUntil = new Date()
    lockedUntil.setDate(lockedUntil.getDate() + 30)

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          user_id: userId,
          question,
          pros: currentProsRef.current,
          cons: currentConsRef.current,
          result,
          locked_until: lockedUntil.toISOString(),
          time_saved: timerMinutes
          // TODO: Add confidence_level: confidenceLevel after running the migration
        })
        .select()
        .single()

      if (error) throw error
      
      // Decision-specific success messages
      const successMessages = {
        YES: {
          title: '✅ Decision Made: YES!',
          description: `Great choice! You've decided to go forward. This decision is locked for 30 days - trust your judgment and move ahead with confidence! 🚀`
        },
        NO: {
          title: '❌ Decision Made: NO!',
          description: `Sometimes saying no is the right choice. You've avoided a path that didn't feel right. This decision is locked for 30 days - trust your instincts! 🛡️`
        }
      }

      addToast({
        type: 'success',
        ...successMessages[result],
        duration: 6000
      })
      
      onDecisionComplete(data as Decision)
    } catch (error) {
      console.error('Error saving decision:', error)
      
      // Better error message extraction for Supabase
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      if (error && typeof error === 'object') {
        // Handle Supabase-specific error structure
        if ('message' in error && error.message) {
          errorMessage = error.message
        } else if ('error' in error && typeof error.error === 'object') {
          // Nested error object
          errorMessage = error.error.message || error.error.details || 'Database connection issue'
        } else if ('details' in error && error.details) {
          errorMessage = error.details
        } else if ('hint' in error && error.hint) {
          errorMessage = error.hint
        } else if ('code' in error && error.code) {
          // PostgreSQL error codes
          errorMessage = `Database error (${error.code}): ${error.message || 'Please check your connection'}`
        } else {
          // Last resort - but make it user-friendly
          const errorStr = JSON.stringify(error)
          errorMessage = errorStr === '{}' ? 'Connection issue - please try again' : `Error: ${errorStr}`
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      addToast({
        type: 'error',
        title: '💥 Failed to Save Decision',
        description: `Oops! We couldn't save your decision: ${errorMessage}`,
        duration: 8000
      })
      
      // Reset UI state so user can try again
      setDecisionResult(null)
      setShowResult(false)
      setIsTimerActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const makeAutoDecision = () => {
    const currentPros = currentProsRef.current
    const currentCons = currentConsRef.current
    let result: 'YES' | 'NO'
    
    if (currentPros.length > currentCons.length) {
      result = 'YES'
    } else if (currentCons.length > currentPros.length) {
      result = 'NO'
    } else {
      // Coin flip for tie
      result = Math.random() < 0.5 ? 'YES' : 'NO'
    }
    
    setDecisionResult(result)
    setShowConfidenceRating(true)
    setIsTimerActive(false)
    localStorage.removeItem(`decision-timer-${userId}`) // Clear saved state
  }

  const startTimer = (data: DecisionForm) => {
    if (pros.length === 0 && cons.length === 0) {
      addToast({
        type: 'warning',
        title: 'Add Pros or Cons',
        description: 'Add at least one pro or con before starting the timer!'
      })
      return
    }
    
    if (!data.question.trim()) {
      addToast({
        type: 'warning',
        title: 'Question Required',
        description: 'Please enter a question before starting the timer.'
      })
      return
    }
    
    setTimeRemaining(data.timerMinutes * 60)
    setIsTimerActive(true)
    
    addToast({
      type: 'info',
      title: 'Timer Started!',
      description: `You have ${data.timerMinutes} minutes to decide.`,
      duration: 3000
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleConfidenceSubmit = (confidence: number) => {
    setConfidenceLevel(confidence)
    setShowConfidenceRating(false)
    setShowResult(true)
    if (decisionResult) {
      saveDecision(decisionResult)
    }
  }

  // Confidence Rating Screen - Compact Version
  if (showConfidenceRating && decisionResult) {
    console.log('Showing confidence screen for decision:', decisionResult)
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center py-4"
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-xl border border-white/20">
          {/* Compact Header */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{decisionResult === 'YES' ? '🚀' : '🛡️'}</span>
              <span className="text-lg font-bold text-gray-800">
                Your Choice: <span className={`px-2 py-1 rounded-lg text-white ${decisionResult === 'YES' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {decisionResult}
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-600">Rate your confidence (1-10)</p>
          </div>

          {/* Simplified Confidence Scale */}
          <div className="mb-3">
            <div className="grid grid-cols-5 gap-2">
              {[
                { range: [1, 2], label: '1-2', color: 'bg-red-500', desc: 'Very Low' },
                { range: [3, 4], label: '3-4', color: 'bg-orange-400', desc: 'Low' },
                { range: [5, 6], label: '5-6', color: 'bg-yellow-400', desc: 'Medium' },
                { range: [7, 8], label: '7-8', color: 'bg-green-400', desc: 'High' },
                { range: [9, 10], label: '9-10', color: 'bg-green-600', desc: 'Very High' }
              ].map((group, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleConfidenceSubmit(group.range[1])} // Use the higher value
                  className={`${group.color} hover:opacity-80 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div>{group.label}</div>
                  <div className="text-xs opacity-90">{group.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            💡 Quick confidence rating
          </div>
        </div>
      </motion.div>
    )
  }

  if (showResult) {
    // Decision-specific psychological reinforcement messages
    const decisionMessages = {
      YES: {
        title: "You Said YES! ✅",
        subtitle: "Move Forward with Confidence",
        message: "Great choice! You've decided to take action. Research shows that people who commit to forward-moving decisions experience higher satisfaction and growth.",
        affirmation: "Trust your decision. You've considered the options and chosen progress.",
        emoji: "🚀",
        gradient: "from-green-400 to-emerald-500"
      },
      NO: {
        title: "You Said NO! ❌", 
        subtitle: "Protect Your Energy",
        message: "Smart boundary! Saying no is a powerful decision that protects your time and energy for what truly matters. This takes courage and wisdom.",
        affirmation: "Your 'no' is valuable. You've prioritized what aligns with your goals.", 
        emoji: "🛡️",
        gradient: "from-red-400 to-rose-500"
      }
    }
    
    const currentMessage = decisionMessages[decisionResult!]
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl mx-auto text-center py-8"
      >
        <motion.div
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          className="mb-6"
        >
          <div className={`text-6xl mb-4`}>
            {currentMessage.emoji}
          </div>
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentMessage.gradient} bg-clip-text text-transparent mb-2`}>
            {currentMessage.title}
          </h1>
          <h2 className="text-xl text-gray-600 font-medium">
            {currentMessage.subtitle}
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 mb-6"
        >
          <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            {currentMessage.message}
          </p>
          <div className={`p-4 rounded-xl bg-gradient-to-r ${currentMessage.gradient} bg-opacity-10 border border-current border-opacity-20`}>
            <p className="font-semibold text-gray-800">
              💭 {currentMessage.affirmation}
            </p>
          </div>
        </motion.div>

        {confidenceLevel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-indigo-600 font-medium">Confidence Level:</span>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < confidenceLevel! ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-indigo-700 font-bold">{confidenceLevel}/10</span>
            </div>
            <p className="text-xs text-indigo-600 text-center mt-2">
              {confidenceLevel <= 3 ? "Low confidence - consider reviewing this decision in the future" 
               : confidenceLevel <= 7 ? "Moderate confidence - you've made a reasoned choice"
               : "High confidence - you feel very sure about this decision"}
            </p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3"
        >
          🔒 This decision is locked for 30 days to help you commit fully and avoid second-guessing
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <motion.div 
        className="max-w-4xl mx-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(((pros.length + cons.length) / 10 + (watchedQuestion?.length > 0 ? 1 : 0)) / 2 * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(((pros.length + cons.length) / 10 + (watchedQuestion?.length > 0 ? 1 : 0)) / 2 * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(startTimer)} className="space-y-10">
          {/* Question Input */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <label className="text-xl font-bold text-gray-800">
                What decision do you need to make?
              </label>
            </div>
            <div className="relative">
              <input
                {...register('question', { required: 'Question is required' })}
                disabled={isTimerActive}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl bg-white/90"
                placeholder="e.g., Should I accept this job offer?"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl">🤔</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              💡 Tip: Be specific and clear about your decision
            </div>
            <AnimatePresence>
              {errors.question && (
                <motion.p 
                  className="text-red-500 mt-2 text-sm font-medium"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.question.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

        {/* Timer Display */}
        {isTimerActive && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-600">Time remaining to decide</p>
          </motion.div>
        )}

          {/* Pros/Cons Grid */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Pros Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <h3 className="text-xl font-bold text-green-700">
                  Pros ({pros.length}/5)
                </h3>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    value={currentPro}
                    onChange={(e) => setCurrentPro(e.target.value)}
                    disabled={isTimerActive || pros.length >= 5}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-3 focus:ring-green-100 focus:border-green-400 outline-none disabled:bg-gray-100 text-gray-800 placeholder-green-400 bg-white/80 transition-all duration-200"
                    placeholder="What's a positive aspect?"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addPro()
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                    <span className="text-lg">➕</span>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={addPro}
                  disabled={isTimerActive || !currentPro.trim() || pros.length >= 5}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add
                </motion.button>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {pros.length === 0 ? (
                    <motion.div 
                      className="text-center py-8 text-green-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-4xl mb-2">🌟</div>
                      <p className="text-sm">Start adding the positive aspects</p>
                    </motion.div>
                  ) : (
                    pros.map((pro, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="group flex items-center gap-3 p-4 bg-white/60 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-gray-800 font-medium">{pro}</span>
                        {!isTimerActive && (
                          <motion.button
                            type="button"
                            onClick={() => removePro(index)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <span className="text-sm">✕</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cons Section */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <h3 className="text-xl font-bold text-red-700">
                  Cons ({cons.length}/5)
                </h3>
                <div className="text-2xl">❌</div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    value={currentCon}
                    onChange={(e) => setCurrentCon(e.target.value)}
                    disabled={isTimerActive || cons.length >= 5}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-3 focus:ring-red-100 focus:border-red-400 outline-none disabled:bg-gray-100 text-gray-800 placeholder-red-400 bg-white/80 transition-all duration-200"
                    placeholder="What's a negative aspect?"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCon()
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                    <span className="text-lg">➖</span>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={addCon}
                  disabled={isTimerActive || !currentCon.trim() || cons.length >= 5}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add
                </motion.button>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {cons.length === 0 ? (
                    <motion.div 
                      className="text-center py-8 text-red-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-4xl mb-2">⚠️</div>
                      <p className="text-sm">Start adding the negative aspects</p>
                    </motion.div>
                  ) : (
                    cons.map((con, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="group flex items-center gap-3 p-4 bg-white/60 border border-red-200 rounded-xl hover:shadow-md transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-gray-800 font-medium">{con}</span>
                        {!isTimerActive && (
                          <motion.button
                            type="button"
                            onClick={() => removeCon(index)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <span className="text-sm">✕</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        {/* Timer Selection */}
        <AnimatePresence>
          {!isTimerActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <label className="text-xl font-bold text-indigo-700">
                  Choose Your Decision Time
                </label>
                <div className="text-2xl">⏱️</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { value: 5, label: 'Quick', desc: 'For simple decisions', icon: '⚡', color: 'from-yellow-400 to-orange-400' },
                  { value: 10, label: 'Balanced', desc: 'Most popular choice', icon: '⚖️', color: 'from-blue-400 to-indigo-400', recommended: true },
                  { value: 15, label: 'Deep', desc: 'For complex decisions', icon: '🧠', color: 'from-purple-400 to-pink-400' }
                ].map((option) => (
                  <motion.label
                    key={option.value}
                    className={`relative cursor-pointer group ${
                      watchedTimerMinutes === option.value
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('timerMinutes', { valueAsNumber: true })}
                      className="sr-only"
                    />
                    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-200 group-hover:shadow-lg ${
                      watchedTimerMinutes === option.value
                        ? 'border-indigo-400 bg-indigo-50/80'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}>
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                          {option.icon}
                        </div>
                        <div className="font-bold text-gray-800 mb-1">
                          {option.value} min
                        </div>
                        <div className="text-sm font-medium text-indigo-600 mb-1">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.desc}
                        </div>
                        {option.recommended && (
                          <motion.div 
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", delay: 0.5 }}
                          >
                            ⭐ Popular
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.label>
                ))}
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-sm text-indigo-700 border border-indigo-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">💡</span>
                  <span className="font-medium">Smart Suggestion:</span>
                </div>
                <p className="text-indigo-600">
                  {(() => {
                    const totalItems = pros.length + cons.length
                    if (totalItems <= 3) return "5-10 minutes should be enough for this decision"
                    if (totalItems <= 6) return "10 minutes is perfect for weighing these options"
                    return "15 minutes recommended for thorough consideration"
                  })()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {!isTimerActive ? (
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!watchedQuestion?.trim() || (pros.length === 0 && cons.length === 0)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl">🚀</span>
              <span>Start Decision Timer</span>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <span className="text-2xl">⏰</span>
              </motion.div>
            </div>
          </motion.button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-gray-600">Timer is running. You can make a decision now or wait for auto-decision.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log('Manual YES decision clicked')
                  setDecisionResult('YES')
                  setShowConfidenceRating(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Decide YES Now
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Manual NO decision clicked')
                  setDecisionResult('NO')
                  setShowConfidenceRating(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Decide NO Now
              </button>
            </div>
          </div>
        )}
        </form>
        </div>
      </motion.div>
      
      {isLoading && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div 
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="text-center">
              <motion.p 
                className="text-xl font-semibold text-gray-800 mb-1"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Saving Decision
              </motion.p>
              <p className="text-sm text-gray-600">
                Locking your choice for 30 days...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}