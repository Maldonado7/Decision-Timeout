'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

export function DecisionCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function NavigationSkeleton() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading your decisions...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationSkeleton />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">{message}</p>
          <div className="space-y-2 max-w-sm mx-auto">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const defaultIcon = (
    <svg 
      className="w-12 h-12 text-gray-400 mx-auto" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
      />
    </svg>
  )

  return (
    <div className="text-center py-12 px-4">
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  className?: string
}

export function ErrorFallback({ error, resetError, className = '' }: ErrorFallbackProps) {
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-red-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-4">
        {error?.message || 'An unexpected error occurred while loading this content.'}
      </p>
      
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

interface NetworkStatusProps {
  isOnline: boolean
  className?: string
}

export function NetworkStatus({ isOnline, className = '' }: NetworkStatusProps) {
  if (isOnline) {
    return null
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <svg 
          className="w-5 h-5 text-yellow-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
        <p className="text-yellow-800 text-sm">
          No internet connection. Some features may be limited.
        </p>
      </div>
    </div>
  )
}

interface RetryableErrorProps {
  error: Error
  onRetry: () => void
  retryCount: number
  maxRetries: number
  className?: string
}

export function RetryableError({ 
  error, 
  onRetry, 
  retryCount, 
  maxRetries, 
  className = '' 
}: RetryableErrorProps) {
  const canRetry = retryCount < maxRetries

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <svg 
          className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        <div className="flex-1">
          <h4 className="text-red-800 font-medium mb-1">Operation Failed</h4>
          <p className="text-red-700 text-sm mb-3">{error.message}</p>
          
          {canRetry ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again ({maxRetries - retryCount} attempts left)
              </button>
              <span className="text-red-600 text-xs">
                Attempt {retryCount + 1} of {maxRetries + 1}
              </span>
            </div>
          ) : (
            <p className="text-red-600 text-sm">
              Maximum retry attempts reached. Please refresh the page or try again later.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}