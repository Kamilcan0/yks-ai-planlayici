/**
 * Error Handling & Monitoring System
 * Hata yakalama, loglama ve kullanıcı bildirimi sistemi
 */

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
  userAgent: string
  url: string
  timestamp: Date
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

export interface NetworkError {
  url: string
  method: string
  status: number
  message: string
  response?: any
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errorLogs: ErrorLog[] = []
  private maxLogs = 1000
  
  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  private setupGlobalErrorHandlers(): void {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        severity: 'high',
        context: {
          line: event.lineno,
          column: event.colno
        }
      })
    })

    // Unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        context: {
          reason: event.reason
        }
      })
    })

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.logError({
          message: `Resource loading error: ${(event.target as any)?.src || (event.target as any)?.href}`,
          severity: 'medium',
          context: {
            element: event.target.tagName,
            source: (event.target as any)?.src || (event.target as any)?.href
          }
        })
      }
    }, true)
  }

  logError(error: Partial<ErrorLog>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      userId: error.userId,
      severity: error.severity || 'medium',
      context: error.context
    }

    this.errorLogs.push(errorLog)
    
    // Limit log size
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift()
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorLog.severity.toUpperCase()}]`)
      console.error(errorLog.message)
      if (errorLog.stack) {
        console.error(errorLog.stack)
      }
      if (errorLog.context) {
        console.table(errorLog.context)
      }
      console.groupEnd()
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorLog)
    }
  }

  private async sendErrorToMonitoring(errorLog: ErrorLog): Promise<void> {
    try {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      })
    } catch (error) {
      console.warn('Failed to send error to monitoring service:', error)
    }
  }

  handleNetworkError(error: NetworkError): void {
    this.logError({
      message: `Network Error: ${error.method} ${error.url} - ${error.status} ${error.message}`,
      severity: error.status >= 500 ? 'high' : 'medium',
      context: {
        url: error.url,
        method: error.method,
        status: error.status,
        response: error.response
      }
    })
  }

  handleAuthError(error: any): void {
    this.logError({
      message: `Authentication Error: ${error.message}`,
      severity: 'high',
      context: {
        errorCode: error.code,
        errorDetails: error
      }
    })
  }

  handleAPIError(endpoint: string, error: any): void {
    this.logError({
      message: `API Error: ${endpoint} - ${error.message}`,
      severity: 'medium',
      context: {
        endpoint,
        error: error
      }
    })
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs].reverse() // Most recent first
  }

  getErrorsByseverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.errorLogs.filter(log => log.severity === severity)
  }

  clearErrorLogs(): void {
    this.errorLogs = []
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// React Error Boundary Helper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error }>
) => {
  return class ErrorBoundaryWrapper extends React.Component<P, { hasError: boolean; error?: Error }> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorHandlingService.logError({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: Component.name,
        severity: 'high'
      })
    }

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          const FallbackComponent = fallbackComponent
          return <FallbackComponent error={this.state.error!} />
        }
        
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bir Hata Oluştu
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        )
      }

      return <Component {...this.props} />
    }
  }
}

// Async error handler for promises
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await promise
  } catch (error: any) {
    errorHandlingService.logError({
      message: `Async Error${context ? ` in ${context}` : ''}: ${error.message}`,
      stack: error.stack,
      severity: 'medium',
      context: { operation: context }
    })
    return null
  }
}

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> => {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      if (attempt === maxRetries) {
        errorHandlingService.logError({
          message: `Failed after ${maxRetries} attempts${context ? ` in ${context}` : ''}: ${error.message}`,
          stack: error.stack,
          severity: 'high',
          context: { 
            operation: context,
            attempts: maxRetries,
            finalError: error
          }
        })
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Network request wrapper with error handling
export const safeNetworkRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response | null> => {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      errorHandlingService.handleNetworkError({
        url,
        method: options.method || 'GET',
        status: response.status,
        message: response.statusText,
        response: await response.text()
      })
      return null
    }
    
    return response
  } catch (error: any) {
    errorHandlingService.handleNetworkError({
      url,
      method: options.method || 'GET',
      status: 0,
      message: error.message,
      response: null
    })
    return null
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance()
