import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Brain, Clock, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { createUserProfile, updateUserProfile, saveGuestProfile, UserProfile } from '@/lib/firebase'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: (data: UserProfile) => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, setProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    seviye: 'başlangıç' as 'başlangıç' | 'orta' | 'ileri',
    haftalık_saat: 20,
    hedef_tarih: '',
    field: 'sayisal' as 'sayisal' | 'ea' | 'sozel' | 'dil',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)

  const steps = [
    {
      title: 'Merhaba! 👋',
      subtitle: 'Kendini tanıtalım',
      component: NameStep
    },
    {
      title: 'Seviyeni Belirle 📚',
      subtitle: 'Mevcut YKS hazırlık seviyeni nasıl?',
      component: LevelStep
    },
    {
      title: 'Çalışma Süren ⏰',
      subtitle: 'Haftada kaç saat çalışmayı planlıyorsun?',
      component: HoursStep
    },
    {
      title: 'Hedef Tarih 🎯',
      subtitle: 'YKS sınav tarihini belirle',
      component: DateStep
    },
    {
      title: 'Alan Seçimi 🎓',
      subtitle: 'Hangi alana odaklanacaksın?',
      component: FieldStep
    }
  ]

  function NameStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <User className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Sana özel bir çalışma planı hazırlayabilmem için önce tanışalım!
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Adın ne?</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            placeholder="Adını yaz..."
            required
          />
        </div>

        {!user?.email && (
          <div>
            <label className="block text-sm font-medium mb-2">E-posta (isteğe bağlı)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="E-posta adresin (opsiyonel)"
            />
          </div>
        )}
      </div>
    )
  }

  function LevelStep() {
    const levels = [
      {
        value: 'başlangıç',
        title: 'Başlangıç',
        description: 'YKS\'ye yeni başlıyorum',
        icon: '🌱'
      },
      {
        value: 'orta',
        title: 'Orta Seviye', 
        description: 'Bir süredir hazırlanıyorum',
        icon: '📈'
      },
      {
        value: 'ileri',
        title: 'İleri Seviye',
        description: 'Deneme sınavlarında iyi sonuçlar alıyorum',
        icon: '🚀'
      }
    ]

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Seviyene uygun bir plan hazırlayabilmem için mevcut durumunu belirt
          </p>
        </div>

        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => setFormData(prev => ({ ...prev, seviye: level.value as any }))}
            className={`w-full p-4 border rounded-lg text-left transition-all hover:border-primary ${
              formData.seviye === level.value 
                ? 'border-primary bg-primary/5' 
                : 'border-border'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{level.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{level.title}</h3>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
              {formData.seviye === level.value && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  function HoursStep() {
    const hourOptions = [5, 10, 15, 20, 25, 30, 35, 40]

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Haftada kaç saat çalışma zamanın var? Gerçekçi bir sayı seç!
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4">
            Haftalık çalışma süren: <span className="text-primary font-semibold">{formData.haftalık_saat} saat</span>
          </label>
          
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={formData.haftalık_saat}
            onChange={(e) => setFormData(prev => ({ ...prev, haftalık_saat: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>5 saat</span>
            <span>40 saat</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {hourOptions.map((hours) => (
            <button
              key={hours}
              onClick={() => setFormData(prev => ({ ...prev, haftalık_saat: hours }))}
              className={`p-2 text-sm border rounded-lg transition-all ${
                formData.haftalık_saat === hours 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-border hover:border-primary'
              }`}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>
    )
  }

  function DateStep() {
    // Calculate next YKS date (typically June)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const yksYear = currentMonth >= 6 ? currentYear + 1 : currentYear // After June, target next year
    const defaultDate = `${yksYear}-06-15` // Approximate YKS date

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            YKS sınav tarihini belirle. Bu tarihe göre çalışma programını optimize edeceğim.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hedef YKS Tarihi</label>
          <input
            type="date"
            value={formData.hedef_tarih || defaultDate}
            onChange={(e) => setFormData(prev => ({ ...prev, hedef_tarih: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>İpucu:</strong> YKS genellikle Haziran ayının ikinci yarısında yapılır. 
            Tam tarih açıklanmadıysa yaklaşık bir tarih seçebilirsin.
          </p>
        </div>
      </div>
    )
  }

  function FieldStep() {
    const fields = [
      {
        value: 'sayisal',
        title: 'Sayısal',
        description: 'Mühendislik, Tıp, Fen bilimleri',
        icon: '🔬',
        subjects: ['Matematik', 'Fizik', 'Kimya', 'Biyoloji']
      },
      {
        value: 'ea',
        title: 'Eşit Ağırlık',
        description: 'İktisat, İşletme, Hukuk',
        icon: '⚖️',
        subjects: ['Matematik', 'Tarih', 'Coğrafya', 'Edebiyat']
      },
      {
        value: 'sozel',
        title: 'Sözel',
        description: 'Edebiyat, Tarih, Sosyoloji',
        icon: '📚',
        subjects: ['Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
      },
      {
        value: 'dil',
        title: 'Dil',
        description: 'İngilizce, Almanca, Fransızca',
        icon: '🌍',
        subjects: ['İngilizce', 'Türkçe', 'Edebiyat']
      }
    ]

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-muted-foreground">
            Hangi alana odaklanacaksın? Bu seçimine göre ders dağılımını optimize edeceğim.
          </p>
        </div>

        {fields.map((field) => (
          <button
            key={field.value}
            onClick={() => setFormData(prev => ({ ...prev, field: field.value as any }))}
            className={`w-full p-4 border rounded-lg text-left transition-all hover:border-primary ${
              formData.field === field.value 
                ? 'border-primary bg-primary/5' 
                : 'border-border'
            }`}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{field.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{field.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                <div className="flex flex-wrap gap-1">
                  {field.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              {formData.field === field.value && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      const profileData: UserProfile = {
        kullanıcı_ID: user?.id || `guest_${Date.now()}`,
        name: formData.name,
        email: formData.email || user?.email || '',
        seviye: formData.seviye,
        haftalık_saat: formData.haftalık_saat,
        hedef_tarih: formData.hedef_tarih,
        field: formData.field,
        tercihler: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (user?.isGuest) {
        // Save to localStorage for guest users
        saveGuestProfile(profileData)
      } else if (user?.id) {
        // Save to Firebase for authenticated users
        try {
          await updateUserProfile(user.id, profileData)
        } catch (error) {
          console.error('Error saving profile to Firebase:', error)
          // Fallback to localStorage if Firebase fails
          saveGuestProfile(profileData)
        }
      }

      setProfile(profileData)
      onComplete(profileData)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component
  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0
      case 1: return true // seviye her zaman set
      case 2: return formData.haftalık_saat > 0
      case 3: return formData.hedef_tarih !== ''
      case 4: return true // field her zaman set
      default: return false
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-xl max-w-lg w-full shadow-xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent />
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Geri</span>
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed() || loading}
                  className="flex items-center space-x-2"
                >
                  <span>{loading ? 'Hazırlanıyor...' : 'Tamamla'}</span>
                  <Brain className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center space-x-2"
                >
                  <span>İleri</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

