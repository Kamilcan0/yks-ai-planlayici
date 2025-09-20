import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePlan, StudyPlan, AdaptiveScheduler, Telemetry } from '@/lib/api'
import { useAuth } from '@/components/auth/AuthProvider'
import { PlanCard } from './PlanCard'

interface PlanGeneratorProps {
  onPlanGenerated?: (plan: StudyPlan) => void
}

export const PlanGenerator: React.FC<PlanGeneratorProps> = ({ onPlanGenerated }) => {
  const { user, profile } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState(false)
  const [planStats, setPlanStats] = useState<{
    totalBlocks: number
    totalHours: number
    confidence: number
  } | null>(null)

  const handleGeneratePlan = async () => {
    if (!user || !profile) {
      setError('Lütfen önce giriş yapın ve profilinizi tamamlayın')
      return
    }

    setLoading(true)
    setError(null)
    const startTime = Date.now()

    try {
      const userData = {
        kullanıcı_ID: user.id,
        seviye: profile.seviye,
        haftalık_saat: profile.haftalık_saat,
        hedef_tarih: profile.hedef_tarih,
        field: profile.field || 'sayisal',
        tercihler: profile.tercihler || {}
      }

      const result = await generatePlan(userData)
      
      // Apply adaptive scheduling
      const optimizedPlan = AdaptiveScheduler.optimizeBlockDistribution(
        profile.haftalık_saat,
        result.plan
      )

      setCurrentPlan(optimizedPlan)
      setMockMode(result.mock_mode || false)
      
      // Calculate plan statistics
      const allBlocks = optimizedPlan.haftalık_plan.flatMap(day => [...day.TYT, ...day.AYT])
      const totalMinutes = allBlocks.reduce((sum, block) => sum + block.süre_dakika, 0)
      const avgConfidence = allBlocks.length > 0 
        ? allBlocks.reduce((sum, block) => sum + block.confidence, 0) / allBlocks.length
        : 0

      setPlanStats({
        totalBlocks: allBlocks.length,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        confidence: Math.round(avgConfidence * 100)
      })

      onPlanGenerated?.(optimizedPlan)

      // Track telemetry
      const duration = Date.now() - startTime
      Telemetry.trackPlanGeneration(user.id, duration, true, result.mock_mode || false)

      if (result.warning) {
        setError(`⚠️ ${result.warning}`)
      }

    } catch (err) {
      const duration = Date.now() - startTime
      Telemetry.trackPlanGeneration(user.id, duration, false, false)
      
      setError(err instanceof Error ? err.message : 'Plan oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleProgressUpdate = (blockId: string, completed: boolean) => {
    // Update local state optimistically
    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        haftalık_plan: currentPlan.haftalık_plan.map(day => ({
          ...day,
          TYT: day.TYT.map(block => 
            block.blok_id === blockId ? { ...block, completed } : block
          ),
          AYT: day.AYT.map(block => 
            block.blok_id === blockId ? { ...block, completed } : block
          )
        }))
      }
      setCurrentPlan(updatedPlan)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Giriş Gerekli</h3>
        <p className="text-muted-foreground">
          AI destekli plan oluşturmak için lütfen giriş yapın
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Profil Tamamlanmamış</h3>
        <p className="text-muted-foreground">
          Lütfen önce onboarding sürecini tamamlayın
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI Destekli Plan Oluşturucu</span>
        </motion.div>

        <h2 className="text-3xl font-bold mb-2">Kişiselleştirilmiş Çalışma Planın</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Yapay zeka teknolojisi ile seviyene, hedefinе ve çalışma saatlerine özel 
          optimize edilmiş haftalık çalışma planı oluştur.
        </p>
      </div>

      {/* User Info Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Seviye:</span>
            <p className="font-medium capitalize">{profile.seviye}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Haftalık Saat:</span>
            <p className="font-medium">{profile.haftalık_saat} saat</p>
          </div>
          <div>
            <span className="text-muted-foreground">Alan:</span>
            <p className="font-medium capitalize">{profile.field || 'Sayısal'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Hedef:</span>
            <p className="font-medium">{profile.hedef_tarih}</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={handleGeneratePlan}
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Plan Oluşturuluyor...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              {currentPlan ? 'Planı Yenile' : 'Plan Oluştur'}
            </>
          )}
        </Button>

        {loading && (
          <div className="mt-4 space-y-2 max-w-md mx-auto">
            <div className="text-sm text-muted-foreground">
              AI senin için en uygun planı hazırlıyor...
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">
                {error.includes('⚠️') ? 'Uyarı' : 'Hata'}
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mock Mode Warning */}
      {mockMode && currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Demo Modu</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Bu plan demo amaçlıdır. Gerçek AI özelliklerinin aktif olması için environment değişkenlerini ayarlayın.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan Statistics */}
      {planStats && currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{planStats.totalBlocks}</div>
            <div className="text-sm text-muted-foreground">Toplam Blok</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{planStats.totalHours}h</div>
            <div className="text-sm text-muted-foreground">Toplam Süre</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{planStats.confidence}%</div>
            <div className="text-sm text-muted-foreground">Güven Skoru</div>
          </div>
        </motion.div>
      )}

      {/* Generated Plan */}
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Plan Hazır!</h4>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Haftalık çalışma planın başarıyla oluşturuldu. Planını takip etmek için günlük kontrol listesini kullan.
                </p>
              </div>
            </div>
          </div>

          {/* UX Recommendations */}
          {currentPlan.ux_önerileri && currentPlan.ux_önerileri.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Kullanım İpuçları</h4>
              <ul className="space-y-1">
                {currentPlan.ux_önerileri.map((öneri, idx) => (
                  <li key={idx} className="text-blue-700 dark:text-blue-300 text-sm">
                    • {öneri}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Daily Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Haftalık Program</h3>
              <span className="text-sm text-muted-foreground">
                Planınızı 1 kere kaydettikten sonra güncellenecektir
              </span>
            </div>

            <div className="grid gap-4">
              {currentPlan.haftalık_plan.map((day, index) => (
                <PlanCard
                  key={index}
                  day={day}
                  kaynak_önerileri={currentPlan.kaynak_önerileri}
                  planId={currentPlan.kullanıcı_ID + '_' + currentPlan.tarih}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          </div>

          {/* Adaptation Notes */}
          {currentPlan.adaptasyon_notları && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">🎯 Plan Notları</h4>
              <p className="text-sm text-muted-foreground">{currentPlan.adaptasyon_notları}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Today Filter Quick Access */}
      {currentPlan && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="default"
            className="rounded-full shadow-lg"
            onClick={() => {
              const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' })
              const todayElement = document.querySelector(`[data-day="${today}"]`)
              todayElement?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Bugün
          </Button>
        </div>
      )}
    </div>
  )
}

