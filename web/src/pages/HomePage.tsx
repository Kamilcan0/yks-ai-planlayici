import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Book, 
  Play,
  CheckCircle,
  Circle,
  Plus,
  Sparkles,
  Brain,
  Award,
  Fire
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateWeeklyPlan } from '@/lib/ai/plan-generator'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useToast } from '@/components/ui/toaster'

interface DailyTask {
  id: string
  subject: string
  topic: string
  duration: number
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

interface WeeklyStats {
  completedTasks: number
  totalTasks: number
  studyHours: number
  streak: number
  points: number
}

export const HomePage: React.FC = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    completedTasks: 0,
    totalTasks: 0,
    studyHours: 0,
    streak: 0,
    points: 0
  })
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  useEffect(() => {
    loadTodaysPlan()
    loadWeeklyStats()
  }, [user?.id])

  const loadTodaysPlan = async () => {
    try {
      setLoading(true)
      // TODO: Load from Supabase
      const mockTasks: DailyTask[] = [
        {
          id: '1',
          subject: 'Matematik',
          topic: 'Fonksiyonlar',
          duration: 60,
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          subject: 'Türkçe',
          topic: 'Paragraf',
          duration: 45,
          completed: true,
          priority: 'medium'
        },
        {
          id: '3',
          subject: 'Fizik',
          topic: 'Hareket',
          duration: 90,
          completed: false,
          priority: 'high'
        }
      ]
      setTodayTasks(mockTasks)
    } catch (error) {
      console.error('Error loading today\'s plan:', error)
      toast({
        title: 'Hata',
        description: 'Günlük plan yüklenirken hata oluştu',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyStats = async () => {
    try {
      // TODO: Load from Supabase
      setWeeklyStats({
        completedTasks: 12,
        totalTasks: 21,
        studyHours: 25.5,
        streak: 7,
        points: 1250
      })
    } catch (error) {
      console.error('Error loading weekly stats:', error)
    }
  }

  const generateNewPlan = async () => {
    if (!profile) return

    try {
      setGeneratingPlan(true)
      const plan = await generateWeeklyPlan({
        level: profile.seviye,
        field: profile.field,
        weeklyHours: profile.haftalık_saat,
        targetDate: profile.hedef_tarih
      })
      
      // TODO: Save to Supabase and update UI
      toast({
        title: 'Başarılı!',
        description: 'Yeni haftalık planınız oluşturuldu',
        type: 'success'
      })
      
      await loadTodaysPlan()
    } catch (error) {
      console.error('Error generating plan:', error)
      toast({
        title: 'Hata',
        description: 'Plan oluşturulurken hata oluştu',
        type: 'error'
      })
    } finally {
      setGeneratingPlan(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      setTodayTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed }
            : task
        )
      )
      
      // TODO: Update in Supabase
      toast({
        title: 'Güncellendi',
        description: 'Görev durumu güncellendi',
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950'
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-950'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }

  const completionPercentage = weeklyStats.totalTasks > 0 
    ? (weeklyStats.completedTasks / weeklyStats.totalTasks) * 100 
    : 0

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Merhaba, {profile?.name || 'Öğrenci'}! 👋
              </h1>
              <p className="text-blue-100">
                Bugün {todayTasks.filter(t => !t.completed).length} görevin var. Hadi başlayalım!
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Fire className="w-5 h-5" />
                <span className="text-lg font-bold">{weeklyStats.streak} gün</span>
              </div>
              <p className="text-sm text-blue-100">Çalışma serisi</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{weeklyStats.completedTasks}</p>
                        <p className="text-sm text-muted-foreground">Tamamlanan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{weeklyStats.studyHours}h</p>
                        <p className="text-sm text-muted-foreground">Bu hafta</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">{weeklyStats.points}</p>
                        <p className="text-sm text-muted-foreground">Puan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{Math.round(completionPercentage)}%</p>
                        <p className="text-sm text-muted-foreground">Tamamlanma</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Bugünkü Planım</span>
                  </CardTitle>
                  <Button
                    onClick={generateNewPlan}
                    disabled={generatingPlan}
                    variant="outline"
                    size="sm"
                  >
                    {generatingPlan ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Yeni Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        task.completed 
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="h-6 w-6 p-0"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${
                              task.completed ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {task.subject} - {task.topic}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.duration} dk
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Haftalık İlerleme</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tamamlanan Görevler</span>
                      <span>{weeklyStats.completedTasks}/{weeklyStats.totalTasks}</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {Math.round(completionPercentage)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Bu hafta çok iyisin! 🎉
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Çalışmaya Başla
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Book className="w-4 h-4 mr-2" />
                    Kaynak Önerileri
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Mentor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
