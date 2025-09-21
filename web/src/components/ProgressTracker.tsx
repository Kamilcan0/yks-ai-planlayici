import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Trophy,
  Flame,
  Zap
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { UserProgress } from '@/lib/supabase'

interface ProgressTrackerProps {
  progress: UserProgress[]
  weeklyGoal?: number
  targetDate?: string
  className?: string
}

interface WeeklyStats {
  studiedDays: number
  totalMinutes: number
  completedItems: number
  avgConfidence: number
  streak: number
}

interface DailyProgress {
  date: string
  minutes: number
  itemsCompleted: number
  subjects: string[]
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  weeklyGoal = 20 * 60, // 20 hours in minutes
  targetDate,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    let filteredProgress = progress
    switch (selectedPeriod) {
      case 'week':
        filteredProgress = progress.filter(p => new Date(p.created_at) >= weekStart)
        break
      case 'month':
        filteredProgress = progress.filter(p => new Date(p.created_at) >= monthStart)
        break
      default:
        filteredProgress = progress
    }

    const totalMinutes = filteredProgress.reduce((acc, p) => acc + p.study_time_minutes, 0)
    const completedCount = filteredProgress.filter(p => p.completion_date).length
    const uniqueDays = new Set(filteredProgress.map(p => 
      new Date(p.created_at).toDateString()
    )).size

    // Calculate streak (consecutive days with study)
    const dailyProgress = new Map<string, boolean>()
    filteredProgress.forEach(p => {
      const date = new Date(p.created_at).toDateString()
      dailyProgress.set(date, true)
    })

    let streak = 0
    let currentDate = new Date()
    while (dailyProgress.has(currentDate.toDateString())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return {
      totalMinutes,
      completedCount,
      studiedDays: uniqueDays,
      weeklyProgress: (totalMinutes / weeklyGoal) * 100,
      streak,
      avgSessionTime: uniqueDays > 0 ? totalMinutes / uniqueDays : 0
    }
  }, [progress, selectedPeriod, weeklyGoal])

  // Group progress by day for chart
  const dailyData = useMemo(() => {
    const grouped = new Map<string, DailyProgress>()
    
    progress.forEach(p => {
      const date = new Date(p.created_at).toISOString().split('T')[0]
      const existing = grouped.get(date) || {
        date,
        minutes: 0,
        itemsCompleted: 0,
        subjects: []
      }
      
      existing.minutes += p.study_time_minutes
      if (p.completion_date) {
        existing.itemsCompleted++
      }
      
      // Extract subjects from completed_items
      if (p.completed_items && typeof p.completed_items === 'object') {
        Object.keys(p.completed_items).forEach(subject => {
          if (!existing.subjects.includes(subject)) {
            existing.subjects.push(subject)
          }
        })
      }
      
      grouped.set(date, existing)
    })
    
    return Array.from(grouped.values()).slice(-7) // Last 7 days
  }, [progress])

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}dk`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours} saat`
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (streak >= 3) return <Flame className="w-5 h-5 text-orange-500" />
    if (streak >= 1) return <Zap className="w-5 h-5 text-blue-500" />
    return <Target className="w-5 h-5 text-gray-400" />
  }

  const getMotivationalMessage = () => {
    if (stats.streak >= 7) {
      return "Harika! 🔥 7 günlük serini tamamladın!"
    }
    if (stats.streak >= 3) {
      return "Süper! 💪 Serin devam ediyor!"
    }
    if (stats.completedCount > 0) {
      return "İyi gidiyorsun! 👍 Devam et!"
    }
    return "Başlayalım! 🚀 İlk adımını at!"
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          İlerleme Takibi
        </h3>
        <div className="flex rounded-lg bg-muted p-1">
          {(['week', 'month', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="text-xs"
            >
              {period === 'week' ? 'Hafta' : period === 'month' ? 'Ay' : 'Tümü'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Toplam Süre</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{formatTime(stats.totalMinutes)}</div>
            <div className="text-xs text-muted-foreground">
              Ortalama: {formatTime(Math.round(stats.avgSessionTime))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Tamamlanan</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{stats.completedCount}</div>
            <div className="text-xs text-muted-foreground">
              {stats.studiedDays} gün çalışıldı
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            {getStreakIcon(stats.streak)}
            <span className="text-sm text-muted-foreground">Seri</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{stats.streak}</div>
            <div className="text-xs text-muted-foreground">
              {stats.streak > 0 ? 'gün üst üste' : 'seri yok'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Haftalık Hedef</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">
              {Math.round(stats.weeklyProgress)}%
            </div>
            <Progress value={stats.weeklyProgress} className="h-2" />
          </div>
        </motion.div>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{getMotivationalMessage()}</h4>
            <p className="text-sm text-muted-foreground">
              {targetDate && `Hedef tarih: ${new Date(targetDate).toLocaleDateString('tr-TR')}`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Daily Progress Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Son 7 Gün</h4>
        <div className="space-y-4">
          {dailyData.map((day, index) => {
            const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 60)
            const percentage = (day.minutes / maxMinutes) * 100
            
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {new Date(day.date).toLocaleDateString('tr-TR', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                      {formatTime(day.minutes)}
                    </span>
                    {day.itemsCompleted > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                        {day.itemsCompleted} tamamlandı
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className="h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                  />
                </div>
                {day.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {day.subjects.map((subject, i) => (
                      <span
                        key={i}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Hedef Belirle
        </Button>
        <Button variant="outline" size="sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          Hatırlatıcı Ayarla
        </Button>
      </div>
    </div>
  )
}
