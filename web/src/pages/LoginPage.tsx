import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  Brain, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/toaster'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/home'
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, location])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      await signIn(formData.email, formData.password)
      
      toast({
        title: 'Başarılı!',
        description: 'Giriş yapıldı, yönlendiriliyorsunuz...',
        type: 'success'
      })
      
      const from = (location.state as any)?.from?.pathname || '/home'
      navigate(from, { replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Giriş Başarısız',
        description: error.message || 'E-posta veya şifre hatalı',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">YKS Plan</h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              YKS'ye Hazırlığın
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Destekli</span>
              <br />Çalışma Planı
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Yapay zeka destekli kişiselleştirilmiş çalışma planları ile YKS hedeflerine ulaş. 
              Seviyene uygun kaynak önerileri, günlük motivasyon ve ilerleme takibi.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Kişiselleştirilmiş AI planları</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Günlük motivasyon ve takip</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Kaliteli kaynak önerileri</span>
            </div>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center lg:hidden mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold">YKS Plan</h1>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Hoş Geldin!</CardTitle>
              <p className="text-sm text-muted-foreground">
                Hesabına giriş yap ve çalışmaya devam et
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Hesabın yok mu?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Kayıt ol
                  </Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Giriş yaparak{' '}
                  <a href="#" className="text-primary hover:underline">Kullanım Şartları</a>
                  {' '}ve{' '}
                  <a href="#" className="text-primary hover:underline">Gizlilik Politikası</a>
                  'nı kabul etmiş olursun.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}