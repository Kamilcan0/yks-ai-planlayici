import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePlanStore } from '@/store/planStore'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  title: string
  message: string
  type: 'reminder' | 'achievement' | 'motivation'
  timestamp: Date
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const { sessions, stats, subjects } = usePlanStore()

  useEffect(() => {
    checkForNotifications()
    const interval = setInterval(checkForNotifications, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [sessions, stats])

  const checkForNotifications = () => {
    const newNotifications: Notification[] = []
    
    // Daily reminder
    const now = new Date()
    const hour = now.getHours()
    
    if (hour === 9 && now.getMinutes() === 0) {
      const todaySessions = sessions.filter(s => s.dayIndex === now.getDay())
      if (todaySessions.length > 0) {
        const firstSession = todaySessions[0]
        const subject = subjects.find(s => s.id === firstSession.subjectId)
        
        newNotifications.push({
          id: 'daily-reminder',
          title: '🌅 Günaydın!',
          message: `Bugünün ilk dersi: ${subject?.name || 'Bilinmeyen'}`,
          type: 'reminder',
          timestamp: now
        })
      }
    }

    // Achievement notifications
    if (stats.streak > 0 && stats.streak % 7 === 0) {
      newNotifications.push({
        id: `streak-${stats.streak}`,
        title: '🔥 Muhteşem Seri!',
        message: `${stats.streak} gündür düzenli çalışıyorsun!`,
        type: 'achievement',
        timestamp: now
      })
    }

    // Motivation notifications
    const completedToday = sessions.filter(s => 
      s.dayIndex === now.getDay() && s.isCompleted
    ).length
    
    if (completedToday >= 3) {
      newNotifications.push({
        id: 'daily-motivation',
        title: '💪 Harika Gidiyorsun!',
        message: `Bugün ${completedToday} ders tamamladın!`,
        type: 'motivation',
        timestamp: now
      })
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 5))
      setIsVisible(true)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'motivation': return 'border-l-green-500 bg-green-50 dark:bg-green-950'
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  if (notifications.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-50 space-y-2 max-w-sm"
        >
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={`border-l-4 ${getNotificationColor(notification.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Bell className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
