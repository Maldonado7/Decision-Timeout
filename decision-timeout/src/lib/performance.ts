/**
 * Performance optimization utilities for Decision Timeout app
 */
import React from 'react'

export interface PerformanceMark {
  name: string
  startTime: number
  duration?: number
}

class PerformanceTracker {
  private marks: Map<string, PerformanceMark> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupObservers()
    }
  }

  private setupObservers() {
    // Long Task API observer
    if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`Long task detected: ${entry.duration}ms`, entry)
          
          // Track long tasks in monitoring
          if (typeof window !== 'undefined' && (window as any).monitoring) {
            (window as any).monitoring.trackMetric({
              name: 'long_task',
              value: entry.duration,
              tags: { type: 'performance' }
            })
          }
        }
      })
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        // Long Task API not supported
      }
    }

    // Layout Shift observer
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            console.log(`Layout shift: ${(entry as any).value}`, entry)
          }
        }
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        // Layout Shift API not supported
      }
    }
  }

  mark(name: string) {
    const startTime = performance.now()
    this.marks.set(name, { name, startTime })
    
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name)
    }
  }

  measure(name: string, startMark?: string) {
    const endTime = performance.now()
    
    if (startMark && this.marks.has(startMark)) {
      const startMarkData = this.marks.get(startMark)!
      const duration = endTime - startMarkData.startTime
      
      this.marks.set(name, {
        name,
        startTime: startMarkData.startTime,
        duration
      })
      
      if ('performance' in window && 'measure' in performance) {
        try {
          performance.measure(name, startMark)
        } catch (e) {
          // Fallback if performance.measure fails
        }
      }
      
      return duration
    }
    
    return 0
  }

  getMarks(): PerformanceMark[] {
    return Array.from(this.marks.values())
  }

  clear() {
    this.marks.clear()
    if ('performance' in window) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker()

// React performance utilities
export function measureRender<T extends Record<string, unknown>>(
  componentName: string,
  props?: T
) {
  return function <P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    const MeasuredComponent = (props: P) => {
      React.useEffect(() => {
        performanceTracker.mark(`${componentName}-start`)
        
        return () => {
          performanceTracker.measure(`${componentName}-render`, `${componentName}-start`)
        }
      }, [])

      return React.createElement(Component, props)
    }
    
    MeasuredComponent.displayName = `Measured(${componentName})`
    return MeasuredComponent
  }
}

// Image optimization utilities
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onLoad,
  onError
}) => {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (!imgRef.current || loaded || error) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = src
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (!priority) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, loaded, error, priority])

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.()
  }

  return (
    <img
      ref={imgRef}
      src={priority ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}

// Bundle size analysis
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return

  const scripts = Array.from(document.scripts)
  const totalSize = scripts.reduce((acc, script) => {
    if (script.src && script.src.includes('/_next/')) {
      // Estimate size based on typical Next.js chunk sizes
      return acc + (script.src.includes('chunk') ? 50000 : 200000)
    }
    return acc
  }, 0)

  console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
  return totalSize
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !(performance as any).memory) return

  const memory = (performance as any).memory
  const memInfo = {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit
  }

  console.log('Memory usage:', {
    used: `${(memInfo.used / 1024 / 1024).toFixed(2)} MB`,
    total: `${(memInfo.total / 1024 / 1024).toFixed(2)} MB`,
    limit: `${(memInfo.limit / 1024 / 1024).toFixed(2)} MB`
  })

  return memInfo
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === 'undefined') return

  // Cumulative Layout Shift
  let clsValue = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value
      }
    }
  }).observe({ entryTypes: ['layout-shift'] })

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = (entry as any).processingStart - entry.startTime
      console.log('FID:', fid)
    }
  }).observe({ entryTypes: ['first-input'] })

  // Report CLS when page is about to unload
  window.addEventListener('beforeunload', () => {
    console.log('CLS:', clsValue)
  })
}

// Resource loading optimization
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
}

export function preconnect(href: string, crossorigin = false) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  if (crossorigin) link.crossOrigin = ''
  
  document.head.appendChild(link)
}

// Component lazy loading with error boundary
export function lazyWithErrorBoundary<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => <div>Loading...</div>
) {
  const LazyComponent = React.lazy(importFunc)
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={<fallback />}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ))
}

// Performance budget checker
export interface PerformanceBudget {
  lcp: number // ms
  fid: number // ms
  cls: number // score
  bundleSize: number // bytes
  imageSize: number // bytes per image
}

export function checkPerformanceBudget(budget: PerformanceBudget) {
  const violations: string[] = []
  
  // Check LCP
  const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]
  if (lcp && lcp.startTime > budget.lcp) {
    violations.push(`LCP exceeded: ${lcp.startTime}ms > ${budget.lcp}ms`)
  }
  
  // Check bundle size
  const estimatedSize = analyzeBundleSize()
  if (estimatedSize && estimatedSize > budget.bundleSize) {
    violations.push(`Bundle size exceeded: ${estimatedSize} > ${budget.bundleSize}`)
  }
  
  // Check images
  const images = document.querySelectorAll('img')
  images.forEach((img, index) => {
    if (img.src && img.naturalWidth * img.naturalHeight * 4 > budget.imageSize) {
      violations.push(`Image ${index} size exceeded budget`)
    }
  })
  
  return violations
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  measureWebVitals()
  
  // Monitor every 30 seconds
  setInterval(() => {
    monitorMemoryUsage()
  }, 30000)
}