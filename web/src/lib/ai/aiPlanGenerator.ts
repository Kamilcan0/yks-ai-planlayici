// AI Plan Generator - YKS Haftalık Plan ve Kaynak Önerisi Üretici

export interface UserProfile {
  kullanıcı_ID: string
  name: string
  level: 'başlangıç' | 'orta' | 'ileri'
  field: 'sayisal' | 'ea' | 'sozel' | 'dil'
  weeklyHours: number
  targetDate: string
  subjects?: Record<string, number>
  previousPerformance?: PerformanceData[]
}

export interface PerformanceData {
  subject: string
  topic: string
  correctAnswers: number
  totalQuestions: number
  timeSpent: number // minutes
  date: string
}

export interface StudySession {
  konu: string
  soru_sayısı: number
  süre_dakika: number
  not?: string
}

export interface DayPlan {
  gün: string
  TYT: StudySession[]
  AYT: StudySession[]
}

export interface ResourceRecommendation {
  konu: string
  tip: 'Kitap' | 'Video' | 'Soru Bankası' | 'Not'
  isim: string
  zorluk: 'kolay' | 'orta' | 'zor'
  beklenen_süre_dakika: number
  öncelik: 'yüksek' | 'orta' | 'düşük'
  not?: string
  url?: string
}

export interface UXPreferences {
  tema: 'Açık renk' | 'Koyu renk'
  bildirimler: string[]
  arayüz_notları: string[]
}

export interface WeeklyPlan {
  kullanıcı_ID: string
  tarih: string
  haftalık_plan: DayPlan[]
  kaynak_önerileri: ResourceRecommendation[]
  UX_önerileri: UXPreferences
  adaptasyon_notları: string[]
  toplam_haftalık_saat: number
  başarı_tahmini: number
}

class AIPlanGenerator {
  private subjectMapping = {
    sayisal: {
      TYT: ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Sosyal'],
      AYT: ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji']
    },
    ea: {
      TYT: ['Matematik', 'Geometri', 'Türkçe', 'Sosyal', 'Tarih', 'Coğrafya'],
      AYT: ['Matematik', 'Edebiyat', 'Tarih', 'Coğrafya']
    },
    sozel: {
      TYT: ['Türkçe', 'Sosyal', 'Matematik', 'Geometri'],
      AYT: ['Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe']
    },
    dil: {
      TYT: ['Türkçe', 'Sosyal', 'Matematik', 'Yabancı Dil'],
      AYT: ['Yabancı Dil', 'Edebiyat']
    }
  }

  private topicDatabase = {
    'Matematik': [
      'Temel Kavramlar', 'Sayılar', 'Faktöriyel', 'Modüler Aritmetik',
      'Fonksiyonlar', 'Polinom', 'Eşitsizlikler', 'Logaritma',
      'Trigonometri', 'Diziler', 'Kombinatorik', 'Olasılık'
    ],
    'Geometri': [
      'Temel Geometri', 'Üçgenler', 'Dörtgenler', 'Çember',
      'Analitik Geometri', 'Katı Cisimler', 'Analiz'
    ],
    'Fizik': [
      'Hareket', 'Kuvvet', 'Enerji', 'İtme', 'Dalgalar',
      'Elektrik', 'Manyetizma', 'Optik', 'Modern Fizik'
    ],
    'Kimya': [
      'Atom', 'Periyodik Sistem', 'Kimyasal Bağlar', 'Gazlar',
      'Çözeltiler', 'Asit-Baz', 'Elektrokimya', 'Organik Kimya'
    ],
    'Biyoloji': [
      'Hücre', 'Canlıların Ortak Özellikleri', 'Sistemler',
      'Kalıtım', 'Ekoloji', 'Bitki Biyolojisi'
    ],
    'Türkçe': [
      'Anlam', 'Cümle', 'Paragraf', 'Metin', 'Yazım Kuralları'
    ],
    'Sosyal': [
      'Atatürk İlkeleri', 'Türk Tarihi', 'Coğrafya', 'Vatandaşlık'
    ]
  }

