'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { DecisionForm, DecisionTimer, DecisionResult, ProgressIndicator } from './'
import { DecisionForm as DecisionFormData, DecisionStep, DecisionResult as DecisionResultType } from '../../types/components'

export default function DecisionCreator() {
  const { userId } = useAuth()
  const [currentStep, setCurrentStep] = useState<DecisionStep>('setup')
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [currentPro, setCurrentPro] = useState('')
  const [currentCon, setCurrentCon] = useState('')
  const [starredPro, setStarredPro] = useState<number | null>(null)
  const [starredCon, setStarredCon] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [decisionResult, setDecisionResult] = useState<DecisionResultType>(null)
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentTimerMinutes, setCurrentTimerMinutes] = useState(10)


  const saveDecision = useCallback(async (result: 'YES' | 'NO', question: string, timerMinutes: number) => {
    const lockedUntil = new Date()
    lockedUntil.setDate(lockedUntil.getDate() + 30)

    setIsLoading(true)
    try {
      const { error } = await supabase
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
    } catch (error) {
      console.error('Error saving decision:', error)
      setValidationError('Failed to save decision. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, pros, cons])

  const makeAutoDecision = useCallback((question: string, timerMinutes: number) => {
    let result: 'YES' | 'NO'
    
    // Factor in starred items (they count double)
    const prosWeight = pros.length + (starredPro !== null ? 1 : 0)
    const consWeight = cons.length + (starredCon !== null ? 1 : 0)
    
    if (prosWeight > consWeight) {
      result = 'YES'
    } else if (consWeight > prosWeight) {
      result = 'NO'
    } else {
      result = Math.random() < 0.5 ? 'YES' : 'NO'
    }
    
    setDecisionResult(result)
    setCurrentStep('result')
    setIsTimerActive(false)
    saveDecision(result, question, timerMinutes)
  }, [pros.length, cons.length, starredPro, starredCon, saveDecision])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            makeAutoDecision(currentQuestion, currentTimerMinutes)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timeRemaining, makeAutoDecision, currentQuestion, currentTimerMinutes])

  const addPro = useCallback(() => {
    if (currentPro.trim() && pros.length < 5) {
      setPros([...pros, currentPro.trim()])
      setCurrentPro('')
      setValidationError('')
    }
  }, [currentPro, pros])

  const addCon = useCallback(() => {
    if (currentCon.trim() && cons.length < 5) {
      setCons([...cons, currentCon.trim()])
      setCurrentCon('')
      setValidationError('')
    }
  }, [currentCon, cons])

  const removePro = (index: number) => {
    if (!isTimerActive) {
      setPros(pros.filter((_, i) => i !== index))
      // Adjust starred index if needed
      if (starredPro === index) {
        setStarredPro(null)
      } else if (starredPro !== null && starredPro > index) {
        setStarredPro(starredPro - 1)
      }
    }
  }

  const removeCon = (index: number) => {
    if (!isTimerActive) {
      setCons(cons.filter((_, i) => i !== index))
      // Adjust starred index if needed
      if (starredCon === index) {
        setStarredCon(null)
      } else if (starredCon !== null && starredCon > index) {
        setStarredCon(starredCon - 1)
      }
    }
  }

  const startTimer = (data: DecisionFormData) => {
    if (pros.length === 0 && cons.length === 0) {
      setValidationError('Add at least one pro or con before starting the timer!')
      return
    }
    
    setValidationError('')
    setCurrentQuestion(data.question)
    setCurrentTimerMinutes(data.timerMinutes)
    setTimeRemaining(data.timerMinutes * 60)
    setIsTimerActive(true)
    setCurrentStep('timer')
  }

  const cancelTimer = () => {
    setIsTimerActive(false)
    setCurrentStep('setup')
    setTimeRemaining(0)
  }

  const resetDecision = () => {
    setCurrentStep('setup')
    setDecisionResult(null)
    setIsTimerActive(false)
    setTimeRemaining(0)
    setPros([])
    setCons([])
    setCurrentPro('')
    setCurrentCon('')
    setStarredPro(null)
    setStarredCon(null)
    setValidationError('')
    setCurrentQuestion('')
    setCurrentTimerMinutes(10)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTimerActive) {
        cancelTimer()
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        if (currentStep === 'setup' && currentPro) {
          e.preventDefault()
          addPro()
        } else if (currentStep === 'setup' && currentCon) {
          e.preventDefault()
          addCon()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTimerActive, currentStep, currentPro, currentCon, addPro, addCon])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDecisionLogic = useCallback(() => {
    const prosWeight = pros.length + (starredPro !== null ? 1 : 0)
    const consWeight = cons.length + (starredCon !== null ? 1 : 0)
    
    const starredText = (starredPro !== null || starredCon !== null) 
      ? ' (starred items count double)' 
      : ''
    
    if (prosWeight > consWeight) {
      return `More pros than cons (${prosWeight} vs ${consWeight})${starredText}`
    } else if (consWeight > prosWeight) {
      return `More cons than pros (${consWeight} vs ${prosWeight})${starredText}`
    } else {
      return `Tied pros and cons (${prosWeight} vs ${consWeight})${starredText} - coin flip`
    }
  }, [pros.length, cons.length, starredPro, starredCon])



  const handleViewHistory = () => {
    window.location.href = '/history'
  }

  if (currentStep === 'result') {
    return (
      <div className="space-y-6">
        <ProgressIndicator currentStep={currentStep} />
        <DecisionResult 
          result={decisionResult!}
          decisionLogic={getDecisionLogic()}
          onReset={resetDecision}
          onViewHistory={handleViewHistory}
        />
      </div>
    )
  }

  if (currentStep === 'timer') {
    return (
      <div className="space-y-6">
        <ProgressIndicator currentStep={currentStep} />
        <DecisionTimer 
          timeRemaining={timeRemaining}
          pros={pros}
          cons={cons}
          onCancel={cancelTimer}
          formatTime={formatTime}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={currentStep} />
      <DecisionForm 
        onSubmit={startTimer}
        pros={pros}
        cons={cons}
        currentPro={currentPro}
        currentCon={currentCon}
        starredPro={starredPro}
        starredCon={starredCon}
        validationError={validationError}
        isLoading={isLoading}
        onProChange={setCurrentPro}
        onConChange={setCurrentCon}
        onAddPro={addPro}
        onAddCon={addCon}
        onRemovePro={removePro}
        onRemoveCon={removeCon}
        onStarPro={setStarredPro}
        onStarCon={setStarredCon}
        isTimerActive={isTimerActive}
      />
    </div>
  )
}