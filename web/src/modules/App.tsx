import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Home, Info, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlanStore } from '@/store/planStore'
import { Dashboard } from '@/components/Dashboard'
import { SubjectForm } from '@/components/SubjectForm'
import { Notifications } from '@/components/Notifications'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PlanGeneratorDemo } from '@/components/PlanGeneratorDemo'
import { AIAssistantDemo } from '@/components/AIAssistantDemo'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/components/ContactForm'
import { OnboardingModal } from '@/components/OnboardingModal'
import { PlanGenerator } from '@/components/PlanGenerator'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import { StudyPlan } from '@/lib/api'
import { exportElementToPdf, exportWeekToExcel } from './export'

const AppContent = () => {
  const { user, profile } = useAuth()
  const { 
    isDarkMode, sessions, subjects, stats,
    toggleDarkMode, generateWeeklyPlan
  } = usePlanStore()
  
  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'contact'>('home')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'plan' | 'subjects' | 'demo'>('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)

  // Show onboarding if user exists but no profile
  useEffect(() => {
    if (user && !profile) {
      setShowOnboarding(true)
    } else {
      setShowOnboarding(false)
    }
  }, [user, profile])

  const handleOnboardingComplete = (profileData: any) => {
    setShowOnboarding(false)
    // Profile is handled by AuthProvider
  }

  const exportPlan = (format: 'pdf' | 'excel' | 'png') => {
    const planElement = document.getElementById('weekly-plan')
    if (!planElement) return

    switch (format) {
      case 'pdf':
        exportElementToPdf('weekly-plan', 'haftalik_plan.pdf')
        break
      case 'excel':
        if (currentPlan) {
          const excelData = currentPlan.haftalık_plan.flatMap(day => 
            [...day.TYT, ...day.AYT].map(session => ({
              Gün: day.gün,
              Tür: day.TYT.includes(session) ? 'TYT' : 'AYT',
              Konu: session.konu,
              'Soru Sayısı': session.soru_sayısı,
              'Süre (dk)': session.süre_dakika,
              Not: session.not || ''
            }))
          )
          exportWeekToExcel(excelData as any, 'haftalik_plan.xlsx')
        }
        break
      case 'png':
        import('html2canvas-pro').then(html2canvas => {
          html2canvas.default(planElement).then(canvas => {
            const link = document.createElement('a')
            link.download = 'haftalik_plan.png'
            link.href = canvas.toDataURL()
            link.click()
          })
        })
        break
    }
  }

  // Show onboarding modal
  if (showOnboarding) {
    return (
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  // Main application sections
  const HomeSection = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            YKS <span className="text-primary">AI Asistanı</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Yapay zeka destekli kişiselleştirilmiş çalışma planları ile YKS hedeflerinize daha hızlı ulaşın.
            Adaptif öğrenme algoritması ile başarınızı maksimize edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setActiveTab('ai')} className="px-8">
              <Brain className="w-5 h-5 mr-2" />
              AI Planımı Oluştur
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveTab('dashboard')}>
              Dashboard'a Git
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Brain,
            title: 'AI Destekli Planlama',
            description: 'Kişiselleştirilmiş çalışma programları ve adaptif öğrenme',
            color: 'text-blue-500'
          },
          {
            icon: Info,
            title: 'Akıllı Analiz',
            description: 'Performans takibi ve zayıf konularda ekstra odaklanma',
            color: 'text-green-500'
          },
          {
            icon: MessageSquare,
            title: 'Kaynak Önerileri',
            description: 'Seviyene uygun kitap, video ve soru bankası tavsiyeleri',
            color: 'text-purple-500'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card border rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Tab Navigation for App */}
      <section>
        <div className="border-b mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'ai', label: 'AI Asistan', icon: Brain },
              { id: 'plan', label: 'Haftalık Plan', icon: Brain },
              { id: 'subjects', label: 'Dersler', icon: Info },
              { id: 'demo', label: 'Demo', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'ai' && <PlanGenerator onPlanGenerated={setCurrentPlan} />}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Haftalık Çalışma Planın</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportPlan('pdf')}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportPlan('excel')}>
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportPlan('png')}>
                    PNG
                  </Button>
                </div>
              </div>

              <div id="weekly-plan">
                {currentPlan ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {currentPlan.haftalık_plan.map((day, index) => (
                      <motion.div
                        key={day.gün}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-card border rounded-xl"
                      >
                        <h3 className="text-lg font-semibold mb-4">{day.gün}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-blue-600 mb-2">TYT</h4>
                            <div className="space-y-2">
                              {day.TYT.map((session, idx) => (
                                <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <p className="font-medium">{session.konu}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.soru_sayısı} soru • {session.süre_dakika} dk
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-green-600 mb-2">AYT</h4>
                            <div className="space-y-2">
                              {day.AYT.map((session, idx) => (
                                <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <p className="font-medium">{session.konu}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.soru_sayısı} soru • {session.süre_dakika} dk
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Henüz AI planın oluşturulmamış. AI Asistan sekmesinden planını oluştur!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'subjects' && <SubjectForm />}
          {activeTab === 'demo' && (
            <div className="space-y-8">
              <PlanGeneratorDemo />
              <AIAssistantDemo />
            </div>
          )}
        </motion.div>
      </section>
    </div>
  )

  const AboutSection = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-6">Hakkımızda</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          kfmatematik, YKS'ye hazırlanan öğrenciler için yapay zeka destekli 
          eğitim çözümleri sunan yenilikçi bir platformdur.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Misyonumuz</h2>
          <p className="text-muted-foreground leading-relaxed">
            Her öğrencinin kendi potansiyelini maksimuma çıkarabilmesi için 
            kişiselleştirilmiş, akıllı ve etkili çalışma deneyimleri sunmak.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Vizyonumuz</h2>
          <p className="text-muted-foreground leading-relaxed">
            Türkiye'nin en gelişmiş AI destekli eğitim platformu olmak ve 
            öğrencilerin başarısına katkıda bulunmak.
          </p>
        </div>
      </div>
    </div>
  )

  const ContactSection = () => (
    <div className="max-w-4xl mx-auto">
      <ContactForm />
    </div>
  )

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Notifications />
        
        <Header 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 container mx-auto px-4 py-8">
          {activeSection === 'home' && <HomeSection />}
          {activeSection === 'about' && <AboutSection />}
          {activeSection === 'contact' && <ContactSection />}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  )
}

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}