  private resourceDatabase: Omit<ResourceRecommendation, 'konu'>[] = [
    {
      tip: 'Kitap',
      isim: 'Tema Matematik',
      zorluk: 'orta',
      beklenen_süre_dakika: 120,
      öncelik: 'yüksek',
      not: 'Temel konular için mükemmel'
    },
    {
      tip: 'Video',
      isim: 'TonguçAkademi YouTube',
      zorluk: 'kolay',
      beklenen_süre_dakika: 30,
      öncelik: 'orta',
      not: 'Kısa ve özlü anlatım',
      url: 'https://youtube.com/tongucakademi'
    },
    {
      tip: 'Soru Bankası',
      isim: 'Karekök Soru Bankası',
      zorluk: 'zor',
      beklenen_süre_dakika: 90,
      öncelik: 'yüksek',
      not: 'Zorlu sorular için ideal'
    }
  ]

  generateWeeklyPlan(user: UserProfile, previousPerformance?: PerformanceData[]): WeeklyPlan {
    const today = new Date()
    const planId = this.generatePlanId(user.kullanıcı_ID, today)
    
    // Adaptive algorithm based on performance
    const adaptations = this.analyzePerformance(previousPerformance || [])
    
    // Generate daily plans
    const weeklyPlan = this.generateDailyPlans(user, adaptations)
    
    // Generate resource recommendations
    const resources = this.generateResourceRecommendations(user, adaptations)
    
    // Generate UX preferences
    const uxPreferences = this.generateUXPreferences(user)
    
    return {
      kullanıcı_ID: user.kullanıcı_ID,
      tarih: today.toISOString().split('T')[0],
      haftalık_plan: weeklyPlan,
      kaynak_önerileri: resources,
      UX_önerileri: uxPreferences,
      adaptasyon_notları: adaptations.notes,
      toplam_haftalık_saat: user.weeklyHours,
      başarı_tahmini: this.calculateSuccessPrediction(user, adaptations)
    }
  }

  private generatePlanId(userId: string, date: Date): string {
    return `${userId}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`
  }

