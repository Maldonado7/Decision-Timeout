'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-hide offline message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOfflineMessage])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-sm text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="flex-shrink-0"
            >
              <path 
                d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z" 
                fill="currentColor"
              />
              <path 
                d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z" 
                fill="currentColor"
              />
              <path 
                d="M9 17l2 2c.55-.55 1.45-.55 2 0l2-2C13.79 15.79 10.21 15.79 9 17z" 
                fill="currentColor"
              />
              <path 
                d="M12 21h.01" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <line 
                x1="1" 
                y1="1" 
                x2="23" 
                y2="23" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            <span>You&apos;re offline. Some features may be limited.</span>
          </div>
        </motion.div>
      )}
      
      {isOnline && showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-sm text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="flex-shrink-0"
            >
              <path 
                d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z" 
                fill="currentColor"
              />
              <path 
                d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z" 
                fill="currentColor"
              />
              <path 
                d="M9 17l2 2c.55-.55 1.45-.55 2 0l2-2C13.79 15.79 10.21 15.79 9 17z" 
                fill="currentColor"
              />
              <circle 
                cx="12" 
                cy="21" 
                r="1" 
                fill="currentColor"
              />
            </svg>
            <span>Back online! All features restored.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}