/**
 * YKS Akıllı Asistanı - Push Notifications Sistemi
 * PWA için push notification yönetimi
 */

interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: any[];
  data?: any;
}

interface ScheduledNotification {
  id: string;
  config: NotificationConfig;
  scheduledTime: Date;
  type: 'study' | 'break' | 'motivation' | 'reminder';
}

class PushNotificationManager {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  constructor() {
    this.checkPermission();
    this.initServiceWorker();
    this.loadScheduledNotifications();
  }

  /**
   * Bildirim iznini kontrol et
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Service Worker'ı başlat
   */
  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker Push Notifications için hazır');
      } catch (error) {
        console.error('❌ Service Worker hatası:', error);
      }
    }
  }

  /**
   * Bildirim izni iste
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('⚠️ Bu tarayıcı notifications desteklemiyor');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification izni verildi');
        
        // Hoş geldin bildirimi gönder
        this.showWelcomeNotification();
        return true;
      } else {
        console.log('❌ Notification izni reddedildi');
        return false;
      }
    } catch (error) {
      console.error('❌ Notification izni hatası:', error);
      return false;
    }
  }

  /**
   * Hoş geldin bildirimi
   */
  private showWelcomeNotification(): void {
    this.showNotification({
      title: '🎉 YKS Akıllı Asistanı',
      body: 'Bildirimler aktifleştirildi! Artık çalışma hatırlatmaları alacaksın.',
      icon: '/icons/icon-192x192.png',
      tag: 'welcome',
      requireInteraction: false
    });
  }

  /**
   * Anlık bildirim göster
   */
  async showNotification(config: NotificationConfig): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('⚠️ Notification izni yok');
      return;
    }

    const options: NotificationOptions = {
      body: config.body,
      icon: config.icon || '/icons/icon-192x192.png',
      badge: config.badge || '/icons/badge-72x72.png',
      tag: config.tag,
      requireInteraction: config.requireInteraction || false,
      data: config.data || {}
      // vibrate: [200, 100, 200], // Android için (TypeScript hatası nedeniyle kapatıldı)
      // actions: config.actions || [] // TypeScript hatası nedeniyle kapatıldı
    };

    try {
      if (this.registration) {
        // Service Worker üzerinden göster
        await this.registration.showNotification(config.title, options);
      } else {
        // Direkt notification API ile göster
        new Notification(config.title, options);
      }
      
      console.log('📱 Notification gönderildi:', config.title);
    } catch (error) {
      console.error('❌ Notification gönderme hatası:', error);
    }
  }

  /**
   * Çalışma hatırlatması
   */
  showStudyReminder(subject: string): void {
    this.showNotification({
      title: '📚 Çalışma Zamanı!',
      body: `${subject} çalışma vaktiniz geldi. Hadi başlayalım!`,
      tag: 'study-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'start-study',
          title: '▶️ Başla',
          icon: '/icons/play.png'
        },
        {
          action: 'snooze',
          title: '⏰ 10dk Sonra',
          icon: '/icons/snooze.png'
        }
      ],
      data: { type: 'study', subject }
    });
  }

  /**
   * Mola hatırlatması
   */
  showBreakReminder(): void {
    this.showNotification({
      title: '☕ Mola Zamanı!',
      body: 'Biraz dinlenme zamanı. Gözlerini dinlendir, su iç!',
      tag: 'break-reminder',
      requireInteraction: false,
      actions: [
        {
          action: 'start-break',
          title: '😌 Mola Ver',
          icon: '/icons/break.png'
        },
        {
          action: 'continue-study',
          title: '📖 Devam Et',
          icon: '/icons/continue.png'
        }
      ],
      data: { type: 'break' }
    });
  }

  /**
   * Motivasyon mesajı
   */
  showMotivationMessage(message: string): void {
    const motivationMessages = [
      '🌟 Harika gidiyorsun! Devam et!',
      '💪 Her gün biraz daha iyileşiyorsun!',
      '🎯 Hedefinize bir adım daha yaklaştın!',
      '🚀 Başarı senin olacak, vazgeçme!',
      '⭐ Bugün de kendini aştın!'
    ];

    const randomMessage = message || motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

    this.showNotification({
      title: '💝 Motivasyon Zamanı',
      body: randomMessage,
      tag: 'motivation',
      requireInteraction: false,
      data: { type: 'motivation' }
    });
  }

  /**
   * Performans raporu
   */
  showPerformanceReport(stats: any): void {
    this.showNotification({
      title: '📊 Günlük Performans',
      body: `Bugün ${stats.questionsAnswered} soru çözdün! Başarı oranın: %${stats.accuracy}`,
      tag: 'performance',
      requireInteraction: true,
      actions: [
        {
          action: 'view-stats',
          title: '📈 Detayları Gör',
          icon: '/icons/stats.png'
        }
      ],
      data: { type: 'performance', stats }
    });
  }

  /**
   * Zamanlanmış bildirim ekle
   */
  scheduleNotification(config: NotificationConfig, delay: number, type: ScheduledNotification['type']): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scheduledTime = new Date(Date.now() + delay);

    const scheduledNotification: ScheduledNotification = {
      id,
      config,
      scheduledTime,
      type
    };

    this.scheduledNotifications.set(id, scheduledNotification);
    this.saveScheduledNotifications();

    // Timeout ile zamanla
    setTimeout(() => {
      this.showNotification(config);
      this.scheduledNotifications.delete(id);
      this.saveScheduledNotifications();
    }, delay);

    console.log(`⏰ Notification zamanlandı: ${scheduledTime.toLocaleString('tr-TR')}`);
    return id;
  }

  /**
   * Günlük çalışma hatırlatmaları planla
   */
  scheduleDailyReminders(): void {
    const now = new Date();
    const studyTimes = ['09:00', '14:00', '19:00'];

    studyTimes.forEach(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Eğer bugün geçmişse yarına ayarla
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      this.scheduleNotification({
        title: '📚 YKS Çalışma Zamanı',
        body: `${timeStr} çalışma saatiniz geldi! Hangi konuya odaklanacaksın?`,
        tag: `daily-reminder-${timeStr}`,
        requireInteraction: true,
        actions: [
          {
            action: 'open-app',
            title: '📖 Uygulamayı Aç',
            icon: '/icons/app.png'
          },
          {
            action: 'snooze-30',
            title: '⏰ 30dk Sonra',
            icon: '/icons/snooze.png'
          }
        ]
      }, delay, 'reminder');
    });

    console.log('📅 Günlük hatırlatmalar zamanlandı');
  }

  /**
   * Pomodoro timer notifications
   */
  startPomodoroSession(subject: string, duration: number = 25): void {
    // Başlangıç bildirimi
    this.showNotification({
      title: '🍅 Pomodoro Başladı',
      body: `${subject} için ${duration} dakikalık odaklanma oturumu başladı!`,
      tag: 'pomodoro-start',
      requireInteraction: false
    });

    // Mola bildirimi zamanla
    const breakDelay = duration * 60 * 1000; // Dakikayı milisaniyeye çevir
    this.scheduleNotification({
      title: '🎉 Pomodoro Tamamlandı',
      body: `Harika! ${duration} dakika odaklanma tamamlandı. 5 dakika mola zamanı!`,
      tag: 'pomodoro-complete',
      requireInteraction: true,
      actions: [
        {
          action: 'start-break',
          title: '☕ Mola Ver',
          icon: '/icons/break.png'
        },
        {
          action: 'continue-session',
          title: '🔄 Devam Et',
          icon: '/icons/continue.png'
        }
      ]
    }, breakDelay, 'study');

    console.log(`🍅 Pomodoro zamanlandı: ${duration} dakika`);
  }

  /**
   * Haftalık rapor bildirimi
   */
  scheduleWeeklyReport(): void {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(20, 0, 0, 0);

    const delay = nextSunday.getTime() - now.getTime();

    this.scheduleNotification({
      title: '📈 Haftalık Performans Raporu',
      body: 'Bu haftaki çalışma performansın hazır! Gelişimini görmeye hazır mısın?',
      tag: 'weekly-report',
      requireInteraction: true,
      actions: [
        {
          action: 'view-report',
          title: '📊 Raporu Gör',
          icon: '/icons/report.png'
        }
      ]
    }, delay, 'reminder');

    console.log(`📈 Haftalık rapor zamanlandı: ${nextSunday.toLocaleString('tr-TR')}`);
  }

  /**
   * Zamanlanmış bildirimi iptal et
   */
  cancelScheduledNotification(id: string): boolean {
    if (this.scheduledNotifications.has(id)) {
      this.scheduledNotifications.delete(id);
      this.saveScheduledNotifications();
      console.log(`🗑️ Zamanlanmış bildirim iptal edildi: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Tüm zamanlanmış bildirimleri iptal et
   */
  cancelAllScheduledNotifications(): void {
    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();
    console.log('🗑️ Tüm zamanlanmış bildirimler iptal edildi');
  }

  /**
   * Zamanlanmış bildirimleri kaydet
   */
  private saveScheduledNotifications(): void {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      localStorage.setItem('yks_scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('❌ Scheduled notifications kayıt hatası:', error);
    }
  }

  /**
   * Zamanlanmış bildirimleri yükle
   */
  private loadScheduledNotifications(): void {
    try {
      const stored = localStorage.getItem('yks_scheduled_notifications');
      if (stored) {
        const notifications: ScheduledNotification[] = JSON.parse(stored);
        const now = new Date();

        notifications.forEach(notification => {
          const scheduledTime = new Date(notification.scheduledTime);
          
          // Geçmiş bildirimleri temizle
          if (scheduledTime > now) {
            this.scheduledNotifications.set(notification.id, notification);
            
            // Yeniden zamanla
            const delay = scheduledTime.getTime() - now.getTime();
            setTimeout(() => {
              this.showNotification(notification.config);
              this.scheduledNotifications.delete(notification.id);
              this.saveScheduledNotifications();
            }, delay);
          }
        });

        console.log(`📅 ${this.scheduledNotifications.size} zamanlanmış bildirim yüklendi`);
      }
    } catch (error) {
      console.error('❌ Scheduled notifications yükleme hatası:', error);
    }
  }

  /**
   * Bildirim izin durumunu al
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Zamanlanmış bildirimleri listele
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Test bildirimi gönder
   */
  sendTestNotification(): void {
    this.showNotification({
      title: '🧪 Test Bildirimi',
      body: 'YKS Akıllı Asistanı bildirim sistemi çalışıyor!',
      tag: 'test',
      requireInteraction: false,
      data: { type: 'test' }
    });
  }
}

// Singleton instance
export const pushNotificationManager = new PushNotificationManager();

// React hook için utility
export function useNotifications() {
  const requestPermission = () => pushNotificationManager.requestPermission();
  const showStudyReminder = (subject: string) => pushNotificationManager.showStudyReminder(subject);
  const showBreakReminder = () => pushNotificationManager.showBreakReminder();
  const showMotivation = (message?: string) => pushNotificationManager.showMotivationMessage(message || '');
  const startPomodoro = (subject: string, duration?: number) => pushNotificationManager.startPomodoroSession(subject, duration);
  const scheduleDailyReminders = () => pushNotificationManager.scheduleDailyReminders();
  const getPermissionStatus = () => pushNotificationManager.getPermissionStatus();
  const sendTest = () => pushNotificationManager.sendTestNotification();

  return {
    requestPermission,
    showStudyReminder,
    showBreakReminder,
    showMotivation,
    startPomodoro,
    scheduleDailyReminders,
    getPermissionStatus,
    sendTest
  };
}

export default pushNotificationManager;
