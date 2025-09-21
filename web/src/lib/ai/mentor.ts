/**
 * AI Mentor System
 * OpenAI GPT ile akıllı rehberlik sistemi
 */

import { openai } from './openai-client'

export interface MentorSession {
  id: string
  userId: string
  messages: MentorMessage[]
  topic: string
  createdAt: Date
  updatedAt: Date
}

export interface MentorMessage {
  id: string
  role: 'user' | 'mentor'
  content: string
  timestamp: Date
  type?: 'question' | 'explanation' | 'motivation' | 'suggestion'
}

export interface StudyContext {
  currentSubject?: string
  currentTopic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  studyLevel: 'baslangic' | 'orta' | 'ileri'
  field: 'sayisal' | 'esit' | 'sozel'
  recentPerformance: {
    completedTasks: number
    totalTasks: number
    studyHours: number
    streak: number
  }
  strugglingAreas?: string[]
  strengths?: string[]
}

export class AIMentorService {
  private static instance: AIMentorService
  private activeSessions: Map<string, MentorSession> = new Map()

  private constructor() {}

  static getInstance(): AIMentorService {
    if (!AIMentorService.instance) {
      AIMentorService.instance = new AIMentorService()
    }
    return AIMentorService.instance
  }

  async startSession(userId: string, topic: string = 'general'): Promise<MentorSession> {
    const session: MentorSession = {
      id: this.generateSessionId(),
      userId,
      messages: [],
      topic,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.activeSessions.set(session.id, session)
    
    // Welcome message
    const welcomeMessage = await this.generateWelcomeMessage(topic)
    session.messages.push({
      id: this.generateMessageId(),
      role: 'mentor',
      content: welcomeMessage,
      timestamp: new Date(),
      type: 'motivation'
    })

    return session
  }

  async sendMessage(
    sessionId: string, 
    userMessage: string, 
    context?: StudyContext
  ): Promise<MentorMessage> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    // Add user message
    const userMsg: MentorMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      type: 'question'
    }
    session.messages.push(userMsg)

    // Generate mentor response
    const mentorResponse = await this.generateMentorResponse(session, context)
    
    const mentorMsg: MentorMessage = {
      id: this.generateMessageId(),
      role: 'mentor',
      content: mentorResponse.content,
      timestamp: new Date(),
      type: mentorResponse.type
    }
    session.messages.push(mentorMsg)

