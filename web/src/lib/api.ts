// API client for backend communication
import { UserProfile } from './firebase'

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

export interface StudyPlan {
  kullanıcı_ID: string
  tarih: string
  haftalık_plan: DayPlan[]
  kaynak_önerileri: ResourceRecommendation[]
  ux_önerileri?: string[]
  adaptasyon_notları?: string
  confidence_overall?: number
}

export interface DayPlan {
  gün: string
  TYT: StudyBlock[]
  AYT: StudyBlock[]
}

export interface StudyBlock {
  konu: string
  soru_sayısı: number
  süre_dakika: number
  odak_konular: string[]
  confidence: number
  not?: string
  blok_id?: string
}

export interface ResourceRecommendation {
  konu: string
  tip: 'kitap' | 'video' | 'soru_bankası' | 'online_kaynak'
  isim: string
  zorluk: 'kolay' | 'orta' | 'zor'
  beklenen_süre_dakika: number
  öncelik: number
  link?: string
  repeat_after_days?: number
}

export interface UserProgress {
  user_id: string
  progress_id: string
  blok_id: string
  plan_id: string
  tamamlandı: boolean
  zaman: string
}

// API Functions
export async function generatePlan(userData: {
  kullanıcı_ID: string
  seviye: string
  haftalık_saat: number
  hedef_tarih: string
  field?: string
  tercihler?: Record<string, any>
}): Promise<{ plan: StudyPlan; mock_mode?: boolean; warning?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Plan generation failed')
    }

    // Add block IDs for progress tracking
    const planWithIds = {
      ...data.plan,
      haftalık_plan: data.plan.haftalık_plan.map((day: DayPlan) => ({
        ...day,
        TYT: day.TYT.map((block, idx) => ({
          ...block,
          blok_id: `${day.gün.toLowerCase()}_tyt_${idx}_${Date.now()}`
        })),
        AYT: day.AYT.map((block, idx) => ({
          ...block,
          blok_id: `${day.gün.toLowerCase()}_ayt_${idx}_${Date.now()}`
        }))
      }))
    }

    return {
      plan: planWithIds,
      mock_mode: data.mock_mode,
      warning: data.warning
    }
  } catch (error) {
    console.error('Plan generation error:', error)
    throw error
  }
}

export async function saveUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Profile save failed')
    }

    return data.profile
  } catch (error) {
    console.error('Profile save error:', error)
    throw error
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-profile/${userId}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Profile fetch failed')
    }

    return data.profile
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Profile update failed')
    }

    return data.profile
  } catch (error) {
    console.error('Profile update error:', error)
    throw error
  }
}

export async function saveProgress(userId: string, progressData: {
  blok_id: string
  plan_id: string
  tamamlandı: boolean
  zaman?: string
}): Promise<{ progress: UserProgress; adaptive_trigger?: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-progress/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Progress save failed')
    }

    return {
      progress: data.progress,
      adaptive_trigger: data.adaptive_trigger
    }
  } catch (error) {
    console.error('Progress save error:', error)
    throw error
  }
}

