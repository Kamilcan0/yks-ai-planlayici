import { useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = usePlanStore(state => state.isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return <>{children}</>
}
