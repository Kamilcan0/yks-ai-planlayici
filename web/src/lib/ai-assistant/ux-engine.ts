/**
 * YKS Akıllı Asistanı - UX Öneri Sistemi
 * Kullanıcı davranışına göre arayüz ve tema önerileri
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import {
  UserProfile,
  UXRecommendations,
  UserPreferences,
  AIAssistantError
} from './types';
import { dataStore } from './data-store';
import { userManager } from './user-manager';

// Tema önerileri veritabanı
const THEME_RECOMMENDATIONS = {
  personality: {
    focused: { theme: 'dark', colorScheme: 'purple', reason: 'Koyu tema odaklanmayı artırır' },
    energetic: { theme: 'light', colorScheme: 'orange', reason: 'Canlı renkler motivasyonu yükseltir' },
    calm: { theme: 'auto', colorScheme: 'blue', reason: 'Sakin renkler stresi azaltır' },
    creative: { theme: 'light', colorScheme: 'green', reason: 'Yeşil tonlar yaratıcılığı destekler' }
  },
  performance: {
    struggling: { theme: 'light', colorScheme: 'green', reason: 'Pozitif renkler motivasyonu artırır' },
    improving: { theme: 'auto', colorScheme: 'blue', reason: 'Sakin renkler konsantrasyonu destekler' },
    excellent: { theme: 'dark', colorScheme: 'purple', reason: 'Profesyonel görünüm başarıyı yansıtır' }
  },
  timeOfDay: {
    morning: { theme: 'light', colorScheme: 'orange', reason: 'Aydınlık tema uyanıklığı destekler' },
    afternoon: { theme: 'auto', colorScheme: 'blue', reason: 'Uyarlanabilir tema gözleri korur' },
    evening: { theme: 'dark', colorScheme: 'purple', reason: 'Koyu tema göz yorgunluğunu azaltır' }
  }
};

// Motivasyon mesajları kategorileri
const MOTIVATION_CATEGORIES = {
  morning: {
    high_performer: [
      'Günaydın şampiyon! Bugün de zirveye bir adım daha yaklaşacaksın! 🏆',
      'Sabah enerjinle bugün harika şeyler başaracaksın! ☀️',
      'Mükemmel performansın devam ediyor - bu günü de domine et! 💪'
    ],
    average_performer: [
      'Günaydın! Bugün kendini aşacağın bir gün olacak! 🌟',
      'Her sabah yeni bir fırsat! Bugün daha iyisini yapabilirsin! 📈',
      'Sabah motivasyonunla bugünü başarıyla taçlandır! 🎯'
    ],
    struggling: [
      'Günaydın! Bugün senin gününe benzeyecek! 🌅',
      'Her zorluk seni güçlendiriyor - sabahın enerjisiyle başla! 💎',
      'Bugün küçük adımlarla büyük başarılar yaratacaksın! 🌱'
    ]
  },
  study_reminder: {
    gentle: [
      'Çalışma vaktiniz geldi! Hadi başlayalım! 📚',
      'Biraz çalışma zamanı - beynin hazır! 🧠',
      'Şimdi öğrenme moduna geçme vakti! ✨'
    ],
    motivational: [
      'Hedefine bir adım daha yaklaş! Çalışma zamanı! 🎯',
      'Başarı seni bekliyor - çalışmaya başla! 🚀',
      'Şampiyon ruhunla çalışmaya devam! 💪'
    ],
    urgent: [
      'Çalışma planından geride kalıyorsun! Hemen başla! ⏰',
      'Hedeflerini unutma - çalışma zamanı! 🔥',
      'Zaman geçiyor, ama sen hâlâ kazanabilirsin! ⚡'
    ]
  },
  break_reminder: {
    gentle: [
      'Biraz mola verebilirsin! Beynini dinlendir! 😌',
      'Kısa bir nefes alma vakti! ☕',
      'Molalar da öğrenmenin bir parçası! 🌸'
    ],
    health_focused: [
      'Gözlerini dinlendir, su iç! Sağlık önemli! 💧',
      'Ayağa kalk, biraz hareket et! 🚶‍♀️',
      'Derin nefes al, gevşe! Mental sağlık öncelik! 🧘‍♂️'
    ]
  }
};

// Çalışma ipuçları
const STUDY_TIPS = {
  concentration: [
    'Pomodoro tekniğini deneyin: 25dk çalışma + 5dk mola',
    'Çalışma alanınızı düzenli tutun - düzen zihni rahatlatır',
    'Telefonu çalışma alanından uzaklaştırın',
    'Arka plan müziği yerine doğa seslerini tercih edin'
  ],
  memory: [
    'Öğrendiğiniz konuları kendi kelimelerinizle anlatın',
    'Mind map ve görsel özetler oluşturun',
    'Konular arası bağlantılar kurun',
    'Düzenli tekrar yaparak bilgiyi pekiştirin'
  ],
  motivation: [
    'Küçük hedefler belirleyin ve başarıları kutlayın',
    'Çalışma arkadaşı bulun - beraber daha güçlüsünüz',
    'İlerlemenizi görselleştirin - grafik ve tablolar',
    'Neden çalıştığınızı hatırlayın - hedefinizi yazın'
  ],
  health: [
    'Düzenli uyku alın - beyin en az 7 saate ihtiyaç duyar',
    'Yeterli su için - dehidrasyon konsantrasyonu bozar',
    'Beslenme düzenini bozmayın - beyin glikoza ihtiyaç duyar',
    'Düzenli egzersiz yapın - oksijen beyne kan akışını artırır'
  ]
};

/**
 * UX Öneri Motoru
 */