    session.updatedAt = new Date()
    return mentorMsg
  }

  private async generateMentorResponse(
    session: MentorSession, 
    context?: StudyContext
  ): Promise<{ content: string; type: MentorMessage['type'] }> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      const conversationHistory = session.messages.slice(-6) // Last 6 messages for context

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'mentor' ? 'assistant' as const : 'user' as const,
          content: msg.content
        }))
      ]

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 500
      })

      const content = completion.choices[0]?.message?.content || "Üzgünüm, şu anda sana yardım edemiyorum. Lütfen daha sonra tekrar dene."
      const type = this.determineMessageType(content)

      return { content, type }
    } catch (error) {
      console.error('Error generating mentor response:', error)
      return {
        content: "Şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar dene.",
        type: 'explanation'
      }
    }
  }

  private buildSystemPrompt(context?: StudyContext): string {
    let prompt = `Sen YKS'ye hazırlanan öğrenciler için uzman bir rehber öğretmensin. 

GÖREVIN:
- Öğrencilere ders konularında yardım et
- Çalışma motivasyonu ve stratejileri sun
- Soru çözme teknikleri öğret
- Zaman yönetimi konusunda tavsiyelerde bulun
- Sınav kaygısı ile baş etme yöntemleri ver
- Pozitif ve destekleyici ol

KURALLAR:
1. Her zaman Türkçe yanıtla
2. Kısa ve anlaşılır açıklamalar yap (max 3-4 paragraf)
3. Somut örnekler ve pratik tavsiyeler ver
4. Öğrenciyi motive et, olumsuz konuşma
5. Eğer konu bilgin yoksa, güvenilir kaynaklara yönlendir

ÖĞRENCI PROFİLİ:`

    if (context) {
      prompt += `
- Seviye: ${context.studyLevel}
- Alan: ${context.field}
- Güncel performans: ${context.recentPerformance.completedTasks}/${context.recentPerformance.totalTasks} görev tamamlandı
- Çalışma serisi: ${context.recentPerformance.streak} gün
- Haftalık çalışma: ${context.recentPerformance.studyHours} saat`

      if (context.currentSubject) {
        prompt += `\n- Çalıştığı ders: ${context.currentSubject}`
      }
      if (context.currentTopic) {
        prompt += `\n- Çalıştığı konu: ${context.currentTopic}`
      }
      if (context.strugglingAreas && context.strugglingAreas.length > 0) {
        prompt += `\n- Zorlandığı alanlar: ${context.strugglingAreas.join(', ')}`
      }
      if (context.strengths && context.strengths.length > 0) {
        prompt += `\n- Güçlü olduğu alanlar: ${context.strengths.join(', ')}`
      }
    }

    prompt += `

ÖRNEK YANIT TARZLARIN:
- Konu açıklaması: "Bu konuyu anlamak için şu adımları izle..."
- Motivasyon: "Harika gidiyorsun! Bu başarını görmek beni çok mutlu ediyor..."
- Strateji: "Bu tür soruları çözmek için şu tekniği öneriyorum..."
- Tavsiye: "Sınav kaygını azaltmak için şunları deneyebilirsin..."

Şimdi öğrencinin sorusunu yanıtla:`

    return prompt
  }

  private determineMessageType(content: string): MentorMessage['type'] {
    const motivationKeywords = ['harika', 'başarılı', 'mükemmel', 'tebrikler', 'gurur', 'mutlu', 'devam et']
    const explanationKeywords = ['çünkü', 'nedeni', 'açıklama', 'anlamak', 'öğrenmek', 'kavram']
    const suggestionKeywords = ['öneriyorum', 'deneyebilirsin', 'tavsiye', 'yapmalısın', 'strategi']

    const lowerContent = content.toLowerCase()

    if (motivationKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'motivation'
    }
    if (explanationKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'explanation'
    }
    if (suggestionKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'suggestion'
    }

    return 'explanation' // default
  }

  private async generateWelcomeMessage(topic: string): Promise<string> {
    const welcomeMessages = {
      general: "Merhaba! Ben senin AI rehber öğretmenin. YKS hazırlığında her konuda sana yardım etmeye hazırım. Soru çözme teknikleri, konu anlatımları, motivasyon veya çalışma stratejileri... Ne konuda yardıma ihtiyacın var? 😊",
      matematik: "Merhaba! Matematik konusunda yardıma mı ihtiyacın var? Hangi konuda zorlanıyorsun? Fonksiyonlar, türev, integral, geometri... Her konuda sana adım adım yardım edebilirim! 📐",
      turkce: "Merhaba! Türkçe konusunda buradayım. Paragraf sorularında mı zorlanıyorsun, yoksa dil bilgisi mi? Hangi konuda yardım istiyorsun? 📚",
      fizik: "Merhaba! Fizik sorularında yardıma hazırım. Hareket, kuvvet, elektrik, optik... Hangi konuda kafan karışık? Beraber çözelim! ⚛️",
      kimya: "Merhaba! Kimya konusunda rehberlik edebilirim. Atom, periyodik sistem, tepkimeler... Hangi konuda zorlanıyorsun? 🧪",
      biyoloji: "Merhaba! Biyoloji konularında yardım etmeye hazırım. Hücre, genetik, sistemler... Neyi merak ediyorsun? 🧬",
      motivation: "Merhaba! Motivasyon desteği için buradayım. Çalışma enerjin düşük mü? Hedeflerine odaklanman mı gerek? Beraber bu zorlu süreci aşacağız! 💪"
    }

    return welcomeMessages[topic as keyof typeof welcomeMessages] || welcomeMessages.general
  }

  async getPersonalizedStudyTips(context: StudyContext): Promise<string[]> {
    try {
      const prompt = `
Öğrenci profili:
- Seviye: ${context.studyLevel}
- Alan: ${context.field}
- Performans: ${context.recentPerformance.completedTasks}/${context.recentPerformance.totalTasks} görev tamamlandı
- Seri: ${context.recentPerformance.streak} gün

Bu öğrenciye özel 5 pratik çalışma tavsiyesi ver. Her tavsiye 1 cümle olsun.
JSON formatında yanıtla: ["tavsiye1", "tavsiye2", ...]
`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sen uzman bir YKS rehber öğretmenisin. Pratik ve uygulanabilir tavsiyeler verirsin." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        try {
          return JSON.parse(content)
        } catch {
          return content.split('\n').filter(tip => tip.trim()).slice(0, 5)
        }
      }
      
      return this.getDefaultStudyTips(context)
    } catch (error) {
      console.error('Error generating study tips:', error)
      return this.getDefaultStudyTips(context)
    }
  }

  private getDefaultStudyTips(context: StudyContext): string[] {
    const tips = [
      "25 dakika çalış, 5 dakika mola ver (Pomodoro Tekniği)",
      "Zor konuları sabah saatlerinde çalış",
      "Her gün düzenli tekrar yap",
      "Öğrendiğin konuları arkadaşlarına anlat",
      "Bol bol soru çöz ve hatalarını analiz et"
    ]

    if (context.field === 'sayisal') {
      tips.push("Formülleri ezberlemek yerine mantığını anla")
      tips.push("Geometri problemlerinde şekil çizmeyi unutma")
    } else if (context.field === 'sozel') {
      tips.push("Çok okuma yaparak kelime dağarcığını geliştir")
      tips.push("Tarih konularında kronolojik sıra önemli")
    }

    return tips.slice(0, 5)
  }

  async getMotivationalQuote(): Promise<string> {
    const quotes = [
      "Başarı, sürekli çaba ve kararlılığın sonucudur. Sen de bu yoldasın! 🌟",
      "Her zorluğun içinde bir fırsat gizlidir. YKS de senin için bir fırsat! 💪",
      "Hedefine odaklan, süreci sev, başarı kaçınılmaz olacak! 🎯",
      "Düştüğün yerde kalma, kalk ve daha güçlü devam et! 🚀",
      "Sabır ve azim, başarının anahtarlarıdır. Sen ikisine de sahipsin! 🔑",
      "Bugün attığın her adım, yarının başarısını inşa ediyor! 🏆",
      "İmkansız, sadece cesaret edemeyenlerin sözlüğünde var! ⭐",
      "Çalıştığın her an, hayallerine bir adım daha yaklaşıyorsun! 🌈"
    ]

    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  private generateSessionId(): string {
    return `mentor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getSession(sessionId: string): MentorSession | undefined {
    return this.activeSessions.get(sessionId)
  }

  getUserSessions(userId: string): MentorSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  endSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId)
  }
}

// Export singleton instance
export const aiMentorService = AIMentorService.getInstance()
