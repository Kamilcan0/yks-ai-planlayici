/**
 * Performance utilities for optimizing React app performance
 */

// Lazy loading utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  return React.lazy(factory)
}

// Image optimization
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality = 80) => {
  if (!url) return ''
  
  // If it's already optimized or a data URL, return as is
  if (url.includes('?') || url.startsWith('data:')) {
    return url
  }
  
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return `${url}?${params.toString()}`
}

// Memory management
export const createMemoryEfficientState = <T>(initialValue: T) => {
  const [state, setState] = React.useState<T>(initialValue)
  const prevStateRef = React.useRef<T>(initialValue)
  
  const setOptimizedState = React.useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue
      
      // Only update if value actually changed
      if (nextValue !== prevStateRef.current) {
        prevStateRef.current = nextValue
        return nextValue
      }
      
      return prev
    })
  }, [])
  
  return [state, setOptimizedState] as const
}

// Bundle size optimization
export const importWithRetry = async <T>(
  factory: () => Promise<T>, 
  retries = 3
): Promise<T> => {
  try {
    return await factory()
  } catch (error) {
    if (retries > 0) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
      return importWithRetry(factory, retries - 1)
    }
    throw error
  }
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  return async () => {
    const start = performance.now()
    
    try {
      const result = await fn()
      const end = performance.now()
      
      console.log(`Performance: ${name} took ${end - start} milliseconds`)
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Analytics integration here
      }
      
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`Performance: ${name} failed after ${end - start} milliseconds`, error)
      throw error
    }
  }
}

// React performance hooks
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = React.useRef(0)
  const mountTime = React.useRef(Date.now())
  
  React.useEffect(() => {
    renderCount.current += 1
  })
  
  React.useEffect(() => {
    const loadTime = Date.now() - mountTime.current
    console.log(`Component ${componentName} mounted in ${loadTime}ms`)
    
    return () => {
      console.log(`Component ${componentName} rendered ${renderCount.current} times`)
    }
  }, [componentName])
}

// Virtualization helpers
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  return { startIndex, endIndex, visibleItemsCount: endIndex - startIndex + 1 }
}

// Cache management
export const createCache = <K, V>(maxSize = 100) => {
  const cache = new Map<K, V>()
  
  const get = (key: K): V | undefined => {
    const value = cache.get(key)
    if (value !== undefined) {
      // Move to end (LRU)
      cache.delete(key)
      cache.set(key, value)
    }
    return value
  }
  
  const set = (key: K, value: V): void => {
    if (cache.has(key)) {
      cache.delete(key)
    } else if (cache.size >= maxSize) {
      // Remove oldest (first) item
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    cache.set(key, value)
  }
  
  const clear = (): void => {
    cache.clear()
  }
  
  return { get, set, clear, size: () => cache.size }
}

// Intersection Observer utility
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  
  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [ref, options])
  
  return isIntersecting
}

// Resource prefetching
export const prefetchComponent = (componentFactory: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Prefetch on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        componentFactory().catch(() => {
          // Silently fail prefetch
        })
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        componentFactory().catch(() => {
          // Silently fail prefetch
        })
      }, 100)
    }
  }
}

// Export React for TypeScript
import React from 'react'
