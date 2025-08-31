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
  // Removed confidence rating - goes directly to result
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [extensionsUsed, setExtensionsUsed] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [actualDecision, setActualDecision] = useState<'YES' | 'NO' | 'MAYBE' | null>(null)
  const [showActualDecisionPrompt, setShowActualDecisionPrompt] = useState(false)
  const [showFinalCelebration, setShowFinalCelebration] = useState(false)
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null)
  const [showConfidenceRating, setShowConfidenceRating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{suggestedTemplate: string | null, templateName: string | null, time: number, pros: string[], cons: string[]} | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showStatsPopover, setShowStatsPopover] = useState(false)

  // AI Intelligence for custom decisions with template suggestions
  const analyzeCustomDecision = (question: string) => {
    const text = question.toLowerCase()
    
    // Restaurant/Food location decisions
    if (text.includes('restaurant') || text.includes('eat') || text.includes('dinner') || text.includes('lunch') || text.includes('where') && (text.includes('eat') || text.includes('food'))) {
      return {
        suggestedTemplate: 'restaurant',
        templateName: 'Restaurant Choice',
        time: 5,
        pros: ['Close to home', 'We haven\'t been in months', 'Good parking available', 'Takes reservations'],
        cons: ['Usually packed on weekends', 'Service was slow last time', 'Limited menu options', 'No parking nearby']
      }
    }
    
    // Menu/Food ordering decisions
    if (text.includes('order') || text.includes('menu') || text.includes('what should i get') || text.includes('food')) {
      return {
        suggestedTemplate: 'menu',
        templateName: 'Menu Decision',
        time: 3,
        pros: ['I\'ve had this before - loved it', 'Won\'t make me feel too full', 'Comes with a side included', 'Chef\'s special sounds interesting'],
        cons: ['More than I planned to spend', 'Has ingredients I usually avoid', 'Will make me sleepy after', 'Says 20+ minute wait time']
      }
    }
    
    // Outfit/Clothing decisions
    if (text.includes('wear') || text.includes('outfit') || text.includes('clothes') || text.includes('dress')) {
      return {
        suggestedTemplate: 'outfit',
        templateName: 'Outfit Choice',
        time: 8,
        pros: ['Comfortable for sitting', 'Won\'t show food stains', 'Matches the restaurant vibe', 'Easy to move around in'],
        cons: ['Might be too casual', 'Could get wrinkled', 'Not weather appropriate', 'Wore this here before']
      }
    }
    
    // Purchase decisions
    if (text.includes('buy') || text.includes('purchase') || text.includes('spend') || text.includes('cost') || text.includes('should i get')) {
      return {
        suggestedTemplate: 'purchase',
        templateName: 'Purchase Decision',
        time: 5,
        pros: ['Been wanting this for weeks', 'On sale right now', 'Will use it regularly', 'Good brand reputation'],
        cons: ['Already have something similar', 'Might go on sale later', 'Don\'t really need it', 'Reviews mention quality issues']
      }
    }
    
    // Communication decisions
    if (text.includes('text') || text.includes('message') || text.includes('call') || text.includes('respond') || text.includes('reply')) {
      return {
        suggestedTemplate: 'text',
        templateName: 'Text Response',
        time: 2,
        pros: ['Answers their question clearly', 'Shows I care about them', 'Keeps conversation going', 'Honest but kind response'],
        cons: ['Might be misunderstood', 'Could sound too formal', 'Maybe too much detail', 'Wrong tone for the situation']
      }
    }
    
    // Cancel/Plans decisions
    if (text.includes('cancel') || text.includes('plans') || text.includes('event') || text.includes('bail')) {
      return {
        suggestedTemplate: 'cancel',
        templateName: 'Cancel Plans',
        time: 5,
        pros: ['Really need the rest today', 'Can focus on urgent tasks', 'Save money for later', 'Avoid bad weather/traffic'],
        cons: ['Will disappoint my friend', 'Hard to reschedule later', 'Might miss something fun', 'Already said I\'d be there']
      }
    }
    
    // Entertainment decisions
    if (text.includes('watch') || text.includes('netflix') || text.includes('tv') || text.includes('movie') || text.includes('show')) {
      return {
        suggestedTemplate: 'entertainment',
        templateName: 'Entertainment Choice',
        time: 4,
        pros: ['Perfect length for tonight', 'Matches my current mood', 'Friends recommended it', 'Can pause if needed'],
        cons: ['Might be too intense', 'Could keep me up late', 'Rather be productive', 'Seen too much of this genre']
      }
    }
    
    // Work/Task decisions
    if (text.includes('work') || text.includes('task') || text.includes('project') || text.includes('priority') || text.includes('job')) {
      return {
        suggestedTemplate: 'work',
        templateName: 'Work Priority',
        time: 10,
        pros: ['High impact', 'Due soon', 'Easy to complete', 'Boss wants it'],
        cons: ['Time consuming', 'Not urgent', 'Boring task', 'Difficult to start']
      }
    }
    
    // Default generic suggestions
    return {
      suggestedTemplate: null,
      templateName: null,
      time: 15,
      pros: ['Good opportunity', 'Positive outcome', 'Learning experience'],
      cons: ['Takes effort', 'Risk involved', 'Uncertain outcome']
    }
  }

  // Enhanced Stats tracking with Gamification
  const updateStats = (timeSpent: number, confidenceLevel?: number) => {
    const today = new Date().toDateString()
    const stats = JSON.parse(localStorage.getItem('decisionTimeoutStats') || '{}')
    
    if (!stats[today]) {
      stats[today] = { count: 0, totalTime: 0, confidenceSum: 0, streak: 0 }
    }
    
    stats[today].count += 1
    stats[today].totalTime += timeSpent
    if (confidenceLevel) {
      stats[today].confidenceSum += confidenceLevel
    }
    
    // Update streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toDateString()
    
    if (stats[yesterdayKey]?.count > 0) {
      stats[today].streak = (stats[yesterdayKey].streak || 0) + 1
    } else {
      stats[today].streak = 1
    }
    
    localStorage.setItem('decisionTimeoutStats', JSON.stringify(stats))
  }
  
  const getStats = () => {
    const today = new Date().toDateString()
    const stats = JSON.parse(localStorage.getItem('decisionTimeoutStats') || '{}')
    const todayStats = stats[today] || { count: 0, totalTime: 0, confidenceSum: 0, streak: 0 }
    
    const allDays = Object.values(stats) as { count: number, totalTime: number, confidenceSum: number }[]
    const totalDecisions = allDays.reduce((sum, day) => sum + day.count, 0)
    const totalTime = allDays.reduce((sum, day) => sum + day.totalTime, 0)
    const totalConfidence = allDays.reduce((sum, day) => sum + (day.confidenceSum || 0), 0)
    const averageTime = totalDecisions > 0 ? Math.round(totalTime / totalDecisions) : 0
    const averageConfidence = totalDecisions > 0 ? Math.round((totalConfidence / totalDecisions) * 10) / 10 : 0
    
    // Calculate streak
    const currentStreak = todayStats.streak || 0
    
    // Calculate level (1 decision = 1 XP, level up every 10 decisions)
    const level = Math.floor(totalDecisions / 10) + 1
    const xpProgress = totalDecisions % 10
    
    // Achievements
    const achievements = []
    if (totalDecisions >= 1) achievements.push({ name: "First Decision", icon: "🎯", unlocked: true })
    if (totalDecisions >= 10) achievements.push({ name: "Decision Maker", icon: "⚡", unlocked: true })
    if (totalDecisions >= 50) achievements.push({ name: "Pro Decider", icon: "🏆", unlocked: true })
    if (currentStreak >= 3) achievements.push({ name: "On a Roll", icon: "🔥", unlocked: true })
    if (currentStreak >= 7) achievements.push({ name: "Week Warrior", icon: "💪", unlocked: true })
    if (averageTime <= 300) achievements.push({ name: "Speed Demon", icon: "⚡", unlocked: true })
    if (averageConfidence >= 4) achievements.push({ name: "Confident Chooser", icon: "💎", unlocked: true })
    
    return {
      todayCount: todayStats.count,
      averageTime,
      totalDecisions,
      currentStreak,
      level,
      xpProgress,
      averageConfidence,
      achievements
    }
  }

  // Research-based decision templates targeting commonly overthought scenarios
  const decisionTemplates = [
    {
      id: 'restaurant',
      title: "Where to Eat Tonight",
      icon: "🍽️",
      time: 5,
      question: "Where should we eat tonight?",
      description: "Restaurant choice",
      pros: ["Close to home", "We haven't been in months", "Good parking available", "Takes reservations"],
      cons: ["Usually packed on weekends", "Service was slow last time", "Limited menu options", "No parking nearby"],
      color: "from-orange-400 to-red-400"
    },
    {
      id: 'menu',
      title: "Menu Decision",
      icon: "📋",
      time: 3,
      question: "What should I order from this menu?",
      description: "Food ordering",
      pros: ["I've had this before - loved it", "Won't make me feel too full", "Comes with a side included", "Chef's special sounds interesting"],
      cons: ["More than I planned to spend", "Has ingredients I usually avoid", "Will make me sleepy after", "Says 20+ minute wait time"],
      color: "from-yellow-400 to-orange-400"
    },
    {
      id: 'outfit',
      title: "Dining Out Outfit",
      icon: "👔",
      time: 8,
      question: "What should I wear to this restaurant?",
      description: "Outfit choice",
      pros: ["Comfortable for sitting", "Won't show food stains", "Matches the restaurant vibe", "Easy to move around in"],
      cons: ["Might be too casual", "Could get wrinkled", "Not weather appropriate", "Wore this here before"],
      color: "from-purple-400 to-pink-400"
    },
    {
      id: 'purchase',
      title: "Should I Buy This",
      icon: "💳",
      time: 5,
      question: "Should I buy this item?",
      description: "Purchase decision",
      pros: ["Been wanting this for weeks", "On sale right now", "Will use it regularly", "Good brand reputation"],
      cons: ["Already have something similar", "Might go on sale later", "Don't really need it", "Reviews mention quality issues"],
      color: "from-green-400 to-emerald-400"
    },
    {
      id: 'text',
      title: "Text Response",
      icon: "📱",
      time: 2,
      question: "How should I respond to this text?",
      description: "Communication",
      pros: ["Answers their question clearly", "Shows I care about them", "Keeps conversation going", "Honest but kind response"],
      cons: ["Might be misunderstood", "Could sound too formal", "Maybe too much detail", "Wrong tone for the situation"],
      color: "from-blue-400 to-indigo-400"
    },
    {
      id: 'cancel',
      title: "Cancel These Plans",
      icon: "🚫",
      time: 5,
      question: "Should I cancel these plans?",
      description: "Social commitment",
      pros: ["Really need the rest today", "Can focus on urgent tasks", "Save money for later", "Avoid bad weather/traffic"],
      cons: ["Will disappoint my friend", "Hard to reschedule later", "Might miss something fun", "Already said I'd be there"],
      color: "from-red-400 to-rose-400"
    },
    {
      id: 'entertainment',
      title: "What to Watch Tonight",
      icon: "🎬",
      time: 4,
      question: "What should I watch on Netflix tonight?",
      description: "Entertainment choice",
      pros: ["Perfect length for tonight", "Matches my current mood", "Friends recommended it", "Can pause if needed"],
      cons: ["Might be too intense", "Could keep me up late", "Rather be productive", "Seen too much of this genre"],
      color: "from-indigo-400 to-purple-400"
    },
    {
      id: 'meeting',
      title: "Meeting Decision",
      icon: "📅",
      time: 5,
      question: "Should I attend this meeting?",
      description: "Meeting attendance",
      pros: ["Might learn something useful", "Shows team involvement", "Can provide input", "Networking opportunity"],
      cons: ["Could work on urgent task instead", "Usually runs over time", "My input not critical", "Can get notes later"],
      color: "from-teal-400 to-cyan-400"
    },
    {
      id: 'task',
      title: "Task Priority",
      icon: "📋",
      time: 8,
      question: "Which task should I tackle first?",
      description: "Task prioritization",
      pros: ["High impact on project", "Quick win possible", "Blocking others", "Due soon"],
      cons: ["Complex and time-consuming", "Waiting on dependencies", "Not urgent yet", "Need more context"],
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 'email',
      title: "Email Response",
      icon: "✉️",
      time: 3,
      question: "Should I respond to this email now?",
      description: "Email timing",
      pros: ["Quick to answer", "Sender waiting", "Clears my inbox", "While it's fresh"],
      cons: ["Not urgent", "Need more info first", "In deep work mode", "Better to batch later"],
      color: "from-purple-400 to-pink-400"
    },
    {
      id: 'delegate',
      title: "Delegation Decision",
      icon: "🤝",
      time: 5,
      question: "Should I delegate this task?",
      description: "Task delegation",
      pros: ["Team member has expertise", "Frees my time for priorities", "Good learning opportunity for them", "Not my strength"],
      cons: ["Faster if I do it myself", "Need to explain context", "Quality concerns", "They're already busy"],
      color: "from-green-400 to-emerald-400"
    },
    {
      id: 'stayout',
      title: "Stay In vs Go Out",
      icon: "🏠",
      time: 6,
      question: "Should I go out tonight or stay in?",
      description: "Social vs rest",
      pros: ["Could meet new people", "Get some fresh air", "Try something different", "Friends will be there"],
      cons: ["Feeling tired already", "Costs money I don't have", "Weather looks bad", "Have early morning tomorrow"],
      color: "from-amber-400 to-yellow-400"
    },
    {
      id: 'custom',
      title: "Custom Decision",
      icon: "➕",
      time: 15,
      question: "",
      description: "Your own decision",
      pros: [],
      cons: [],
      color: "from-gray-400 to-slate-400"
    }
  ]

  const { register, handleSubmit, getValues, setValue, watch } = useForm<DecisionForm>({
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

  // Audio notifications for timer
  useEffect(() => {
    if (!isTimerActive || !audioEnabled) return
    
    if (timeRemaining === 30) {
      // 30-second chime
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQad')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } else if (timeRemaining === 10) {
      // 10-second urgent chime
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQadDaN2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQad')
      audio.volume = 0.5
      audio.play().catch(() => {})
      
      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [isTimerActive, timeRemaining, audioEnabled])
  
  // Prevent back navigation during timer
  useEffect(() => {
    if (!isTimerActive) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Timer is running! Are you sure you want to leave?'
    }
    
    const handlePopState = (e: PopStateEvent) => {
      if (confirm('Timer is running! Are you sure you want to go back?')) {
        setIsTimerActive(false)
        localStorage.removeItem(`decision-timer-${userId}`)
        setExtensionsUsed(0)
      } else {
        e.preventDefault()
        window.history.pushState(null, '', window.location.href)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.href)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isTimerActive, userId])

  const currentProsRef = useRef(pros)
  const currentConsRef = useRef(cons)
  
  // Update refs when pros/cons change
  useEffect(() => {
    currentProsRef.current = pros
  }, [pros])
  
  useEffect(() => {
    currentConsRef.current = cons
  }, [cons])

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

  const saveDecision = useCallback(async (result: 'YES' | 'NO') => {
    const { question, timerMinutes } = getValues()
    const lockedUntil = new Date()
    lockedUntil.setDate(lockedUntil.getDate() + 30)

    setIsLoading(true)

    try {
      // Try to save to database first
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
      
      // Success - decision saved to database
      const successMessages = {
        YES: {
          title: '✅ Decision Made: YES!',
          description: `Great choice! You've decided to go forward. This decision is saved and locked for 30 days - trust your judgment and move ahead with confidence! 🚀`
        },
        NO: {
          title: '❌ Decision Made: NO!',
          description: `Smart boundary! You've protected your time and energy. This decision is saved and locked for 30 days - trust your instincts! 🛡️`
        }
      }

      addToast({
        type: 'success',
        ...successMessages[result],
        duration: 6000
      })
      
      onDecisionComplete(data as Decision)
    } catch (error) {
      console.error('Database save failed:', error)
      
      // Database failed - give user options
      const proceed = confirm(
        `Your decision: ${result}\n\n` +
        `Database isn't set up yet, so this decision won't be saved to history.\n\n` +
        `Options:\n` +
        `• Click OK to continue without saving (you'll see your decision result)\n` +
        `• Click Cancel to go back and set up database first\n\n` +
        `(Check QUICK_FIX_README.md for database setup instructions)`
      )
      
      if (proceed) {
        // User chose to continue without saving
        const successMessages = {
          YES: {
            title: '✅ Decision Made: YES!',
            description: `Great choice! You've decided to go forward. Trust your judgment and move ahead with confidence! 🚀 (Not saved to history - set up database to enable saving)`
          },
          NO: {
            title: '❌ Decision Made: NO!',
            description: `Smart boundary! You've protected your time and energy. Trust your instincts! 🛡️ (Not saved to history - set up database to enable saving)`
          }
        }

        addToast({
          type: 'success',
          ...successMessages[result],
          duration: 6000
        })
        
        // Create mock decision object for onDecisionComplete
        const mockDecision: Decision = {
          id: generateId(),
          user_id: userId,
          question,
          pros: currentProsRef.current,
          cons: currentConsRef.current,
          result,
          locked_until: lockedUntil.toISOString(),
          time_saved: timerMinutes,
          created_at: new Date().toISOString(),
          outcome: 'pending'
        }
        
        onDecisionComplete(mockDecision)
      } else {
        // User chose to go back and set up database
        addToast({
          type: 'info',
          title: '🔧 Database Setup Needed',
          description: 'Go to Supabase Dashboard → SQL Editor and run the setup_database.sql script. Then try making your decision again!',
          duration: 8000
        })
        
        // Reset to allow user to try again after database setup
        setDecisionResult(null)
        setShowResult(false)
        setIsTimerActive(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, getValues, addToast, onDecisionComplete])

  const makeAutoDecision = useCallback(() => {
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
    
    console.log('AUTO-DECISION made:', result, 'Pros:', currentPros.length, 'Cons:', currentCons.length)
    setDecisionResult(result)
    setShowResult(true)
    setIsTimerActive(false)
    localStorage.removeItem(`decision-timer-${userId}`) // Clear saved state
    saveDecision(result)
  }, [userId, saveDecision])

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

  const startTimer = (data: DecisionForm) => {
    if (pros.length === 0 && cons.length === 0) {
      addToast({
        type: 'warning',
        title: 'Add Pros or Cons',
        description: 'Add at least one pro or con before starting the timer!'
      })
      return
    }
    
    // Question is now optional - set a default if empty
    if (!data.question || !data.question.trim()) {
      setValue('question', 'My decision')
    }
    
    setTimeRemaining(data.timerMinutes * 60)
    setIsTimerActive(true)
    
    addToast({
      type: 'info',
      title: '⏱️ Timer Started!',
      description: `${data.timerMinutes} minutes to decide. Stay focused!`,
      duration: 3000
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Determine which view to render
  const renderTimerView = isTimerActive && !showResult
  const renderConfidenceView = showConfidenceRating && !showFinalCelebration
  const renderActualDecisionView = showActualDecisionPrompt && !showConfidenceRating && !showFinalCelebration
  const renderFinalCelebration = showFinalCelebration || showResult

  // Full-screen timer view when active
  if (renderTimerView) {
    const totalTime = getValues().timerMinutes * 60
    const elapsed = totalTime - timeRemaining
    const progressPercent = (elapsed / totalTime) * 100
    const isLowTime = timeRemaining <= 60 // Last minute warning
    const isVeryLowTime = timeRemaining <= 30 // Last 30 seconds
    const isFinalCountdown = timeRemaining <= 10 // Final 10 seconds
    
    // Dynamic messaging based on time remaining (research-based psychological guidance)
    const getTimerMessage = () => {
      const minutes = Math.floor(timeRemaining / 60)
      
      if (isFinalCountdown) return '🚨 Time to decide! Go with your gut!'
      if (minutes >= 3) return '🤔 Take time to weigh your options carefully'
      if (minutes >= 1) return '💭 Trust your instincts - they\'re usually right'
      return '⚡ Time to decide! Go with your gut!'
    }
    
    
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl w-full text-center">
            {/* Enhanced Circular Progress Ring - Larger for Better Visibility */}
            <div className="relative mb-12 flex justify-center">
              <svg width="320" height="320" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke={isFinalCountdown ? '#dc2626' : isVeryLowTime ? '#ea580c' : isLowTime ? '#d97706' : '#2563eb'}
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-300"
                  initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 140 * (1 - progressPercent / 100),
                    filter: isFinalCountdown ? 'drop-shadow(0 0 20px #dc2626)' : isVeryLowTime ? 'drop-shadow(0 0 15px #ea580c)' : 'none'
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              {/* Enhanced Timer Display in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: isFinalCountdown ? [1, 1.15, 1] : isVeryLowTime ? [1, 1.08, 1] : 1
                  }}
                  transition={{ 
                    duration: isFinalCountdown ? 0.2 : 0.4,
                    repeat: (isFinalCountdown || isVeryLowTime) ? Infinity : 0
                  }}
                  className={`text-7xl md:text-8xl lg:text-9xl font-mono font-bold mb-4 transition-colors duration-300 ${
                    isFinalCountdown ? 'text-red-600' : 
                    isVeryLowTime ? 'text-orange-500' : 
                    isLowTime ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}
                  style={{ 
                    filter: isFinalCountdown ? 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))' : 'none',
                    textShadow: isFinalCountdown ? '0 0 20px rgba(220, 38, 38, 0.3)' : 'none'
                  }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>
                
                {/* Enhanced Contextual Messaging */}
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-xl md:text-2xl font-semibold mb-3 text-center px-4 ${
                    isFinalCountdown ? 'text-red-700' : 
                    isVeryLowTime ? 'text-orange-600' : 
                    isLowTime ? 'text-yellow-700' : 
                    'text-gray-700'
                  }`}
                >
                  {getTimerMessage()}
                </motion.div>
                
                <motion.p 
                  className="text-base md:text-lg text-gray-600 text-center px-6 max-w-xs"
                  animate={{ opacity: isFinalCountdown ? [1, 0.7, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isFinalCountdown ? Infinity : 0 }}
                >
                  {getValues().question || 'Your decision awaits'}
                </motion.p>
                
                {/* Progress Indicator */}
                <div className="mt-4 text-sm text-gray-500 text-center">
                  {Math.round(progressPercent)}% complete
                </div>
              </div>
            </div>


            {/* Quick Summary */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{pros.length}</div>
                  <div className="text-sm text-gray-500">Pros</div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{cons.length}</div>
                  <div className="text-sm text-gray-500">Cons</div>
                </div>
              </div>
              
              {pros.length > 0 && (
                <div className="mt-4 text-left">
                  <div className="text-sm font-medium text-green-700 mb-1">Top Pros:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {pros.slice(0, 3).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {cons.length > 0 && (
                <div className="mt-4 text-left">
                  <div className="text-sm font-medium text-red-700 mb-1">Top Cons:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {cons.slice(0, 3).map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons - Enhanced for Mobile Touch Targets */}
            <div className="flex flex-col gap-6 max-w-md mx-auto px-4">
              <motion.button
                onClick={() => {
                  setDecisionResult('YES')
                  setShowActualDecisionPrompt(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                  const timeSpent = getValues().timerMinutes * 60 - timeRemaining
                  updateStats(timeSpent, confidenceRating || undefined)
                }}
                className="w-full px-8 py-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-3xl text-xl md:text-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[88px] flex items-center justify-center gap-4 touch-manipulation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-4xl">✅</span>
                <span>I&apos;ve Decided: YES</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setDecisionResult('NO')
                  setShowActualDecisionPrompt(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                  const timeSpent = getValues().timerMinutes * 60 - timeRemaining
                  updateStats(timeSpent, confidenceRating || undefined)
                }}
                className="w-full px-8 py-8 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-3xl text-xl md:text-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[88px] flex items-center justify-center gap-4 touch-manipulation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-4xl">❌</span>
                <span>I&apos;ve Decided: NO</span>
              </motion.button>
            </div>

            {/* Timer Controls */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Extension Buttons */}
              {extensionsUsed < 2 && timeRemaining <= 60 && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    onClick={() => {
                      setTimeRemaining(prev => prev + 60)
                      setExtensionsUsed(prev => prev + 1)
                      addToast({
                        type: 'info',
                        title: '⏱️ +1 Minute Added',
                        description: `${2 - extensionsUsed - 1} extensions remaining`,
                        duration: 2000
                      })
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    ⏱️ +1 Min
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      setTimeRemaining(prev => prev + 30)
                      setExtensionsUsed(prev => prev + 1)
                      addToast({
                        type: 'info',
                        title: '⏱️ +30 Seconds Added',
                        description: `${2 - extensionsUsed - 1} extensions remaining`,
                        duration: 2000
                      })
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    ⏱️ +30 Sec
                  </motion.button>
                  
                  <span className="text-xs text-gray-500 self-center">
                    ({2 - extensionsUsed} left)
                  </span>
                </div>
              )}
              
              {/* Audio Toggle */}
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  audioEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
              </button>
              
              {/* Emergency Exit */}
              <motion.button
                onClick={() => {
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                  setExtensionsUsed(0)
                }}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
                whileHover={{ scale: 1.05 }}
              >
                Stop Timer & Go Back
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>
    )
  }

  // Confidence Rating Screen
  if (renderConfidenceView) {
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl w-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-6xl mb-4">🎯</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                How confident are you?
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                You decided: <strong className={`${actualDecision === 'YES' ? 'text-green-600' : actualDecision === 'NO' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {actualDecision === 'YES' ? 'YES, I&apos;ll do it!' : actualDecision === 'NO' ? 'NO, I won&apos;t do it' : 'MAYBE, I need more time'}
                </strong>
              </p>
              <p className="text-lg text-gray-500">
                Rate your confidence in this decision
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Confidence Rating Stars - Enhanced for Touch */}
              <div className="mb-6">
                <div className="flex justify-center gap-3 md:gap-4 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      onClick={() => setConfidenceRating(rating)}
                      className={`text-6xl md:text-7xl p-2 rounded-xl transition-all duration-200 touch-manipulation min-w-[60px] min-h-[60px] md:min-w-[80px] md:min-h-[80px] flex items-center justify-center ${
                        confidenceRating && rating <= confidenceRating
                          ? 'text-yellow-400 scale-110 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-300 hover:scale-105 hover:bg-yellow-25 active:bg-yellow-50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ⭐
                    </motion.button>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  {confidenceRating ? (
                    <span className="font-semibold">
                      {confidenceRating === 1 ? 'Very unsure - lots of doubt' :
                       confidenceRating === 2 ? 'Somewhat unsure - some doubt' :
                       confidenceRating === 3 ? 'Neutral - could go either way' :
                       confidenceRating === 4 ? 'Pretty confident - feels right' :
                       'Very confident - absolutely sure!'}
                    </span>
                  ) : (
                    'Tap the stars to rate your confidence'
                  )}
                </div>
              </div>
              
              {/* Continue Button */}
              <AnimatePresence>
                {confidenceRating && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      setShowFinalCelebration(true)
                      const finalDecision = actualDecision === 'MAYBE' ? decisionResult! : actualDecision as 'YES' | 'NO'
                      // Update stats with confidence rating
                      const timeSpent = getValues().timerMinutes * 60 - timeRemaining
                      updateStats(timeSpent, confidenceRating || undefined)
                      saveDecision(finalDecision)
                    }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue to Celebration 🎉
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            
            <p className="text-sm text-gray-500">
              Your confidence level helps us understand decision quality 📊
            </p>
          </div>
        </motion.div>
      </>
    )
  }

  // What did you decide? prompt screen
  if (renderActualDecisionView) {
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl w-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Great job avoiding overthinking!
              </h1>
              <p className="text-xl text-gray-600">
                Now, what did you actually decide?
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-700 mb-6">
                The timer suggested: <strong className={`${decisionResult === 'YES' ? 'text-green-600' : 'text-red-600'}`}>{decisionResult}</strong>
                <br />
                But what do YOU want to do?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                <motion.button
                  onClick={() => {
                    setActualDecision('YES')
                    setShowConfidenceRating(true)
                  }}
                  className="px-6 py-6 md:py-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[88px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl md:text-4xl mb-2">✅</div>
                  <div className="font-bold">YES</div>
                  <div className="text-sm opacity-90">I&apos;ll do it</div>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setActualDecision('NO')
                    setShowConfidenceRating(true)
                  }}
                  className="px-6 py-6 md:py-8 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[88px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl md:text-4xl mb-2">❌</div>
                  <div className="font-bold">NO</div>
                  <div className="text-sm opacity-90">I won&apos;t do it</div>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setActualDecision('MAYBE')
                    setShowConfidenceRating(true)
                  }}
                  className="px-6 py-6 md:py-8 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[88px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl md:text-4xl mb-2">🤔</div>
                  <div className="font-bold">MAYBE</div>
                  <div className="text-sm opacity-90">Need more time</div>
                </motion.button>
              </div>
            </motion.div>
            
            <p className="text-sm text-gray-500">
              Your honest choice helps us improve the app! 💡
            </p>
          </div>
        </motion.div>
      </>
    )
  }

  // Final celebration with stats and next actions
  if (renderFinalCelebration) {
    // Decision-specific psychological reinforcement messages
    const decisionMessages = {
      YES: {
        title: "Great Job Avoiding Overthinking! ✅",
        subtitle: "You Chose Progress",
        message: "Excellent! You trusted your instincts and made a decision to move forward. Studies show that people who act decisively experience less regret and more satisfaction than those who endlessly deliberate.",
        affirmation: "You've broken the overthinking cycle. Your gut knew what to do.",
        celebration: "🎉 Decision made in record time!",
        emoji: "🚀",
        gradient: "from-green-400 to-emerald-500"
      },
      NO: {
        title: "Great Job Avoiding Overthinking! ❌", 
        subtitle: "You Protected Your Boundaries",
        message: "Brilliant! You trusted your instincts and chose to protect your time and energy. This kind of decisive boundary-setting is a superpower that most people struggle to develop.",
        affirmation: "You've broken the overthinking cycle. Your gut knew this wasn't right.",
        celebration: "🎉 Decision made in record time!",
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
          <div className="text-lg font-semibold text-purple-600 mb-2">
            {currentMessage.celebration}
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

        {/* Confidence Celebration */}
        {confidenceRating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold text-gray-800">Confidence Level</h3>
            </div>
            
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  className={`text-3xl ${star <= confidenceRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            <p className="text-center text-gray-700 font-medium">
              {confidenceRating === 1 ? '🤔 It\'s okay to have doubts - you made a decision!' :
               confidenceRating === 2 ? '💭 Some uncertainty is normal - trust your process!' :
               confidenceRating === 3 ? '⚖️ Balanced feelings - you weighed the options!' :
               confidenceRating === 4 ? '💪 Strong confidence - great decision-making!' :
               '🔥 Maximum confidence - you nailed it!'}
            </p>
            
            {confidenceRating >= 4 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ delay: 1, repeat: 2 }}
                className="text-center mt-3"
              >
                <span className="text-2xl">🏆</span>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
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
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 relative">
          {/* Stats Button - Floating */}
          <motion.button
            onClick={() => setShowStatsPopover(!showStatsPopover)}
            className="absolute top-4 right-4 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">📊</span>
          </motion.button>

          {/* Stats Popover */}
          <AnimatePresence>
            {showStatsPopover && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-white/20 p-6 z-20"
              >
                {(() => {
                  const stats = getStats()
                  return (
                    <div>
                      {/* Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Your Decision Stats</h3>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <span className="text-lg font-semibold text-purple-600">Level {stats.level}</span>
                        </div>
                        
                        {/* XP Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress to Level {stats.level + 1}</span>
                            <span>{stats.xpProgress}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(stats.xpProgress / 10) * 100}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Key Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600">{stats.todayCount}</div>
                          <div className="text-xs text-blue-600">Today</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">{stats.totalDecisions}</div>
                          <div className="text-xs text-green-600">Total</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-xl">
                          <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                          <div className="text-xs text-orange-600">Streak</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageTime/60)}m</div>
                          <div className="text-xs text-purple-600">Avg Time</div>
                        </div>
                      </div>

                      {/* Achievements */}
                      {stats.achievements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Achievements</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {stats.achievements.slice(-4).map((achievement, idx) => (
                              <motion.div
                                key={achievement.name}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                              >
                                <span className="text-lg">{achievement.icon}</span>
                                <span className="text-xs font-medium text-yellow-800">{achievement.name}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confidence Rating */}
                      {stats.averageConfidence > 0 && (
                        <div className="text-center p-3 bg-indigo-50 rounded-xl mb-4">
                          <div className="flex justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star}
                                className={`text-lg ${star <= Math.round(stats.averageConfidence) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-indigo-600">Average Confidence</div>
                        </div>
                      )}
                      
                      {/* Close Button */}
                      <button
                        onClick={() => setShowStatsPopover(false)}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>

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
          {/* Enhanced Home Screen with Value Proposition */}
          {!selectedTemplate && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Header Section with Clear Value Proposition */}
              <div className="text-center space-y-8 mb-16">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 bg-clip-text text-transparent leading-tight"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Stop Overthinking, Start Deciding ⏰
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Combat analysis paralysis with timed decision-making
                </motion.p>
                
                {/* How It Works Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-4xl mx-auto border border-blue-100"
                >
                  <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700 mb-4">
                    <span className="text-2xl">✨</span>
                    <span className="font-semibold">How it works:</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-base md:text-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                      <span>Choose a template</span>
                    </div>
                    <div className="hidden md:block text-blue-400">→</div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                      <span>Set your timer</span>
                    </div>
                    <div className="hidden md:block text-purple-400">→</div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                      <span>Decide when time&apos;s up</span>
                    </div>
                  </div>
                </motion.div>

                {/* Social Proof Stats */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-gray-600"
                >
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-600">10,000+</div>
                    <div className="text-sm md:text-base">People making faster decisions</div>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600">4.2 min</div>
                    <div className="text-sm md:text-base">Average decision time</div>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-teal-600">90%</div>
                    <div className="text-sm md:text-base">Feel more confident</div>
                  </div>
                </motion.div>
              </div>

              {/* Template Selection Instructions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Choose Your Decision Type
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Pick a template that matches your situation, or create a custom decision
                </p>
              </motion.div>
              
              {/* Organized Template Categories */}
              <div className="space-y-12">
                {/* Daily Life - Most Popular Section */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      🌟 Daily Life Decisions
                    </h3>
                    <p className="text-gray-600">Most common decisions that people overthink</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                    {/* Featured larger cards for popular templates */}
                    {decisionTemplates.filter(t => ['restaurant', 'menu', 'purchase'].includes(t.id)).map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          setValue('question', template.question)
                          setValue('timerMinutes', template.time)
                          setPros(template.pros)
                          setCons(template.cons)
                        }}
                        className={`p-8 md:p-10 bg-gradient-to-br ${template.color} rounded-3xl border-2 border-transparent hover:border-white/50 active:border-white/70 transition-all duration-300 text-center group hover:shadow-2xl active:shadow-3xl min-h-[200px] md:min-h-[220px] touch-manipulation relative overflow-hidden`}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Subtle background pattern */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10">
                          <div className="text-6xl md:text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            {template.icon}
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 drop-shadow-sm">
                            {template.title}
                          </h3>
                          <p className="text-white/90 mb-4 text-base md:text-lg">
                            {template.description}
                          </p>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold text-white border border-white/30">
                            {template.time} min timer • Most Popular
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Social & Communication */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      💬 Social & Communication
                    </h3>
                    <p className="text-gray-600">Navigate relationships and social situations</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                    {decisionTemplates.filter(t => ['text', 'cancel', 'stayout'].includes(t.id)).map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          setValue('question', template.question)
                          setValue('timerMinutes', template.time)
                          setPros(template.pros)
                          setCons(template.cons)
                        }}
                        className={`p-6 md:p-8 bg-gradient-to-br ${template.color} rounded-2xl border-2 border-transparent hover:border-indigo-300 active:border-indigo-400 transition-all duration-200 text-center group hover:shadow-lg active:shadow-xl min-h-[170px] md:min-h-[190px] touch-manipulation`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                          {template.icon}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 drop-shadow-sm">
                          {template.title}
                        </h3>
                        <p className="text-white/90 mb-3 text-sm md:text-base">
                          {template.description}
                        </p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-semibold text-white border border-white/30">
                          {template.time} min timer
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Personal Choices */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      🎭 Personal Choices
                    </h3>
                    <p className="text-gray-600">Style, entertainment, and lifestyle decisions</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                    {decisionTemplates.filter(t => ['outfit', 'entertainment'].includes(t.id)).map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          setValue('question', template.question)
                          setValue('timerMinutes', template.time)
                          setPros(template.pros)
                          setCons(template.cons)
                        }}
                        className={`p-6 md:p-8 bg-gradient-to-br ${template.color} rounded-2xl border-2 border-transparent hover:border-indigo-300 active:border-indigo-400 transition-all duration-200 text-center group hover:shadow-lg active:shadow-xl min-h-[170px] md:min-h-[190px] touch-manipulation`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                          {template.icon}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 drop-shadow-sm">
                          {template.title}
                        </h3>
                        <p className="text-white/90 mb-3 text-sm md:text-base">
                          {template.description}
                        </p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-semibold text-white border border-white/30">
                          {template.time} min timer
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Custom & Work */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      💼 Work & Custom
                    </h3>
                    <p className="text-gray-600">Professional decisions and custom scenarios</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                    {decisionTemplates.filter(t => ['meeting', 'task', 'email', 'delegate', 'custom'].includes(t.id)).map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          if (template.id === 'custom') {
                            setShowCustomInput(true)
                          } else {
                            setValue('question', template.question)
                            setValue('timerMinutes', template.time)
                            setPros(template.pros)
                            setCons(template.cons)
                          }
                        }}
                        className={`p-6 md:p-8 bg-gradient-to-br ${template.color || 'from-gray-50 to-gray-100'} rounded-2xl border-2 border-transparent hover:border-indigo-300 active:border-indigo-400 transition-all duration-200 text-center group hover:shadow-lg active:shadow-xl min-h-[170px] md:min-h-[190px] touch-manipulation`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                          {template.icon}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                          {template.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600">
                          {template.time} min timer
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Helpful Footer with Tips */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="mt-16 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl border border-gray-200 text-center max-w-4xl mx-auto"
              >
                <div className="text-3xl mb-4">💡</div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  Decision-Making Tip
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Most decisions don&apos;t need perfect analysis - just good enough choices made quickly.
                  <br />
                  <span className="font-semibold text-blue-600">Research shows that time pressure often leads to better decisions.</span>
                </p>
                
                <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Reduces overthinking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Builds confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Saves mental energy</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Custom Decision Input - Only for Custom Template */}
          {selectedTemplate === 'custom' && showCustomInput && (
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setShowCustomInput(false)
                    setValue('question', '')
                    setPros([])
                    setCons([])
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
                >
                  ← Back
                </button>
                <label className="text-xl font-bold text-gray-800">
                  What&apos;s your decision?
                </label>
              </div>
              <div className="relative">
                <input
                  {...register('question')}
                  disabled={isTimerActive}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl bg-white/90"
                  placeholder="e.g., Should I accept this job offer?"
                  autoFocus
                  onChange={(e) => {
                    setValue('question', e.target.value)
                    if (e.target.value.trim().length > 10) {
                      const suggestions = analyzeCustomDecision(e.target.value)
                      setAiSuggestions(suggestions)
                      setShowSuggestions(true)
                    } else {
                      setShowSuggestions(false)
                    }
                  }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-2xl">🤔</span>
                </div>
              </div>
              
              {/* AI Suggestions */}
              <AnimatePresence>
                {showSuggestions && aiSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🤖</span>
                      <h3 className="font-semibold text-gray-800">
                        {aiSuggestions.suggestedTemplate ? 
                          `Looks like: ${aiSuggestions.templateName}` : 
                          'Smart Suggestions'
                        }
                      </h3>
                    </div>
                    
                    {aiSuggestions.suggestedTemplate && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800">
                          💡 We have a specific template for this! 
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(aiSuggestions.suggestedTemplate)
                              const template = decisionTemplates.find(t => t.id === aiSuggestions.suggestedTemplate)
                              if (template) {
                                setValue('question', template.question)
                                setValue('timerMinutes', template.time)
                                setPros([...template.pros])
                                setCons([...template.cons])
                                setShowSuggestions(false)
                                addToast({
                                  type: 'success',
                                  title: '✨ Template Applied!',
                                  description: `Switched to ${template.title} template`,
                                  duration: 3000
                                })
                              }
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-700 font-medium underline"
                          >
                            Use Template Instead
                          </button>
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Suggested Pros:</h4>
                        <div className="space-y-1">
                          {aiSuggestions.pros.map((pro, idx) => (
                            <div key={idx} className="text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                              {pro}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Suggested Cons:</h4>
                        <div className="space-y-1">
                          {aiSuggestions.cons.map((con, idx) => (
                            <div key={idx} className="text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                              {con}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-gray-600 mb-3">
                      💡 Recommended time: <strong>{aiSuggestions.time} minutes</strong>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('timerMinutes', aiSuggestions.time)
                          setPros([...aiSuggestions.pros])
                          setCons([...aiSuggestions.cons])
                          setShowSuggestions(false)
                          addToast({
                            type: 'success',
                            title: '🤖 AI Suggestions Applied!',
                            description: `Set ${aiSuggestions.time}min timer with smart pros/cons`,
                            duration: 3000
                          })
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all duration-200"
                      >
                        ✨ Use These Suggestions
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        className="px-4 py-2 text-gray-600 font-medium text-sm hover:text-gray-800 transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* Selected Template Display */}
          {selectedTemplate && selectedTemplate !== 'custom' && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {decisionTemplates.find(t => t.id === selectedTemplate)?.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {decisionTemplates.find(t => t.id === selectedTemplate)?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getValues().question}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setValue('question', '')
                    setPros([])
                    setCons([])
                    setValue('timerMinutes', 10)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Change
                </button>
              </div>
            </motion.div>
          )}

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

          {/* Pros/Cons Grid - Only show after template selection */}
          {selectedTemplate && (
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
                  Pros ({pros.length}/3) {pros.length >= 3 && '✓'}
                </h3>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    value={currentPro}
                    onChange={(e) => setCurrentPro(e.target.value)}
                    disabled={isTimerActive || pros.length >= 3}
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
                  disabled={isTimerActive || !currentPro.trim() || pros.length >= 3}
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
                  Cons ({cons.length}/3) {cons.length >= 3 && '✓'}
                </h3>
                <div className="text-2xl">❌</div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    value={currentCon}
                    onChange={(e) => setCurrentCon(e.target.value)}
                    disabled={isTimerActive || cons.length >= 3}
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
                  disabled={isTimerActive || !currentCon.trim() || cons.length >= 3}
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
          )}

        {/* Timer Selection - Only show after template selection */}
        <AnimatePresence>
          {!isTimerActive && selectedTemplate && (
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
                    const questionLength = (watchedQuestion || '').length
                    
                    if (totalItems >= 8 || questionLength > 100) {
                      return "This seems complex - try 15 minutes for thorough thinking."
                    } else if (totalItems <= 4 && questionLength < 30) {
                      return "Simple decision - 5 minutes should be plenty!"
                    } else {
                      return "Balanced approach - 10 minutes works well for most decisions."
                    }
                  })()}
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
            disabled={!selectedTemplate || (pros.length === 0 && cons.length === 0) || (selectedTemplate === 'custom' && !watchedQuestion?.trim())}
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
                  console.log('🟢 MANUAL YES CLICKED at', new Date().toISOString())
                  setDecisionResult('YES')
                  setShowResult(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                  saveDecision('YES')
                  console.log('🟢 MANUAL YES - Going directly to result')
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Decide YES Now
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('🔴 MANUAL NO CLICKED at', new Date().toISOString())
                  setDecisionResult('NO')
                  setShowResult(true)
                  setIsTimerActive(false)
                  localStorage.removeItem(`decision-timer-${userId}`)
                  saveDecision('NO')
                  console.log('🔴 MANUAL NO - Going directly to result')
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