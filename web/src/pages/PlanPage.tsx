import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { Brain, ArrowLeft, Download, Share, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/components/PlanCard'
import { ResourceList } from '@/components/ResourceList'
import { Navbar } from '@/components/Navbar'
import { getUserPlan, savePlan, StudyPlan } from '@/lib/supabase'
import { usePlanStore } from '@/store/planStore'

export const PlanPage: React.FC = () => {
  const { user, profile } = useAuth()
  const { isDarkMode, toggleDarkMode } = usePlanStore()
  const navigate = useNavigate()
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const loadPlan = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const plan = await getUserPlan(user.id)
        setCurrentPlan(plan)
      } catch (error) {
        console.error('Error loading plan:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [user?.id])

  const generateNewPlan = async () => {
    if (!user?.id || !profile) return

    setGenerating(true)
    try {
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
      }
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setGenerating(false)
    }
  }

  const exportPlan = (format: 'pdf' | 'json') => {
    if (!currentPlan) return

    if (format === 'json') {
      const dataStr = JSON.stringify(currentPlan, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `plan_${currentPlan.week_number}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
    // PDF export would need additional implementation
  }

  const sharePlan = async () => {
    if (!currentPlan) return

    try {
      await navigator.share({
        title: `Hafta ${currentPlan.week_number} Çalışma Planı`,
        text: 'YKS AI Asistanı ile oluşturduğum çalışma planımı paylaşıyorum!',
        url: window.location.href
      })
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Plan yükleniyor...</span>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 md:mb-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard'a Dön
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              {currentPlan ? `Hafta ${currentPlan.week_number} Planı` : 'Çalışma Planı'}
            </h1>
            <p className="text-muted-foreground">
              {currentPlan 
                ? `${new Date(currentPlan.plan_date).toLocaleDateString('tr-TR')} tarihinde oluşturuldu`
                : 'Henüz bir planınız bulunmuyor'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentPlan && (
              <>
                <Button variant="outline" size="sm" onClick={() => exportPlan('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
                <Button variant="outline" size="sm" onClick={sharePlan}>
                  <Share className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </>
            )}
            <Button 
              onClick={generateNewPlan}
              disabled={generating}
              className="bg-gradient-to-r from-primary to-blue-600"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {generating ? 'Oluşturuluyor...' : currentPlan ? 'Yeni Plan' : 'Plan Oluştur'}
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        {currentPlan ? (
          <div className="space-y-8">
            {/* Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PlanCard plan={currentPlan} />
            </motion.div>

            {/* Resources */}
            {currentPlan.resources && currentPlan.resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ResourceList 
                  resources={currentPlan.resources as any[]}
                  onResourceClick={(resource) => {
                    if (resource.url) {
                      window.open(resource.url, '_blank')
                    }
                  }}
                />
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <Brain className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Çalışma planınız hazır değil</h2>
              <p className="text-muted-foreground mb-8">
                AI destekli kişiselleştirilmiş çalışma planınızı oluşturmak için aşağıdaki butona tıklayın.
              </p>
              <Button 
                onClick={generateNewPlan}
                disabled={generating}
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600"
              >
                {generating ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {generating ? 'Plan Oluşturuluyor...' : 'İlk Planımı Oluştur'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
