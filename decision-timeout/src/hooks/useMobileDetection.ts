'use client'

import { useState, useEffect } from 'react'

interface MobileDetectionResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  hasTouch: boolean
  orientation: 'portrait' | 'landscape' | null
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false, 
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    hasTouch: false,
    orientation: null,
    screenSize: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDetection = () => {
      const userAgent = navigator.userAgent
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Device detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)
      const isMobile = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent) && !isTablet
      const isDesktop = !isMobile && !isTablet
      
      // PWA detection
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   (window.navigator as any).standalone === true ||
                   document.referrer.includes('android-app://')
      
      // Orientation detection
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      
      // Screen size detection
      const width = window.innerWidth
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      if (width < 640) screenSize = 'xs'
      else if (width < 768) screenSize = 'sm'
      else if (width < 1024) screenSize = 'md'
      else if (width < 1280) screenSize = 'lg'
      else screenSize = 'xl'

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isPWA,
        hasTouch,
        orientation,
        screenSize
      })
    }

    // Initial detection
    updateDetection()

    // Listen for orientation/resize changes
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)

    return () => {
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return detection
}