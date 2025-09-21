/**
 * YKS Akıllı Asistanı - Ana Export Modülü
 * Tüm AI asistan fonksiyonlarını export eder
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

// Ana sınıflar
export { aiAssistant } from './ai-assistant';
export { userManager } from './user-manager';
export { dataStore } from './data-store';
export { adaptiveEngine } from './adaptive-engine';
export { uxEngine } from './ux-engine';

// Tip tanımları
export type {
  UserIdentity,
  UserProfile,
  UserPerformance,
  TopicPerformance,
  UserPreferences,
  AdaptiveStudyPlan,
  DailyStudyPlan,
  StudyBlock,
  UXRecommendations,
  AIAssistantOutput,
  CreateUserRequest,
  UpdatePerformanceRequest,
  GeneratePlanRequest,
  StudySession,
  DatabaseUser
} from './types';

export { 
  AIAssistantError, 
  AdaptationLevel,
  TOPIC_CATEGORIES 
} from './types';

// Utility fonksiyonlar
export {
  generateUniqueID,
  validateEmail,
  validateUsername
} from './user-manager';

// Sabitler
export const AI_ASSISTANT_VERSION = '1.0.0';

export const AI_FEATURES = {
  ADAPTIVE_PLANNING: 'Adaptif ders planı üretimi',
  PERFORMANCE_ANALYSIS: 'Performans analizi ve takip',
  UX_RECOMMENDATIONS: 'Arayüz ve tema önerileri',
  SMART_NOTIFICATIONS: 'Akıllı hatırlatma sistemi',
  DATA_ANALYTICS: 'Çalışma verileri analizi',
  AUTO_ADAPTATION: 'Otomatik plan adaptasyonu'
} as const;

// Konfigürasyon
export const AI_CONFIG = {
  // Plan üretim ayarları
  PLAN_VALIDITY_DAYS: 7,
  MIN_QUESTIONS_FOR_ANALYSIS: 10,
  ADAPTATION_THRESHOLD: 0.3, // %30 başarı oranı altında adaptasyon
  
  // Performans kategorileri
  PERFORMANCE_THRESHOLDS: {
    EXCELLENT: 85,
    GOOD: 70,
    AVERAGE: 50,
    NEEDS_IMPROVEMENT: 0
  },
  
  // Çalışma düzeni kategorileri
  STUDY_PATTERN: {
    HIGH_CONSISTENCY: 7, // gün streak
    MEDIUM_CONSISTENCY: 3,
    HIGH_INTENSITY: 300, // dakika/hafta
    MEDIUM_INTENSITY: 150
  },
  
  // Bildirim zamanlaması
  NOTIFICATION_TIMES: {
    MORNING_MOTIVATION: '08:00',
    EVENING_SUMMARY: '22:00',
    BREAK_REMINDER_OFFSET: 45 // dakika
  }
} as const;

// API yardımcı fonksiyonları
export const aiUtils = {
  /**
   * Kullanıcı performansını kategorize et
   */
  categorizePerformance: (successRate: number): string => {
    if (successRate >= AI_CONFIG.PERFORMANCE_THRESHOLDS.EXCELLENT) return 'excellent';
    if (successRate >= AI_CONFIG.PERFORMANCE_THRESHOLDS.GOOD) return 'good';
    if (successRate >= AI_CONFIG.PERFORMANCE_THRESHOLDS.AVERAGE) return 'average';
    return 'needs_improvement';
  },

  /**
   * Çalışma düzenini analiz et
   */
  analyzeStudyPattern: (streakDays: number, weeklyMinutes: number) => ({
    consistency: streakDays >= AI_CONFIG.STUDY_PATTERN.HIGH_CONSISTENCY ? 'high' :
                streakDays >= AI_CONFIG.STUDY_PATTERN.MEDIUM_CONSISTENCY ? 'medium' : 'low',
    intensity: weeklyMinutes >= AI_CONFIG.STUDY_PATTERN.HIGH_INTENSITY ? 'high' :
              weeklyMinutes >= AI_CONFIG.STUDY_PATTERN.MEDIUM_INTENSITY ? 'medium' : 'low'
  }),

  /**
   * JSON çıktısını validate et
   */
  validateAIOutput: (output: any): boolean => {
    try {
      return !!(
        output.kullanıcı_ID &&
        output.tarih &&
        output.haftalık_plan &&
        Array.isArray(output.haftalık_plan) &&
        output.UX_önerileri &&
        output.performans_analizi &&
        output.istatistikler
      );
    } catch {
      return false;
    }
  },

  /**
   * Çıktıyı özetle
   */
  summarizeOutput: (output: any): string => {
    const totalBlocks = output.haftalık_plan.reduce((sum, day) => 
      sum + day.TYT.length + day.AYT.length + (day.tekrar?.length || 0), 0
    );
    
    return `AI Asistan Özeti:
    - Kullanıcı: ${output.kullanıcı_ID}
    - Tarih: ${output.tarih}
    - Haftalık Blok Sayısı: ${totalBlocks}
    - Başarı Oranı: %${output.istatistikler.başarı_oranı}
    - Zayıf Konu Sayısı: ${output.performans_analizi.zayıf_konular.length}
    - Adaptasyon Notu: ${output.adaptasyon_notları.length}`;
  },

  /**
   * Çıktıyı CSV formatına çevir
   */
  exportToCSV: (output: any): string => {
    const headers = ['Gün', 'Kategori', 'Konu', 'Soru Sayısı', 'Süre', 'Zorluk', 'Öncelik'];
    const rows = [headers.join(',')];

    output.haftalık_plan.forEach(day => {
      day.TYT.forEach(block => {
        rows.push([
          day.gün,
          'TYT',
          `"${block.konu}"`,
          block.soru_sayısı,
          block.süre_dakika,
          block.zorluk,
          block.öncelik
        ].join(','));
      });

      day.AYT.forEach(block => {
        rows.push([
          day.gün,
          'AYT',
          `"${block.konu}"`,
          block.soru_sayısı,
          block.süre_dakika,
          block.zorluk,
          block.öncelik
        ].join(','));
      });

      if (day.tekrar) {
        day.tekrar.forEach(block => {
          rows.push([
            day.gün,
            'Tekrar',
            `"${block.konu}"`,
            '-',
            block.süre_dakika,
            'Tekrar',
            '5'
          ].join(','));
        });
      }
    });

    return rows.join('\n');
  }
};

