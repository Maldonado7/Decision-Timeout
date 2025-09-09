'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) {
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Handle beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after user has used app for a bit
      setTimeout(() => {
        setIsVisible(true)
      }, 10000) // Show after 10 seconds
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For iOS, show manual prompt after delay
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setTimeout(() => {
        setIsVisible(true)
      }, 15000) // Show after 15 seconds on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return

    if (deferredPrompt) {
      // Chrome/Android install
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't render anything until client-side hydration is complete
  if (!hasMounted || isInstalled) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm mx-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-white"
                >
                  <path 
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">
                Install Decision Timeout
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isIOS 
                  ? "Add to your home screen for quick access!"
                  : "Get faster access and work offline!"
                }
              </p>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            {isIOS ? (
              <div className="flex-1">
                <div className="text-xs text-gray-600 space-y-1">
                  <p>1. Tap <span className="font-semibold">Share</span> button</p>
                  <p>2. Select <span className="font-semibold">&quot;Add to Home Screen&quot;</span></p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Install App
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}