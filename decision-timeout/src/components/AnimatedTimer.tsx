'use client'

import { useEffect, useState } from 'react'

export function AnimatedTimer() {
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // Auto-start the demo timer
    const startTimer = () => {
      setIsRunning(true)
      setTimeRemaining(300) // Reset to 5 minutes
    }

    // Start immediately
    startTimer()

    // Restart every 18 seconds (15 seconds countdown + 3 seconds pause)
    const interval = setInterval(() => {
      startTimer()
    }, 18000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(timer)
  }, [isRunning, timeRemaining])

  // Calculate progress percentage
  const totalTime = 300 // 5 minutes
  const progress = ((totalTime - timeRemaining) / totalTime) * 100

  // Exact color progression: Blue → Purple → Orange as specified
  const getColor = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    
    // Cool Blue: 5:00 - 3:00 (180+ seconds)
    if (timeRemaining > 180) return '#3B82F6' // Cool Blue
    
    // Energetic Purple: 3:00 - 1:00 (60-180 seconds) 
    if (timeRemaining > 60) return '#8B5CF6' // Purple
    
    // Urgent Orange/Red: 1:00 - 0:00 (0-60 seconds)
    if (timeRemaining > 30) return '#F59E0B' // Orange
    
    // Final urgent red for last 30 seconds
    return '#EF4444' // Red
  }

  // Enhanced glow color for effects
  const getGlowColor = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    
    if (minutes >= 3) return 'rgba(59, 130, 246, 0.4)' // Blue glow
    if (minutes >= 2) return 'rgba(99, 102, 241, 0.4)' // Indigo glow
    if (minutes >= 1) return 'rgba(139, 92, 246, 0.4)' // Purple glow
    if (seconds > 30) return 'rgba(168, 85, 247, 0.4)' // Light purple glow
    if (seconds > 10) return 'rgba(245, 158, 11, 0.5)' // Orange glow
    return 'rgba(239, 68, 68, 0.6)' // Red glow
  }

  // Get message based on time remaining  
  const getMessage = () => {
    if (timeRemaining === 0) return 'Time to Decide!'
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Pulse effect for final seconds
  const shouldPulse = timeRemaining <= 30 && timeRemaining > 0
  const shouldShake = timeRemaining <= 10 && timeRemaining > 0

  const currentColor = getColor()

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Enhanced outer glow effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            shouldPulse ? 'scale-125 opacity-60' : 'scale-110 opacity-30'
          }`}
          style={{ backgroundColor: currentColor, filter: 'blur(40px)', opacity: 0.4 }}
        />
        
        {/* Secondary glow ring */}
        <div 
          className={`absolute inset-4 rounded-full transition-all duration-300 ${
            shouldPulse ? 'opacity-40' : 'opacity-20'
          }`}
          style={{ backgroundColor: currentColor, filter: 'blur(20px)' }}
        />
        
        {/* Main timer circle - Exactly 300px as specified */}
        <div 
          className={`relative transition-all duration-500 ${
            shouldShake ? 'animate-bounce' : shouldPulse ? 'animate-pulse' : ''
          }`}
          style={{ width: '300px', height: '300px' }}
        >
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
              className="backdrop-blur-sm"
            />
            
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={currentColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-100 ease-linear"
              style={{
                filter: shouldPulse ? `drop-shadow(0 0 20px ${currentColor})` : 'none'
              }}
            />
          </svg>

          {/* Timer Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div 
              className={`text-6xl font-mono font-black mb-4 transition-all duration-300 ${
                shouldShake ? 'animate-bounce' : shouldPulse ? 'animate-pulse' : ''
              }`}
              style={{ 
                textShadow: shouldPulse ? `0 0 20px ${currentColor}` : `0 0 10px rgba(0,0,0,0.4)`,
                color: timeRemaining === 0 ? '#EF4444' : 'white'
              }}
            >
              {getMessage()}
            </div>
            
            {timeRemaining === 0 && (
              <div className="text-2xl font-bold text-red-400 animate-pulse">
                Make your choice!
              </div>
            )}
          </div>

          {/* Floating particles effect */}
          {shouldPulse && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-ping"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}