/**
 * YKS Akıllı Asistanı - Ana Entegrasyon Modülü
 * Tüm AI sistemlerini birleştiren ana sınıf ve JSON çıktı üretici
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import {
  UserProfile,
  AIAssistantOutput,
  GeneratePlanRequest,
  UpdatePerformanceRequest,
  AIAssistantError,
  TopicPerformance
} from './types';
import { userManager } from './user-manager';
import { dataStore } from './data-store';
import { adaptiveEngine } from './adaptive-engine';
import { uxEngine } from './ux-engine';

/**
 * Ana YKS Akıllı Asistanı Sınıfı
 */
export class AIAssistant {
  
  /**
   * Tam AI çıktısı üret (istenen JSON formatında)
   */
  async generateFullOutput(
    forceRegenerate: boolean = false,
    focusTopics?: string[],
    availableTime?: number
  ): Promise<AIAssistantOutput> {
    const profile = userManager.getUserProfile();
    if (!profile) {
      throw new AIAssistantError('Kullanıcı profili bulunamadı', 'NO_PROFILE');
    }

    console.log('🤖 AI Asistan tam çıktı üretiyor...');

    // 1. Adaptif plan üret
    const adaptivePlan = await adaptiveEngine.generateAdaptivePlan({
      userId: profile.identity.id,
      forceRegenerate,
      focusTopics,
      availableTime
    });

    // 2. UX önerileri üret
    const uxRecommendations = uxEngine.generateUXRecommendations(profile);

    // 3. Performans analizi
    const performanceAnalysis = this.analyzePerformance(profile);

    // 4. İstatistikler hesapla
    const statistics = this.calculateStatistics(profile);

    // 5. JSON formatında çıktı oluştur
    const output: AIAssistantOutput = {
      kullanıcı_ID: profile.identity.id,
      tarih: new Date().toISOString().split('T')[0],
      haftalık_plan: this.formatWeeklyPlan(adaptivePlan),
      UX_önerileri: this.formatUXRecommendations(uxRecommendations),
      adaptasyon_notları: adaptivePlan.adaptationNotes,
      performans_analizi: performanceAnalysis,
      istatistikler: statistics
    };

    // 6. Profili güncelle
    userManager.updateProfile({
      studyPlan: adaptivePlan,
      uxRecommendations: uxRecommendations,
      lastUpdated: new Date().toISOString()
    });

    return output;
  }

  /**
   * Performansı güncelle ve adaptasyon yap
   */
  async updatePerformanceAndAdapt(request: UpdatePerformanceRequest): Promise<AIAssistantOutput> {
    // Performansı güncelle
    dataStore.updateUserPerformance(request);

    console.log('📊 Performans güncellendi, adaptasyon yapılıyor...');

    // Önemli değişiklik varsa planı yeniden üret
    const shouldRegenerate = this.shouldRegeneratePlan(request);
    
    return this.generateFullOutput(shouldRegenerate);
  }

  /**
   * Haftalık planı istenen formata çevir
   */
  private formatWeeklyPlan(adaptivePlan: any): AIAssistantOutput['haftalık_plan'] {
    return adaptivePlan.weeklyPlan.map((day: any) => ({
      gün: day.day,
      date: day.date,
      TYT: day.TYT.map((block: any) => ({
        konu: block.topicName,
        soru_sayısı: block.questionCount,
        süre_dakika: block.estimatedMinutes,
        zorluk: this.mapDifficultyToTurkish(block.difficultyLevel),
        öncelik: block.priority
      })),
      AYT: day.AYT.map((block: any) => ({
        konu: block.topicName,
        soru_sayısı: block.questionCount,
        süre_dakika: block.estimatedMinutes,
        zorluk: this.mapDifficultyToTurkish(block.difficultyLevel),
        öncelik: block.priority
      })),
      ...(day.review.length > 0 && {
        tekrar: day.review.map((block: any) => ({
          konu: block.topicName,
          süre_dakika: block.estimatedMinutes,
          neden: block.adaptationReason || 'Pekiştirme'
        }))
      })
    }));
  }

