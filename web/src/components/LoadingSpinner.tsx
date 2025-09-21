import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  type?: 'spinner' | 'brain' | 'dots'
  message?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'spinner',
  message,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center'

  const SpinnerComponent = () => {
    switch (type) {
      case 'brain':
        return (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Brain className={`${sizeClasses[size]} text-primary`} />
          </motion.div>
        )
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  y: [-4, 4, -4],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        )
    }
  }

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <SpinnerComponent />
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground text-center max-w-xs"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-muted rounded-lg p-6 space-y-4">
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted-foreground/20 rounded"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div 
            key={j} 
            className="h-4 bg-muted-foreground/20 rounded flex-1"
          />
        ))}
      </div>
    ))}
  </div>
)

// Loading overlay for specific components
export const LoadingOverlay: React.FC<{
  loading: boolean
  children: React.ReactNode
  message?: string
}> = ({ loading, children, message }) => {
  if (!loading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner message={message} type="brain" />
      </div>
    </div>
  )
}

// Lazy loading wrapper
export const LazyWrapper: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ children, fallback }) => {
  return (
    <React.Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner type="brain" message="Yükleniyor..." />
          </div>
        )
      }
    >
      {children}
    </React.Suspense>
  )
}
