/**
 * Performance Monitoring & Optimization
 * Performans izleme ve optimizasyon araçları
 */

export interface PerformanceMetrics {
  id: string
  timestamp: Date
  url: string
  loadTime: number
  renderTime: number
  ttfb: number // Time to First Byte
  fcp: number  // First Contentful Paint
  lcp: number  // Largest Contentful Paint
  fid: number  // First Input Delay
  cls: number  // Cumulative Layout Shift
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
  networkInfo?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
}

export interface ComponentPerformance {
  componentName: string
  renderTime: number
  renderCount: number
  averageRenderTime: number
  lastRendered: Date
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private componentMetrics = new Map<string, ComponentPerformance>()
  private observer?: PerformanceObserver
  private maxMetrics = 500

  private constructor() {
    this.setupPerformanceObserver()
    this.measurePageLoad()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Web Vitals observer
        this.observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.processPerformanceEntry(entry)
          })
        })

        // Observe various performance metrics
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] })
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error)
      }
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming)
        break
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming)
        break
      case 'largest-contentful-paint':
        this.handleLCPEntry(entry)
        break
      case 'measure':
        this.handleMeasureEntry(entry)
        break
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      id: this.generateId(),
      timestamp: new Date(),
      url: window.location.href,
      loadTime: entry.loadEventEnd - entry.navigationStart,
      renderTime: entry.domContentLoadedEventEnd - entry.navigationStart,
      ttfb: entry.responseStart - entry.navigationStart,
      fcp: 0, // Will be updated by paint entries
      lcp: 0, // Will be updated by LCP entries
      fid: 0, // Will be updated by input events
      cls: 0, // Will be calculated separately
      memoryUsage: this.getMemoryUsage(),
      networkInfo: this.getNetworkInfo()
    }

    this.addMetrics(metrics)
  }

  private handlePaintEntry(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      const lastMetrics = this.metrics[this.metrics.length - 1]
      if (lastMetrics) {
        lastMetrics.fcp = entry.startTime
      }
    }
  }

  private handleLCPEntry(entry: any): void {
    const lastMetrics = this.metrics[this.metrics.length - 1]
    if (lastMetrics) {
      lastMetrics.lcp = entry.startTime
    }
  }

  private handleMeasureEntry(entry: PerformanceEntry): void {
    // Custom measurements
    if (entry.name.startsWith('component-render:')) {
      const componentName = entry.name.replace('component-render:', '')
      this.updateComponentMetrics(componentName, entry.duration)
    }
  }

  private measurePageLoad(): void {
    if (document.readyState === 'complete') {
      this.captureInitialMetrics()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.captureInitialMetrics(), 100)
      })
    }
  }

  private captureInitialMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.handleNavigationEntry(navigation)
    }

    // Measure FID
    this.measureFID()
    
    // Measure CLS
    this.measureCLS()
  }

  private measureFID(): void {
    let firstInputDelay = 0
    
    const processEvent = (event: PerformanceEventTiming) => {
      if (firstInputDelay === 0) {
        firstInputDelay = event.processingStart - event.startTime
        const lastMetrics = this.metrics[this.metrics.length - 1]
        if (lastMetrics) {
          lastMetrics.fid = firstInputDelay
        }
      }
    }

    // Listen for first input
    ['click', 'keydown', 'mousedown', 'pointerdown', 'touchstart'].forEach(type => {
      document.addEventListener(type, (event) => {
        if (firstInputDelay === 0) {
          const performanceEntry = {
            startTime: performance.now(),
            processingStart: performance.now()
          } as PerformanceEventTiming
          processEvent(performanceEntry)
        }
      }, { once: true, passive: true })
    })
  }

  private measureCLS(): void {
    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: any[] = []

    const processLayoutShiftEntry = (entry: any) => {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0]
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

        if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && 
            entry.startTime - firstSessionEntry.startTime < 5000) {
          sessionValue += entry.value
          sessionEntries.push(entry)
        } else {
          sessionValue = entry.value
          sessionEntries = [entry]
        }

        if (sessionValue > clsValue) {
          clsValue = sessionValue
          const lastMetrics = this.metrics[this.metrics.length - 1]
          if (lastMetrics) {
            lastMetrics.cls = clsValue
          }
        }
      }
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(processLayoutShiftEntry)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Layout Shift measurement not supported:', error)
    }
  }

  private getMemoryUsage(): PerformanceMetrics['memoryUsage'] {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return undefined
  }

  private getNetworkInfo(): PerformanceMetrics['networkInfo'] {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }
    }
    return undefined
  }

  // Public API
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    const duration = endTime - startTime

    performance.mark(`component-render-start:${componentName}`)
    performance.mark(`component-render-end:${componentName}`)
    performance.measure(`component-render:${componentName}`, 
      `component-render-start:${componentName}`, 
      `component-render-end:${componentName}`)

    this.updateComponentMetrics(componentName, duration)
  }

  private updateComponentMetrics(componentName: string, duration: number): void {
    const existing = this.componentMetrics.get(componentName)
    
    if (existing) {
      existing.renderCount++
      existing.renderTime += duration
      existing.averageRenderTime = existing.renderTime / existing.renderCount
      existing.lastRendered = new Date()
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime: duration,
        renderCount: 1,
        averageRenderTime: duration,
        lastRendered: new Date()
      })
    }
  }

  measureAsyncOperation(operationName: string, operation: () => Promise<any>): Promise<any> {
    const startTime = performance.now()
    
    return operation().finally(() => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performance.mark(`async-start:${operationName}`)
      performance.mark(`async-end:${operationName}`)
      performance.measure(`async:${operationName}`, 
        `async-start:${operationName}`, 
        `async-end:${operationName}`)

      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operationName} took ${duration}ms`)
      }
    })
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // Limit stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricsToAnalytics(metrics)
    }
  }

  private async sendMetricsToAnalytics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Send to your analytics service
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metrics)
      })
    } catch (error) {
      console.warn('Failed to send performance metrics:', error)
    }
  }

  // Getters
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values())
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0
    return this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length
  }

  getSlowComponents(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values())
      .filter(c => c.averageRenderTime > 16) // 60fps threshold
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
  }

  // Performance optimization helpers
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  }

  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  }

  // Memory cleanup
  cleanupMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// React Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    measureRender: (componentName: string, renderFn: () => void) => 
      monitor.measureComponentRender(componentName, renderFn),
    measureAsync: (operationName: string, operation: () => Promise<any>) => 
      monitor.measureAsyncOperation(operationName, operation),
    getMetrics: () => monitor.getMetrics(),
    getComponentMetrics: () => monitor.getComponentMetrics()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