  /**
   * UX önerilerini istenen formata çevir
   */
  private formatUXRecommendations(uxRec: any): AIAssistantOutput['UX_önerileri'] {
    return {
      tema: uxRec.theme.recommended === 'auto' ? 'Otomatik' :
            uxRec.theme.recommended === 'dark' ? 'Koyu' : 'Açık',
      renk_şeması: this.mapColorSchemeToTurkish(uxRec.theme.colorScheme),
      bildirimler: [
        uxRec.notifications.morningMessage,
        ...uxRec.notifications.reminderMessages.slice(0, 2)
      ],
      arayüz_notları: [
        `Düzen: ${this.mapLayoutToTurkish(uxRec.interface.layout)}`,
        ...uxRec.interface.highlightAreas.slice(0, 2).map((area: string) => `Vurgula: ${area}`)
      ],
      motivasyon_mesajları: uxRec.notifications.motivationQuotes
    };
  }

  /**
   * Performans analizi yap
   */
  private analyzePerformance(profile: UserProfile): AIAssistantOutput['performans_analizi'] {
    const weakTopics = dataStore.getWeakTopics(profile, 5);
    const strongTopics = dataStore.getStrongTopics(profile, 5);
    const weeklyReport = dataStore.getWeeklyReport(profile);
    const trend = dataStore.getPerformanceTrend(profile);

    // Hedef güncelleme gerekli mi?
    const targetUpdateNeeded = this.shouldUpdateTargets(profile, trend);

    // Öneriler oluştur
    const suggestions = this.generatePerformanceSuggestions(profile, weakTopics, trend);

    return {
      güçlü_konular: strongTopics.map(topic => topic.topicName),
      zayıf_konular: weakTopics.map(topic => topic.topicName),
      öneriler: suggestions,
      hedef_güncelleme: targetUpdateNeeded
    };
  }

  /**
   * İstatistikleri hesapla
   */
  private calculateStatistics(profile: UserProfile): AIAssistantOutput['istatistikler'] {
    const performance = profile.performance;
    const weeklyReport = dataStore.getWeeklyReport(profile);

    return {
      bugünkü_çalışma: performance.studyTimeToday,
      haftalık_çalışma: weeklyReport.totalStudyTime,
      başarı_oranı: Math.round(performance.successRate * 10) / 10,
      çözülen_soru: performance.totalQuestionsSolved
    };
  }

  /**
   * Plan yeniden üretilmeli mi kontrol et
   */
  private shouldRegeneratePlan(request: UpdatePerformanceRequest): boolean {
    const profile = userManager.getUserProfile();
    if (!profile) return false;

    // Büyük performans değişiklikleri
    const accuracy = request.correctAnswers / request.questionsAnswered;
    
    if (accuracy < 0.3) {
      console.log('❌ Düşük başarı oranı, plan yeniden üretiliyor');
      return true;
    }
    
    if (accuracy > 0.9 && request.questionsAnswered >= 10) {
      console.log('✅ Yüksek başarı oranı, plan yeniden üretiliyor');
      return true;
    }

    // Plan eski mi?
    const lastUpdate = new Date(profile.lastUpdated);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (lastUpdate < oneDayAgo) {
      console.log('⏰ Plan güncellemesi gerekli');
      return true;
    }

    return false;
  }

  /**
   * Hedef güncelleme gerekli mi?
   */
  private shouldUpdateTargets(profile: UserProfile, trend: any): boolean {
    const currentSuccess = profile.performance.successRate;
    const currentTarget = profile.targetScore;

    // Sürekli yüksek performans -> hedefi artır
    if (currentSuccess >= 90 && trend.improvement === 'improving') {
      return true;
    }

    // Sürekli düşük performans -> hedefi düşür
    if (currentSuccess <= 40 && trend.improvement === 'declining') {
      return true;
    }

    return false;
  }

