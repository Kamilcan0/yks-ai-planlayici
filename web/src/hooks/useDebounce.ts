import { useState, useEffect } from 'react'

/**
 * useDebounce hook - Debounces a value for the specified delay
 * Useful for search inputs, API calls, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useDebouncedCallback hook - Debounces a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }) as T

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback
}

/**
 * useThrottle hook - Throttles a value for the specified interval
 * Ensures the value updates at most once per interval
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdated

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value)
      setLastUpdated(now)
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value)
        setLastUpdated(Date.now())
      }, interval - timeSinceLastUpdate)

      return () => clearTimeout(timeoutId)
    }
  }, [value, interval, lastUpdated])

  return throttledValue
}

/**
 * useAsyncDebounce hook - Debounces an async operation
 * Cancels previous operations when a new one is triggered
 */
export function useAsyncDebounce<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  delay: number
): [T, boolean] {
  const [loading, setLoading] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const debouncedFunction = useDebouncedCallback(
    async (...args: Parameters<T>) => {
      // Cancel previous request
      if (abortController) {
        abortController.abort()
      }

      const newController = new AbortController()
      setAbortController(newController)
      setLoading(true)

      try {
        const result = await asyncFunction(...args)
        
        // Only update state if not aborted
        if (!newController.signal.aborted) {
          setLoading(false)
        }
        
        return result
      } catch (error) {
        if (!newController.signal.aborted) {
          setLoading(false)
          throw error
        }
      }
    },
    delay
  ) as T

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  return [debouncedFunction, loading]
}
