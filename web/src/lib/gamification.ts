/**
 * Gamification System
 * Oyunlaştırma özellikleri: Puan, rozet, seviye sistemi
 */

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'streak' | 'progress' | 'social' | 'special'
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  requirement: {
    type: 'study_hours' | 'streak_days' | 'tasks_completed' | 'perfect_week' | 'early_riser' | 'night_owl' | 'speed_learner' | 'consistency'
    target: number
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
  }
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
}

export interface UserStats {
  totalStudyHours: number
  totalTasksCompleted: number
  currentStreak: number
  longestStreak: number
  level: number
  totalPoints: number
  weeklyGoalCompletions: number
  perfectWeeks: number
  earlyStudySessions: number
  lateStudySessions: number
  fastCompletions: number
}

export class GamificationManager {
  private static instance: GamificationManager
  private achievements: Achievement[] = []
  
  private constructor() {
    this.initializeAchievements()
  }

  static getInstance(): GamificationManager {
    if (!GamificationManager.instance) {
      GamificationManager.instance = new GamificationManager()
    }
    return GamificationManager.instance
  }

  private initializeAchievements(): void {
    this.achievements = [
      // Study Hours Achievements
      {
        id: 'first_hour',
        title: 'İlk Adım',
        description: 'İlk 1 saatini tamamla',
        icon: '🎯',
        category: 'study',
        difficulty: 'bronze',
        points: 10,
        requirement: { type: 'study_hours', target: 1 },
        unlocked: false
      },
      {
        id: 'study_marathon',
        title: 'Maraton Koşucusu',
        description: '50 saat çalışma tamamla',
        icon: '🏃‍♂️',
        category: 'study',
        difficulty: 'silver',
        points: 100,
        requirement: { type: 'study_hours', target: 50 },
        unlocked: false
      },
      {
        id: 'study_master',
        title: 'Çalışma Ustası',
        description: '200 saat çalışma tamamla',
        icon: '🎓',
        category: 'study',
        difficulty: 'gold',
        points: 500,
        requirement: { type: 'study_hours', target: 200 },
        unlocked: false
      },
      {
        id: 'study_legend',
        title: 'Efsane Öğrenci',
        description: '500 saat çalışma tamamla',
        icon: '👑',
        category: 'study',
        difficulty: 'platinum',
        points: 1000,
        requirement: { type: 'study_hours', target: 500 },
        unlocked: false
      },

      // Streak Achievements
      {
        id: 'week_warrior',
        title: 'Hafta Savaşçısı',
        description: '7 gün üst üste çalış',
        icon: '🔥',
        category: 'streak',
        difficulty: 'bronze',
        points: 50,
        requirement: { type: 'streak_days', target: 7 },
        unlocked: false
      },
      {
        id: 'month_master',
        title: 'Ay Ustası',
        description: '30 gün üst üste çalış',
        icon: '⚡',
        category: 'streak',
        difficulty: 'silver',
        points: 200,
        requirement: { type: 'streak_days', target: 30 },
        unlocked: false
      },
      {
        id: 'unstoppable',
        title: 'Durdurulamaz',
        description: '100 gün üst üste çalış',
        icon: '🚀',
        category: 'streak',
        difficulty: 'gold',
        points: 1000,
        requirement: { type: 'streak_days', target: 100 },
        unlocked: false
      },

      // Progress Achievements
      {
        id: 'task_master',
        title: 'Görev Ustası',
        description: '100 görevi tamamla',
        icon: '✅',
        category: 'progress',
        difficulty: 'silver',
        points: 150,
        requirement: { type: 'tasks_completed', target: 100 },
        unlocked: false
      },
      {
        id: 'perfect_week',
        title: 'Mükemmel Hafta',
        description: 'Bir haftadaki tüm görevleri tamamla',
        icon: '⭐',
        category: 'progress',
        difficulty: 'gold',
        points: 300,
        requirement: { type: 'perfect_week', target: 1 },
        unlocked: false
      },

      // Time-based Achievements
      {
        id: 'early_bird',
        title: 'Erken Kuş',
        description: '09:00\'dan önce 10 kez çalış',
        icon: '🌅',
        category: 'special',
        difficulty: 'bronze',
        points: 75,
        requirement: { type: 'early_riser', target: 10 },
        unlocked: false
      },
      {
        id: 'night_owl',
        title: 'Gece Kuşu',
        description: '21:00\'dan sonra 10 kez çalış',
        icon: '🌙',
        category: 'special',
        difficulty: 'bronze',
        points: 75,
        requirement: { type: 'night_owl', target: 10 },
        unlocked: false
      },
      {
        id: 'speed_demon',
        title: 'Hız Şeytanı',
        description: '20 görevi hızlıca tamamla',
        icon: '💨',
        category: 'special',
        difficulty: 'silver',
        points: 150,
        requirement: { type: 'speed_learner', target: 20 },
        unlocked: false
      },

      // Consistency Achievements
      {
        id: 'consistent_learner',
        title: 'Tutarlı Öğrenci',
        description: '4 hafta boyunca haftalık hedefi tut',
        icon: '📈',
        category: 'progress',
        difficulty: 'gold',
        points: 400,
        requirement: { type: 'consistency', target: 4, timeframe: 'weekly' },
        unlocked: false
      }
    ]
  }

