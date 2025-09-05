import React from 'react'
import { motion } from 'framer-motion'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400'
  }
  
  const combinedClasses = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`.trim()
  
  return (
    <svg 
      className={combinedClasses}
      fill="none" 
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading...', 
  size = 'md' 
}) => {
  if (!isVisible) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 max-w-sm mx-4"
      >
        <Spinner size={size} />
        <p className="text-gray-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  )
}

export interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  isLoading, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {children}
    </div>
  )
}

export interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => {
  const roundedClass = rounded ? 'rounded-full' : 'rounded'
  
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${width} ${height} ${roundedClass} ${className}`}
      role="status"
      aria-label="Loading content"
    />
  )
}

export interface PulseProps {
  children: React.ReactNode
  className?: string
}

const Pulse: React.FC<PulseProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export { Spinner, LoadingOverlay, LoadingButton, Skeleton, Pulse }