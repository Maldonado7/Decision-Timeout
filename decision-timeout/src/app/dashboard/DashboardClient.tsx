'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import DecisionCreator from '@/components/decision/DecisionCreator'
import { Decision } from '@/lib/supabase'

interface DashboardClientProps {
  userId: string
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [latestDecision, setLatestDecision] = useState<Decision | null>(null)

  const handleDecisionComplete = useCallback((decision: Decision) => {
    setLatestDecision(decision)
    setShowSuccess(true)
    
    // Hide success message after 3 seconds and reset form
    setTimeout(() => {
      setShowSuccess(false)
      setLatestDecision(null)
      // Trigger a page reload to reset the DecisionCreator component
      window.location.reload()
    }, 3000)
  }, [])

  if (showSuccess && latestDecision) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md mx-auto relative overflow-hidden"
          initial={{ scale: 0.5, rotateY: -90 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2 
          }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 animate-pulse"></div>
          
          <motion.div 
            className="text-6xl mb-6 relative z-10"
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              delay: 0.5,
              repeat: 2
            }}
          >
            🎉
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Decision Saved!
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 mb-6 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Your decision has been locked for 30 days.
          </motion.p>
          
          <motion.div 
            className={`text-6xl font-black mb-6 relative ${
              latestDecision.result === 'YES' 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 1.2 
            }}
          >
            <motion.div
              animate={{ 
                textShadow: [
                  "0 0 20px currentColor",
                  "0 0 40px currentColor", 
                  "0 0 20px currentColor"
                ]
              }}
              transition={{ duration: 2, repeat: 1, delay: 1.5 }}
            >
              {latestDecision.result}
            </motion.div>
          </motion.div>
          
          <motion.div
            className="flex items-center justify-center gap-2 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <p className="text-sm ml-2">
              Preparing next decision...
            </p>
          </motion.div>
          
          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${
                  i % 4 === 0 ? 'bg-yellow-400' :
                  i % 4 === 1 ? 'bg-pink-400' :
                  i % 4 === 2 ? 'bg-blue-400' :
                  'bg-green-400'
                } rounded-full`}
                initial={{ 
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  rotate: 0
                }}
                animate={{
                  x: `${Math.random() * 200 - 100}%`,
                  y: `${Math.random() * 200 - 100}%`,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  delay: 1.3 + Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <DecisionCreator 
      userId={userId}
      onDecisionComplete={handleDecisionComplete}
    />
  )
}