import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

export interface Toast {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToasterProps {
  toasts?: Toast[]
  onRemove?: (id: string) => void
}

const ToastIcon: React.FC<{ type: Toast['type'] }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    default:
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const ToastItem: React.FC<{ 
  toast: Toast 
  onRemove: (id: string) => void 
}> = ({ toast, onRemove }) => {
  const [isRemoving, setIsRemoving] = React.useState(false)

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsRemoving(true)
        setTimeout(() => onRemove(toast.id), 300)
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onRemove])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? 300 : 0, 
        scale: isRemoving ? 0.3 : 1 
      }}
      transition={{ duration: 0.3 }}
      className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-80 max-w-md"
    >
      <div className="flex items-start space-x-3">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {toast.action && (
        <div className="mt-3 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toast.action.onClick}
            className="text-xs"
          >
            {toast.action.label}
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export const Toaster: React.FC<ToasterProps> = ({ 
  toasts = [], 
  onRemove = () => {} 
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const ToasterComponent = React.useMemo(() => (
    <Toaster toasts={toasts} onRemove={removeToast} />
  ), [toasts, removeToast])

  return {
    toast: addToast,
    toasts,
    Toaster: ToasterComponent
  }
}
