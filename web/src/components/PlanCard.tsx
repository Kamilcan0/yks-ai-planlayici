import { motion } from 'framer-motion'
import { Clock, CheckCircle, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePlanStore, StudySession, Subject } from '@/store/planStore'
import { formatDuration, getDayType } from '@/lib/utils'
import { cn } from '@/lib/utils'

const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

interface PlanCardProps {
  dayIndex: number
  sessions: StudySession[]
  subjects: Subject[]
}

export function PlanCard({ dayIndex, sessions, subjects }: PlanCardProps) {
  const markSessionComplete = usePlanStore(state => state.markSessionComplete)
  const dayType = getDayType(dayIndex)
  const dayName = dayNames[dayIndex]
  
  const daySessions = sessions.filter(s => s.dayIndex === dayIndex)
  const completedSessions = daySessions.filter(s => s.isCompleted).length
  const progress = daySessions.length > 0 ? (completedSessions / daySessions.length) * 100 : 0

  const getDayTypeColor = (type: string) => {
    switch (type) {
      case 'TYT': return 'bg-blue-500'
      case 'AYT': return 'bg-purple-500'
      case 'TEKRAR': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject?.color || '#6b7280'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
            <div className={cn("px-2 py-1 rounded-full text-xs font-medium text-white", getDayTypeColor(dayType))}>
              {dayType}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {completedSessions}/{daySessions.length} tamamlandı
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {daySessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Bugün ders yok</p>
          ) : (
            daySessions.map((session) => {
              const subject = subjects.find(s => s.id === session.subjectId)
              const isReview = session.subjectId === 'review'
              
              return (
                <motion.div
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    session.isCompleted ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-background"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: isReview ? '#10b981' : getSubjectColor(session.subjectId) }}
                    />
                    <div>
                      <p className="font-medium">
                        {isReview ? 'Genel Tekrar & Deneme' : subject?.name || 'Bilinmeyen'}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.startTime} • {formatDuration(session.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={session.isCompleted ? "outline" : "default"}
                    onClick={() => !session.isCompleted && markSessionComplete(session.id)}
                    disabled={session.isCompleted}
                  >
                    {session.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
