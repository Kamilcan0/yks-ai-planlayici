/**
 * YKS Akıllı Asistanı - Adaptif Ders Planı AI Motoru
 * Kullanıcı performansına göre kişiselleştirilmiş plan üretimi
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import {
  UserProfile,
  AdaptiveStudyPlan,
  DailyStudyPlan,
  StudyBlock,
  TopicPerformance,
  GeneratePlanRequest,
  AIAssistantError,
  TOPIC_CATEGORIES
} from './types';
import { dataStore } from './data-store';
import { userManager } from './user-manager';

// Motivasyon mesajları kategorileri
const MOTIVATION_MESSAGES = {
  strong: [
    'Harika gidiyorsun! Bu hızla hedefinize ulaşacaksın! 🎯',
    'Başarın seni bekliyor! Devam et! 💪',
    'Mükemmel performans! Bu kararlılığın seni zirveye taşıyacak! 🚀'
  ],
  improving: [
    'Her gün biraz daha iyi oluyorsun! 📈',
    'İlerlemen çok güzel! Böyle devam et! ⭐',
    'Sabır ve çalışmanın meyvelerini almaya başladın! 🌱'
  ],
  struggling: [
    'Zorluklar seni güçlendiriyor! Vazgeçme! 💎',
    'Her uzman bir zamanlar başlangıç seviyesindeydi! 🌟',
    'Bugün kendine yatırım yap, yarın hasat et! 📚'
  ],
  review: [
    'Tekrar, öğrenmenin anahtarıdır! 🔑',
    'Pekiştirme zamanı! Bilgilerin daha da sağlamlaşacak! 🏗️',
    'Gözden geçirme, başarının garantisidir! ✅'
  ]
};

/**
 * Adaptif AI Motoru
 */
export class AdaptiveEngine {
  
  /**
   * Ana adaptif plan üretici
   */
  async generateAdaptivePlan(request: GeneratePlanRequest): Promise<AdaptiveStudyPlan> {
    const profile = userManager.getUserProfile();
    if (!profile) {
      throw new AIAssistantError('Kullanıcı profili bulunamadı', 'NO_PROFILE');
    }

    // Mevcut plan varsa ve güncel ise, yeniden üretilmesine gerek yok
    if (!request.forceRegenerate && profile.studyPlan && this.isPlanCurrent(profile.studyPlan)) {
      return profile.studyPlan;
    }

    console.log('🧠 Adaptif plan üretiliyor...');

    // 1. Performans analizi
    const performanceAnalysis = this.analyzePerformance(profile);
    
    // 2. Zayıf konuları belirle
    const weakTopics = dataStore.getWeakTopics(profile, 10);
    
    // 3. Güçlü konuları belirle
    const strongTopics = dataStore.getStrongTopics(profile, 5);
    
    // 4. Odak alanlarını belirle
    const focusAreas = this.determineFocusAreas(profile, weakTopics, request.focusTopics);
    
    // 5. Haftalık plan oluştur
    const weeklyPlan = this.createWeeklyPlan(profile, performanceAnalysis, focusAreas, request.availableTime);
    
    // 6. Adaptasyon notları oluştur
    const adaptationNotes = this.generateAdaptationNotes(profile, performanceAnalysis, weakTopics);

    const adaptivePlan: AdaptiveStudyPlan = {
      userId: profile.identity.id,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 hafta geçerli
      adaptationLevel: (profile.studyPlan?.adaptationLevel || 0) + 1,
      weeklyPlan,
      focusAreas,
      adaptationNotes
    };

    // Profili güncelle
    userManager.updateProfile({ studyPlan: adaptivePlan });

    return adaptivePlan;
  }