  /**
   * Performans önerileri oluştur
   */
  private generatePerformanceSuggestions(
    profile: UserProfile,
    weakTopics: TopicPerformance[],
    trend: any
  ): string[] {
    const suggestions: string[] = [];

    // Zayıf konular için öneriler
    if (weakTopics.length > 0) {
      suggestions.push(`${weakTopics[0].topicName} konusuna ekstra zaman ayırın`);
    }

    // Trend bazlı öneriler
    if (trend.improvement === 'declining') {
      suggestions.push('Çalışma metodunuzu gözden geçirin');
      suggestions.push('Mola sürelerini kontrol edin');
    } else if (trend.improvement === 'improving') {
      suggestions.push('Bu ivmeyi koruyun, harika gidiyorsunuz!');
    }

    // Çalışma düzeni önerileri
    if (profile.performance.streakDays < 3) {
      suggestions.push('Düzenli çalışma alışkanlığı geliştirin');
    }

    if (profile.performance.averageTimePerQuestion > 180) {
      suggestions.push('Soru çözme hızınızı artırmaya odaklanın');
    }

    return suggestions.slice(0, 5); // En fazla 5 öneri
  }

  /**
   * Zorluk seviyesini Türkçe'ye çevir
   */
  private mapDifficultyToTurkish(difficulty: string): string {
    const map: Record<string, string> = {
      'baslangic': 'Başlangıç',
      'orta': 'Orta',
      'ileri': 'İleri'
    };
    return map[difficulty] || difficulty;
  }

  /**
   * Renk şemasını Türkçe'ye çevir
   */
  private mapColorSchemeToTurkish(colorScheme: string): string {
    const map: Record<string, string> = {
      'blue': 'Mavi',
      'green': 'Yeşil',
      'purple': 'Mor',
      'orange': 'Turuncu'
    };
    return map[colorScheme] || colorScheme;
  }

  /**
   * Layout'u Türkçe'ye çevir
   */
  private mapLayoutToTurkish(layout: string): string {
    const map: Record<string, string> = {
      'minimal': 'Minimal',
      'detailed': 'Detaylı',
      'cards': 'Kartlar'
    };
    return map[layout] || layout;
  }

  /**
   * JSON çıktısını dosyaya kaydet
   */
  async saveOutputToFile(output: AIAssistantOutput): Promise<void> {
    try {
      const fileName = `yks_ai_output_${output.kullanıcı_ID}_${output.tarih}.json`;
      const jsonString = JSON.stringify(output, null, 2);
      
      // Browser environment için
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      URL.revokeObjectURL(url);
      
      console.log(`💾 AI çıktısı kaydedildi: ${fileName}`);
    } catch (error) {
      console.error('AI çıktısı kaydedilemedi:', error);
      throw new AIAssistantError('Dosya kaydedilemedi', 'SAVE_ERROR', error);
    }
  }

  /**
   * Profil özeti al
   */
  getProfileSummary(): any {
    const profile = userManager.getUserProfile();
    if (!profile) return null;

    const weeklyReport = dataStore.getWeeklyReport(profile);
    const weakTopics = dataStore.getWeakTopics(profile, 3);
    const strongTopics = dataStore.getStrongTopics(profile, 3);

    return {
      kullanıcı: {
        id: profile.identity.id,
        alan: profile.field,
        seviye: profile.level,
        kayıt_tarihi: profile.identity.createdAt,
        son_aktivite: profile.identity.lastActiveAt
      },
      performans: {
        genel_başarı: `%${profile.performance.successRate.toFixed(1)}`,
        çözülen_soru: profile.performance.totalQuestionsSolved,
        çalışma_serisi: `${profile.performance.streakDays} gün`,
        haftalık_saat: `${weeklyReport.totalStudyTime} dakika`
      },
      güçlü_yanlar: strongTopics.map(t => `${t.topicName} (%${t.successRate.toFixed(0)})`),
      gelişim_alanları: weakTopics.map(t => `${t.topicName} (%${t.successRate.toFixed(0)})`),
      son_güncelleme: profile.lastUpdated
    };
  }

