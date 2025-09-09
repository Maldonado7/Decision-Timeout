/**
 * Enhanced error handling utilities for the Decision Timeout app
 */

export interface AppError {
  code: string
  message: string
  originalError?: Error
  timestamp: Date
  context?: Record<string, unknown>
}

export class DecisionTimeoutError extends Error {
  public code: string
  public originalError?: Error
  public timestamp: Date
  public context?: Record<string, unknown>

  constructor(code: string, message: string, originalError?: Error, context?: Record<string, unknown>) {
    super(message)
    this.name = 'DecisionTimeoutError'
    this.code = code
    this.originalError = originalError
    this.timestamp = new Date()
    this.context = context
  }
}

export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  
  // Decision errors
  DECISION_NOT_FOUND: 'DECISION_NOT_FOUND',
  DECISION_LOCKED: 'DECISION_LOCKED',
  INVALID_DECISION_DATA: 'INVALID_DECISION_DATA',
  
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * Enhanced async wrapper with retry logic and detailed error handling
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoffMultiplier?: number
    retryCondition?: (error: Error) => boolean
    onRetry?: (attempt: number, error: Error) => void
    context?: Record<string, unknown>
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    retryCondition = () => true,
    onRetry,
    context = {}
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw new DecisionTimeoutError(
          ERROR_CODES.UNKNOWN_ERROR,
          `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
          lastError,
          { ...context, attempts: attempt + 1 }
        )
      }

      onRetry?.(attempt + 1, lastError)

      // Wait with exponential backoff
      const waitTime = delay * Math.pow(backoffMultiplier, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}

/**
 * Safe async wrapper that never throws, returns result or error
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    const appError: AppError = {
      code: error instanceof DecisionTimeoutError ? error.code : ERROR_CODES.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      originalError: error instanceof Error ? error : undefined,
      timestamp: new Date(),
      context
    }
    return { error: appError }
  }
}

/**
 * Enhanced error logger with structured logging
 */
export function logError(error: Error | AppError, context?: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    code: 'code' in error ? error.code : ERROR_CODES.UNKNOWN_ERROR,
    stack: error instanceof Error ? error.stack : undefined,
    context: {
      ...('context' in error ? error.context : {}),
      ...context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logEntry)
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(logEntry)
    
    // For now, just store in sessionStorage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]')
      errors.push(logEntry)
      // Keep only last 50 errors
      sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-50)))
    } catch (e) {
      // Ignore storage errors
    }
  }
}

/**
 * Network-specific error handling
 */
export function handleNetworkError(error: Error, context?: Record<string, unknown>): AppError {
  if (error.message.includes('fetch')) {
    return {
      code: ERROR_CODES.NETWORK_UNAVAILABLE,
      message: 'Network connection unavailable. Please check your internet connection.',
      originalError: error,
      timestamp: new Date(),
      context
    }
  }

  if (error.message.includes('timeout')) {
    return {
      code: ERROR_CODES.NETWORK_TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
      timestamp: new Date(),
      context
    }
  }

  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected network error occurred.',
    originalError: error,
    timestamp: new Date(),
    context
  }
}

/**
 * Database-specific error handling
 */
export function handleDatabaseError(error: Error, context?: Record<string, unknown>): AppError {
  const message = error.message.toLowerCase()

  if (message.includes('constraint') || message.includes('unique')) {
    return {
      code: ERROR_CODES.DB_CONSTRAINT_VIOLATION,
      message: 'This action conflicts with existing data. Please try a different approach.',
      originalError: error,
      timestamp: new Date(),
      context
    }
  }

  if (message.includes('connection') || message.includes('timeout')) {
    return {
      code: ERROR_CODES.DB_CONNECTION_FAILED,
      message: 'Database connection failed. Please try again in a moment.',
      originalError: error,
      timestamp: new Date(),
      context
    }
  }

  return {
    code: ERROR_CODES.DB_QUERY_FAILED,
    message: 'Database operation failed. Please try again.',
    originalError: error,
    timestamp: new Date(),
    context
  }
}

/**
 * User-friendly error messages
 */
export function getErrorMessage(error: AppError | Error): string {
  if ('code' in error) {
    switch (error.code) {
      case ERROR_CODES.AUTH_REQUIRED:
        return 'Please sign in to continue.'
      case ERROR_CODES.AUTH_EXPIRED:
        return 'Your session has expired. Please sign in again.'
      case ERROR_CODES.DECISION_NOT_FOUND:
        return 'Decision not found. It may have been deleted.'
      case ERROR_CODES.DECISION_LOCKED:
        return 'This decision is still locked. You can update it after the lock period expires.'
      case ERROR_CODES.NETWORK_UNAVAILABLE:
        return 'No internet connection. Please check your network and try again.'
      case ERROR_CODES.NETWORK_TIMEOUT:
        return 'Request timed out. Please try again.'
      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment before trying again.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
  
  return error.message || 'An unexpected error occurred.'
}