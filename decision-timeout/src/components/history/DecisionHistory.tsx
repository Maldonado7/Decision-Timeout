'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase, Decision } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function DecisionHistory() {
  const { userId } = useAuth()
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'good' | 'bad' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalDecisions: 0,
    totalTimeSaved: 0,
    successRate: 0,
    goodDecisions: 0,
    badDecisions: 0,
    pendingDecisions: 0,
    averageTimePerDecision: 0,
    mostRecentDecision: null as Date | null
  })

  const fetchDecisions = useCallback(async () => {
    if (!userId) return
    
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
  }, [userId])

  useEffect(() => {
    fetchDecisions()
  }, [fetchDecisions])

  const calculateStats = (decisions: Decision[]) => {
    const totalDecisions = decisions.length
    const totalTimeSaved = decisions.reduce((sum, d) => sum + d.time_saved, 0)
    const goodDecisions = decisions.filter(d => d.outcome === 'good').length
    const badDecisions = decisions.filter(d => d.outcome === 'bad').length
    const pendingDecisions = decisions.filter(d => d.outcome === 'pending').length
    const successRate = goodDecisions + badDecisions > 0 ? 
      Math.round((goodDecisions / (goodDecisions + badDecisions)) * 100) : 0
    const averageTimePerDecision = totalDecisions > 0 ? Math.round(totalTimeSaved / totalDecisions) : 0
    const mostRecentDecision = totalDecisions > 0 ? new Date(decisions[0].created_at) : null

    setStats({
      totalDecisions,
      totalTimeSaved,
      successRate,
      goodDecisions,
      badDecisions,
      pendingDecisions,
      averageTimePerDecision,
      mostRecentDecision
    })
  }

  const updateDecisionOutcome = async (decisionId: string, outcome: 'good' | 'bad') => {
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ outcome })
        .eq('id', decisionId)

      if (error) throw error
      
      // Optimistic update
      setDecisions(prev => prev.map(d => 
        d.id === decisionId ? { ...d, outcome } : d
      ))
      
      // Recalculate stats
      const updatedDecisions = decisions.map(d => 
        d.id === decisionId ? { ...d, outcome } : d
      )
      calculateStats(updatedDecisions)
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const filteredDecisions = decisions.filter(decision => {
    const matchesFilter = filter === 'all' || decision.outcome === filter
    const matchesSearch = decision.question.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            {stats.totalDecisions}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Decisions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
            {stats.successRate}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
            {Math.round(stats.totalTimeSaved / 60)}h
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Time Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2">
            {stats.averageTimePerDecision}m
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Avg per Decision</div>
        </motion.div>
      </div>

      {/* Visual Stats */}
      {stats.totalDecisions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Decision Outcomes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Good Decisions</span>
              </div>
              <span className="text-sm font-medium">{stats.goodDecisions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalDecisions > 0 ? (stats.goodDecisions / stats.totalDecisions) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Bad Decisions</span>
              </div>
              <span className="text-sm font-medium">{stats.badDecisions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalDecisions > 0 ? (stats.badDecisions / stats.totalDecisions) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm">Pending Review</span>
              </div>
              <span className="text-sm font-medium">{stats.pendingDecisions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalDecisions > 0 ? (stats.pendingDecisions / stats.totalDecisions) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'good', 'bad', 'pending'] as const).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-3 min-h-[44px] rounded-lg font-medium transition-colors touch-manipulation ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' ? 'All' : 
                 filterOption === 'good' ? `Good (${stats.goodDecisions})` :
                 filterOption === 'bad' ? `Bad (${stats.badDecisions})` :
                 `Pending (${stats.pendingDecisions})`}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-auto"
            />
          </div>
        </div>
      </motion.div>

      {/* Decisions List */}
      {filteredDecisions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="text-gray-400 text-6xl mb-4">🤔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {decisions.length === 0 ? 'No decisions yet' : 'No decisions match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {decisions.length === 0 
              ? "Start making decisions to see your history here" 
              : "Try adjusting your filters or search term"}
          </p>
          {decisions.length === 0 && (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
            >
              Make Your First Decision
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredDecisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        decision.result === 'YES' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {decision.result}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {decision.question}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatTimeAgo(decision.created_at)}</span>
                          <span>•</span>
                          <span>{decision.time_saved} min saved</span>
                          <span>•</span>
                          <span>{decision.pros.length} pros, {decision.cons.length} cons</span>
                        </div>
                      </div>
                    </div>

                    {(decision.pros.length > 0 || decision.cons.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {decision.pros.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2">Pros</h4>
                            <ul className="space-y-1">
                              {decision.pros.slice(0, 2).map((pro, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-green-500 mr-1">•</span>
                                  {pro}
                                </li>
                              ))}
                              {decision.pros.length > 2 && (
                                <li className="text-sm text-gray-400">
                                  +{decision.pros.length - 2} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {decision.cons.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-red-700 mb-2">Cons</h4>
                            <ul className="space-y-1">
                              {decision.cons.slice(0, 2).map((con, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-red-500 mr-1">•</span>
                                  {con}
                                </li>
                              ))}
                              {decision.cons.length > 2 && (
                                <li className="text-sm text-gray-400">
                                  +{decision.cons.length - 2} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      decision.outcome === 'good' ? 'bg-green-100 text-green-700' :
                      decision.outcome === 'bad' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {decision.outcome === 'pending' ? 'Pending Review' : 
                       decision.outcome === 'good' ? 'Good Decision' : 'Bad Decision'}
                    </div>

                    {decision.outcome === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDecisionOutcome(decision.id, 'good')}
                          className="px-3 py-2 min-h-[40px] bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
                        >
                          👍 Good
                        </button>
                        <button
                          onClick={() => updateDecisionOutcome(decision.id, 'bad')}
                          className="px-3 py-2 min-h-[40px] bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
                        >
                          👎 Bad
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-400">
                      {formatDate(decision.created_at)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick Actions */}
      {decisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center"
        >
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Make Another Decision</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}