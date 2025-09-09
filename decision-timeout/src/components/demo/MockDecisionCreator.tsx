'use client'

// Demo version that works without database - for testing UI only
import { useState, useEffect, useCallback } from 'react'

export default function MockDecisionCreator() {
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [currentPro, setCurrentPro] = useState('')
  const [currentCon, setCurrentCon] = useState('')
  const [question, setQuestion] = useState('')
  const [timerMinutes, setTimerMinutes] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [decisionResult, setDecisionResult] = useState<'YES' | 'NO' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showConfidenceRating, setShowConfidenceRating] = useState(false)
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null)

  const makeAutoDecision = useCallback(() => {
    let result: 'YES' | 'NO'
    
    if (pros.length > cons.length) {
      result = 'YES'
    } else if (cons.length > pros.length) {
      result = 'NO'
    } else {
      result = Math.random() < 0.5 ? 'YES' : 'NO'
    }
    
    setDecisionResult(result)
    setShowConfidenceRating(true)
    setIsTimerActive(false)
  }, [pros.length, cons.length])

  // Timer logic
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
  }, [isTimerActive, timeRemaining, makeAutoDecision])

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

  const startTimer = (e: React.FormEvent) => {
    e.preventDefault()
    if (pros.length === 0 && cons.length === 0) {
      alert('Add at least one pro or con!')
      return
    }
    
    if (!question.trim()) {
      alert('Please enter a question!')
      return
    }
    
    setTimeRemaining(timerMinutes * 60)
    setIsTimerActive(true)
  }

  const handleConfidenceSubmit = (confidence: number) => {
    setConfidenceLevel(confidence)
    setShowConfidenceRating(false)
    setShowResult(true)
    // In demo mode, just console.log instead of saving to database
    console.log('Demo Decision:', { question, pros, cons, result: decisionResult, confidence })
    alert('✅ Demo decision saved! (Check console for details)')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Confidence Rating Screen
  if (showConfidenceRating && decisionResult) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="text-4xl mb-4">{decisionResult === 'YES' ? '🚀' : '🛡️'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            You chose: <span className={decisionResult === 'YES' ? 'text-green-600' : 'text-red-600'}>{decisionResult}</span>
          </h2>
          <p className="text-gray-600 mb-6">How confident do you feel?</p>
          
          <div className="grid grid-cols-10 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => handleConfidenceSubmit(rating)}
                className={`h-12 rounded-lg font-bold text-white transition-all duration-200 ${
                  rating <= 3 
                    ? 'bg-red-400 hover:bg-red-500' 
                    : rating <= 7 
                    ? 'bg-yellow-400 hover:bg-yellow-500' 
                    : 'bg-green-400 hover:bg-green-500'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500">
            💡 Demo Mode - Data not saved to database
          </div>
        </div>
      </div>
    )
  }

  // Result Screen
  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="text-6xl mb-4">{decisionResult === 'YES' ? '🚀' : '🛡️'}</div>
          <h1 className="text-4xl font-bold mb-4">
            Decision: <span className={decisionResult === 'YES' ? 'text-green-600' : 'text-red-600'}>{decisionResult}</span>
          </h1>
          <p className="text-gray-700 mb-4">
            {decisionResult === 'YES' 
              ? "Great choice! You've decided to move forward with confidence!" 
              : "Smart boundary! You've protected your time and energy."}
          </p>
          
          {confidenceLevel && (
            <div className="mb-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-center gap-3">
                <span className="text-indigo-600 font-medium">Confidence Level:</span>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < confidenceLevel ? 'bg-indigo-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-indigo-700 font-bold">{confidenceLevel}/10</span>
              </div>
            </div>
          )}
          
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
            🚧 Demo Mode Active - Run database setup to enable full features
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Make Another Decision
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        
        {/* Demo Mode Banner */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-6 text-center text-yellow-800">
          🚧 Demo Mode - Testing UI without database. Run setup_database.sql to enable full features.
        </div>

        <form onSubmit={startTimer} className="space-y-8">
          {/* Question Input */}
          <div>
            <label className="text-xl font-bold text-gray-800 mb-4 block">
              🤔 What decision do you need to make?
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isTimerActive}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg text-gray-900 placeholder-gray-400 bg-white/90"
              placeholder="e.g., Should I accept this job offer?"
            />
          </div>

          {/* Timer Display */}
          {isTimerActive && (
            <div className="text-center py-4">
              <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-gray-600">Time remaining to decide</p>
            </div>
          )}

          {/* Pros/Cons Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pros Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <h3 className="text-xl font-bold text-green-700 mb-4">
                ✅ Pros ({pros.length}/5)
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  value={currentPro}
                  onChange={(e) => setCurrentPro(e.target.value)}
                  disabled={isTimerActive || pros.length >= 5}
                  className="flex-1 px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 outline-none"
                  placeholder="What's a positive aspect?"
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
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {pros.length === 0 ? (
                  <div className="text-center py-8 text-green-500">
                    <div className="text-4xl mb-2">🌟</div>
                    <p className="text-sm">Start adding the positive aspects</p>
                  </div>
                ) : (
                  pros.map((pro, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/60 border border-green-200 rounded-xl">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="flex-1 text-gray-800 font-medium">{pro}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cons Section */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
              <h3 className="text-xl font-bold text-red-700 mb-4">
                ❌ Cons ({cons.length}/5)
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  value={currentCon}
                  onChange={(e) => setCurrentCon(e.target.value)}
                  disabled={isTimerActive || cons.length >= 5}
                  className="flex-1 px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-400 outline-none"
                  placeholder="What's a negative aspect?"
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
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {cons.length === 0 ? (
                  <div className="text-center py-8 text-red-500">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="text-sm">Start adding the negative aspects</p>
                  </div>
                ) : (
                  cons.map((con, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/60 border border-red-200 rounded-xl">
                      <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="flex-1 text-gray-800 font-medium">{con}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Timer Selection */}
          {!isTimerActive && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-700 mb-6">
                ⏱️ Choose Your Decision Time
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { value: 5, label: 'Quick', desc: 'For simple decisions', icon: '⚡' },
                  { value: 10, label: 'Balanced', desc: 'Most popular choice', icon: '⚖️' },
                  { value: 15, label: 'Deep', desc: 'For complex decisions', icon: '🧠' }
                ].map((option) => (
                  <label key={option.value} className="cursor-pointer group">
                    <input
                      type="radio"
                      value={option.value}
                      checked={timerMinutes === option.value}
                      onChange={(e) => setTimerMinutes(Number(e.target.value))}
                      className="sr-only"
                    />
                    <div className={`bg-white/80 rounded-xl p-4 border-2 transition-all duration-200 ${
                      timerMinutes === option.value
                        ? 'border-indigo-400 bg-indigo-50/80'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-bold text-gray-800 mb-1">{option.value} min</div>
                        <div className="text-sm font-medium text-indigo-600 mb-1">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isTimerActive ? (
            <button
              type="submit"
              disabled={!question.trim() || (pros.length === 0 && cons.length === 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              🚀 Start Decision Timer
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-gray-600">Timer is running. You can make a decision now or wait for auto-decision.</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={makeAutoDecision}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Decide YES Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionResult('NO')
                    setShowConfidenceRating(true)
                    setIsTimerActive(false)
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
    </div>
  )
}