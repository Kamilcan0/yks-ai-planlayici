import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AuthButton } from '@/components/AuthButton'
import { useDebouncedState } from '@/hooks/useDebouncedState'
import { signInWithSupabase, signInWithGoogle as signInWithGoogleSupabase } from '@/lib/supabase'

interface LoginFormProps {
  onSuccess: () => void
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export const LoginForm: React.FC<LoginFormProps> = React.memo(({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showGuestOption, setShowGuestOption] = useState(false)
  
  // Debounced form data for validation
  const [debouncedEmail] = useDebouncedState(formData.email, 300)
  const [debouncedPassword] = useDebouncedState(formData.password, 300)

  // AbortController for timeout handling
  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Email validation
  const emailError = useMemo(() => {
    if (!debouncedEmail) return ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(debouncedEmail) ? '' : 'Geçerli bir e-posta adresi girin'
  }, [debouncedEmail])

  // Password validation
  const passwordError = useMemo(() => {
    if (!debouncedPassword) return ''
    return debouncedPassword.length >= 6 ? '' : 'Şifre en az 6 karakter olmalı'
  }, [debouncedPassword])

  // Update errors when debounced values change
  React.useEffect(() => {
    setErrors(prev => ({
      ...prev,
      email: emailError,
      password: passwordError
    }))
  }, [emailError, passwordError])

  const handleInputChange = useCallback((field: keyof FormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }))
      // Clear general error when user starts typing
      if (errors.general) {
        setErrors(prev => ({ ...prev, general: undefined }))
      }
    }, [errors.general])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (loading) return

    // Validate form
    const newErrors: FormErrors = {}
    if (!formData.email) newErrors.email = 'E-posta adresi gerekli'
    if (!formData.password) newErrors.password = 'Şifre gerekli'
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    let timeoutId: NodeJS.Timeout | null = null

    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController()
      timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, 15000) // 15 second timeout

      await signInWithSupabase(formData.email, formData.password)
      
      // Clear timeout on success
      if (timeoutId) clearTimeout(timeoutId)
      onSuccess()
      
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        setErrors({ general: 'Bağlantı zaman aşımına uğradı. Tekrar deneyin.' })
      } else {
        setErrors({ 
          general: error.message || 'Giriş yapılırken bir hata oluştu' 
        })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [formData, loading, emailError, passwordError, onSuccess])

  const handleGoogleSignIn = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setErrors({})

    let timeoutId: NodeJS.Timeout | null = null

    try {
      abortControllerRef.current = new AbortController()
      timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, 15000)

      await signInWithGoogleSupabase()
      
      if (timeoutId) clearTimeout(timeoutId)
      onSuccess()
      
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        setErrors({ general: 'Bağlantı zaman aşımına uğradı. Tekrar deneyin.' })
      } else {
        setErrors({ 
          general: error.message || 'Google ile giriş yapılamadı' 
        })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [loading, onSuccess])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Error Message */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{errors.general}</span>
        </motion.div>
      )}

      {/* Guest Login Option */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowGuestOption(!showGuestOption)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Misafir olarak devam et
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            E-posta
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500' : 'border-border'
              }`}
              placeholder="E-posta adresiniz"
              required
              disabled={loading}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Şifre
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.password ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Şifreniz"
              required
              disabled={loading}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          loading={loading}
          className="w-full"
          ariaLabel="Giriş yap"
        >
          Giriş Yap
        </AuthButton>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-sm text-muted-foreground">veya</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      {/* Google Sign In */}
      <AuthButton
        type="button"
        variant="outline"
        loading={loading}
        onClick={handleGoogleSignIn}
        className="w-full"
        ariaLabel="Google ile giriş yap"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Giriş Yap
      </AuthButton>
    </motion.div>
  )
})

LoginForm.displayName = 'LoginForm'