  /**
   * Performans analizi
   */
  private analyzePerformance(profile: UserProfile): any {
    const performance = profile.performance;
    const weeklyReport = dataStore.getWeeklyReport(profile);
    const trend = dataStore.getPerformanceTrend(profile);

    return {
      overall: {
        level: performance.successRate >= 85 ? 'excellent' :
               performance.successRate >= 70 ? 'good' :
               performance.successRate >= 50 ? 'average' : 'needs_improvement',
        successRate: performance.successRate,
        totalQuestions: performance.totalQuestionsSolved,
        streak: performance.streakDays
      },
      weekly: weeklyReport,
      trend: trend,
      studyPattern: {
        consistency: performance.streakDays >= 7 ? 'high' : 
                    performance.streakDays >= 3 ? 'medium' : 'low',
        intensity: weeklyReport.averageStudyTime >= 240 ? 'high' :
                  weeklyReport.averageStudyTime >= 120 ? 'medium' : 'low'
      }
    };
  }

  /**
   * Odak alanlarını belirle
   */
  private determineFocusAreas(
    profile: UserProfile, 
    weakTopics: TopicPerformance[], 
    requestedTopics?: string[]
  ): string[] {
    const focusAreas: string[] = [];

    // Kullanıcının istediği konular varsa öncelik ver
    if (requestedTopics) {
      focusAreas.push(...requestedTopics);
    }

    // Zayıf konuları ekle
    weakTopics.forEach(topic => {
      if (!focusAreas.includes(topic.topicName)) {
        focusAreas.push(topic.topicName);
      }
    });

    // Alan bazlı temel konuları ekle
    const fieldTopics = this.getFieldBasics(profile.field);
    fieldTopics.forEach(topic => {
      if (!focusAreas.includes(topic) && focusAreas.length < 8) {
        focusAreas.push(topic);
      }
    });

    return focusAreas.slice(0, 8); // En fazla 8 odak alan
  }

  /**
   * Alan bazlı temel konuları getir
   */
  private getFieldBasics(field: 'sayisal' | 'esit' | 'sozel'): string[] {
    const basics = {
      sayisal: [
        'TYT Matematik - Temel İşlemler',
        'TYT Matematik - Fonksiyonlar',
        'AYT Matematik - Türev',
        'AYT Fizik - Mekanik',
        'AYT Kimya - Atomun Yapısı'
      ],
      esit: [
        'TYT Matematik - Temel İşlemler',
        'TYT Sosyal - Tarih',
        'AYT Edebiyat - Modern Türk Edebiyatı',
        'AYT Tarih - Yakın Çağ',
        'AYT Coğrafya - Beşeri Coğrafya'
      ],
      sozel: [
        'TYT Türkçe - Dil Bilgisi',
        'TYT Sosyal - Tarih',
        'AYT Edebiyat - Divan Edebiyatı',
        'AYT Tarih - İslam Tarihi',
        'AYT Coğrafya - Fiziki Coğrafya'
      ]
    };

    return basics[field] || [];
  }

  /**
   * Haftalık plan oluştur
   */
  private createWeeklyPlan(
    profile: UserProfile,
    analysis: any,
    focusAreas: string[],
    availableTime?: number
  ): DailyStudyPlan[] {
    const weekPlan: DailyStudyPlan[] = [];
    const dailyTime = availableTime || profile.preferences.study.dailyGoal;
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const dayType = i % 2 === 0 ? 'TYT' : 'AYT';
      const isWeekend = i >= 5;
      
      let dayTime = dailyTime;
      if (isWeekend) {
        dayTime = i === 6 ? dailyTime * 0.5 : dailyTime * 0.7; // Pazar daha az, Cumartesi biraz az
      }

      const dailyPlan = this.createDailyPlan(
        days[i],
        date.toISOString().split('T')[0],
        dayType,
        dayTime,
        profile,
        analysis,
        focusAreas,
        isWeekend
      );

      weekPlan.push(dailyPlan);
    }