  calculateLevel(totalPoints: number): number {
    // Level calculation: Every 100 points = 1 level
    return Math.floor(totalPoints / 100) + 1
  }

  getPointsForNextLevel(currentPoints: number): number {
    const currentLevel = this.calculateLevel(currentPoints)
    const pointsForNextLevel = currentLevel * 100
    return pointsForNextLevel - currentPoints
  }

  checkAchievements(userStats: UserStats): Achievement[] {
    const newUnlocks: Achievement[] = []

    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return

      let requirementMet = false
      let progress = 0

      switch (achievement.requirement.type) {
        case 'study_hours':
          progress = userStats.totalStudyHours
          requirementMet = userStats.totalStudyHours >= achievement.requirement.target
          break
        case 'streak_days':
          progress = userStats.currentStreak
          requirementMet = userStats.currentStreak >= achievement.requirement.target
          break
        case 'tasks_completed':
          progress = userStats.totalTasksCompleted
          requirementMet = userStats.totalTasksCompleted >= achievement.requirement.target
          break
        case 'perfect_week':
          progress = userStats.perfectWeeks
          requirementMet = userStats.perfectWeeks >= achievement.requirement.target
          break
        case 'early_riser':
          progress = userStats.earlyStudySessions
          requirementMet = userStats.earlyStudySessions >= achievement.requirement.target
          break
        case 'night_owl':
          progress = userStats.lateStudySessions
          requirementMet = userStats.lateStudySessions >= achievement.requirement.target
          break
        case 'speed_learner':
          progress = userStats.fastCompletions
          requirementMet = userStats.fastCompletions >= achievement.requirement.target
          break
        case 'consistency':
          progress = userStats.weeklyGoalCompletions
          requirementMet = userStats.weeklyGoalCompletions >= achievement.requirement.target
          break
      }

      // Update progress
      achievement.progress = Math.min(progress, achievement.requirement.target)

      if (requirementMet && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date()
        newUnlocks.push(achievement)
      }
    })

    return newUnlocks
  }

  getAchievements(): Achievement[] {
    return this.achievements
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked)
  }

  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category)
  }

  getTotalPoints(): number {
    return this.achievements
      .filter(a => a.unlocked)
      .reduce((total, a) => total + a.points, 0)
  }

  getCompletionPercentage(): number {
    const unlockedCount = this.achievements.filter(a => a.unlocked).length
    return Math.round((unlockedCount / this.achievements.length) * 100)
  }

  generateMotivationalMessage(userStats: UserStats): string {
    const level = this.calculateLevel(userStats.totalPoints)
    const streak = userStats.currentStreak
    
    const messages = [
      `Seviye ${level} oyuncusu! Muhteşem ilerleme! 🎮`,
      `${streak} günlük serinle herkesi etkiliyorsun! 🔥`,
      `Toplam ${userStats.totalStudyHours} saat çalıştın. İnanılmaz! ⏰`,
      `${userStats.totalTasksCompleted} görev tamamladın. Sen bir şampiyon! 🏆`,
      `Hedeflerine odaklanmaya devam et! 🎯`,
      `Her gün biraz daha güçleniyorsun! 💪`,
      `Başarıya giden yolda ilerleyişin muhteşem! 🌟`,
      `Azmin ve kararlılığın seni öne çıkarıyor! ⭐`
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  calculateDailyBonus(completedToday: number, targetToday: number): number {
    const completionRate = completedToday / targetToday
    
    if (completionRate >= 1.0) return 50 // Perfect day bonus
    if (completionRate >= 0.8) return 25 // Good day bonus
    if (completionRate >= 0.5) return 10 // Decent day bonus
    
    return 0
  }

  calculateWeeklyBonus(weeklyCompletion: number): number {
    if (weeklyCompletion >= 95) return 200 // Excellent week
    if (weeklyCompletion >= 85) return 100 // Good week
    if (weeklyCompletion >= 70) return 50  // Decent week
    
    return 0
  }

  getLeaderboardData(allUsers: UserStats[]): Array<UserStats & { rank: number }> {
    return allUsers
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({ ...user, rank: index + 1 }))
  }
}

// Export singleton instance
export const gamificationManager = GamificationManager.getInstance()
