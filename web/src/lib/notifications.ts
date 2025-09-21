/**
 * Push Notification Management
 * PWA bildirim sistemi
 */

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export class NotificationManager {
  private static instance: NotificationManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers not supported')
        return false
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported')
        return false
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', this.registration)

      // Request notification permission
      await this.requestPermission()

      // Setup notification scheduling
      this.scheduleStudyReminders()

      return true
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }
    return Notification.permission
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    if (this.registration) {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag,
        data: options.data,
        actions: options.actions || [],
        vibrate: [100, 50, 100],
        requireInteraction: false
      })
    } else {
      // Fallback to basic notification
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png'
      })
    }
  }

  async scheduleStudyReminder(message: string, delayMinutes: number = 30): Promise<void> {
    // Schedule a study reminder
    await this.showNotification({
      title: 'YKS Plan Hatırlatması',
      body: message,
      tag: 'study-reminder',
      actions: [
        {
          action: 'view-plan',
          title: 'Planımı Görüntüle'
        },
        {
          action: 'snooze',
          title: '10 dk sonra hatırlat'
        }
      ]
    })
  }

  private scheduleStudyReminders(): void {
    // Schedule daily study reminders
    const now = new Date()
    const reminderTimes = [
      { hour: 9, minute: 0, message: 'Günaydın! Bugünkü çalışma planın hazır 📚' },
      { hour: 14, minute: 0, message: 'Öğleden sonra çalışma vakti! 💪' },
      { hour: 19, minute: 0, message: 'Akşam çalışma seansını unutma! 🌙' },
      { hour: 21, minute: 0, message: 'Bugünü değerlendirme zamanı 📊' }
    ]

    reminderTimes.forEach(time => {
      const reminderTime = new Date(now)
      reminderTime.setHours(time.hour, time.minute, 0, 0)
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }

      const delay = reminderTime.getTime() - now.getTime()
      
      setTimeout(() => {
        this.showNotification({
          title: 'YKS Plan',
          body: time.message,
          tag: `reminder-${time.hour}`,
          actions: [
            {
              action: 'view-plan',
              title: 'Planımı Görüntüle'
            }
          ]
        })
      }, delay)
    })
  }

  async showMotivationalNotification(): Promise<void> {
    const motivationalMessages = [
      'Harika gidiyorsun! Hedefine bir adım daha yakınsın 🎯',
      'Bugün de başarılarınla gurur duyuyoruz! 🌟',
      'Azmin ve kararlılığın seni başarıya götürecek! 💪',
      'Her gün biraz daha ileriye gidiyorsun! 🚀',
      'Çalışma serinle herkesi etkiliyorsun! 🔥',
      'Hedefinden asla vazgeçme, sen yapabilirsin! ⭐'
    ]

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

    await this.showNotification({
      title: 'Motivasyon Zamanı! 💫',
      body: randomMessage,
      tag: 'motivation'
    })
  }

  async showStreak Notification(days: number): Promise<void> {
    await this.showNotification({
      title: `${days} Gün Seri! 🔥`,
      body: `${days} gündür düzenli çalışıyorsun. Bu harika bir başarı!`,
      tag: 'streak-achievement',
      actions: [
        {
          action: 'share',
          title: 'Paylaş'
        },
        {
          action: 'continue',
          title: 'Devam Et'
        }
      ]
    })
  }

  async showWeeklyProgress(completionRate: number): Promise<void> {
    const message = completionRate >= 90 
      ? `Mükemmel! Bu hafta %${completionRate} tamamladın! 🏆`
      : completionRate >= 70
      ? `İyi gidiyorsun! Bu hafta %${completionRate} tamamladın 👍`
      : `Bu hafta %${completionRate} tamamladın. Hadi biraz daha zorlayalım! 💪`

    await this.showNotification({
      title: 'Haftalık Rapor',
      body: message,
      tag: 'weekly-progress'
    })
  }

  async showTaskReminder(taskName: string, remainingTime: string): Promise<void> {
    await this.showNotification({
      title: 'Görev Hatırlatması',
      body: `"${taskName}" görevi için ${remainingTime} kaldı`,
      tag: 'task-reminder',
      actions: [
        {
          action: 'start-task',
          title: 'Başla'
        },
        {
          action: 'postpone',
          title: 'Ertele'
        }
      ]
    })
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()
