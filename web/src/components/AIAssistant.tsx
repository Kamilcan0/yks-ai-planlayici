import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Calendar, BookOpen, TrendingUp, Target, Clock, Award, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { aiPlanGenerator, type UserProfile, type WeeklyPlan, type PerformanceData } from '@/lib/ai/aiPlanGenerator'

interface AIAssistantProps {
  user: UserProfile
  onPlanGenerated?: (plan: WeeklyPlan) => void
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ user, onPlanGenerated }) => {
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'resources' | 'progress'>('overview')

  useEffect(() => {
    loadExistingPlan()
  }, [user.kullanıcı_ID])

  const loadExistingPlan = async () => {
    try {
      const existingPlan = await aiPlanGenerator.loadPlanFromDatabase(user.kullanıcı_ID)
      if (existingPlan) {
        setCurrentPlan(existingPlan)
      }
    } catch (err) {
      console.error('Error loading existing plan:', err)
    }
  }

  const generateNewPlan = async (performanceData?: PerformanceData[]) => {
    setIsGenerating(true)
    setError(null)

    try {
      const newPlan = aiPlanGenerator.generateWeeklyPlan(user, performanceData)
      
      // Save to database
      const saved = await aiPlanGenerator.savePlanToDatabase(newPlan)
      if (saved) {
        setCurrentPlan(newPlan)
        onPlanGenerated?.(newPlan)
      } else {
        setError('Plan kaydedilemedi, ancak görüntüleyebilirsiniz.')
        setCurrentPlan(newPlan)
      }
    } catch (err) {
      setError('Plan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Error generating plan:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const updatePerformance = async (performance: PerformanceData) => {
    try {
      await aiPlanGenerator.updatePerformance(user.kullanıcı_ID, performance)
      // Regenerate plan with new performance data
      await generateNewPlan([performance])
    } catch (err) {
      console.error('Error updating performance:', err)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: Brain },
    { id: 'schedule', label: 'Program', icon: Calendar },
    { id: 'resources', label: 'Kaynaklar', icon: BookOpen },
    { id: 'progress', label: 'İlerleme', icon: TrendingUp }
  ]

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Merhaba {user.name}! 👋
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentPlan ? 
                  'Kişiselleştirilmiş çalışma planın hazır! Haftalık hedefin ve kaynak önerilerini inceleyebilirsin.' :
                  'Sana özel bir YKS çalışma planı oluşturmak için AI asistanını kullanabiliriz. Seviye ve hedeflerine göre optimize edilmiş bir program hazırlayacağım.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Stats */}
      {currentPlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Haftalık Süre</p>
                  <p className="text-2xl font-bold">{currentPlan.toplam_haftalık_saat}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Başarı Tahmini</p>
                  <p className="text-2xl font-bold">%{currentPlan.başarı_tahmini}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Kaynak Önerisi</p>
                  <p className="text-2xl font-bold">{currentPlan.kaynak_önerileri.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adaptation Notes */}
      {currentPlan && currentPlan.adaptasyon_notları.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>AI Analizi & Öneriler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentPlan.adaptasyon_notları.map((note, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{note}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Generate Plan Button */}
      <div className="text-center">
        <Button
          onClick={() => generateNewPlan()}
          disabled={isGenerating}
          size="lg"
          className="px-8"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
          ) : (
            <Brain className="w-5 h-5 mr-2" />
          )}
          {currentPlan ? 'Planı Yeniden Oluştur' : 'AI Planımı Oluştur'}
        </Button>
      </div>
    </div>
  )

  const ScheduleTab = () => (
    <div className="space-y-6">
      {currentPlan ? (
        currentPlan.haftalık_plan.map((day, index) => (
          <motion.div
            key={day.gün}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{day.gün}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TYT */}
                  <div>
                    <h4 className="font-medium mb-3 text-blue-600">TYT</h4>
                    <div className="space-y-2">
                      {day.TYT.map((session, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="font-medium">{session.konu}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.soru_sayısı} soru • {session.süre_dakika} dk
                          </p>
                          {session.not && (
                            <p className="text-xs text-blue-600 mt-1">{session.not}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AYT */}
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">AYT</h4>
                    <div className="space-y-2">
                      {day.AYT.map((session, idx) => (
                        <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="font-medium">{session.konu}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.soru_sayısı} soru • {session.süre_dakika} dk
                          </p>
                          {session.not && (
                            <p className="text-xs text-green-600 mt-1">{session.not}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Henüz bir çalışma programın yok. AI planını oluştur!
          </p>
        </div>
      )}
    </div>
  )

  const ResourcesTab = () => (
    <div className="space-y-4">
      {currentPlan ? (
        currentPlan.kaynak_önerileri.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-l-4 ${
              resource.öncelik === 'yüksek' ? 'border-l-red-500' :
              resource.öncelik === 'orta' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{resource.isim}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        resource.öncelik === 'yüksek' ? 'bg-red-100 text-red-700' :
                        resource.öncelik === 'orta' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {resource.öncelik} öncelik
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>{resource.konu}</strong> • {resource.tip} • {resource.zorluk} seviye
                    </p>
                    
                    <p className="text-sm mb-2">
                      ⏱️ Tahmini süre: {resource.beklenen_süre_dakika} dakika
                    </p>
                    
                    {resource.not && (
                      <p className="text-sm text-blue-600">{resource.not}</p>
                    )}
                    
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Kaynağa git →
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Henüz kaynak önerilerini yok. AI planını oluştur!
          </p>
        </div>
      )}
    </div>
  )

  const ProgressTab = () => (
    <div className="space-y-6">
      {currentPlan && (
        <>
          {/* Success Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Başarı Tahmini</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Genel Başarı Oranı</span>
                    <span className="font-bold">%{currentPlan.başarı_tahmini}</span>
                  </div>
                  <Progress value={currentPlan.başarı_tahmini} className="h-3" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Bu tahmin, seviyene, çalışma sürenize ve geçmiş performansına göre hesaplanmıştır.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Input */}
          <Card>
            <CardHeader>
              <CardTitle>Performans Güncelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Çözdüğün soruları kaydet, AI planını daha da kişiselleştirsin!
              </p>
              
              <Button variant="outline" className="w-full">
                Soru Çözümü Kaydet
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Bir Hata Oluştu</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => setError(null)}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'progress' && <ProgressTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