// Örnek kullanım şablonları
export const USAGE_EXAMPLES = {
  // Yeni kullanıcı oluşturma
  CREATE_USER: `
    import { userManager } from '@/lib/ai-assistant';
    
    const newUser = await userManager.createUser({
      email: 'student@example.com',
      field: 'sayisal',
      level: 'orta'
    });
  `,

  // AI çıktısı üretme
  GENERATE_OUTPUT: `
    import { aiAssistant } from '@/lib/ai-assistant';
    
    const output = await aiAssistant.generateFullOutput();
    console.log(output.haftalık_plan);
  `,

  // Performans güncelleme
  UPDATE_PERFORMANCE: `
    import { aiAssistant } from '@/lib/ai-assistant';
    
    const updated = await aiAssistant.updatePerformanceAndAdapt({
      userId: 'user_123',
      topicId: 'tyt_matematik_fonksiyonlar',
      questionsAnswered: 20,
      correctAnswers: 16,
      timeSpent: 45,
      sessionType: 'study'
    });
  `,

  // Guest kullanıcı
  GUEST_USER: `
    import { userManager } from '@/lib/ai-assistant';
    
    const guestProfile = userManager.createGuestUser('esit', 'baslangic');
  `
};

// Debug ve geliştirme araçları
export const devTools = {
  /**
   * Sistem durumunu logla
   */
  logSystemStatus: (): void => {
    // const health = aiAssistant.healthCheck();
    // const profile = userManager.getUserProfile();
    
    console.group('🤖 AI Asistan Sistem Durumu');
    // console.log('Sistem:', health);
    // console.log('Kullanıcı:', profile?.identity);
    // console.log('Performans:', profile?.performance);
    console.groupEnd();
  },

  /**
   * Mock veri oluştur
   */
  generateMockData: () => {
    // const mockProfile = userManager.createGuestUser('sayisal', 'orta');
    
    // Mock performans verisi ekle
    // for (let i = 0; i < 5; i++) {
    //   dataStore.updateUserPerformance({
    //     userId: mockProfile.identity.id,
    //     topicId: `mock_topic_${i}`,
    //     questionsAnswered: 20,
    //     correctAnswers: Math.floor(Math.random() * 15) + 10,
    //     timeSpent: 60,
    //     sessionType: 'study'
    //   });
    // }
    
    // return mockProfile;
    return null;
  },

  /**
   * Performans simülasyonu
   */
  simulateStudySession: async (
    duration: number = 60,
    accuracy: number = 0.75
  ) => {
    const questionsAnswered = Math.floor(duration / 3); // 3dk/soru
    const correctAnswers = Math.floor(questionsAnswered * accuracy);
    
    // return aiAssistant.updatePerformanceAndAdapt({
    //   userId: userManager.getCurrentUser()?.id || 'guest',
    //   topicId: `simulation_${Date.now()}`,
    //   questionsAnswered,
    //   correctAnswers,
    //   timeSpent: duration,
    //   sessionType: 'study'
    // });
    return Promise.resolve({} as any);
  }
};

// Version info
export const VERSION_INFO = {
  version: AI_ASSISTANT_VERSION,
  features: Object.keys(AI_FEATURES).length,
  buildDate: new Date().toISOString(),
  compatibility: {
    react: '>=18.0.0',
    typescript: '>=5.0.0',
    vite: '>=5.0.0'
  }
};
