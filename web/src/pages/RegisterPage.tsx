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
  ArrowRight,
  User,
  Calendar,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/toaster'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    seviye: 'orta',
    field: 'sayisal',
    haftalık_saat: 20,
    hedef_tarih: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1) // Multi-step form

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/home'
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, location])

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad soyad gerekli'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ad soyad en az 2 karakter olmalı'
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.seviye) {
      newErrors.seviye = 'Seviye seçimi gerekli'
    }
    
    if (!formData.field) {
      newErrors.field = 'Alan seçimi gerekli'
    }
    
    if (!formData.haftalık_saat || formData.haftalık_saat < 5 || formData.haftalık_saat > 80) {
      newErrors.haftalık_saat = 'Haftalık çalışma saati 5-80 arasında olmalı'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      handleNext()
      return
    }
    
    if (!validateStep2()) return
    
    try {
      setLoading(true)
      await signUp(formData.email, formData.password, {
        name: formData.name,
        seviye: formData.seviye,
        field: formData.field,
        haftalık_saat: formData.haftalık_saat,
        hedef_tarih: formData.hedef_tarih
      })
      
      toast({
        title: 'Başarılı!',
        description: 'Hesabınız oluşturuldu, yönlendiriliyorsunuz...',
        type: 'success'
      })
      
      navigate('/home', { replace: true })
    } catch (error: any) {
      console.error('Register error:', error)
      toast({
        title: 'Kayıt Başarısız',
        description: error.message || 'Kayıt işlemi sırasında hata oluştu',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
              Hemen Başla,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Hedefine Ulaş</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ücretsiz hesap oluştur ve AI destekli kişiselleştirilmiş çalışma planınla 
              YKS hedeflerine adım adım ilerle.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">Hedef odaklı planlar</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <User className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">Kişiselleştirilmiş deneyim</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">%100 ücretsiz</span>
            </div>
          </div>
        </motion.div>

        {/* Register Form */}
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
              <CardTitle className="text-2xl font-bold">Hesap Oluştur</CardTitle>
              <p className="text-sm text-muted-foreground">
                {step === 1 ? 'Giriş bilgilerini doldurun' : 'Çalışma tercihlerini belirleyin'}
              </p>
              
              {/* Progress indicator */}
              <div className="flex space-x-2 justify-center pt-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Adınız ve soyadınız"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          disabled={loading}
                        />
                      </div>
                      {errors.name && (
                        <div className="flex items-center space-x-1 text-red-500 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Şifre Tekrar</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="flex items-center space-x-1 text-red-500 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.confirmPassword}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Seviyeniz</label>
                      <Select 
                        value={formData.seviye} 
                        onValueChange={(value) => handleInputChange('seviye', value)}
                      >
                        <SelectTrigger className={errors.seviye ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seviyenizi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baslangic">Başlangıç - Temelleri öğreniyorum</SelectItem>
                          <SelectItem value="orta">Orta - Temel bilgilerim var</SelectItem>
                          <SelectItem value="ileri">İleri - İyi seviyedeyim</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.seviye && (
                        <div className="flex items-center space-x-1 text-red-500 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.seviye}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alanınız</label>
                      <Select 
                        value={formData.field} 
                        onValueChange={(value) => handleInputChange('field', value)}
                      >
                        <SelectTrigger className={errors.field ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Alanınızı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sayisal">Sayısal (MF)</SelectItem>
                          <SelectItem value="esit">Eşit Ağırlık (TM)</SelectItem>
                          <SelectItem value="sozel">Sözel (TS)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.field && (
                        <div className="flex items-center space-x-1 text-red-500 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.field}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Haftalık Çalışma Saati</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="20"
                          min="5"
                          max="80"
                          value={formData.haftalık_saat}
                          onChange={(e) => handleInputChange('haftalık_saat', parseInt(e.target.value) || 20)}
                          className={`pl-10 ${errors.haftalık_saat ? 'border-red-500' : ''}`}
                          disabled={loading}
                        />
                      </div>
                      {errors.haftalık_saat && (
                        <div className="flex items-center space-x-1 text-red-500 text-sm">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.haftalık_saat}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Günde ortalama {Math.round(formData.haftalık_saat / 7 * 10) / 10} saat</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hedef Tarih (Opsiyonel)</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={formData.hedef_tarih}
                          onChange={(e) => handleInputChange('hedef_tarih', e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  {step === 2 && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-11"
                      disabled={loading}
                    >
                      Geri
                    </Button>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="flex-1 h-11" 
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Oluşturuluyor...' : step === 1 ? 'Devam Et' : 'Hesap Oluştur'}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Zaten hesabın var mı?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:underline font-medium"
                  >
                    Giriş yap
                  </Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Kayıt olarak{' '}
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