export class UXEngine {

  /**
   * Kullanıcı için UX önerileri üret
   */
  generateUXRecommendations(profile: UserProfile): UXRecommendations {
    const performanceAnalysis = this.analyzeUserBehavior(profile);
    const timePreferences = this.analyzeTimePreferences(profile);
    const personalityType = this.inferPersonalityType(profile);

    return {
      theme: this.recommendTheme(performanceAnalysis, timePreferences, personalityType),
      notifications: this.generateNotifications(profile, performanceAnalysis),
      interface: this.recommendInterface(profile, performanceAnalysis),
      study: this.recommendStudySettings(profile, performanceAnalysis)
    };
  }

  /**
   * Kullanıcı davranışını analiz et
   */
  private analyzeUserBehavior(profile: UserProfile): any {
    const performance = profile.performance;
    const weeklyReport = dataStore.getWeeklyReport(profile);
    const trend = dataStore.getPerformanceTrend(profile);

    // Performans seviyesi
    let performanceLevel: 'struggling' | 'improving' | 'excellent';
    if (performance.successRate >= 85) {
      performanceLevel = 'excellent';
    } else if (trend.improvement === 'improving' || performance.successRate >= 60) {
      performanceLevel = 'improving';
    } else {
      performanceLevel = 'struggling';
    }

    // Çalışma düzeni analizi
    const studyPattern = {
      consistency: performance.streakDays >= 7 ? 'high' :
                   performance.streakDays >= 3 ? 'medium' : 'low',
      intensity: weeklyReport.averageStudyTime >= 300 ? 'high' :
                weeklyReport.averageStudyTime >= 150 ? 'medium' : 'low',
      efficiency: performance.averageTimePerQuestion < 90 ? 'high' :
                 performance.averageTimePerQuestion < 150 ? 'medium' : 'low'
    };

    return {
      performanceLevel,
      studyPattern,
      totalExperience: performance.totalQuestionsSolved,
      recentActivity: weeklyReport.totalStudyTime,
      engagement: this.calculateEngagement(performance, weeklyReport)
    };
  }

  /**
   * Zaman tercihlerini analiz et
   */
  private analyzeTimePreferences(profile: UserProfile): any {
    const preferences = profile.preferences.study.preferredStudyTimes;
    const currentHour = new Date().getHours();

    let timeOfDay: 'morning' | 'afternoon' | 'evening';
    if (currentHour < 12) {
      timeOfDay = 'morning';
    } else if (currentHour < 18) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'evening';
    }

