import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Plus, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Target,
  Sparkles,
  Clock,
  User,
  Settings,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/components/PlanCard'
import { ResourceList } from '@/components/ResourceList'
import { ProgressTracker } from '@/components/ProgressTracker'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserPlan, getUserProgress, savePlan, saveProgress, StudyPlan, UserProgress } from '@/lib/supabase'
import { usePlanStore } from '@/store/planStore'

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const { isDarkMode, toggleDarkMode } = usePlanStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'resources' | 'progress'>('overview')
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const [plan, progress] = await Promise.all([
          getUserPlan(user.id),
          getUserProgress(user.id)
        ])
        
        setCurrentPlan(plan)
        setUserProgress(progress)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id])

  const generateNewPlan = async () => {
    if (!user?.id || !profile) return

    setGenerating(true)
    try {
      // Call the Netlify function to generate a plan
      const response = await fetch('/.netlify/functions/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          level: profile.level,
          weekly_hours: profile.weekly_hours,
          target_date: profile.target_date,
          field: profile.field,
          preferences: profile.preferences
        })
      })

      const result = await response.json()
      
      if (result.success && result.plan) {
        // Save the plan to Supabase
        const savedPlan = await savePlan({
          user_id: user.id,
          plan_id: `plan_${Date.now()}`,
          week_number: result.plan.week_number || 1,
          plan_date: result.plan.plan_date,
          schedule: result.plan.schedule,
          resources: result.plan.resources,
          tips: result.plan.tips,
          notes: result.plan.notes,
          confidence_score: result.plan.confidence_score,
          is_active: true
        })
        
        setCurrentPlan(savedPlan)
        setActiveTab('plan')
      } else {
        throw new Error(result.error || 'Plan generation failed')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      // You might want to show a toast notification here
    } finally {
      setGenerating(false)
    }
  }

  const handleProgressUpdate = async (planId: string, itemId: string, completed: boolean) => {
    if (!user?.id) return

    try {
      await saveProgress({
        user_id: user.id,
        plan_id: planId,
        item_id: itemId,
        completed_items: { [itemId]: completed },
        study_time_minutes: completed ? 30 : 0, // Default 30 minutes when completed
        completion_date: completed ? new Date().toISOString() : undefined
      })

      // Refresh progress data
      const updatedProgress = await getUserProgress(user.id)
      setUserProgress(updatedProgress)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi öğleden sonra'
    return 'İyi akşamlar'
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
    { id: 'plan', label: 'Çalışma Planı', icon: Calendar },
    { id: 'resources', label: 'Kaynaklar', icon: BookOpen },
    { id: 'progress', label: 'İlerleme', icon: Target }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {user?.name || 'Kullanıcı'}! 👋
              </h1>
              <p className="text-muted-foreground">
                {profile ? 
                  `${profile.level === 'beginner' ? 'Başlangıç' : profile.level === 'intermediate' ? 'Orta' : 'İleri'} seviye • ${profile.field === 'science' ? 'Sayısal' : profile.field === 'social' ? 'Sözel' : profile.field === 'language' ? 'Dil' : 'Eşit Ağırlık'} alan` :
                  'Profilinizi tamamlayın'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
              <Button 
                onClick={generateNewPlan}
                disabled={generating}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {generating ? 'Oluşturuluyor...' : 'Yeni Plan Oluştur'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {currentPlan ? '1' : '0'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Aktif Plan</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentPlan ? 'Planınız hazır!' : 'Plan oluşturun'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200 dark:border-green-800 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round(userProgress.reduce((acc, p) => acc + p.study_time_minutes, 0) / 60)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Toplam Saat</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Bu hafta çalışılan
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {userProgress.filter(p => p.completion_date).length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Tamamlanan</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Görev sayısı
                  </p>
                </motion.div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Plan Preview */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Son Planınız</h3>
                  {currentPlan ? (
                    <PlanCard 
                      plan={currentPlan} 
                      onToggleItem={(itemId, completed) => 
                        handleProgressUpdate(currentPlan.id, itemId, completed)
                      }
                      className="max-h-96 overflow-y-auto"
                    />
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">Henüz plan yok</h4>
                      <p className="text-muted-foreground mb-4">
                        AI destekli kişiselleştirilmiş planınızı oluşturun
                      </p>
                      <Button onClick={generateNewPlan} disabled={generating}>
                        <Plus className="w-4 h-4 mr-2" />
                        İlk Planımı Oluştur
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Overview */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">İlerleme Özeti</h3>
                  <ProgressTracker 
                    progress={userProgress}
                    weeklyGoal={profile?.weekly_hours ? profile.weekly_hours * 60 : 1200}
                    targetDate={profile?.target_date}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div>
              {currentPlan ? (
                <PlanCard 
                  plan={currentPlan}
                  onToggleItem={(itemId, completed) => 
                    handleProgressUpdate(currentPlan.id, itemId, completed)
                  }
                />
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Çalışma planınız yok</h3>
                  <p className="text-muted-foreground mb-6">
                    AI destekli kişiselleştirilmiş planınızı oluşturun
                  </p>
                  <Button onClick={generateNewPlan} disabled={generating} size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Plan Oluştur
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              {currentPlan && currentPlan.resources ? (
                <ResourceList 
                  resources={currentPlan.resources as any[]}
                  onResourceClick={(resource) => {
                    if (resource.url) {
                      window.open(resource.url, '_blank')
                    }
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Kaynak önerisi yok</h3>
                  <p className="text-muted-foreground mb-6">
                    Önce bir çalışma planı oluşturun
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <ProgressTracker 
              progress={userProgress}
              weeklyGoal={profile?.weekly_hours ? profile.weekly_hours * 60 : 1200}
              targetDate={profile?.target_date}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
