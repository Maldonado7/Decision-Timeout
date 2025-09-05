'use client'

import { useState, useCallback, useEffect } from 'react'
import { AppError, logError, getErrorMessage, withRetry, safeAsync } from '@/lib/errorHandling'

interface UseErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: AppError) => void
}

interface ErrorState {
  error: AppError | null
  isRetrying: boolean
  retryCount: number
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, onError } = options
  
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  })

  const handleError = useCallback((error: Error | AppError, context?: Record<string, unknown>) => {
    const appError: AppError = 'code' in error ? error : {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      originalError: error,
      timestamp: new Date(),
      context
    }

    logError(appError, context)
    setErrorState(prev => ({ ...prev, error: appError }))
    onError?.(appError)
  }, [onError])

  const clearError = useCallback(() => {
    setErrorState({ error: null, isRetrying: false, retryCount: 0 })
  }, [])

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (errorState.retryCount >= maxRetries) return

    setErrorState(prev => ({ 
      ...prev, 
      isRetrying: true, 
      retryCount: prev.retryCount + 1 
    }))

    try {
      await withRetry(operation, {
        maxRetries: 1,
        delay: retryDelay
      })
      clearError()
    } catch (error) {
      handleError(error as Error)
    } finally {
      setErrorState(prev => ({ ...prev, isRetrying: false }))
    }
  }, [errorState.retryCount, maxRetries, retryDelay, handleError, clearError])

  const safeExecute = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T | null> => {
    const result = await safeAsync(operation, context)
    
    if (result.error) {
      handleError(result.error as AppError, context)
      return null
    }
    
    return result.data || null
  }, [handleError])

  return {
    error: errorState.error,
    errorMessage: errorState.error ? getErrorMessage(errorState.error) : null,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry: errorState.retryCount < maxRetries,
    handleError,
    clearError,
    retry,
    safeExecute
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  )
  
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
      setConnectionType(connection.effectiveType || 'unknown')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return { isOnline, connectionType }
}

interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: AppError) => void
  immediate?: boolean
  dependencies?: React.DependencyList
}

export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  const { onSuccess, onError, immediate = false, dependencies = [] } = options
  
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: AppError | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const { handleError } = useErrorHandler({ onError })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const result = await safeAsync(operation)
    
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error! }))
      handleError(result.error as AppError)
    } else {
      setState({ data: result.data!, loading: false, error: null })
      onSuccess?.(result.data!)
    }
  }, [operation, onSuccess, handleError])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute, ...dependencies])

  return {
    ...state,
    execute,
    reset,
    retry: () => execute()
  }
}