export async function getUserProgress(userId: string, planId?: string): Promise<UserProgress[]> {
  try {
    const params = new URLSearchParams()
    if (planId) params.append('plan_id', planId)
    
    const response = await fetch(`${API_BASE_URL}/user-progress/${userId}?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Progress fetch failed')
    }

    return data.progress
  } catch (error) {
    console.error('Progress fetch error:', error)
    return []
  }
}

// Advanced AI Features
export class AdaptiveScheduler {
  static optimizeBlockDistribution(weeklyHours: number, plan: StudyPlan): StudyPlan {
    // Implement adaptive scheduling logic
    const dailyTargetHours = weeklyHours / 6 // 6 study days, Sunday rest
    
    return {
      ...plan,
      haftalık_plan: plan.haftalık_plan.map(day => {
        if (day.gün === 'Pazar') return day // Keep Sunday as rest day
        
        const totalMinutes = [...day.TYT, ...day.AYT].reduce((sum, block) => sum + block.süre_dakika, 0)
        const targetMinutes = dailyTargetHours * 60
        
        if (totalMinutes > targetMinutes * 1.2) {
          // Too much content, split into more days or reduce
          return this.reduceDayLoad(day, targetMinutes)
        } else if (totalMinutes < targetMinutes * 0.8) {
          // Too little content, can add more
          return this.increaseDayLoad(day, targetMinutes)
        }
        
        return day
      })
    }
  }

  private static reduceDayLoad(day: DayPlan, targetMinutes: number): DayPlan {
    // Prioritize blocks by confidence and importance
    const allBlocks = [...day.TYT.map(b => ({...b, type: 'TYT'})), ...day.AYT.map(b => ({...b, type: 'AYT'}))]
    allBlocks.sort((a, b) => b.confidence - a.confidence) // Keep high confidence blocks
    
    let currentMinutes = 0
    const selectedBlocks = allBlocks.filter(block => {
      if (currentMinutes + block.süre_dakika <= targetMinutes) {
        currentMinutes += block.süre_dakika
        return true
      }
      return false
    })
    
    return {
      ...day,
      TYT: selectedBlocks.filter(b => b.type === 'TYT').map(({type, ...block}) => block),
      AYT: selectedBlocks.filter(b => b.type === 'AYT').map(({type, ...block}) => block)
    }
  }

  private static increaseDayLoad(day: DayPlan, targetMinutes: number): DayPlan {
    // Could add review sessions or additional practice
    return day
  }
}

export class SpacedRepetitionEngine {
  static calculateNextReview(lastReview: Date, difficulty: number, successRate: number): Date {
    // SM-2 inspired algorithm
    const baseInterval = difficulty === 1 ? 1 : difficulty === 2 ? 6 : 14
    const multiplier = successRate > 0.8 ? 2.5 : successRate > 0.6 ? 1.3 : 1.0
    
    const nextInterval = Math.max(1, Math.floor(baseInterval * multiplier))
    
    const nextDate = new Date(lastReview)
    nextDate.setDate(nextDate.getDate() + nextInterval)
    
    return nextDate
  }

  static getRepetitionHints(resources: ResourceRecommendation[]): string[] {
    return resources.map(resource => {
      const days = resource.repeat_after_days || 7
      return `${resource.isim}: ${days} gün sonra tekrar et`
    })
  }
}

export class ConfidenceScorer {
  static calculateBlockConfidence(
    topic: string, 
    userLevel: string, 
    previousPerformance: number[] = []
  ): number {
    // Base confidence by level
    const baseConfidence = {
      'başlangıç': 0.6,
      'orta': 0.75,
      'ileri': 0.85
    }[userLevel] || 0.7

    // Adjust by previous performance
    if (previousPerformance.length > 0) {
      const avgPerformance = previousPerformance.reduce((a, b) => a + b, 0) / previousPerformance.length
      return Math.min(1.0, Math.max(0.0, baseConfidence + (avgPerformance - 0.7) * 0.3))
    }

    return baseConfidence
  }

  static getDifficultyEstimate(confidence: number): 'kolay' | 'orta' | 'zor' {
    if (confidence >= 0.8) return 'kolay'
    if (confidence >= 0.6) return 'orta'
    return 'zor'
  }
}

// A/B Testing Support
export class ABTestManager {
  static getVariant(userId: string, testName: string): 'A' | 'B' {
    // Simple hash-based assignment for consistent user experience
    const hash = this.simpleHash(userId + testName)
    return hash % 2 === 0 ? 'A' : 'B'
  }

  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  static logEvent(userId: string, event: string, variant: string, data?: any) {
    // In production, this would send to analytics service
    console.log('A/B Test Event:', { userId, event, variant, data, timestamp: new Date() })
  }
}

// Telemetry
export class Telemetry {
  static trackPlanGeneration(userId: string, duration: number, success: boolean, mockMode: boolean) {
    this.logEvent('plan_generation', {
      userId,
      duration,
      success,
      mockMode,
      timestamp: new Date()
    })
  }

  static trackUserRetention(userId: string, daysSinceFirstUse: number) {
    this.logEvent('user_retention', {
      userId,
      daysSinceFirstUse,
      timestamp: new Date()
    })
  }

  private static logEvent(eventType: string, data: any) {
    // In production, this would send to analytics service (Google Analytics, Mixpanel, etc.)
    console.log(`Telemetry [${eventType}]:`, data)
  }
}