  /**
   * Sistem sağlığını kontrol et
   */
  healthCheck(): any {
    const profile = userManager.getUserProfile();
    const isAuthenticated = userManager.isAuthenticated();
    
    return {
      durum: 'aktif',
      kullanıcı_durumu: isAuthenticated ? 'giriş_yapılmış' : 'misafir',
      profil_varlığı: profile !== null,
      veri_bütünlüğü: this.checkDataIntegrity(),
      son_kontrol: new Date().toISOString(),
      versiyon: '1.0.0'
    };
  }

  /**
   * Veri bütünlüğünü kontrol et
   */
  private checkDataIntegrity(): boolean {
    try {
      const profile = userManager.getUserProfile();
      if (!profile) return false;

      // Kritik alanları kontrol et
      const hasValidPerformance = profile.performance && 
        typeof profile.performance.totalQuestionsSolved === 'number';
      
    const hasValidPreferences = profile.preferences && 
      profile.preferences.theme && 
      profile.preferences.study;

    return hasValidPerformance && Boolean(hasValidPreferences);
    } catch (error) {
      console.error('Veri bütünlüğü kontrolü başarısız:', error);
      return false;
    }
  }

  /**
   * Acil durum moduna geç (performans çok düşükse)
   */
  activateEmergencyMode(): AIAssistantOutput {
    console.log('🚨 Acil durum modu aktifleştirildi');
    
    const profile = userManager.getUserProfile();
    if (!profile) {
      throw new AIAssistantError('Acil durum için profil gerekli', 'NO_PROFILE');
    }

    // Basitleştirilmiş plan oluştur
    const emergencyOutput: AIAssistantOutput = {
      kullanıcı_ID: profile.identity.id,
      tarih: new Date().toISOString().split('T')[0],
      haftalık_plan: this.createEmergencyPlan(profile),
      UX_önerileri: {
        tema: 'Açık',
        renk_şeması: 'Yeşil',
        bildirimler: [
          'Sabırla devam et! Küçük adımlar büyük başarılar yaratır! 🌱',
          'Bugün sadece 30 dakika çalış - yeterli!'
        ],
        arayüz_notları: [
          'Düzen: Minimal',
          'Vurgula: Basit hedefler',
          'Gizle: Karmaşık özellikler'
        ],
        motivasyon_mesajları: [
          'Her uzman bir zamanlar acemi olmuştur.',
          'Zorluklar seni güçlendiriyor.',
          'Bugün dün\'den biraz daha iyi ol.'
        ]
      },
      adaptasyon_notları: [
        'Acil durum modu aktif',
        'Plan basitleştirildi',
        'Temel konulara odaklanılıyor',
        'Motivasyon artırma öncelikli'
      ],
      performans_analizi: {
        güçlü_konular: [],
        zayıf_konular: ['Temel konular'],
        öneriler: [
          'Çok küçük hedefler belirleyin',
          'Günde 30 dakika çalışmaya odaklanın',
          'Başarıları mutlaka kutlayın'
        ],
        hedef_güncelleme: true
      },
      istatistikler: {
        bugünkü_çalışma: profile.performance.studyTimeToday,
        haftalık_çalışma: profile.performance.studyTimeWeek,
        başarı_oranı: profile.performance.successRate,
        çözülen_soru: profile.performance.totalQuestionsSolved
      }
    };

    return emergencyOutput;
  }

  /**
   * Acil durum planı oluştur
   */
  private createEmergencyPlan(profile: UserProfile): AIAssistantOutput['haftalık_plan'] {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const plan = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      
      plan.push({
        gün: days[i],
        date: date.toISOString().split('T')[0],
        TYT: i < 5 ? [{
          konu: 'TYT Matematik - Temel İşlemler',
          soru_sayısı: 10,
          süre_dakika: 30,
          zorluk: 'Başlangıç',
          öncelik: 5
        }] : [],
        AYT: [],
        ...(i === 6 && {
          tekrar: [{
            konu: 'Haftalık Genel Tekrar',
            süre_dakika: 30,
            neden: 'Motivasyon artırma'
          }]
        })
      });
    }

    return plan;
  }
}

// Singleton instance
export const aiAssistant = new AIAssistant();