  private analyzePerformance(performance: PerformanceData[]) {
    const weakSubjects: string[] = []
    const strongSubjects: string[] = []
    const notes: string[] = []

    if (performance.length === 0) {
      notes.push('İlk planınız - genel tavsiyeler uygulanacak')
      return { weakSubjects, strongSubjects, notes, needsExtra: [] }
    }

    // Analyze subject performance
    const subjectStats = performance.reduce((acc, perf) => {
      const successRate = perf.correctAnswers / perf.totalQuestions
      if (!acc[perf.subject]) {
        acc[perf.subject] = { total: 0, success: 0, count: 0 }
      }
      acc[perf.subject].total += perf.totalQuestions
      acc[perf.subject].success += perf.correctAnswers
      acc[perf.subject].count += 1
      return acc
    }, {} as Record<string, { total: number; success: number; count: number }>)

    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const avgSuccess = stats.success / stats.total
      if (avgSuccess < 0.6) {
        weakSubjects.push(subject)
        notes.push(`${subject} konusunda %${Math.round(avgSuccess * 100)} başarı - ekstra çalışma gerekli`)
      } else if (avgSuccess > 0.8) {
        strongSubjects.push(subject)
        notes.push(`${subject} konusunda harika gidiyorsun! (%${Math.round(avgSuccess * 100)})`)
      }
    })

    return { 
      weakSubjects, 
      strongSubjects, 
      notes,
      needsExtra: weakSubjects
    }
  }

  private generateDailyPlans(user: UserProfile, adaptations: any): DayPlan[] {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
    const dailyHours = user.weeklyHours / 7
    const subjects = this.subjectMapping[user.field]
    
    return days.map((day, index) => {
      const tytSessions = this.generateSubjectSessions(
        subjects.TYT, 
        dailyHours * 0.6, // 60% TYT
        user.level,
        adaptations.needsExtra,
        'TYT'
      )
      
      const aytSessions = this.generateSubjectSessions(
        subjects.AYT, 
        dailyHours * 0.4, // 40% AYT
        user.level,
        adaptations.needsExtra,
        'AYT'
      )

      return {
        gün: day,
        TYT: tytSessions,
        AYT: aytSessions
      }
    })
  }

  private generateSubjectSessions(
    availableSubjects: string[], 
    timeHours: number, 
    level: UserProfile['level'],
    weakSubjects: string[],
    type: 'TYT' | 'AYT'
  ): StudySession[] {
    const sessions: StudySession[] = []
    const timeMinutes = timeHours * 60
    let remainingTime = timeMinutes

    // Prioritize weak subjects
    const prioritizedSubjects = [
      ...weakSubjects.filter(s => availableSubjects.includes(s)),
      ...availableSubjects.filter(s => !weakSubjects.includes(s))
    ]

    prioritizedSubjects.slice(0, 3).forEach((subject, index) => {
      if (remainingTime <= 0) return

      const sessionTime = Math.min(
        remainingTime / (3 - index),
        this.getMaxSessionTime(level)
      )

      if (sessionTime >= 15) { // Minimum 15 minutes
        const topics = this.topicDatabase[subject] || [subject]
        const randomTopic = topics[Math.floor(Math.random() * topics.length)]
        
        const questionCount = this.calculateQuestionCount(sessionTime, level)
        
        sessions.push({
          konu: randomTopic,
          soru_sayısı: questionCount,
          süre_dakika: Math.round(sessionTime),
          not: this.generateSessionNote(subject, level, weakSubjects.includes(subject))
        })

        remainingTime -= sessionTime
      }
    })

    return sessions
  }

  private getMaxSessionTime(level: UserProfile['level']): number {
    switch (level) {
      case 'başlangıç': return 45
      case 'orta': return 60
      case 'ileri': return 90
      default: return 60
    }
  }

  private calculateQuestionCount(timeMinutes: number, level: UserProfile['level']): number {
    const baseRate = level === 'başlangıç' ? 2 : level === 'orta' ? 1.5 : 1 // minutes per question
    return Math.round(timeMinutes / baseRate)
  }

  private generateSessionNote(subject: string, level: UserProfile['level'], isWeak: boolean): string {
    if (isWeak) {
      return 'Temel konuları tekrar et, sonra soru çöz'
    }
    
    switch (level) {
      case 'başlangıç':
        return 'Önce konu tekrarı, sonra kolay sorular'
      case 'orta':
        return 'Konu pekiştirmesi ve orta zorlukta sorular'
      case 'ileri':
        return 'Zorlu soru çeşitleri ve zaman yönetimi'
      default:
        return 'Düzenli çalışma ile başarı gelir'
    }
  }

  private generateResourceRecommendations(user: UserProfile, adaptations: any): ResourceRecommendation[] {
    const subjects = [...this.subjectMapping[user.field].TYT, ...this.subjectMapping[user.field].AYT]
    const recommendations: ResourceRecommendation[] = []

    // Weak subjects get priority
    const prioritySubjects = [
      ...adaptations.needsExtra,
      ...subjects.filter((s: string) => !adaptations.needsExtra.includes(s))
    ]

    prioritySubjects.slice(0, 6).forEach((subject: string) => {
      // Add different types of resources
      const resourceTypes = ['Kitap', 'Video', 'Soru Bankası'] as const
      
      resourceTypes.forEach(type => {
        const baseResource = this.resourceDatabase.find(r => r.tip === type) || this.resourceDatabase[0]
        
        recommendations.push({
          ...baseResource,
          konu: subject,
          tip: type,
          isim: this.getSubjectSpecificResource(subject, type),
          öncelik: adaptations.needsExtra.includes(subject) ? 'yüksek' : 'orta',
          zorluk: this.getResourceDifficulty(user.level),
          not: adaptations.needsExtra.includes(subject) ? 
            'Öncelikli çalışılması gereken konu' : 
            'Düzenli çalışma için uygun'
        })
      })
    })

    return recommendations.slice(0, 10) // Limit to 10 resources
  }

  private getSubjectSpecificResource(subject: string, type: ResourceRecommendation['tip']): string {
    const resources = {
      'Matematik': {
        'Kitap': 'Palme Matematik Konu Anlatımı',
        'Video': 'Matematik Bilimleri YouTube Kanalı',
        'Soru Bankası': 'Karekök Matematik Soru Bankası'
      },
      'Fizik': {
        'Kitap': 'Birey Fizik Konu Anlatımı',
        'Video': 'Fizik Dersi YouTube',
        'Soru Bankası': 'Sonuç Fizik Soru Bankası'
      }
      // Add more subjects as needed
    }

    return resources[subject as keyof typeof resources]?.[type] || `${subject} ${type} Kaynağı`
  }

  private getResourceDifficulty(level: UserProfile['level']): ResourceRecommendation['zorluk'] {
    switch (level) {
      case 'başlangıç': return 'kolay'
      case 'orta': return 'orta'
      case 'ileri': return 'zor'
      default: return 'orta'
    }
  }

  private generateUXPreferences(user: UserProfile): UXPreferences {
    const isDarkTheme = Math.random() > 0.5 // Random for now, can be based on user behavior
    
    const notifications = [
      `Merhaba ${user.name}! Bugün ${Math.ceil(user.weeklyHours / 7)} saat çalışma zamanın.`,
      'Akşam tekrarını unutma! 15 dakika bile fark yaratır.',
      'Haftalık hedefinin %70\'ini tamamladın! Devam et! 🚀'
    ]

    const uiNotes = [
      'Minimal ve odaklanmış tasarım',
      user.level === 'başlangıç' ? 'Yönlendirici mesajlar göster' : 'Özet bilgiler yeterli',
      'Progress göstergelerini öne çıkar'
    ]

    return {
      tema: isDarkTheme ? 'Koyu renk' : 'Açık renk',
      bildirimler: notifications,
      arayüz_notları: uiNotes
    }
  }

  private calculateSuccessPrediction(user: UserProfile, adaptations: any): number {
    let baseScore = 70 // Base prediction

    // Level adjustments
    switch (user.level) {
      case 'başlangıç': baseScore += 5; break
      case 'orta': baseScore += 10; break
      case 'ileri': baseScore += 15; break
    }

    // Time commitment adjustment
    if (user.weeklyHours >= 30) baseScore += 10
    else if (user.weeklyHours >= 20) baseScore += 5
    else if (user.weeklyHours < 10) baseScore -= 5

    // Adaptation penalty for weak subjects
    baseScore -= adaptations.needsExtra.length * 3

    return Math.min(95, Math.max(50, baseScore))
  }

  // API simulation methods
  async savePlanToDatabase(plan: WeeklyPlan): Promise<boolean> {
    try {
      // Simulate API call
      console.log('Saving plan to database:', plan)
      
      // In real implementation:
      // const response = await fetch('/api/user/' + plan.kullanıcı_ID + '/plan', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(plan)
      // })
      // return response.ok
      
      return true
    } catch (error) {
      console.error('Error saving plan:', error)
      return false
    }
  }

  async loadPlanFromDatabase(userId: string): Promise<WeeklyPlan | null> {
    try {
      // Simulate API call
      console.log('Loading plan for user:', userId)
      
      // In real implementation:
      // const response = await fetch('/api/user/' + userId + '/plan')
      // if (response.ok) {
      //   return await response.json()
      // }
      
      return null
    } catch (error) {
      console.error('Error loading plan:', error)
      return null
    }
  }

  async updatePerformance(userId: string, performance: PerformanceData): Promise<boolean> {
    try {
      // Simulate API call
      console.log('Updating performance for user:', userId, performance)
      
      // In real implementation:
      // const response = await fetch('/api/user/' + userId + '/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(performance)
      // })
      // return response.ok
      
      return true
    } catch (error) {
      console.error('Error updating performance:', error)
      return false
    }
  }
}

export const aiPlanGenerator = new AIPlanGenerator()
