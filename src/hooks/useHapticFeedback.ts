'use client'

export interface HapticFeedbackOptions {
  pattern?: number | number[]
  enabled?: boolean
}

export function useHapticFeedback() {
  const vibrate = (options: HapticFeedbackOptions = {}) => {
    const { pattern = 10, enabled = true } = options
    
    // Check if vibration is supported and enabled
    if (!enabled || !('vibrate' in navigator)) {
      return
    }
    
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not supported:', error)
    }
  }

  // Predefined haptic patterns for common interactions
  const patterns = {
    light: () => vibrate({ pattern: 1 }),
    medium: () => vibrate({ pattern: 10 }),
    heavy: () => vibrate({ pattern: 50 }),
    success: () => vibrate({ pattern: [10, 50, 10] }),
    error: () => vibrate({ pattern: [50, 50, 50] }),
    warning: () => vibrate({ pattern: [25, 25, 25] }),
    click: () => vibrate({ pattern: 1 }),
    longPress: () => vibrate({ pattern: [10, 100, 10] }),
    selection: () => vibrate({ pattern: 5 }),
    notification: () => vibrate({ pattern: [100, 50, 100] })
  }

  return {
    vibrate,
    ...patterns
  }
}