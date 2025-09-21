import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AuthButtonProps {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  ariaLabel?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}

export const AuthButton: React.FC<AuthButtonProps> = React.memo(({
  onClick,
  loading = false,
  disabled = false,
  children,
  ariaLabel,
  className,
  variant = 'default',
  size = 'default',
  type = 'button'
}) => {
  const isDisabled = loading || disabled

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      className={cn(
        'touch-manipulation select-none',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'transition-all duration-200 ease-in-out',
        'active:scale-95',
        className
      )}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </Button>
  )
})

AuthButton.displayName = 'AuthButton'
