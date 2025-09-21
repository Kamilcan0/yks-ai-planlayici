/**
 * YKS Haftalık Plan Üretici - Ana Modül
 * Kural tabanlı haftalık çalışma programı üretir
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import {
  GenerateParams,
  WeekPlanResult,
  DayPlan,
  StudyBlock,
  Field,
  Level,
  DayType,
  ValidationResult,
  PlanGenerationError,
  TimeSlot
} from './types';

import {
  SUBJECT_CONFIGS,
  getSubjectsForField,
  getAllResourcesForStudent,
  getResourcesForSubject,
  generateTimeSlots,
  DEFAULT_TIME_SLOTS,
  i18n
} from './resource-mapper';

/**
 * UUID benzeri kısa benzersiz ID üretir
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * ISO tarih stringini verilen gün sayısı kadar ileri taşır
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Parametreleri doğrular
 */
function validateParams(params: GenerateParams): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Zorunlu alanları kontrol et
  if (!params.field || !['sayisal', 'esit', 'sozel'].includes(params.field)) {
    errors.push('Geçerli bir alan seçiniz (sayisal, esit, sozel)');
  }

  if (!params.level || !['baslangic', 'orta', 'ileri'].includes(params.level)) {
    errors.push('Geçerli bir seviye seçiniz (baslangic, orta, ileri)');
  }

  if (!params.studyDaysPerWeek || params.studyDaysPerWeek < 1 || params.studyDaysPerWeek > 7) {
    errors.push('Çalışma günü sayısı 1-7 arasında olmalıdır');
  }

  // Uyarılar
  if (params.studyDaysPerWeek < 4) {
    warnings.push('Çalışma günü sayısı az, tüm dersler yeterince işlenemeyebilir');
  }

  if (params.customSessionDurationMinutes && (params.customSessionDurationMinutes < 30 || params.customSessionDurationMinutes > 180)) {
    warnings.push('Ders süresi 30-180 dakika arasında önerilir');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Alanına göre günlük ders dağılımını hesaplar
 */
function calculateDailySubjectDistribution(field: Field): { TYT: string[], AYT: string[] } {
  const subjects = Object.entries(SUBJECT_CONFIGS)
    .filter(([_, config]) => config.field.includes(field))
    .sort((a, b) => a[1].priority - b[1].priority);

  const tytSubjects = subjects
    .filter(([_, config]) => config.category === 'TYT')
    .map(([_, config]) => config.name);

  const aytSubjects = subjects
    .filter(([_, config]) => config.category === 'AYT')
    .map(([_, config]) => config.name);

  return { TYT: tytSubjects, AYT: aytSubjects };
}

/**
 * TYT/AYT gün tiplerini dönüşümlü olarak dağıtır
 */
function distributeDayTypes(studyDaysPerWeek: number): DayType[] {
  const dayTypes: DayType[] = [];
  
  // İlk 6 gün TYT/AYT dönüşümlü, 7. gün Tekrar
  for (let i = 0; i < Math.min(studyDaysPerWeek, 6); i++) {
    dayTypes.push(i % 2 === 0 ? 'TYT' : 'AYT');
  }
  
  // Eğer 7 gün çalışılacaksa son gün Tekrar
  if (studyDaysPerWeek === 7) {
    dayTypes.push('Tekrar');
  }
  
  return dayTypes;
}

/**
 * Belirli bir gün için çalışma bloklarını oluşturur
 */
function createStudyBlocks(
  dayType: DayType,
  field: Field,
  level: Level,
  timeSlots: TimeSlot[],
  period?: string
): StudyBlock[] {
  const blocks: StudyBlock[] = [];
  const { TYT, AYT } = calculateDailySubjectDistribution(field);
  
  let subjectsToUse: string[] = [];
  
  if (dayType === 'TYT') {
    subjectsToUse = TYT;
  } else if (dayType === 'AYT') {
    subjectsToUse = AYT;
  } else {
    // Tekrar günü - karışık dersler
    subjectsToUse = [...TYT, ...AYT].slice(0, 2);
  }

  // Alan özelinde günlük blok dağılımı
  let blocksPerSubject: Record<string, number> = {};
  
  if (field === 'sayisal') {
    if (dayType === 'TYT') {
      blocksPerSubject = { 'TYT Matematik': 2, 'TYT Fen Bilimleri': 1, 'TYT Türkçe': 1 };
    } else if (dayType === 'AYT') {
      blocksPerSubject = { 'AYT Matematik': 2, 'AYT Fizik': 1, 'AYT Kimya': 1 };
    }
  } else if (field === 'esit') {
    if (dayType === 'TYT') {
      blocksPerSubject = { 'TYT Matematik': 2, 'TYT Sosyal Bilimler': 1, 'TYT Türkçe': 1 };
    } else if (dayType === 'AYT') {
      blocksPerSubject = { 'AYT Matematik': 1, 'AYT Edebiyat': 1, 'AYT Tarih': 1, 'AYT Coğrafya': 1 };
    }
  } else if (field === 'sozel') {
    if (dayType === 'TYT') {
      blocksPerSubject = { 'TYT Türkçe': 2, 'TYT Sosyal Bilimler': 2 };
    } else if (dayType === 'AYT') {
      blocksPerSubject = { 'AYT Edebiyat': 1, 'AYT Tarih': 1, 'AYT Coğrafya': 1, 'AYT Felsefe': 1 };
    }
  }

  // Tekrar günü için özel durum
  if (dayType === 'Tekrar') {
    const mainSubjects = field === 'sayisal' 
      ? ['TYT Matematik', 'AYT Matematik'] 
      : field === 'esit' 
      ? ['TYT Matematik', 'AYT Edebiyat']
      : ['TYT Türkçe', 'AYT Edebiyat'];
    
    blocksPerSubject = {};
    mainSubjects.forEach(subject => {
      blocksPerSubject[subject] = 2;
    });
  }

  // Blokları oluştur
  let slotIndex = 0;
  for (const [subject, count] of Object.entries(blocksPerSubject)) {
    for (let i = 0; i < count && slotIndex < timeSlots.length; i++) {
      const slot = timeSlots[slotIndex];
      const resources = getResourcesForSubject(subject, level, period);
      const primaryResource = resources[0]?.title || `${subject} Çalışma Materyali`;

      blocks.push({
        id: generateId(),
        time: slot.label,
        subject,
        resource: primaryResource,
        durationMinutes: slot.durationMinutes,
        done: false,
        difficulty: level === 'baslangic' ? 'kolay' : level === 'orta' ? 'orta' : 'zor',
        topicsToFocus: getTopicsForSubject(subject, level)
      });

      slotIndex++;
    }
  }

  return blocks;
}

/**
 * Derse göre odaklanılacak konuları belirler
 */
function getTopicsForSubject(subject: string, level: Level): string[] {
  const topicMap: Record<string, Record<Level, string[]>> = {
    'TYT Matematik': {
      baslangic: ['Temel işlemler', 'Cebirsel ifadeler', 'Fonksiyonlar'],
      orta: ['Trigonometri', 'Logaritma', 'Diziler'],
      ileri: ['Türev', 'İntegral', 'Analitik geometri']
    },
    'AYT Matematik': {
      baslangic: ['Limit kavramı', 'Süreklilik', 'Türev tanımı'],
      orta: ['Türev uygulamaları', 'İntegral', 'Analitik geometri'],
      ileri: ['İntegral uygulamaları', 'Dizi-seri', 'Olasılık']
    },
    'AYT Fizik': {
      baslangic: ['Kuvvet-hareket', 'Enerji', 'Momentum'],
      orta: ['Elektrik', 'Manyetizma', 'Dalgalar'],
      ileri: ['Modern fizik', 'Atom fiziği', 'Optik']
    }
  };

  return topicMap[subject]?.[level] || ['Genel tekrar'];
}

/**
 * Ana plan üretici fonksiyon
 */
export function generateWeekPlan(params: GenerateParams): WeekPlanResult {
  try {
    // Parametreleri doğrula
    const validation = validateParams(params);
    if (!validation.isValid) {
      throw new PlanGenerationError(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    // Varsayılan değerleri ayarla
    const sessionDuration = params.customSessionDurationMinutes || 90;
    const weekStart = params.weekStartDate || new Date().toISOString().split('T')[0];
    
    // Zaman slotlarını oluştur
    const timeSlots = sessionDuration === 90 
      ? DEFAULT_TIME_SLOTS 
      : generateTimeSlots(sessionDuration, 4);

    // Gün tiplerini dağıt
    const dayTypes = distributeDayTypes(params.studyDaysPerWeek);
    
    // Günlük planları oluştur
    const weekPlan: DayPlan[] = [];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    for (let i = 0; i < 7; i++) {
      const dayName = dayNames[i];
      const date = addDays(weekStart, i);
      const dayType = i < dayTypes.length ? dayTypes[i] : 'Tekrar';
      
      let blocks: StudyBlock[] = [];
      let notes = '';

      if (i < params.studyDaysPerWeek) {
        blocks = createStudyBlocks(dayType, params.field, params.level, timeSlots, params.period);
        
        if (dayType === 'Tekrar') {
          notes = i18n.messages.revision_day;
        }
      } else {
        notes = 'Dinlenme günü';
      }

      const totalMinutes = blocks.reduce((sum, block) => sum + block.durationMinutes, 0);

      weekPlan.push({
        dayName,
        date,
        type: dayType,
        blocks,
        notes,
        totalMinutes
      });
    }

    // Kaynak önerilerini hazırla
    const resourcesSuggested = getAllResourcesForStudent(
      params.field, 
      params.level, 
      params.period
    );

    // Uyarıları topla
    const warnings: string[] = [...validation.warnings];
    
    // Çalışma günü yetersizse uyarı ekle
    if (params.studyDaysPerWeek <= 5) {
      warnings.push(i18n.messages.insufficient_days);
    }

    // Meta bilgileri hesapla
    const totalStudyHours = weekPlan.reduce((sum, day) => 
      sum + (day.totalMinutes || 0), 0) / 60;
    
    const studyDaysCount = weekPlan.filter(day => day.blocks.length > 0).length;
    const averageHoursPerDay = studyDaysCount > 0 ? totalStudyHours / studyDaysCount : 0;

    return {
      weekPlan,
      resourcesSuggested,
      warnings,
      meta: {
        generatedAt: new Date().toISOString(),
        weekStartDate: weekStart,
        totalStudyHours: Math.round(totalStudyHours * 100) / 100,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100
      }
    };

  } catch (error) {
    if (error instanceof PlanGenerationError) {
      throw error;
    }
    
    throw new PlanGenerationError(
      'Plan oluşturulurken beklenmeyen bir hata oluştu',
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Hızlı plan oluşturma (sadece temel bilgiler)
 */
export function generateQuickPlan(
  field: Field, 
  level: Level, 
  studyDaysPerWeek: number = 6
): WeekPlanResult {
  return generateWeekPlan({
    field,
    level,
    studyDaysPerWeek,
    customSessionDurationMinutes: 90
  });
}

/**
 * Plan validasyonu (oluşturulan planı kontrol eder)
 */
export function validateGeneratedPlan(plan: WeekPlanResult): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Plan yapısını kontrol et
  if (!plan.weekPlan || plan.weekPlan.length !== 7) {
    errors.push('Plan 7 günlük olmalıdır');
  }

  // Her günü kontrol et
  plan.weekPlan.forEach((day, index) => {
    if (!day.dayName || !day.type) {
      errors.push(`${index + 1}. gün eksik bilgi içeriyor`);
    }

    // Blok sayısı kontrolü
    if (day.blocks.length > 6) {
      warnings.push(`${day.dayName} günü çok yoğun (${day.blocks.length} blok)`);
    }

    // Toplam süre kontrolü
    if (day.totalMinutes && day.totalMinutes > 480) { // 8 saatten fazla
      warnings.push(`${day.dayName} günü çok uzun (${Math.round(day.totalMinutes / 60)} saat)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Strategy pattern için hazırlık (ileride LLM entegrasyonu)
export type PlanGenerationStrategy = (params: GenerateParams) => WeekPlanResult;

export const strategies = {
  ruleBased: generateWeekPlan,
  // llmBased: generateLLMPlan, // ileride eklenecek
};

/**
 * Strateji ile plan üretimi (gelecek genişletmeler için)
 */
export function generatePlanWithStrategy(
  params: GenerateParams,
  strategy: PlanGenerationStrategy = strategies.ruleBased
): WeekPlanResult {
  return strategy(params);
}
