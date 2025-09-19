import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Settings, BarChart3, Download, Calendar as CalendarIcon, Code2, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlanStore } from '@/store/planStore'
import { PlanCard } from '@/components/PlanCard'
import { Dashboard } from '@/components/Dashboard'
import { SubjectForm } from '@/components/SubjectForm'
import { Notifications } from '@/components/Notifications'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PlanGeneratorDemo } from '@/components/PlanGeneratorDemo'
import { AIAssistantDemo } from '@/components/AIAssistantDemo'
import { exportElementToPdf, exportWeekToExcel } from './export'

export const App = () => {
  const { 
    name, field, level, isDarkMode, sessions, subjects, stats,
    setUserInfo, toggleDarkMode, generateWeeklyPlan
  } = usePlanStore()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'subjects' | 'demo' | 'ai'>('dashboard')
  const [showSettings, setShowSettings] = useState(!name)

  const handleUserSetup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userName = formData.get('name') as string
    const userField = formData.get('field') as string
    const userLevel = parseInt(formData.get('level') as string)
    
    setUserInfo(userName, userField, userLevel)
    setShowSettings(false)
    generateWeeklyPlan()
  }

  const exportPlan = (format: 'pdf' | 'excel' | 'png') => {
    const planElement = document.getElementById('weekly-plan')
    if (!planElement) return

    switch (format) {
      case 'pdf':
        exportElementToPdf('weekly-plan', 'haftalik_plan.pdf')
        break
      case 'excel':
        // Convert sessions to excel format
        const excelData = sessions.map(session => {
          const subject = subjects.find(s => s.id === session.subjectId)
          return {
            Gün: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'][session.dayIndex],
            Saat: session.startTime,
            Ders: subject?.name || 'Bilinmeyen',
            Süre: `${session.duration} dk`,
            Durum: session.isCompleted ? 'Tamamlandı' : 'Bekliyor'
          }
        })
        exportWeekToExcel(excelData as any, 'haftalik_plan.xlsx')
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

  if (showSettings || !name) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">AI Destekli YKS Planlayıcı</CardTitle>
                <p className="text-muted-foreground">Kişiselleştirilmiş çalışma planını oluştur</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserSetup} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Adın</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Adını gir"
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Alan</label>
                    <select
                      name="field"
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      defaultValue="sayisal"
                    >
                      <option value="sayisal">Sayısal</option>
                      <option value="ea">Eşit Ağırlık</option>
                      <option value="sozel">Sözel</option>
                      <option value="dil">Dil</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Genel Seviye (1-5)</label>
                    <input
                      name="level"
                      type="range"
                      min="1"
                      max="5"
                      defaultValue="3"
                      className="w-full mt-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Başlangıç</span>
                      <span>İleri</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Planımı Oluştur
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Notifications />
        
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">YKS Planlayıcı</h1>
                <span className="text-muted-foreground">Merhaba, {name}!</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4" />
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                  <Moon className="w-4 h-4" />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="border-b bg-card/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Kontrol Paneli', icon: BarChart3 },
                { id: 'plan', label: 'Haftalık Plan', icon: CalendarIcon },
                { id: 'subjects', label: 'Dersler', icon: Settings },
                { id: 'demo', label: 'Plan Üretici Demo', icon: Code2 },
                { id: 'ai', label: 'AI Asistan', icon: Brain }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Haftalık Çalışma Planın</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPlan('pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPlan('excel')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPlan('png')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                </div>
              </div>

              <div id="weekly-plan" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                  <PlanCard
                    key={dayIndex}
                    dayIndex={dayIndex}
                    sessions={sessions}
                    subjects={subjects}
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'subjects' && <SubjectForm />}
          
          {activeTab === 'demo' && <PlanGeneratorDemo />}
          
          {activeTab === 'ai' && <AIAssistantDemo />}
        </main>
      </div>
    </ThemeProvider>
  )
}


