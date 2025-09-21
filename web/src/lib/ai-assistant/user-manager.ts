/**
 * YKS Akıllı Asistanı - Kullanıcı Yönetimi
 * Kimlik doğrulama, profil yönetimi ve guest mode
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import { 
  UserIdentity, 
  UserProfile, 
  CreateUserRequest, 
  AIAssistantError,
  UserPreferences,
  UserPerformance 
} from './types';

// Yerel depolama anahtarları
const STORAGE_KEYS = {
  CURRENT_USER: 'yks_ai_current_user',
  USER_PROFILE: 'yks_ai_user_profile',
  GUEST_TOKEN: 'yks_ai_guest_token',
  SESSION_DATA: 'yks_ai_session_data'
};

/**
 * Benzersiz ID üretici
 */
export function generateUniqueID(type: 'user' | 'guest' | 'session'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  const prefix = type === 'guest' ? 'guest_' : type === 'session' ? 'sess_' : 'user_';
  return `${prefix}${timestamp}_${random}`;
}

/**
 * Email validasyonu
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Kullanıcı adı validasyonu
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Varsayılan kullanıcı tercihleri
 */
function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'auto',
    colorScheme: 'blue',
    notifications: {
      enabled: true,
      morningMotivation: true,
      studyReminders: true,
      breakReminders: true,
      weeklyReports: true,
      soundEnabled: false
    },
    study: {
      sessionDuration: 90,
      breakDuration: 15,
      dailyGoal: 240, // 4 saat
      preferredStudyTimes: ['09:00', '14:00', '19:00'],
      difficultyPreference: 'progressive'
    },
    ui: {
      compactMode: false,
      showProgress: true,
      showStatistics: true,
      animationsEnabled: true
    }
  };
}

/**
 * Varsayılan performans verileri
 */
function getDefaultPerformance(): UserPerformance {
  return {
    totalQuestionsSolved: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageTimePerQuestion: 0,
    successRate: 0,
    streakDays: 0,
    studyTimeToday: 0,
    studyTimeWeek: 0,
    studyTimeTotal: 0
  };
}

/**
 * Kullanıcı Yöneticisi Sınıfı
 */
