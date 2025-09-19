import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Target, Clock, BookOpen, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OnboardingData {
  name: string
  level: 'başlangıç' | 'orta' | 'ileri'
  weeklyHours: number
  targetDate: string
  field: 'sayisal' | 'ea' | 'sozel' | 'dil'
  subjects: Record<string, number>
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    level: 'orta',
    weeklyHours: 20,
    targetDate: '',
    field: 'sayisal',
    subjects: {}
  })

  const steps = [
    {
      title: 'Kendini Tanıt',
      icon: Target,
      component: <PersonalInfoStep />
    },
    {
      title: 'Seviye & Hedef',
      icon: BookOpen,
      component: <LevelTargetStep />
    },
    {
      title: 'Çalışma Planı',
      icon: Clock,
      component: <StudyPlanStep />
    },
    {
      title: 'Tamamlandı!',
      icon: CheckCircle,
      component: <CompletionStep />
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(data)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function PersonalInfoStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Merhaba! 👋
          </h2>
          <p className="text-muted-foreground">
            Sana özel bir YKS planı oluşturmak için birkaç soru soracağım.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Adın nedir?
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Adını gir"
              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Hangi alanda YKS'ye hazırlanıyorsun?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'sayisal', label: 'Sayısal', emoji: '📊' },
                { value: 'ea', label: 'Eşit Ağırlık', emoji: '⚖️' },
                { value: 'sozel', label: 'Sözel', emoji: '📚' },
                { value: 'dil', label: 'Dil', emoji: '🌍' }
              ].map((field) => (
                <motion.button
                  key={field.value}
                  type="button"
                  onClick={() => setData({ ...data, field: field.value as any })}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    data.field === field.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-1">{field.emoji}</div>
                  <div className="font-medium">{field.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function LevelTargetStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Seviye & Hedef 🎯
          </h2>
          <p className="text-muted-foreground">
            Mevcut seviyeni ve hedef tarihinizi belirleyelim.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Genel seviyeni nasıl değerlendiriyorsun?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'başlangıç', label: 'Başlangıç', desc: 'Temel konularda eksiklerim var', emoji: '🌱' },
                { value: 'orta', label: 'Orta', desc: 'Konuları biliyorum, pratik yapmam lazım', emoji: '📈' },
                { value: 'ileri', label: 'İleri', desc: 'İyi seviyedeyim, hedefim yüksek puanlar', emoji: '🚀' }
              ].map((level) => (
                <motion.button
                  key={level.value}
                  type="button"
                  onClick={() => setData({ ...data, level: level.value as any })}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    data.level === level.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.desc}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              YKS hedef tarihin nedir?
            </label>
            <input
              type="date"
              value={data.targetDate}
              onChange={(e) => setData({ ...data, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>
    )
  }

  function StudyPlanStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Çalışma Planı ⏰
          </h2>
          <p className="text-muted-foreground">
            Haftada kaç saat çalışabilirsin?
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-4 block">
              Haftalık çalışma saatin: <span className="text-primary font-bold">{data.weeklyHours} saat</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={data.weeklyHours}
              onChange={(e) => setData({ ...data, weeklyHours: parseInt(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>5 saat</span>
              <span>30 saat</span>
              <span>60 saat</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">📊 Tavsiyemiz:</h3>
            <p className="text-sm text-muted-foreground">
              {data.weeklyHours < 15 && "Az ama düzenli çalışma. Günde 2-3 saat odaklanmış çalışma yapabilirsin."}
              {data.weeklyHours >= 15 && data.weeklyHours <= 35 && "İdeal seviye! Hem sosyal hayatına hem de çalışmana zaman ayırabilirsin."}
              {data.weeklyHours > 35 && "Yoğun bir tempo! Burnout'a dikkat et, düzenli molalar almayı unutma."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  function CompletionStep() {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Harika! Hazırsın! 🎉
          </h2>
          <p className="text-muted-foreground mb-6">
            Şimdi sana özel AI destekli çalışma planını oluşturuyorum...
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg text-left">
          <h3 className="font-medium mb-3">📝 Özet:</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>İsim:</strong> {data.name}</li>
            <li><strong>Alan:</strong> {data.field.charAt(0).toUpperCase() + data.field.slice(1)}</li>
            <li><strong>Seviye:</strong> {data.level.charAt(0).toUpperCase() + data.level.slice(1)}</li>
            <li><strong>Haftalık Süre:</strong> {data.weeklyHours} saat</li>
            <li><strong>Hedef Tarih:</strong> {data.targetDate || 'Belirtilmedi'}</li>
          </ul>
        </div>
      </div>
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.name.trim().length > 1 && data.field
      case 1:
        return data.level && data.targetDate
      case 2:
        return data.weeklyHours > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">YKS AI Asistanı Kurulumu</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                  }}
                >
                  <step.icon className="w-4 h-4" />
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {currentStep === steps.length - 1 ? 'Planımı Oluştur' : 'İleri'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
