import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { usePlanStore } from '@/store/planStore'
import { formatDuration } from '@/lib/utils'

export function Dashboard() {
  const { stats, sessions, subjects } = usePlanStore()
  
  const todayProgress = getTodayProgress(sessions)
  const weeklyGoal = 40 // hours
  const weeklyProgress = (stats.totalHours / weeklyGoal) * 100

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Toplam Saat"
          value={`${stats.totalHours.toFixed(1)}sa`}
          icon={<Clock className="w-5 h-5" />}
          trend="+2.5sa bu hafta"
        />
        
        <StatCard
          title="Seri Gün"
          value={`${stats.streak} gün`}
          icon={<Award className="w-5 h-5" />}
          trend="Harika gidiyorsun!"
        />
        
        <StatCard
          title="Tamamlanan"
          value={`${stats.completedSessions}`}
          icon={<Calendar className="w-5 h-5" />}
          trend="ders tamamlandı"
        />
        
        <StatCard
          title="Bugün"
          value={`%${Math.round(todayProgress)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="tamamlandı"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Haftalık Hedef</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>İlerleme</span>
                <span>{stats.totalHours.toFixed(1)} / {weeklyGoal} saat</span>
              </div>
              <Progress value={Math.min(weeklyProgress, 100)} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {weeklyProgress >= 100 ? '🎉 Haftalık hedefini tamamladın!' : 
                 `Hedefe ${(weeklyGoal - stats.totalHours).toFixed(1)} saat kaldı`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ders Bazlı İlerleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.subjectHours).map(([subject, hours]) => {
                const subjectInfo = subjects.find(s => s.name === subject)
                const maxHours = Math.max(...Object.values(stats.subjectHours)) || 1
                const percentage = (hours / maxHours) * 100
                
                return (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subjectInfo?.color || '#6b7280' }}
                        />
                        <span>{subject}</span>
                      </div>
                      <span>{hours.toFixed(1)}sa</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <MotivationalCard streak={stats.streak} />
    </div>
  )
}

function StatCard({ title, value, icon, trend }: {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MotivationalCard({ streak }: { streak: number }) {
  const getBadge = (streak: number) => {
    if (streak >= 30) return { emoji: '🏆', title: 'Efsane', message: 'Muhteşem bir disiplin!' }
    if (streak >= 14) return { emoji: '🔥', title: 'Ateşli', message: 'Çok iyi gidiyorsun!' }
    if (streak >= 7) return { emoji: '⭐', title: 'Yıldız', message: 'Harika bir hafta!' }
    if (streak >= 3) return { emoji: '💪', title: 'Güçlü', message: 'Devam et!' }
    return { emoji: '🌱', title: 'Başlangıç', message: 'Her büyük yolculuk bir adımla başlar' }
  }

  const badge = getBadge(streak)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{badge.emoji}</div>
            <div>
              <h3 className="text-xl font-bold">{badge.title}</h3>
              <p className="text-purple-100">{badge.message}</p>
              {streak > 0 && (
                <p className="text-sm text-purple-200 mt-1">
                  {streak} gündür düzenli çalışıyorsun
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getTodayProgress(sessions: any[]): number {
  const today = new Date().getDay()
  const todaySessions = sessions.filter(s => s.dayIndex === today)
  if (todaySessions.length === 0) return 0
  
  const completed = todaySessions.filter(s => s.isCompleted).length
  return (completed / todaySessions.length) * 100
}
