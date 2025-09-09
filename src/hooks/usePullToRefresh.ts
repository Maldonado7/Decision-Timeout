'use client'

import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  disabled?: boolean
}

export function usePullToRefresh({ 
  onRefresh, 
  threshold = 60,
  disabled = false 
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const startY = useRef(0)
  const currentY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled) return

    const container = containerRef.current
    if (!container) return

    let isAtTop = true

    const checkScrollPosition = () => {
      isAtTop = window.scrollY <= 0 && container.scrollTop <= 0
    }

    const handleTouchStart = (e: TouchEvent) => {
      checkScrollPosition()
      if (!isAtTop) return
      
      startY.current = e.touches[0].clientY
      setIsPulling(true)
      
      // Haptic feedback for touch start
      if ('vibrate' in navigator) {
        navigator.vibrate(1)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || !isAtTop) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)
      
      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance * 0.5, threshold * 1.5))
        
        // Haptic feedback when approaching threshold
        if (distance > threshold * 0.8 && 'vibrate' in navigator) {
          navigator.vibrate(2)
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      setIsPulling(false)
      
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        
        // Strong haptic feedback for refresh trigger
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 50, 10])
        }
        
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      
      setPullDistance(0)
      startY.current = 0
      currentY.current = 0
    }

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('scroll', checkScrollPosition, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('scroll', checkScrollPosition)
    }
  }, [onRefresh, threshold, disabled, isPulling, pullDistance, isRefreshing])

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    canRefresh: pullDistance >= threshold
  }
}