import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (request: NextRequest) => string
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (request: NextRequest) => {
    const now = Date.now()
    const key = keyGenerator ? keyGenerator(request) : getClientKey(request)
    
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }
    
    const record = store[key]
    
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }
    
    record.count++
    
    const isRateLimited = record.count > maxRequests
    const remainingRequests = Math.max(0, maxRequests - record.count)
    const resetTime = record.resetTime
    
    // Clean up old records periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupExpiredRecords(now)
    }
    
    return {
      isRateLimited,
      remainingRequests,
      resetTime,
      retryAfter: isRateLimited ? Math.ceil((resetTime - now) / 1000) : 0
    }
  }
}

function getClientKey(request: NextRequest): string {
  // Try to get the client IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'anonymous'
  
  // Include user agent to make it harder to bypass
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.substring(0, 50)}`
}

function cleanupExpiredRecords(now: number) {
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime + 60000) { // Clean up records older than 1 minute past reset
      delete store[key]
    }
  })
}

// Predefined rate limiters for common use cases
export const decisionsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export const createDecisionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 10, // 10 decision creations per minute
})