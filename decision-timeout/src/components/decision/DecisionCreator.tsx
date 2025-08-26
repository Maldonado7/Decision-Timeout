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
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm<DecisionForm>({
    defaultValues: {
      timerMinutes: 10
    }
  })

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
        })
        .select()
        .single()

      if (error) throw error
      
      addToast({
        type: 'success',
        title: 'Decision Saved!',
        description: `Your decision "${result}" has been locked for 30 days.`
      })
      
      onDecisionComplete(data as Decision)
    } catch (error) {
      console.error('Error saving decision:', error)
      addToast({
        type: 'error',
        title: 'Failed to Save Decision',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        duration: 7000
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
    setShowResult(true)
    setIsTimerActive(false)
    localStorage.removeItem(`decision-timer-${userId}`) // Clear saved state
    saveDecision(result)
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

  if (showResult) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className={`text-6xl font-bold mb-4 ${
            decisionResult === 'YES' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          DECISION MADE
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-8xl font-black ${
            decisionResult === 'YES' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {decisionResult}
        </motion.div>
        <p className="text-gray-600 mt-6 text-lg">
          This decision is locked for 30 days
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <motion.div 
        className="max-w-2xl mx-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <form onSubmit={handleSubmit(startTimer)} className="space-y-8">
        {/* Question Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-lg font-semibold mb-3 text-gray-800">
            🤔 What decision do you need to make?
          </label>
          <input
            {...register('question', { required: 'Question is required' })}
            disabled={isTimerActive}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none text-lg disabled:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
            placeholder="Should I build this feature?"
          />
          <AnimatePresence>
            {errors.question && (
              <motion.p 
                className="text-red-500 mt-2 text-sm"
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

        {/* Pros Section */}
        <div>
          <h3 className="text-xl font-semibold text-green-600 mb-3">
            Pros ({pros.length}/5)
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              value={currentPro}
              onChange={(e) => setCurrentPro(e.target.value)}
              disabled={isTimerActive || pros.length >= 5}
              className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
              placeholder="Add a pro..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPro()
                }
              }}
            />
            <button
              type="button"
              onClick={addPro}
              disabled={isTimerActive || !currentPro.trim() || pros.length >= 5}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {pros.map((pro, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="flex-1">{pro}</span>
                  {!isTimerActive && (
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Cons Section */}
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-3">
            Cons ({cons.length}/5)
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              value={currentCon}
              onChange={(e) => setCurrentCon(e.target.value)}
              disabled={isTimerActive || cons.length >= 5}
              className="flex-1 px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100"
              placeholder="Add a con..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCon()
                }
              }}
            />
            <button
              type="button"
              onClick={addCon}
              disabled={isTimerActive || !currentCon.trim() || cons.length >= 5}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {cons.map((con, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="flex-1">{con}</span>
                  {!isTimerActive && (
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Timer Selection */}
        <AnimatePresence>
          {!isTimerActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-lg font-semibold mb-3 text-gray-800">
                ⏱️ Decision Timer
              </label>
              <select
                {...register('timerMinutes')}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none text-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <option value={5}>5 minutes - Quick decisions</option>
                <option value={10}>10 minutes - Balanced thinking</option>
                <option value={15}>15 minutes - Deep consideration</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {!isTimerActive ? (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Decision Timer
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-gray-600">Timer is running. You can make a decision now or wait for auto-decision.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  makeAutoDecision()
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Decide YES Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionResult('NO')
                  setShowResult(true)
                  setIsTimerActive(false)
                  saveDecision('NO')
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Decide NO Now
              </button>
            </div>
          </div>
        )}
      </form>
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