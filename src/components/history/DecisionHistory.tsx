'use client'

import { useState, useEffect } from 'react'
import { supabase, Decision } from '@/lib/supabase'
import { motion } from 'framer-motion'

interface DecisionHistoryProps {
  userId: string
}

export default function DecisionHistory({ userId }: DecisionHistoryProps) {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDecisions: 0,
    totalTimeSaved: 0,
    successRate: 0,
    goodDecisions: 0,
    badDecisions: 0,
    pendingDecisions: 0
  })

  useEffect(() => {
    fetchDecisions()
  }, [userId])

  const fetchDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDecisions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching decisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (decisions: Decision[]) => {
    const totalDecisions = decisions.length
    const totalTimeSaved = decisions.reduce((sum, d) => sum + d.time_saved, 0)
    const goodDecisions = decisions.filter(d => d.outcome === 'good').length
    const badDecisions = decisions.filter(d => d.outcome === 'bad').length
    const pendingDecisions = decisions.filter(d => d.outcome === 'pending').length
    const successRate = goodDecisions + badDecisions > 0 ? 
      Math.round((goodDecisions / (goodDecisions + badDecisions)) * 100) : 0

    setStats({
      totalDecisions,
      totalTimeSaved,
      successRate,
      goodDecisions,
      badDecisions,
      pendingDecisions
    })
  }

  const updateDecisionOutcome = async (decisionId: string, outcome: 'good' | 'bad') => {
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ outcome })
        .eq('id', decisionId)

      if (error) throw error
      
      fetchDecisions() // Refresh data
    } catch (error) {
      console.error('Error updating decision outcome:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isDecisionLocked = (lockedUntil: string) => {
    return new Date(lockedUntil) > new Date()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalDecisions}
          </div>
          <div className="text-gray-600">Total Decisions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(stats.totalTimeSaved / 60)}h
          </div>
          <div className="text-gray-600">Time Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.successRate}%
          </div>
          <div className="text-gray-600">Success Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <div className="text-sm text-gray-600 mb-2">Outcomes</div>
          <div className="flex justify-between text-xs">
            <span className="text-green-600">Good: {stats.goodDecisions}</span>
            <span className="text-red-600">Bad: {stats.badDecisions}</span>
            <span className="text-gray-500">Pending: {stats.pendingDecisions}</span>
          </div>
        </motion.div>
      </div>

      {/* Decision List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Decision History</h2>
        </div>
        
        {decisions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No decisions made yet</p>
            <a
              href="/dashboard"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Your First Decision
            </a>
          </div>
        ) : (
          <div className="divide-y">
            {decisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {decision.question}
                    </h3>
                    <div className="text-sm text-gray-500 mb-3">
                      {formatDate(decision.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      decision.result === 'YES' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {decision.result}
                    </div>
                    {isDecisionLocked(decision.locked_until) && (
                      <div className="text-yellow-600 text-sm">🔒 Locked</div>
                    )}
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Pros</h4>
                    <ul className="space-y-1">
                      {decision.pros.map((pro: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Cons</h4>
                    <ul className="space-y-1">
                      {decision.cons.map((con: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Outcome Rating */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">How did this work out?</span>
                  {decision.outcome === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateDecisionOutcome(decision.id, 'good')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Good Decision
                      </button>
                      <button
                        onClick={() => updateDecisionOutcome(decision.id, 'bad')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Bad Decision
                      </button>
                    </div>
                  ) : (
                    <div className={`px-3 py-1 text-sm rounded ${
                      decision.outcome === 'good' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {decision.outcome === 'good' ? 'Good Decision' : 'Bad Decision'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}