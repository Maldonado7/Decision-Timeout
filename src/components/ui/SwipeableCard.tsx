'use client'

import { ReactNode, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  leftColor?: string
  rightColor?: string
  leftLabel?: string
  rightLabel?: string
  disabled?: boolean
  className?: string
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftIcon,
  rightIcon,
  leftColor = '#ef4444',
  rightColor = '#22c55e',
  leftLabel = 'Delete',
  rightLabel = 'Archive',
  disabled = false,
  className = ''
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const { click, selection } = useHapticFeedback()
  const constraintsRef = useRef(null)
  
  // Transform values for background colors and opacity
  const leftBackground = useTransform(x, [-150, -50, 0], [1, 0.8, 0])
  const rightBackground = useTransform(x, [0, 50, 150], [0, 0.8, 1])
  
  const leftOpacity = useTransform(x, [-150, -50, 0], [1, 1, 0])
  const rightOpacity = useTransform(x, [0, 50, 150], [0, 1, 1])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold && onSwipeRight) {
      click()
      onSwipeRight()
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      click()
      onSwipeLeft()
    }
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return
    
    // Haptic feedback when approaching threshold
    const threshold = 80
    if (Math.abs(info.offset.x) > threshold) {
      selection()
    }
  }

  if (disabled) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div ref={constraintsRef} className={`relative overflow-hidden ${className}`}>
      {/* Left action background */}
      {onSwipeLeft && (
        <motion.div
          className="absolute inset-y-0 left-0 right-0 flex items-center justify-start pl-4"
          style={{
            backgroundColor: leftColor,
            opacity: leftBackground
          }}
        >
          <motion.div
            className="flex items-center space-x-2 text-white"
            style={{ opacity: leftOpacity }}
          >
            {leftIcon}
            <span className="font-medium text-sm">{leftLabel}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Right action background */}
      {onSwipeRight && (
        <motion.div
          className="absolute inset-y-0 left-0 right-0 flex items-center justify-end pr-4"
          style={{
            backgroundColor: rightColor,
            opacity: rightBackground
          }}
        >
          <motion.div
            className="flex items-center space-x-2 text-white"
            style={{ opacity: rightOpacity }}
          >
            <span className="font-medium text-sm">{rightLabel}</span>
            {rightIcon}
          </motion.div>
        </motion.div>
      )}

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing touch-manipulation"
      >
        {children}
      </motion.div>
    </div>
  )
}