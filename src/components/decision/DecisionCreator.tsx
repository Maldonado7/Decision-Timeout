'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

interface DecisionForm {
  question: string
  timerMinutes: number
}

interface DecisionCreatorProps {
  userId: string
  onDecisionComplete: (decision: any) => void
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

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<DecisionForm>({
    defaultValues: {
      timerMinutes: 10
    }
  })

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

  const makeAutoDecision = () => {
    let result: 'YES' | 'NO'
    
    if (pros.length > cons.length) {
      result = 'YES'
    } else if (cons.length > pros.length) {
      result = 'NO'
    } else {
      // Coin flip for tie
      result = Math.random() < 0.5 ? 'YES' : 'NO'
    }
    
    setDecisionResult(result)
    setShowResult(true)
    setIsTimerActive(false)
    saveDecision(result)
  }

  const saveDecision = async (result: 'YES' | 'NO') => {
    const { question, timerMinutes } = getValues()
    const lockedUntil = new Date()
    lockedUntil.setDate(lockedUntil.getDate() + 30)

    try {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          user_id: userId,
          question,
          pros,
          cons,
          result,
          locked_until: lockedUntil.toISOString(),
          time_saved: timerMinutes
        })
        .select()
        .single()

      if (error) throw error
      onDecisionComplete(data)
    } catch (error) {
      console.error('Error saving decision:', error)
    }
  }

  const startTimer = (data: DecisionForm) => {
    if (pros.length === 0 && cons.length === 0) {
      alert('Add at least one pro or con before starting the timer!')
      return
    }
    
    setTimeRemaining(data.timerMinutes * 60)
    setIsTimerActive(true)
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
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(startTimer)} className="space-y-6">
        {/* Question Input */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            What decision do you need to make?
          </label>
          <input
            {...register('question', { required: 'Question is required' })}
            disabled={isTimerActive}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg disabled:bg-gray-100"
            placeholder="Should I build this feature?"
          />
          {errors.question && (
            <p className="text-red-500 mt-1">{errors.question.message}</p>
          )}
        </div>

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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
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
        {!isTimerActive && (
          <div>
            <label className="block text-lg font-semibold mb-2">
              Decision Timer
            </label>
            <select
              {...register('timerMinutes')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>
        )}

        {/* Start Button */}
        {!isTimerActive && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Decision Timer
          </button>
        )}
      </form>
    </div>
  )
}