export class UserManager {
  private currentUser: UserIdentity | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    this.loadCurrentUser();
  }

  /**
   * Kayıtlı kullanıcı oluştur
   */
  async createUser(request: CreateUserRequest): Promise<UserProfile> {
    // Validasyon
    if (request.email && !validateEmail(request.email)) {
      throw new AIAssistantError('Geçersiz email adresi', 'INVALID_EMAIL');
    }

    if (request.username && !validateUsername(request.username)) {
      throw new AIAssistantError(
        'Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, _ içerebilir', 
        'INVALID_USERNAME'
      );
    }

    // Benzersiz ID oluştur
    const userId = generateUniqueID('user');
    
    // Kullanıcı kimliği
    const identity: UserIdentity = {
      id: userId,
      type: request.email ? 'email' : 'username',
      email: request.email,
      username: request.username,
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    // Varsayılan UX önerileri
    const uxRecommendations = {
      theme: {
        recommended: 'auto' as const,
        colorScheme: 'blue',
        reason: 'Sistem temanıza uyum sağlar'
      },
      notifications: {
        morningMessage: 'Günaydın! Bugün harika bir çalışma günü olacak! 🌟',
        reminderMessages: [
          'Çalışma vaktiniz geldi! 📚',
          'Kısa bir mola verin ve devam edin! ☕',
          'Bugünkü hedefinize yaklaşıyorsunuz! 🎯'
        ],
        motivationQuotes: [
          'Başarı, hazırlığın fırsatla buluşmasıdır.',
          'Her uzman bir zamanlar acemi olmuştur.',
          'Hedefiniz ne kadar büyükse, motivasyonunuz o kadar güçlü olmalı.'
        ],
        studyTips: [
          'Pomodoro tekniğini deneyin (25dk çalışma + 5dk mola)',
          'Öğrendiğiniz konuları kendi kelimelerinizle açıklayın',
          'Düzenli tekrar yaparak konuları pekiştirin'
        ]
      },
      interface: {
        layout: 'cards' as const,
        highlightAreas: ['Günlük hedefler', 'Zayıf konular', 'İlerleme'],
        hideElements: [],
        shortcuts: ['Ctrl+N: Yeni plan', 'Ctrl+S: Kaydet', 'Ctrl+R: Yenile']
      },
      study: {
        recommendedSessionLength: 90,
        bestStudyTimes: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
        breakSuggestions: [
          'Kısa yürüyüş yapın',
          'Derin nefes egzersizleri',
          'Gözlerinizi dinlendirin'
        ]
      }
    };

    // Tam profil
    const profile: UserProfile = {
      identity,
      field: request.field,
      level: request.level,
      targetScore: {
        TYT: request.field === 'sozel' ? 280 : 320,
        AYT: request.field === 'sayisal' ? 280 : request.field === 'esit' ? 260 : 240
      },
      performance: getDefaultPerformance(),
      topicPerformances: {},
      preferences: getDefaultPreferences(),
      studyPlan: null,
      uxRecommendations,
      lastUpdated: new Date().toISOString()
    };

    // Kaydet
    this.currentUser = identity;
    this.userProfile = profile;
    this.saveToStorage();

    // Veritabanına kaydet (simülasyon)
    await this.saveToDatabase(profile);

    return profile;
  }

  /**
   * Guest kullanıcı oluştur
   */
  createGuestUser(field: 'sayisal' | 'esit' | 'sozel', level: 'baslangic' | 'orta' | 'ileri'): UserProfile {
    const guestId = generateUniqueID('guest');
    
    const identity: UserIdentity = {
      id: guestId,
      type: 'anonymous',
      isGuest: true,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    const profile: UserProfile = {
      identity,
      field,
      level,
      targetScore: {
        TYT: field === 'sozel' ? 280 : 320,
        AYT: field === 'sayisal' ? 280 : field === 'esit' ? 260 : 240
      },
      performance: getDefaultPerformance(),
      topicPerformances: {},
      preferences: getDefaultPreferences(),
      studyPlan: null,
      uxRecommendations: {
        theme: {
          recommended: 'light',
          colorScheme: 'blue',
          reason: 'Misafir kullanıcılar için optimize edildi'
        },
        notifications: {
          morningMessage: 'Merhaba! Çalışmaya başlamaya hazır mısın? 📚',
          reminderMessages: ['Çalışma zamanı!', 'Biraz mola ver!'],
          motivationQuotes: ['Başarı için ilk adım atmak!'],
          studyTips: ['Düzenli çalışma alışkanlığı geliştirin']
        },
        interface: {
          layout: 'minimal',
          highlightAreas: ['Temel özellikler'],
          hideElements: ['Gelişmiş istatistikler'],
          shortcuts: []
        },
        study: {
          recommendedSessionLength: 60,
          bestStudyTimes: ['09:00-11:00'],
          breakSuggestions: ['Kısa mola verin']
        }
      },
      lastUpdated: new Date().toISOString()
    };

    this.currentUser = identity;
    this.userProfile = profile;
    this.saveToStorage();

    return profile;
  }

  /**
   * Kullanıcı girişi
   */
  async signIn(emailOrUsername: string): Promise<UserProfile> {
    // Simülasyon - gerçek uygulamada veritabanından yüklenecek
    const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (storedProfile) {
      const profile: UserProfile = JSON.parse(storedProfile);
      
      if (profile.identity.email === emailOrUsername || 
          profile.identity.username === emailOrUsername) {
        
        // Giriş zamanını güncelle
        profile.identity.lastActiveAt = new Date().toISOString();
        profile.lastUpdated = new Date().toISOString();
        
        this.currentUser = profile.identity;
        this.userProfile = profile;
        this.saveToStorage();
        
        return profile;
      }
    }

    throw new AIAssistantError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
  }

  /**
   * Çıkış yap
   */
  signOut(): void {
    this.currentUser = null;
    this.userProfile = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Mevcut kullanıcıyı al
   */
  getCurrentUser(): UserIdentity | null {
    return this.currentUser;
  }

  /**
   * Kullanıcı profilini al
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  /**
   * Profil güncelle
   */
  updateProfile(updates: Partial<UserProfile>): UserProfile {
    if (!this.userProfile) {
      throw new AIAssistantError('Güncellenecek profil bulunamadı', 'NO_PROFILE');
    }

    this.userProfile = {
      ...this.userProfile,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.saveToStorage();
    this.saveToDatabase(this.userProfile);

    return this.userProfile;
  }

  /**
   * Performans güncelle
   */
  updatePerformance(performance: Partial<UserPerformance>): void {
    if (!this.userProfile) return;

    this.userProfile.performance = {
      ...this.userProfile.performance,
      ...performance
    };

    this.userProfile.lastUpdated = new Date().toISOString();
    this.saveToStorage();
    this.saveToDatabase(this.userProfile);
  }

  /**
   * Tercihler güncelle
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    if (!this.userProfile) return;

    this.userProfile.preferences = {
      ...this.userProfile.preferences,
      ...preferences
    };

    this.userProfile.lastUpdated = new Date().toISOString();
    this.saveToStorage();
  }

  /**
   * LocalStorage'a kaydet
   */
  private saveToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
    
    if (this.userProfile) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.userProfile));
    }
  }

  /**
   * LocalStorage'dan yükle
   */
  private loadCurrentUser(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      
      if (storedUser && storedProfile) {
        this.currentUser = JSON.parse(storedUser);
        this.userProfile = JSON.parse(storedProfile);
      }
    } catch (error) {
      console.warn('Kullanıcı verisi yüklenemedi:', error);
      this.signOut();
    }
  }

  /**
   * Veritabanına kaydet (simülasyon)
   */
  private async saveToDatabase(profile: UserProfile): Promise<void> {
    try {
      // Gerçek uygulamada burada Firebase/API çağrısı yapılacak
      console.log('Veritabanına kaydedildi:', profile.identity.id);
      
      // Simülasyon gecikme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Veritabanı kayıt hatası:', error);
      throw new AIAssistantError('Profil kaydedilemedi', 'DATABASE_ERROR', error);
    }
  }

  /**
   * Kullanıcı oturum açmış mı kontrol et
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.userProfile !== null;
  }

  /**
   * Guest kullanıcı mı kontrol et
   */
  isGuest(): boolean {
    return this.currentUser?.isGuest ?? false;
  }

  /**
   * Oturum verilerini temizle
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
  }

  /**
   * Oturum verisi kaydet
   */
  saveSessionData(data: any): void {
    localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  /**
   * Oturum verisi yükle
   */
  loadSessionData(): any {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_DATA);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        
        // 24 saat eski ise sil
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
          this.clearSession();
          return null;
        }
        
        return data;
      }
    } catch (error) {
      console.warn('Oturum verisi yüklenemedi:', error);
    }
    return null;
  }
}

// Singleton instance
export const userManager = new UserManager();