    // Çalışma saatlerinden zaman tercihi çıkar
    const morningHours = preferences.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 6 && hour < 12;
    }).length;

    const eveningHours = preferences.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 18;
    }).length;

    const preferredTime = morningHours > eveningHours ? 'morning' : 'evening';

    return {
      currentTimeOfDay: timeOfDay,
      preferredTime,
      sessionLength: profile.preferences.study.sessionDuration
    };
  }

  /**
   * Kişilik tipini çıkar
   */
  private inferPersonalityType(profile: UserProfile): 'focused' | 'energetic' | 'calm' | 'creative' {
    const prefs = profile.preferences;
    const performance = profile.performance;

    // UI tercihlerine göre
    if (prefs.ui.compactMode && !prefs.ui.animationsEnabled) {
      return 'focused';
    }

    // Çalışma tercihlerine göre
    if (prefs.study.sessionDuration >= 120 && prefs.study.difficultyPreference === 'challenging') {
      return 'focused';
    }

    if (prefs.study.sessionDuration <= 60 && prefs.ui.animationsEnabled) {
      return 'energetic';
    }

    // Performansa göre
    if (performance.streakDays >= 10 && performance.successRate >= 80) {
      return 'focused';
    }

    if (performance.totalQuestionsSolved < 100) {
      return 'calm'; // Yeni kullanıcılar için sakin yaklaşım
    }

    return 'creative'; // Varsayılan
  }

  /**
   * Tema önerisi üret
   */
  private recommendTheme(
    behaviorAnalysis: any,
    timePreferences: any,
    personalityType: 'focused' | 'energetic' | 'calm' | 'creative'
  ): UXRecommendations['theme'] {
    // Öncelik sırası: Performans > Kişilik > Zaman
    
    // Performans bazlı öneri
    const performanceRec = THEME_RECOMMENDATIONS.performance[behaviorAnalysis.performanceLevel as keyof typeof THEME_RECOMMENDATIONS.performance];
    if (behaviorAnalysis.performanceLevel === 'struggling' || behaviorAnalysis.performanceLevel === 'excellent') {
      return {
        recommended: performanceRec.theme as 'light' | 'dark' | 'auto',
        colorScheme: performanceRec.colorScheme,
        reason: performanceRec.reason
      };
    }

    // Kişilik bazlı öneri
    const personalityRec = THEME_RECOMMENDATIONS.personality[personalityType];
    if (personalityType === 'focused' || personalityType === 'energetic') {
      return {
        recommended: personalityRec.theme as 'light' | 'dark' | 'auto',
        colorScheme: personalityRec.colorScheme,
        reason: personalityRec.reason
      };
    }

    // Zaman bazlı öneri
    const timeRec = THEME_RECOMMENDATIONS.timeOfDay[timePreferences.currentTimeOfDay as keyof typeof THEME_RECOMMENDATIONS.timeOfDay];
    return {
      recommended: timeRec.theme as 'light' | 'dark' | 'auto',
      colorScheme: timeRec.colorScheme,
      reason: timeRec.reason
    };
  }

  /**
   * Bildirim önerileri üret
   */
  private generateNotifications(profile: UserProfile, analysis: any): UXRecommendations['notifications'] {
    const performanceLevel = analysis.performanceLevel;
    const studyPattern = analysis.studyPattern;

    // Sabah mesajı seç
    const morningMessages = MOTIVATION_CATEGORIES.morning[performanceLevel as keyof typeof MOTIVATION_CATEGORIES.morning];
    const morningMessage = morningMessages[Math.floor(Math.random() * morningMessages.length)];

    // Hatırlatma tipini belirle
    let reminderType: 'gentle' | 'motivational' | 'urgent';
    if (studyPattern.consistency === 'low') {
      reminderType = 'urgent';
    } else if (performanceLevel === 'excellent') {
      reminderType = 'motivational';
    } else {
      reminderType = 'gentle';
    }

    const reminderMessages = MOTIVATION_CATEGORIES.study_reminder[reminderType];
    const breakMessages = MOTIVATION_CATEGORIES.break_reminder[
      profile.preferences.ui.compactMode ? 'health_focused' : 'gentle'
    ];

    // Motivasyon alıntıları
    const motivationQuotes = this.selectMotivationQuotes(performanceLevel);

    // Çalışma ipuçları
    const studyTips = this.selectStudyTips(analysis);

    return {
      morningMessage,
      reminderMessages,
      motivationQuotes,
      studyTips
    };
  }

  /**
   * Arayüz önerileri üret
   */
  private recommendInterface(profile: UserProfile, analysis: any): UXRecommendations['interface'] {
    const performance = analysis.performanceLevel;
    const experience = analysis.totalExperience;
    const engagement = analysis.engagement;

    let layout: 'minimal' | 'detailed' | 'cards';
    let highlightAreas: string[];
    let hideElements: string[];
    let shortcuts: string[];

    // Deneyim seviyesine göre
    if (experience < 100) {
      // Yeni kullanıcı
      layout = 'minimal';
      highlightAreas = ['Başlangıç rehberi', 'Temel özellikler', 'İlk hedefler'];
      hideElements = ['Gelişmiş istatistikler', 'Detaylı analizler'];
      shortcuts = ['F1: Yardım', 'Ctrl+N: Yeni plan'];
    } else if (experience < 1000) {
      // Orta seviye kullanıcı
      layout = 'cards';
      highlightAreas = ['Günlük hedefler', 'Haftalık plan', 'İlerleme'];
      hideElements = [];
      shortcuts = ['Ctrl+N: Yeni plan', 'Ctrl+S: Kaydet', 'Ctrl+R: Yenile'];
    } else {
      // Deneyimli kullanıcı
      layout = 'detailed';
      highlightAreas = ['Detaylı istatistikler', 'Trend analizleri', 'Gelişmiş araçlar'];
      hideElements = [];
      shortcuts = [
        'Ctrl+N: Yeni plan', 'Ctrl+S: Kaydet', 'Ctrl+R: Yenile',
        'Ctrl+E: Export', 'Ctrl+A: Analiz', 'F11: Tam ekran'
      ];
    }

    // Performansa göre ayarlama
    if (performance === 'struggling') {
      highlightAreas = ['Motivasyon', 'Basit hedefler', 'Yardım'];
      if (!hideElements.includes('Karmaşık özellikler')) {
        hideElements.push('Karmaşık özellikler');
      }
    } else if (performance === 'excellent') {
      highlightAreas = ['Gelişmiş özellikler', 'Detaylı analizler', 'İleri seviye araçlar'];
    }

    return {
      layout,
      highlightAreas,
      hideElements,
      shortcuts
    };
  }

  /**
   * Çalışma ayarları önerisi
   */
  private recommendStudySettings(profile: UserProfile, analysis: any): UXRecommendations['study'] {
    const current = profile.preferences.study;
    const pattern = analysis.studyPattern;
    const performance = analysis.performanceLevel;

    // Oturum uzunluğu önerisi
    let recommendedSessionLength = current.sessionDuration;
    if (pattern.efficiency === 'low') {
      recommendedSessionLength = Math.max(30, current.sessionDuration - 15);
    } else if (pattern.efficiency === 'high' && performance === 'excellent') {
      recommendedSessionLength = Math.min(120, current.sessionDuration + 15);
    }

    // En iyi çalışma saatleri
    const bestStudyTimes = this.calculateBestStudyTimes(profile, analysis);

    // Mola önerileri
    const breakSuggestions = this.generateBreakSuggestions(profile, analysis);

    return {
      recommendedSessionLength,
      bestStudyTimes,
      breakSuggestions
    };
  }

  /**
   * Engagement hesapla
   */
  private calculateEngagement(performance: any, weeklyReport: any): 'low' | 'medium' | 'high' {
    const factors = {
      streak: performance.streakDays >= 7 ? 3 : performance.streakDays >= 3 ? 2 : 1,
      activity: weeklyReport.totalStudyTime >= 1000 ? 3 : weeklyReport.totalStudyTime >= 500 ? 2 : 1,
      success: performance.successRate >= 80 ? 3 : performance.successRate >= 60 ? 2 : 1
    };

    const score = (factors.streak + factors.activity + factors.success) / 3;
    return score >= 2.5 ? 'high' : score >= 1.5 ? 'medium' : 'low';
  }

  /**
   * Motivasyon alıntıları seç
   */
  private selectMotivationQuotes(performanceLevel: 'struggling' | 'improving' | 'excellent'): string[] {
    const quotes = {
      struggling: [
        'Başarısızlık başarının anahtarıdır; her hata bize bir şey öğretir.',
        'Düşmek sorun değil, kalkmak önemli.',
        'En büyük zafer, düştükten sonra ayağa kalkmaktır.'
      ],
      improving: [
        'İlerleme, mükemmellik değil, gelişmektir.',
        'Her gün biraz daha iyisi için çaba göstermek en güzel hediyedir.',
        'Başarı, hazırlığın fırsatla buluşmasıdır.'
      ],
      excellent: [
        'Mükemmellik bir hedefe varış noktası değil, sürekli iyileşme yolculuğudur.',
        'Başarı, başarıyı doğurur.',
        'Zirvede olmak iyi, ama oraya tırmanmak daha da güzeldir.'
      ]
    };

    return quotes[performanceLevel];
  }

  /**
   * Çalışma ipuçları seç
   */
  private selectStudyTips(analysis: any): string[] {
    const tips: string[] = [];
    
    if (analysis.studyPattern.efficiency === 'low') {
      tips.push(...STUDY_TIPS.concentration.slice(0, 2));
    }
    
    if (analysis.studyPattern.consistency === 'low') {
      tips.push(...STUDY_TIPS.motivation.slice(0, 2));
    }
    
    if (analysis.performanceLevel === 'struggling') {
      tips.push(...STUDY_TIPS.memory.slice(0, 2));
    }
    
    // Her zaman sağlık ipucu ekle
    tips.push(STUDY_TIPS.health[0]);
    
    return tips.slice(0, 5); // En fazla 5 ipucu
  }

  /**
   * En iyi çalışma saatlerini hesapla
   */
  private calculateBestStudyTimes(profile: UserProfile, analysis: any): string[] {
    const preferred = profile.preferences.study.preferredStudyTimes;
    const performance = analysis.performanceLevel;
    
    // Performansa göre optimizasyon
    if (performance === 'struggling') {
      return ['09:00-11:00', '15:00-17:00']; // Zihin en açık olduğu saatler
    } else if (performance === 'excellent') {
      return preferred; // Tercihleri koru
    } else {
      // Karışık öneri
      return ['09:00-11:00', '14:00-16:00', '19:00-21:00'];
    }
  }

  /**
   * Mola önerileri üret
   */
  private generateBreakSuggestions(profile: UserProfile, analysis: any): string[] {
    const suggestions = [];
    
    if (analysis.studyPattern.intensity === 'high') {
      suggestions.push('Göz egzersizleri yapın (20-20-20 kuralı)');
      suggestions.push('Derin nefes alma egzersizleri');
    }
    
    if (profile.preferences.study.sessionDuration > 90) {
      suggestions.push('Kısa yürüyüş yapın');
      suggestions.push('Germe egzersizleri');
    }
    
    suggestions.push('Su için ve hafif atıştırmalık alın');
    suggestions.push('Pencereden dışarı bakın, uzağa odaklanın');
    
    return suggestions;
  }

  /**
   * Tema değişikliği öner
   */
  suggestThemeChange(profile: UserProfile, currentTime: Date): string | null {
    const hour = currentTime.getHours();
    const currentTheme = profile.preferences.theme;
    
    // Gece geç saatlerde koyu tema öner
    if (hour >= 22 && currentTheme !== 'dark') {
      return 'Gece geç saatlerde koyu tema gözlerinizi daha az yorar.';
    }
    
    // Sabah erken saatlerde açık tema öner
    if (hour >= 6 && hour <= 10 && currentTheme !== 'light') {
      return 'Sabah saatlerinde açık tema uyanıklığınızı artırabilir.';
    }
    
    return null;
  }

  /**
   * Dinamik bildirim planı
   */
  createNotificationSchedule(profile: UserProfile): any[] {
    const schedule = [];
    const studyTimes = profile.preferences.study.preferredStudyTimes;
    
    // Sabah motivasyon
    schedule.push({
      time: '08:00',
      type: 'motivation',
      message: 'Günaydın! Bugün de harika bir çalışma günü! 🌟'
    });
    
    // Çalışma hatırlatmaları
    studyTimes.forEach(time => {
      const [hour, minute] = time.split(':');
      schedule.push({
        time: `${hour}:${minute}`,
        type: 'study_reminder',
        message: 'Çalışma zamanın geldi! Hadi başlayalım! 📚'
      });
      
      // Mola hatırlatması (45 dk sonra)
      const breakTime = new Date(`2000-01-01T${time}:00`);
      breakTime.setMinutes(breakTime.getMinutes() + 45);
      const breakHour = breakTime.getHours().toString().padStart(2, '0');
      const breakMinute = breakTime.getMinutes().toString().padStart(2, '0');
      
      schedule.push({
        time: `${breakHour}:${breakMinute}`,
        type: 'break_reminder',
        message: 'Biraz mola verebilirsin! 😌'
      });
    });
    
    // Gece hatırlatması
    schedule.push({
      time: '22:00',
      type: 'bedtime',
      message: 'Bugün yeterince çalıştın. İyi dinlen! 😴'
    });
    
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }
}

// Singleton instance
export const uxEngine = new UXEngine();
