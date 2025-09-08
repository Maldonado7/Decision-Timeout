'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { getUserSubscriptionInfo, getTimerLimits } from '@/lib/subscription'

const CATEGORIES = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'personal', label: 'Personal', emoji: '🏠' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'financial', label: 'Financial', emoji: '💰' },
  { id: 'relationships', label: 'Relationships', emoji: '👥' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'other', label: 'Other', emoji: '📝' },
]


export default function NewDecision() {
  const { user } = useUser()
  const router = useRouter()
  const [decision, setDecision] = useState('')
  const [category, setCategory] = useState('')
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  // Determine user tier and available timers
  const subscriptionInfo = getUserSubscriptionInfo(user)
  const availableTimerMinutes = getTimerLimits(subscriptionInfo.plan)
  
  const availableTimers = availableTimerMinutes.map(minutes => ({
    minutes,
    label: minutes === 0 ? 'No timer' : `${minutes} minutes`,
    recommended: minutes === 5 || (minutes === 10 && subscriptionInfo.plan === 'premium')
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!decision.trim() || !category) return

    setIsLoading(true)
    
    try {
      // Store decision data in localStorage for now
      const decisionData = {
        id: crypto.randomUUID(),
        decision: decision.trim(),
        category,
        timerMinutes,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      localStorage.setItem('currentDecision', JSON.stringify(decisionData))
      router.push('/flow')
    } catch (error) {
      console.error('Error creating decision:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
              ← Back
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">New Decision</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Decision Input */}
            <div>
              <label htmlFor="decision" className="block text-sm font-medium text-slate-900 mb-2">
                What decision do you need to make?
              </label>
              <textarea
                id="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="e.g., Should I take the new job offer?"
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <div className="text-sm text-slate-500 mt-2">
                {decision.length}/500 characters
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      category === cat.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-sm font-medium text-slate-900">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Decision Timer
                {subscriptionInfo.plan === 'guest' && (
                  <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    Guest limit: 5 min
                  </span>
                )}
                {subscriptionInfo.plan === 'free' && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Free limit: 5 min
                  </span>
                )}
                {subscriptionInfo.plan === 'premium' && (
                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Premium: Up to 15 min
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTimers.map((timer) => (
                  <button
                    key={timer.minutes}
                    type="button"
                    onClick={() => setTimerMinutes(timer.minutes)}
                    className={`p-4 rounded-lg border-2 transition-colors text-center relative ${
                      timerMinutes === timer.minutes
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {timer.recommended && (
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                        ★
                      </div>
                    )}
                    <div className="text-lg font-semibold text-slate-900">{timer.label}</div>
                  </button>
                ))}
              </div>
              
              {subscriptionInfo.plan !== 'premium' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-900">Upgrade for longer timers</p>
                      <p className="text-xs text-indigo-700">Get up to 15 minutes or unlimited time</p>
                    </div>
                    <Link
                      href="/sign-up"
                      className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!decision.trim() || !category || isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Starting...' : 'Start Decision Process'}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>💡 Tip: The timer creates focus and prevents overthinking</p>
        </div>
      </div>
    </div>
  )
}