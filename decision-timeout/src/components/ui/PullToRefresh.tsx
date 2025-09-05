'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  disabled?: boolean
  threshold?: number
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false, 
  threshold = 60 
}: PullToRefreshProps) {
  const { 
    containerRef, 
    isPulling, 
    pullDistance, 
    isRefreshing, 
    canRefresh 
  } = usePullToRefresh({ 
    onRefresh, 
    threshold, 
    disabled 
  })

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isPulling ? Math.min(pullDistance / threshold, 1) : 1,
            scale: isPulling ? Math.min(0.8 + (pullDistance / threshold) * 0.2, 1) : 1
          }}
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
          style={{ 
            transform: `translateY(${Math.min(pullDistance * 0.5, threshold * 0.75)}px)` 
          }}
        >
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full
            transition-colors duration-200
            ${canRefresh || isRefreshing 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {isRefreshing ? (
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </motion.svg>
            ) : (
              <motion.svg
                animate={{ 
                  rotate: canRefresh ? 180 : 0,
                  scale: isPulling ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        animate={{
          y: isPulling ? Math.min(pullDistance * 0.3, threshold * 0.5) : 0
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  )
}