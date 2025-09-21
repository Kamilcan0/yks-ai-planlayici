/**
 * YKS Akıllı Asistanı - Tip Tanımları
 * Adaptif öğrenme sistemi için veri yapıları
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

// Kullanıcı kimlik türleri
export type UserIDType = 'email' | 'username' | 'anonymous';

export interface UserIdentity {
  id: string;
  type: UserIDType;
  email?: string;
  username?: string;
  isGuest: boolean;
  createdAt: string;
  lastActiveAt: string;
}

// Kullanıcı performans istatistikleri
export interface UserPerformance {
  totalQuestionsSolved: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number; // saniye
  successRate: number; // 0-100 arası
  streakDays: number;
  studyTimeToday: number; // dakika
  studyTimeWeek: number; // dakika
  studyTimeTotal: number; // dakika
}

// Konu bazlı performans
export interface TopicPerformance {
  topicId: string;
  topicName: string;
  questionsSolved: number;
  correctAnswers: number;
  averageTime: number;
  successRate: number;
  difficultyLevel: 'baslangic' | 'orta' | 'ileri';
  lastStudied: string;
  needsReview: boolean;
  priority: number; // 1-5 arası, 5 en yüksek
}

// Kullanıcı tercihleri
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  notifications: {
    enabled: boolean;
    morningMotivation: boolean;
    studyReminders: boolean;
    breakReminders: boolean;
    weeklyReports: boolean;
    soundEnabled: boolean;
  };
  study: {
    sessionDuration: number; // dakika
    breakDuration: number; // dakika
    dailyGoal: number; // dakika
    preferredStudyTimes: string[]; // ['09:00', '14:00']
    difficultyPreference: 'progressive' | 'mixed' | 'challenging';
  };
  ui: {
    compactMode: boolean;
    showProgress: boolean;
    showStatistics: boolean;
    animationsEnabled: boolean;
  };
}

// Adaptif ders planı
export interface AdaptiveStudyPlan {
  userId: string;
  generatedAt: string;
  validUntil: string;
  adaptationLevel: number; // Kaç kez adapte edildi
  weeklyPlan: DailyStudyPlan[];
  focusAreas: string[]; // Öncelikli konular
  adaptationNotes: string[];
}

export interface DailyStudyPlan {
  day: string;
  date: string;
  totalMinutes: number;
  TYT: StudyBlock[];
  AYT: StudyBlock[];
  review: StudyBlock[];
  motivationMessage: string;
}

export interface StudyBlock {
  topicId: string;
  topicName: string;
  category: 'TYT' | 'AYT';
  subject: string;
  questionCount: number;
  estimatedMinutes: number;
  difficultyLevel: 'baslangic' | 'orta' | 'ileri';
  priority: number;
  adaptationReason?: string;
  resources: string[];
}

// UX önerileri
export interface UXRecommendations {
  theme: {
    recommended: 'light' | 'dark' | 'auto';
    colorScheme: string;
    reason: string;
  };
  notifications: {
    morningMessage: string;
    reminderMessages: string[];
    motivationQuotes: string[];
    studyTips: string[];
  };
  interface: {
    layout: 'minimal' | 'detailed' | 'cards';
    highlightAreas: string[];
    hideElements: string[];
    shortcuts: string[];
  };
  study: {
    recommendedSessionLength: number;
    bestStudyTimes: string[];
    breakSuggestions: string[];
  };
}

// Tam kullanıcı profili
export interface UserProfile {
  identity: UserIdentity;
  field: 'sayisal' | 'esit' | 'sozel';
  level: 'baslangic' | 'orta' | 'ileri';
  targetScore: {
    TYT: number;
    AYT: number;
  };
  performance: UserPerformance;
  topicPerformances: Record<string, TopicPerformance>;
  preferences: UserPreferences;
  studyPlan: AdaptiveStudyPlan | null;
  uxRecommendations: UXRecommendations;
  lastUpdated: string;
}

// AI Asistan çıktısı
export interface AIAssistantOutput {
  kullanıcı_ID: string;
  tarih: string;
  haftalık_plan: Array<{
    gün: string;
    date: string;
    TYT: Array<{
      konu: string;
      soru_sayısı: number;
      süre_dakika: number;
      zorluk: string;
      öncelik: number;
    }>;
    AYT: Array<{
      konu: string;
      soru_sayısı: number;
      süre_dakika: number;
      zorluk: string;
      öncelik: number;
    }>;
    tekrar?: Array<{
      konu: string;
      süre_dakika: number;
      neden: string;
    }>;
  }>;
  UX_önerileri: {
    tema: string;
    renk_şeması: string;
    bildirimler: string[];
    arayüz_notları: string[];
    motivasyon_mesajları: string[];
  };
  adaptasyon_notları: string[];
  performans_analizi: {
    güçlü_konular: string[];
    zayıf_konular: string[];
    öneriler: string[];
    hedef_güncelleme: boolean;
  };
  istatistikler: {
    bugünkü_çalışma: number;
    haftalık_çalışma: number;
    başarı_oranı: number;
    çözülen_soru: number;
  };
}

// Veritabanı modelleri
export interface DatabaseUser {
  id: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  topicId: string;
  startTime: Date;
  endTime: Date;
  questionsSolved: number;
  correctAnswers: number;
  sessionType: 'study' | 'review' | 'test';
  metadata: Record<string, any>;
}

// API istekleri
export interface CreateUserRequest {
  email?: string;
  username?: string;
  field: 'sayisal' | 'esit' | 'sozel';
  level: 'baslangic' | 'orta' | 'ileri';
  isGuest?: boolean;
}

export interface UpdatePerformanceRequest {
  userId: string;
  topicId: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  sessionType: 'study' | 'review' | 'test';
}

export interface GeneratePlanRequest {
  userId: string;
  forceRegenerate?: boolean;
  focusTopics?: string[];
  availableTime?: number; // günlük dakika
}

// Hata türleri
export class AIAssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIAssistantError';
  }
}

// Adaptasyon seviyeleri
export enum AdaptationLevel {
  NONE = 0,
  BASIC = 1,
  MODERATE = 2,
  ADVANCED = 3,
  EXPERT = 4
}

// Konu kategorileri
export const TOPIC_CATEGORIES = {
  TYT: {
    matematik: ['Temel Matematik', 'Cebirsel İfadeler', 'Fonksiyonlar', 'Trigonometri'],
    turkce: ['Dil Bilgisi', 'Paragraf', 'Şiir', 'Halk Edebiyatı'],
    fen: ['Fizik', 'Kimya', 'Biyoloji'],
    sosyal: ['Tarih', 'Coğrafya', 'Felsefe', 'Psikoloji']
  },
  AYT: {
    matematik: ['Limit', 'Türev', 'İntegral', 'Analitik Geometri'],
    fizik: ['Mekanik', 'Elektrik', 'Optik', 'Modern Fizik'],
    kimya: ['Atomun Yapısı', 'Bağlar', 'Çözeltiler', 'Asit-Baz'],
    biyoloji: ['Hücre', 'Genetik', 'Sinir Sistemi', 'Ekoloji'],
    edebiyat: ['Divan Edebiyatı', 'Tanzimat', 'Modern Türk Edebiyatı'],
    tarih: ['İslam Tarihi', 'Osmanlı', 'Yakın Çağ', 'Atatürk İlkeleri'],
    cografya: ['Fiziki Coğrafya', 'Beşeri Coğrafya', 'Türkiye Coğrafyası']
  }
} as const;
