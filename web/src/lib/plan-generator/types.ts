/**
 * YKS Haftalık Plan Üretici - Tip Tanımları
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

// Temel enum ve union türleri
export type Field = 'sayisal' | 'esit' | 'sozel';
export type Level = 'baslangic' | 'orta' | 'ileri';
export type DayType = 'TYT' | 'AYT' | 'Tekrar';
export type ResourceType = 'kitap' | 'soru_bankasi' | 'online_kurs' | 'video' | 'test';

// Kullanıcı tercihleri
export interface UserPreferences {
  preferMorning?: boolean;
  excludeSubjects?: string[];
  preferredBreakDuration?: number; // dakika
}

// Plan üretim parametreleri
export interface GenerateParams {
  field: Field;
  level: Level;
  studyDaysPerWeek: number; // 1-7 arası
  weekStartDate?: string; // ISO date string
  period?: string; // 'Eyl-Kas' gibi
  customSessionDurationMinutes?: number; // varsayılan 90
  userPreferences?: UserPreferences;
}

// Çalışma bloğu
export interface StudyBlock {
  id: string;
  time: string; // '09:00-10:30' formatında
  subject: string; // 'TYT Matematik', 'AYT Fizik' gibi
  resource: string; // önerilen kaynak
  durationMinutes: number;
  done: boolean;
  difficulty?: 'kolay' | 'orta' | 'zor';
  topicsToFocus?: string[]; // hangi konulara odaklanılacak
}

// Günlük plan
export interface DayPlan {
  dayName: string; // 'Pazartesi', 'Salı' vs.
  date?: string; // ISO date string
  type: DayType;
  blocks: StudyBlock[];
  notes?: string;
  totalMinutes?: number; // gündeki toplam çalışma süresi
}

// Kaynak önerisi
export interface ResourceSuggestion {
  title: string;
  level: Level;
  type: ResourceType;
  description?: string;
  priority: number; // 1-5 arası, 5 en yüksek öncelik
  publisher?: string;
  estimatedPrice?: number;
}

// Plan üretim sonucu
export interface WeekPlanResult {
  weekPlan: DayPlan[]; // 7 günlük array
  resourcesSuggested: Record<string, ResourceSuggestion[]>; // subject -> resources
  warnings: string[];
  meta: {
    generatedAt: string; // ISO string
    weekStartDate: string; // ISO string
    totalStudyHours: number;
    averageHoursPerDay: number;
  };
}

// Zaman slotu tanımı
export interface TimeSlot {
  start: string; // '09:00'
  end: string; // '10:30'
  label: string; // '09:00-10:30'
  durationMinutes: number;
}

// Ders tanımı
export interface SubjectConfig {
  name: string;
  category: 'TYT' | 'AYT';
  field: Field[];
  priority: number; // bu alandaki öncelik sırası
  minBlocksPerWeek: number; // haftalık minimum blok sayısı
  maxBlocksPerDay: number; // günlük maksimum blok sayısı
}

// Plan üretim stratejisi (ileride LLM için)
export type PlanGenerationStrategy = (
  params: GenerateParams,
  subjects: SubjectConfig[]
) => WeekPlanResult;

// Hata türleri
export class PlanGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PlanGenerationError';
  }
}

// Validasyon sonucu
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Localization için string sabitleri
export interface I18nStrings {
  days: Record<string, string>;
  subjects: Record<string, string>;
  messages: Record<string, string>;
  errors: Record<string, string>;
}