    return weekPlan;
  }

  /**
   * Günlük plan oluştur
   */
  private createDailyPlan(
    day: string,
    date: string,
    primaryType: 'TYT' | 'AYT',
    totalMinutes: number,
    profile: UserProfile,
    analysis: any,
    focusAreas: string[],
    isWeekend: boolean
  ): DailyStudyPlan {
    const TYTBlocks: StudyBlock[] = [];
    const AYTBlocks: StudyBlock[] = [];
    const reviewBlocks: StudyBlock[] = [];

    // Zaman dağılımı
    const timeDistribution = this.calculateTimeDistribution(primaryType, totalMinutes, isWeekend);

    // TYT blokları oluştur
    if (timeDistribution.TYT > 0) {
      TYTBlocks.push(...this.createStudyBlocks(
        'TYT',
        timeDistribution.TYT,
        profile,
        analysis,
        focusAreas
      ));
    }

    // AYT blokları oluştur
    if (timeDistribution.AYT > 0) {
      AYTBlocks.push(...this.createStudyBlocks(
        'AYT',
        timeDistribution.AYT,
        profile,
        analysis,
        focusAreas
      ));
    }

    // Tekrar blokları oluştur (hafta sonu veya Pazar)
    if (timeDistribution.review > 0) {
      reviewBlocks.push(...this.createReviewBlocks(
        timeDistribution.review,
        profile,
        analysis
      ));
    }

    // Motivasyon mesajı seç
    const motivationMessage = this.selectMotivationMessage(analysis, day === 'Pazar');

    return {
      day,
      date,
      totalMinutes,
      TYT: TYTBlocks,
      AYT: AYTBlocks,
      review: reviewBlocks,
      motivationMessage
    };
  }

  /**
   * Zaman dağılımını hesapla
   */
  private calculateTimeDistribution(
    primaryType: 'TYT' | 'AYT',
    totalMinutes: number,
    isWeekend: boolean
  ): { TYT: number; AYT: number; review: number } {
    if (isWeekend && totalMinutes > 0) {
      // Hafta sonu: karma çalışma
      return {
        TYT: Math.floor(totalMinutes * 0.4),
        AYT: Math.floor(totalMinutes * 0.4),
        review: Math.floor(totalMinutes * 0.2)
      };
    }

    if (primaryType === 'TYT') {
      return {
        TYT: Math.floor(totalMinutes * 0.8),
        AYT: Math.floor(totalMinutes * 0.2),
        review: 0
      };
    } else {
      return {
        TYT: Math.floor(totalMinutes * 0.2),
        AYT: Math.floor(totalMinutes * 0.8),
        review: 0
      };
    }
  }

  /**
   * Çalışma blokları oluştur
   */
  private createStudyBlocks(
    category: 'TYT' | 'AYT',
    totalMinutes: number,
    profile: UserProfile,
    analysis: any,
    focusAreas: string[]
  ): StudyBlock[] {
    const blocks: StudyBlock[] = [];
    const sessionDuration = profile.preferences.study.sessionDuration;
    const sessionCount = Math.max(1, Math.floor(totalMinutes / sessionDuration));
    const actualSessionDuration = Math.floor(totalMinutes / sessionCount);

    // Alan bazlı konuları al
    const subjects = this.getSubjectsForCategory(category, profile.field);
    
    // Odak alanlarını önceliklendir
    const prioritizedSubjects = this.prioritizeSubjects(subjects, focusAreas, profile);

    for (let i = 0; i < sessionCount; i++) {
      const subject = prioritizedSubjects[i % prioritizedSubjects.length];
      const topicId = this.generateTopicId(category, subject);
      
      // Zorluk seviyesini belirle
      const difficulty = this.determineDifficulty(profile, subject, analysis);
      
      // Soru sayısını hesapla
      const questionCount = this.calculateQuestionCount(actualSessionDuration, difficulty);
      
      // Adaptasyon nedenini belirle
      const adaptationReason = this.getAdaptationReason(subject, focusAreas, analysis);

      blocks.push({
        topicId,
        topicName: `${category} ${subject}`,
        category,
        subject,
        questionCount,
        estimatedMinutes: actualSessionDuration,
        difficultyLevel: difficulty,
        priority: focusAreas.includes(subject) ? 5 : 3,
        adaptationReason,
        resources: this.getRecommendedResources(subject, profile.level)
      });
    }

    return blocks;
  }

  /**
   * Tekrar blokları oluştur
   */
  private createReviewBlocks(
    totalMinutes: number,
    profile: UserProfile,
    analysis: any
  ): StudyBlock[] {
    const blocks: StudyBlock[] = [];
    const weakTopics = dataStore.getWeakTopics(profile, 3);
    
    if (weakTopics.length === 0) {
      // Zayıf konu yoksa genel tekrar
      blocks.push({
        topicId: 'review_general',
        topicName: 'Genel Tekrar',
        category: 'TYT',
        subject: 'Karma Tekrar',
        questionCount: Math.floor(totalMinutes / 2),
        estimatedMinutes: totalMinutes,
        difficultyLevel: profile.level,
        priority: 3,
        adaptationReason: 'Genel pekiştirme',
        resources: ['Karma soru bankaları', 'Önceki çalışmalar']
      });
    } else {
      // Zayıf konuları tekrar et
      const timePerTopic = Math.floor(totalMinutes / weakTopics.length);
      
      weakTopics.forEach(topic => {
        blocks.push({
          topicId: `review_${topic.topicId}`,
          topicName: `${topic.topicName} Tekrarı`,
          category: 'TYT', // Tekrar için varsayılan
          subject: topic.topicName,
          questionCount: Math.floor(timePerTopic / 2),
          estimatedMinutes: timePerTopic,
          difficultyLevel: 'baslangic', // Tekrar için kolay başla
          priority: 5,
          adaptationReason: `Başarı oranı: %${topic.successRate.toFixed(0)}`,
          resources: this.getRecommendedResources(topic.topicName, 'baslangic')
        });
      });
    }

    return blocks;
  }

  /**
   * Kategori için dersleri al
   */
  private getSubjectsForCategory(category: 'TYT' | 'AYT', field: 'sayisal' | 'esit' | 'sozel'): string[] {
    if (category === 'TYT') {
      const common = ['Matematik', 'Türkçe'];
      if (field === 'sayisal' || field === 'esit') {
        return [...common, 'Fen Bilimleri', 'Sosyal Bilimler'];
      } else {
        return [...common, 'Sosyal Bilimler'];
      }
    } else {
      if (field === 'sayisal') {
        return ['Matematik', 'Fizik', 'Kimya', 'Biyoloji'];
      } else if (field === 'esit') {
        return ['Matematik', 'Edebiyat', 'Tarih', 'Coğrafya'];
      } else {
        return ['Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe'];
      }
    }
  }

  /**
   * Dersleri önceliklendir
   */
  private prioritizeSubjects(subjects: string[], focusAreas: string[], profile: UserProfile): string[] {
    return subjects.sort((a, b) => {
      const aInFocus = focusAreas.some(area => area.includes(a)) ? 1 : 0;
      const bInFocus = focusAreas.some(area => area.includes(b)) ? 1 : 0;
      
      if (aInFocus !== bInFocus) {
        return bInFocus - aInFocus; // Focus alanları önce
      }

      // Performansa göre sırala (zayıf olanlar önce)
      const aPerf = this.getSubjectPerformance(a, profile);
      const bPerf = this.getSubjectPerformance(b, profile);
      
      return aPerf - bPerf;
    });
  }

  /**
   * Ders performansını al
   */
  private getSubjectPerformance(subject: string, profile: UserProfile): number {
    const topics = Object.values(profile.topicPerformances)
      .filter(topic => topic.topicName.includes(subject));
    
    if (topics.length === 0) return 50; // Varsayılan
    
    return topics.reduce((sum, topic) => sum + topic.successRate, 0) / topics.length;
  }

  /**
   * Zorluk seviyesini belirle
   */
  private determineDifficulty(
    profile: UserProfile,
    subject: string,
    analysis: any
  ): 'baslangic' | 'orta' | 'ileri' {
    const subjectPerf = this.getSubjectPerformance(subject, profile);
    const overallLevel = analysis.overall.level;

    if (subjectPerf < 50 || overallLevel === 'needs_improvement') {
      return 'baslangic';
    } else if (subjectPerf < 80 || overallLevel === 'average') {
      return 'orta';
    } else {
      return 'ileri';
    }
  }

  /**
   * Soru sayısını hesapla
   */
  private calculateQuestionCount(minutes: number, difficulty: 'baslangic' | 'orta' | 'ileri'): number {
    const timePerQuestion = {
      baslangic: 1.5, // 1.5 dakika/soru
      orta: 2,        // 2 dakika/soru
      ileri: 2.5      // 2.5 dakika/soru
    };

    return Math.max(5, Math.floor(minutes / timePerQuestion[difficulty]));
  }

  /**
   * Topic ID üret
   */
  private generateTopicId(category: 'TYT' | 'AYT', subject: string): string {
    const timestamp = Date.now().toString(36).slice(-4);
    return `${category.toLowerCase()}_${subject.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
  }

  /**
   * Adaptasyon nedenini belirle
   */
  private getAdaptationReason(subject: string, focusAreas: string[], analysis: any): string | undefined {
    if (focusAreas.some(area => area.includes(subject))) {
      return 'Odak alanında yer alıyor';
    }

    const subjectPerf = analysis.overall.successRate;
    if (subjectPerf < 50) {
      return 'Başarı oranı düşük, yoğunlaştırılmış çalışma';
    } else if (subjectPerf > 85) {
      return 'Güçlü alan, pekiştirme odaklı';
    }

    return undefined;
  }

  /**
   * Kaynak önerilerini al
   */
  private getRecommendedResources(subject: string, level: 'baslangic' | 'orta' | 'ileri'): string[] {
    const resources = {
      Matematik: {
        baslangic: ['Temel Matematik Konu Anlatımı', 'Başlangıç Soru Bankası'],
        orta: ['Orta Düzey Matematik', 'Karma Soru Seti'],
        ileri: ['İleri Matematik', 'Olimpiyat Soruları']
      },
      Fizik: {
        baslangic: ['Temel Fizik Kavramları', 'Günlük Yaşam Fiziği'],
        orta: ['Fizik Soru Bankası', 'Problem Çözme Teknikleri'],
        ileri: ['İleri Fizik', 'Üniversite Hazırlık']
      },
      // Diğer dersler...
    };

    return resources[subject as keyof typeof resources]?.[level] || 
           [`${subject} ${level} seviye kaynakları`];
  }

  /**
   * Motivasyon mesajı seç
   */
  private selectMotivationMessage(analysis: any, isRestDay: boolean): string {
    if (isRestDay) {
      return MOTIVATION_MESSAGES.review[Math.floor(Math.random() * MOTIVATION_MESSAGES.review.length)];
    }

    const level = analysis.overall.level;
    let category: keyof typeof MOTIVATION_MESSAGES;

    if (level === 'excellent' || level === 'good') {
      category = 'strong';
    } else if (analysis.trend.improvement === 'improving') {
      category = 'improving';
    } else {
      category = 'struggling';
    }

    const messages = MOTIVATION_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Adaptasyon notları oluştur
   */
  private generateAdaptationNotes(
    profile: UserProfile,
    analysis: any,
    weakTopics: TopicPerformance[]
  ): string[] {
    const notes: string[] = [];

    // Genel performans notu
    if (analysis.overall.successRate < 50) {
      notes.push('Genel başarı oranı düşük - temel konulara odaklanın');
    } else if (analysis.overall.successRate > 85) {
      notes.push('Mükemmel performans - ileri seviye sorulara geçiş yapabilirsiniz');
    }

    // Zayıf konular notu
    if (weakTopics.length > 0) {
      const topicNames = weakTopics.slice(0, 3).map(t => t.topicName).join(', ');
      notes.push(`Zayıf konular tespit edildi: ${topicNames}`);
    }

    // Çalışma düzeni notu
    if (analysis.studyPattern.consistency === 'low') {
      notes.push('Düzenli çalışma alışkanlığı geliştirin - her gün en az 1 saat');
    }

    // Trend notu
    if (analysis.trend.improvement === 'declining') {
      notes.push('Performans düşüş eğiliminde - motivasyonu yüksek tutun');
    } else if (analysis.trend.improvement === 'improving') {
      notes.push('Performans yükselişte - bu ivmeyi koruyun');
    }

    return notes;
  }

  /**
   * Plan güncel mi kontrol et
   */
  private isPlanCurrent(plan: AdaptiveStudyPlan): boolean {
    const now = new Date();
    const validUntil = new Date(plan.validUntil);
    return now < validUntil;
  }
}

// Singleton instance
export const adaptiveEngine = new AdaptiveEngine();
