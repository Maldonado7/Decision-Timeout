/**
 * Monitoring and analytics setup for Decision Timeout app
 * Includes error tracking, performance monitoring, and user analytics
 */

export interface MonitoringConfig {
  environment: 'development' | 'staging' | 'production'
  apiKey?: string
  dsn?: string
  enablePerformanceMonitoring: boolean
  enableErrorTracking: boolean
  enableAnalytics: boolean
  sampleRate: number
}

export interface ErrorEvent {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  code?: string
  stack?: string
  context: Record<string, unknown>
  user?: {
    id?: string
    email?: string
  }
  tags: string[]
}

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: string
  tags: Record<string, string>
}

export interface AnalyticsEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: string
  userId?: string
}

class MonitoringService {
  private config: MonitoringConfig
  private initialized = false
  private errorQueue: ErrorEvent[] = []
  private metricsQueue: PerformanceMetric[] = []
  private analyticsQueue: AnalyticsEvent[] = []

  constructor(config: MonitoringConfig) {
    this.config = config
  }

  async initialize() {
    if (this.initialized) return

    if (typeof window === 'undefined') return // Server-side, skip initialization

    this.initialized = true

    // Set up error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking()
    }

    // Set up performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring()
    }

    // Set up analytics
    if (this.config.enableAnalytics) {
      this.setupAnalytics()
    }

    // Set up periodic flushing
    this.setupPeriodicFlush()
  }

  private setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        code: 'JAVASCRIPT_ERROR',
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        tags: ['javascript', 'global']
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled promise rejection: ${event.reason}`,
        code: 'UNHANDLED_PROMISE_REJECTION',
        context: {
          reason: event.reason,
        },
        tags: ['promise', 'unhandled']
      })
    })
  }

  private setupPerformanceMonitoring() {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric({
            name: 'lcp',
            value: entry.startTime,
            tags: { type: 'core-web-vital' }
          })
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric({
            name: 'fid',
            value: (entry as any).processingStart - entry.startTime,
            tags: { type: 'core-web-vital' }
          })
        }
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.trackMetric({
          name: 'cls',
          value: clsValue,
          tags: { type: 'core-web-vital' }
        })
      }).observe({ entryTypes: ['layout-shift'] })
    }

    // Navigation timing
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing
          const navigationStart = timing.navigationStart
          
          this.trackMetric({
            name: 'page_load_time',
            value: timing.loadEventEnd - navigationStart,
            tags: { type: 'navigation' }
          })
          
          this.trackMetric({
            name: 'dom_ready_time',
            value: timing.domContentLoadedEventEnd - navigationStart,
            tags: { type: 'navigation' }
          })
        }, 0)
      })
    }
  }

  private setupAnalytics() {
    // Track page views
    this.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent
    })

    // Track user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.matches('[data-track]')) {
        const trackingData = target.dataset.track
        try {
          const data = JSON.parse(trackingData || '{}')
          this.trackEvent('user_interaction', {
            type: 'click',
            element: target.tagName.toLowerCase(),
            ...data
          })
        } catch (error) {
          // Invalid tracking data, ignore
        }
      }
    })
  }

  private setupPeriodicFlush() {
    // Flush queues every 30 seconds
    setInterval(() => {
      this.flush()
    }, 30000)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true) // Synchronous flush
    })
  }

  captureError(error: Partial<ErrorEvent>) {
    if (!this.config.enableErrorTracking) return

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: error.level || 'error',
      message: error.message || 'Unknown error',
      code: error.code,
      stack: error.stack,
      context: error.context || {},
      tags: error.tags || [],
      user: this.getCurrentUser()
    }

    this.errorQueue.push(errorEvent)

    // Immediate flush for critical errors
    if (errorEvent.level === 'error') {
      this.flush()
    }
  }

  trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    if (!this.config.enablePerformanceMonitoring) return

    this.metricsQueue.push({
      ...metric,
      timestamp: new Date().toISOString()
    })
  }

  trackEvent(event: string, properties: Record<string, unknown> = {}) {
    if (!this.config.enableAnalytics) return

    this.analyticsQueue.push({
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUser()?.id
    })
  }

  // Decision-specific tracking methods
  trackDecisionCreated(decisionData: Record<string, unknown>) {
    this.trackEvent('decision_created', {
      ...decisionData,
      timestamp: new Date().toISOString()
    })
  }

  trackDecisionCompleted(decisionId: string, result: 'YES' | 'NO', timeTaken: number) {
    this.trackEvent('decision_completed', {
      decision_id: decisionId,
      result,
      time_taken: timeTaken
    })
  }

  trackTimerStarted(decisionId: string, duration: number) {
    this.trackEvent('timer_started', {
      decision_id: decisionId,
      duration
    })
  }

  trackTimerCompleted(decisionId: string, remainingTime: number) {
    this.trackEvent('timer_completed', {
      decision_id: decisionId,
      remaining_time: remainingTime,
      completed: remainingTime === 0
    })
  }

  private async flush(synchronous = false) {
    const errors = [...this.errorQueue]
    const metrics = [...this.metricsQueue]
    const analytics = [...this.analyticsQueue]

    // Clear queues
    this.errorQueue = []
    this.metricsQueue = []
    this.analyticsQueue = []

    if (errors.length === 0 && metrics.length === 0 && analytics.length === 0) {
      return
    }

    const payload = {
      errors,
      metrics,
      analytics,
      environment: this.config.environment,
      timestamp: new Date().toISOString()
    }

    try {
      const method = synchronous ? 'sendBeacon' : 'fetch'
      
      if (method === 'sendBeacon' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/monitoring', JSON.stringify(payload))
      } else {
        await fetch('/api/monitoring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          keepalive: synchronous
        })
      }
    } catch (error) {
      // Store in localStorage as fallback
      if (typeof localStorage !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('monitoring_fallback') || '[]')
          stored.push(payload)
          localStorage.setItem('monitoring_fallback', JSON.stringify(stored.slice(-50)))
        } catch (e) {
          // Ignore storage errors
        }
      }
    }
  }

  private getCurrentUser() {
    // This would be replaced with actual user detection logic
    // For now, return null or basic browser info
    return typeof window !== 'undefined' ? {
      id: localStorage.getItem('user_id') || undefined,
      email: localStorage.getItem('user_email') || undefined
    } : undefined
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Public API for manual error reporting
  reportError(error: Error, context?: Record<string, unknown>, tags?: string[]) {
    this.captureError({
      message: error.message,
      code: error.name,
      stack: error.stack,
      context,
      tags
    })
  }

  // Public API for performance timing
  startTiming(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.trackMetric({
        name: `timing_${name}`,
        value: duration,
        tags: { type: 'timing' }
      })
    }
  }
}

// Default configuration
const defaultConfig: MonitoringConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableAnalytics: process.env.NODE_ENV === 'production',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
}

// Global monitoring instance
export const monitoring = new MonitoringService(defaultConfig)

// Initialize monitoring on client-side
if (typeof window !== 'undefined') {
  monitoring.initialize()
}

// React hook for monitoring
export function useMonitoring() {
  return {
    reportError: (error: Error, context?: Record<string, unknown>) => 
      monitoring.reportError(error, context),
    trackEvent: (event: string, properties?: Record<string, unknown>) => 
      monitoring.trackEvent(event, properties),
    startTiming: (name: string) => monitoring.startTiming(name),
    trackDecisionCreated: (data: Record<string, unknown>) => 
      monitoring.trackDecisionCreated(data),
    trackDecisionCompleted: (id: string, result: 'YES' | 'NO', time: number) => 
      monitoring.trackDecisionCompleted(id, result, time),
    trackTimerStarted: (id: string, duration: number) => 
      monitoring.trackTimerStarted(id, duration),
    trackTimerCompleted: (id: string, remainingTime: number) => 
      monitoring.trackTimerCompleted(id, remainingTime)
  }
}