import { openai } from './openai-client'
import { getResourcesForSubject, getSubjectsForField } from '@/lib/plan-generator/resource-mapper'
import { Field, Level } from '@/lib/plan-generator/types'

export interface GenerateWeeklyPlanParams {
  level: Level
  field: Field
  weeklyHours: number
  targetDate?: string
  preferences?: Record<string, any>
}

export interface DailyPlan {
  day: string
  tasks: Array<{
    subject: string
    topic: string
    duration: number
    priority: 'high' | 'medium' | 'low'
    resources: Array<{
      title: string
      type: string
      url?: string
    }>
  }>
  totalDuration: number
}

export interface WeeklyPlan {
  weekNumber: number
  startDate: string
  endDate: string
  dailyPlans: DailyPlan[]
  goals: string[]
  tips: string[]
  motivationalMessage: string
}

export const generateWeeklyPlan = async (params: GenerateWeeklyPlanParams): Promise<WeeklyPlan> => {
  try {
    const subjects = getSubjectsForField(params.field)
    const dailyHours = Math.round(params.weeklyHours / 7 * 10) / 10

    const prompt = `
Sen profesyonel bir YKS rehber öğretmenisin. Aşağıdaki bilgilere göre detaylı bir haftalık çalışma planı oluştur:

Öğrenci Profili:
- Seviye: ${params.level} (başlangıç/orta/ileri)
- Alan: ${params.field} (sayısal/esit/sozel)
- Haftalık çalışma saati: ${params.weeklyHours} saat
- Günlük ortalama: ${dailyHours} saat
- Hedef tarih: ${params.targetDate || 'Belirtilmemiş'}

Dersler: ${subjects.join(', ')}

GÖREV: 7 günlük detaylı plan oluştur. Her gün için:
1. Konu başlıkları ve süreleri
2. Öncelik seviyeleri (high/medium/low)
3. Önerilen kaynak türleri

Çıktı formatı JSON olmalı:
{
  "weekNumber": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-01-21",
  "dailyPlans": [
    {
      "day": "Pazartesi",
      "tasks": [
        {
          "subject": "Matematik",
          "topic": "Fonksiyonlar - Temel Kavramlar",
          "duration": 90,
          "priority": "high",
          "resources": [
            {
              "title": "TYT Matematik Konu Anlatımı",
              "type": "kitap"
            }
          ]
        }
      ],
      "totalDuration": 240
    }
  ],
  "goals": ["Bu hafta fonksiyon konusunu tamamla", "Günde en az 2 soru çöz"],
  "tips": ["Kısa molalar ver", "Düzenli tekrar yap"],
  "motivationalMessage": "Her gün biraz daha ileriye gidiyorsun! 💪"
}

Önemli: Gerçekçi süreler ver, seviyeye uygun konular seç, motivasyonel mesajlar ekle.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Sen uzman bir YKS rehber öğretmenisin. Öğrencilere etkili, gerçekçi ve motivasyonel çalışma planları hazırlarsın. Her zaman JSON formatında yanıt verirsin."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI yanıt vermedi')
    }

    try {
      const parsedPlan = JSON.parse(content) as WeeklyPlan
      
      // Kaynakları mevcut veri tabanından zenginleştir
      parsedPlan.dailyPlans.forEach(dayPlan => {
        dayPlan.tasks.forEach(task => {
          const resources = getResourcesForSubject(task.subject, params.level)
          if (resources.length > 0) {
            task.resources = resources.slice(0, 2).map(r => ({
              title: r.title,
              type: r.type,
              url: r.url
            }))
          }
        })
      })

      return parsedPlan
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('AI yanıtı işlenirken hata oluştu')
    }

  } catch (error) {
    console.error('Plan generation error:', error)
    
    // Fallback plan
    return generateFallbackPlan(params)
  }
}

export const generateMotivationalMessage = async (userProgress: any): Promise<string> => {
  try {
    const prompt = `
Bir YKS öğrencisine günlük motivasyon mesajı yaz. 

Öğrenci durumu:
- Tamamlanan görevler: ${userProgress.completedTasks || 0}
- Toplam görevler: ${userProgress.totalTasks || 0}
- Çalışma serisi: ${userProgress.streak || 0} gün
- Bu hafta çalışma saati: ${userProgress.studyHours || 0}

Kısa, pozitif ve enerjik bir mesaj (maksimum 100 karakter). Türkçe olsun ve emoji kullan.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen motivasyonel bir YKS koçusun. Öğrencileri destekleyici, pozitif ve enerjik mesajlar yazarsın."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 100
    })

    return completion.choices[0]?.message?.content || "Bugün de harika gidiyorsun! Devam et! 🌟"
  } catch (error) {
    console.error('Motivational message error:', error)
    return "Bugün de harika gidiyorsun! Devam et! 🌟"
  }
}

const generateFallbackPlan = (params: GenerateWeeklyPlanParams): WeeklyPlan => {
  const subjects = getSubjectsForField(params.field)
  const dailyHours = Math.round(params.weeklyHours / 7 * 10) / 10
  
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  
  const dailyPlans: DailyPlan[] = days.map(day => {
    const isWeekend = day === 'Cumartesi' || day === 'Pazar'
    const dayHours = isWeekend ? dailyHours * 1.5 : dailyHours
    
    const tasks = subjects.slice(0, 2).map((subject, index) => {
      const resources = getResourcesForSubject(subject, params.level)
      return {
        subject,
        topic: "Genel Tekrar",
        duration: Math.round(dayHours * 60 / 2),
        priority: index === 0 ? 'high' as const : 'medium' as const,
        resources: resources.slice(0, 1).map(r => ({
          title: r.title,
          type: r.type,
          url: r.url
        }))
      }
    })
    
    return {
      day,
      tasks,
      totalDuration: Math.round(dayHours * 60)
    }
  })

  return {
    weekNumber: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dailyPlans,
    goals: [
      "Bu hafta düzenli çalışma alışkanlığı geliştir",
      "Her gün planlanan görevleri tamamla"
    ],
    tips: [
      "25 dakika çalış, 5 dakika mola ver (Pomodoro tekniği)",
      "Zor konulara sabah saatlerinde odaklan",
      "Günlük tekrar yapmayı unutma"
    ],
    motivationalMessage: "Başarıya giden yol sabır ve kararlılıktan geçer! 🚀"
  }
}
