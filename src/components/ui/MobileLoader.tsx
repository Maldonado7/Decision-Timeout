'use client'

import { motion } from 'framer-motion'

interface MobileLoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function MobileLoader({ message = 'Loading...', size = 'md' }: MobileLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]" role="status" aria-live="polite">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full mb-4`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 text-sm sm:text-base text-center"
        aria-label={message}
      >
        {message}
      </motion.p>
      <span className="sr-only">Loading content</span>
    </div>
  )
}