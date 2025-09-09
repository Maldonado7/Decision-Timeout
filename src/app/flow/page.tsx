'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'

interface DecisionData {
  id: string
  decision: string
  category: string
  timerMinutes: number
  createdAt: string
  status: string
}

interface FlowData {
  pros: string[]
  cons: string[]
  emotionScore: number
  aiInsight?: string
}

const EMOTION_LABELS = [
  { value: 1, label: 'Stressed', emoji: '😰' },
  { value: 2, label: 'Worried', emoji: '😟' },
  { value: 3, label: 'Uncertain', emoji: '😐' },
  { value: 4, label: 'Hopeful', emoji: '🙂' },
  { value: 5, label: 'Confident', emoji: '😊' },
]

export default function DecisionFlow() {
  const router = useRouter()
  const [decisionData, setDecisionData] = useState<DecisionData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hasUsedPause, setHasUsedPause] = useState(false)
  
  // Flow data
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [emotionScore, setEmotionScore] = useState(3)
  const [aiInsight, setAiInsight] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  
  // Touch gesture support
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isSwipeFeedback, setIsSwipeFeedback] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('currentDecision')
    if (!stored) {
      router.push('/new-decision')
      return
    }
    
    const data = JSON.parse(stored)
    setDecisionData(data)
    setTimeRemaining(data.timerMinutes * 60) // Convert to seconds
  }, [router])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isPaused || !decisionData?.timerMinutes) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer finished - auto advance to summary
          handleFinishFlow()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isPaused, decisionData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addProCon = (type: 'pros' | 'cons') => {
    if (type === 'pros') {
      setPros([...pros, ''])
    } else {
      setCons([...cons, ''])
    }
  }

  const updateProCon = (type: 'pros' | 'cons', index: number, value: string) => {
    if (type === 'pros') {
      const newPros = [...pros]
      newPros[index] = value
      setPros(newPros)
    } else {
      const newCons = [...cons]
      newCons[index] = value
      setCons(newCons)
    }
  }

  const removeProCon = (type: 'pros' | 'cons', index: number) => {
    if (type === 'pros' && pros.length > 1) {
      setPros(pros.filter((_, i) => i !== index))
    } else if (type === 'cons' && cons.length > 1) {
      setCons(cons.filter((_, i) => i !== index))
    }
  }

  const generateAIInsight = async () => {
    if (!decisionData) return

    setIsLoadingAI(true)
    try {
      const response = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: decisionData.decision,
          pros: pros.filter(p => p.trim()),
          cons: cons.filter(c => c.trim()),
          emotionScore: emotionScore
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate insight')
      }

      const data = await response.json()
      setAiInsight(data.insight)
    } catch (error) {
      console.error('Error generating AI insight:', error)
      setAiInsight('Unable to generate insight at this time. Trust your instincts—you have more wisdom than you think.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handlePauseTimer = () => {
    if (!hasUsedPause && decisionData?.timerMinutes) {
      setIsPaused(true)
      setHasUsedPause(true)
      // Add 5 minutes to timer
      setTimeRemaining(prev => prev + 300)
    }
  }

  const handleResumeTimer = () => {
    setIsPaused(false)
  }

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchEnd(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    if (!decisionData?.timerMinutes) return

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const minSwipeDistance = 50
    
    // Ensure horizontal swipe is more prominent than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      setIsSwipeFeedback(true)
      
      if (deltaX > 0) {
        // Right swipe - resume timer
        if (isPaused) {
          handleResumeTimer()
        }
      } else {
        // Left swipe - pause timer
        if (!isPaused && !hasUsedPause) {
          handlePauseTimer()
        }
      }
      
      // Reset feedback after animation
      setTimeout(() => setIsSwipeFeedback(false), 300)
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handleFinishFlow = () => {
    if (!decisionData) return

    // Save flow data
    const flowData: FlowData = {
      pros: pros.filter(p => p.trim()),
      cons: cons.filter(c => c.trim()),
      emotionScore,
      aiInsight
    }

    const completeData = {
      ...decisionData,
      flowData,
      completedAt: new Date().toISOString()
    }

    localStorage.setItem('completedDecision', JSON.stringify(completeData))
    router.push('/summary')
  }

  if (!decisionData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your decision...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Timer */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/new-decision" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
              ← Back
            </Link>
            
            <div className="flex items-center gap-4">
              {decisionData.timerMinutes > 0 && (
              <div className="flex items-center gap-4">
                <div 
                  className={`text-center touch-none select-none cursor-pointer relative p-2 rounded-lg transition-colors hover:bg-slate-50 swipe-zone swipe-feedback ${isSwipeFeedback ? 'swiping' : ''}`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  title="Swipe left to pause, right to resume"
                >
                  <div className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-slate-500">remaining</div>
                  <div className="text-xs text-slate-400 mt-1">← swipe →</div>
                </div>
                
                {!isPaused && !hasUsedPause && (
                  <button
                    onClick={handlePauseTimer}
                    className="text-sm bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200"
                  >
                    Pause (+5 min)
                  </button>
                )}
                
                {isPaused && (
                  <button
                    onClick={handleResumeTimer}
                    className="text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
                  >
                    Resume
                  </button>
                )}
              </div>
              )}
              
              <SignOutButton redirectUrl="/">
                <button className="text-slate-600 hover:text-slate-900 text-sm">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-slate-500">
            Step {currentStep} of 3
          </div>
        </div>

        {/* Decision Title */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200">
          <h2 className="font-semibold text-slate-900">{decisionData.decision}</h2>
          <span className="inline-block mt-2 text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
            {decisionData.category}
          </span>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">List Pros & Cons</h3>
                <p className="text-slate-600">Get all your thoughts out of your head</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pros */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Pros
                  </h4>
                  <div className="space-y-3">
                    {pros.map((pro, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={pro}
                          onChange={(e) => updateProCon('pros', index, e.target.value)}
                          placeholder="Enter a positive aspect..."
                          className="flex-1 p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {pros.length > 1 && (
                          <button
                            onClick={() => removeProCon('pros', index)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addProCon('pros')}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                    >
                      + Add another pro
                    </button>
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <h4 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Cons
                  </h4>
                  <div className="space-y-3">
                    {cons.map((con, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={con}
                          onChange={(e) => updateProCon('cons', index, e.target.value)}
                          placeholder="Enter a negative aspect..."
                          className="flex-1 p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        {cons.length > 1 && (
                          <button
                            onClick={() => removeProCon('cons', index)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addProCon('cons')}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      + Add another con
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Next: Emotion Check
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">How are you feeling?</h3>
                <p className="text-slate-600">Your emotional state affects decision quality</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  {EMOTION_LABELS.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => setEmotionScore(emotion.value)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-center min-h-[80px] ${
                        emotionScore === emotion.value
                          ? 'border-indigo-500 bg-indigo-50 scale-105'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{emotion.emoji}</div>
                      <div className="text-sm font-medium text-slate-900">{emotion.label}</div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center text-sm text-slate-600 mb-8">
                  Selected: {EMOTION_LABELS.find(e => e.value === emotionScore)?.label}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Next: Get AI Insight
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">AI Insight</h3>
                <p className="text-slate-600">Get a fresh perspective on your decision</p>
              </div>

              {!aiInsight && !isLoadingAI && (
                <div className="text-center">
                  <button
                    onClick={generateAIInsight}
                    className="bg-gradient-to-r from-indigo-600 to-teal-600 text-white px-8 py-4 rounded-lg font-medium hover:from-indigo-700 hover:to-teal-700 text-lg"
                  >
                    Generate AI Insight
                  </button>
                </div>
              )}

              {isLoadingAI && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Analyzing your decision...</p>
                </div>
              )}

              {aiInsight && (
                <div className="bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg p-6 border border-indigo-200">
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
                    {aiInsight}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinishFlow}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
                >
                  Finish & Decide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}