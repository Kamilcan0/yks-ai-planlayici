import { useState, useEffect } from 'react'

/**
 * Custom hook for debounced state updates
 * @param initialValue - Initial state value
 * @param delay - Debounce delay in milliseconds
 * @returns [value, setValue] - Current value and debounced setter
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return [debouncedValue, setValue]
}

/**
 * Utility function for debouncing function calls
 * @param func - Function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Utility function for throttling function calls
 * @param func - Function to throttle
 * @param delay - Throttle delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}
