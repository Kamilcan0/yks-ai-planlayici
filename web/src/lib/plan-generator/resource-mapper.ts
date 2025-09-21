/**
 * YKS Kaynak Eşleme Modülü
 * Seviye ve alana göre kaynak önerilerini yönetir
 * 
 * @author AI Assistant
 * @version 2.0.0
 */

import { 
  Field, 
  Level, 
  ResourceSuggestion, 
  ResourceType 
} from './types';

// Yeni kaynak yükleyici modülünü içe aktar
import { 
  getResourcesForSubject as getEnhancedResources,
  getSubjectsForField as getEnhancedSubjects,
  getAllSubjects,
  getTopicsForSubject,
  getResourcesForTopic
} from './resource-loader';

// Localization için string sabitleri
export const i18n = {
  days: {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  },
  subjects: {
    tyt_matematik: 'TYT Matematik',
    tyt_turkce: 'TYT Türkçe',
    tyt_fen: 'TYT Fen Bilimleri',
    tyt_sosyal: 'TYT Sosyal Bilimler',
    ayt_matematik: 'AYT Matematik',
    ayt_fizik: 'AYT Fizik',
    ayt_kimya: 'AYT Kimya',
    ayt_biyoloji: 'AYT Biyoloji',
    ayt_edebiyat: 'AYT Edebiyat',
    ayt_tarih: 'AYT Tarih',
    ayt_cografya: 'AYT Coğrafya',
    ayt_felsefe: 'AYT Felsefe'
  },
  messages: {
    revision_day: 'Haftalık tekrar ve değerlendirme günü',
    compressed_schedule: 'Program sıkıştırıldı, bazı dersler aynı güne yerleştirildi',
    insufficient_days: 'Çalışma günü sayısı yetersiz, tüm dersler yerleştirilemedi'
  }
};

// Ders konfigürasyonları
export const SUBJECT_CONFIGS = {
  // TYT Dersleri
  tyt_matematik: {
    name: 'TYT Matematik',
    category: 'TYT' as const,
    field: ['sayisal', 'esit'] as Field[],
    priority: 1,
    minBlocksPerWeek: 3,
    maxBlocksPerDay: 2
  },
  tyt_turkce: {
    name: 'TYT Türkçe',
    category: 'TYT' as const,
    field: ['sayisal', 'esit', 'sozel'] as Field[],
    priority: 2,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  tyt_fen: {
    name: 'TYT Fen Bilimleri',
    category: 'TYT' as const,
    field: ['sayisal', 'esit'] as Field[],
    priority: 3,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  tyt_sosyal: {
    name: 'TYT Sosyal Bilimler',
    category: 'TYT' as const,
    field: ['sayisal', 'esit', 'sozel'] as Field[],
    priority: 4,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  
  // AYT Dersleri - Sayısal
  ayt_matematik: {
    name: 'AYT Matematik',
    category: 'AYT' as const,
    field: ['sayisal'] as Field[],
    priority: 1,
    minBlocksPerWeek: 3,
    maxBlocksPerDay: 2
  },
  ayt_fizik: {
    name: 'AYT Fizik',
    category: 'AYT' as const,
    field: ['sayisal'] as Field[],
    priority: 2,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  ayt_kimya: {
    name: 'AYT Kimya',
    category: 'AYT' as const,
    field: ['sayisal'] as Field[],
    priority: 3,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  ayt_biyoloji: {
    name: 'AYT Biyoloji',
    category: 'AYT' as const,
    field: ['sayisal'] as Field[],
    priority: 4,
    minBlocksPerWeek: 1,
    maxBlocksPerDay: 1
  },
  
  // AYT Dersleri - Eşit Ağırlık
  ayt_edebiyat: {
    name: 'AYT Edebiyat',
    category: 'AYT' as const,
    field: ['esit', 'sozel'] as Field[],
    priority: 1,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  ayt_tarih: {
    name: 'AYT Tarih',
    category: 'AYT' as const,
    field: ['esit', 'sozel'] as Field[],
    priority: 2,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  ayt_cografya: {
    name: 'AYT Coğrafya',
    category: 'AYT' as const,
    field: ['esit', 'sozel'] as Field[],
    priority: 3,
    minBlocksPerWeek: 2,
    maxBlocksPerDay: 1
  },
  ayt_felsefe: {
    name: 'AYT Felsefe',
    category: 'AYT' as const,
    field: ['sozel'] as Field[],
    priority: 4,
    minBlocksPerWeek: 1,
    maxBlocksPerDay: 1
  }
};

// Kaynak veritabanı - seviye ve alana göre
const RESOURCE_DATABASE: Record<string, Record<Level, ResourceSuggestion[]>> = {
  'TYT Matematik': {
    baslangic: [
      {
        title: 'TYT Matematik Konu Anlatımı',
        level: 'baslangic',
        type: 'kitap',
        description: 'Temel konular ve örnek çözümler',
        priority: 5,
        publisher: 'Limit Yayınları',
        estimatedPrice: 45
      },
      {
        title: 'TYT Matematik Soru Bankası (Temel)',
        level: 'baslangic',
        type: 'soru_bankasi',
        description: 'Başlangıç seviyesi sorular',
        priority: 4,
        publisher: 'Karekök Yayınları',
        estimatedPrice: 35
      }
    ],
    orta: [
      {
        title: 'TYT Matematik Orta Seviye Soru Bankası',
        level: 'orta',
        type: 'soru_bankasi',
        description: 'Orta zorluk sorular ve çözümleri',
        priority: 5,
        publisher: '3D Yayınları',
        estimatedPrice: 40
      },
      {
        title: 'Tonguç TYT Matematik',
        level: 'orta',
        type: 'kitap',
        description: 'Konu anlatımı ve test soruları',
        priority: 4,
        publisher: 'Tonguç Akademi',
        estimatedPrice: 50
      }
    ],
    ileri: [
      {
        title: 'TYT Matematik İleri Seviye',
        level: 'ileri',
        type: 'soru_bankasi',
        description: 'Zor sorular ve olimpiyat tarzı problemler',
        priority: 5,
        publisher: 'Palme Yayınları',
        estimatedPrice: 55
      }
    ]
  },
  
  'AYT Matematik': {
    baslangic: [
      {
        title: 'AYT Matematik Temel Seviye',
        level: 'baslangic',
        type: 'kitap',
        description: 'AYT matematik temelleri',
        priority: 5,
        publisher: 'Limit Yayınları',
        estimatedPrice: 60
      }
    ],
    orta: [
      {
        title: 'AYT Matematik Soru Bankası',
        level: 'orta',
        type: 'soru_bankasi',
        description: 'Kapsamlı soru havuzu',
        priority: 5,
        publisher: 'Karekök Yayınları',
        estimatedPrice: 50
      }
    ],
    ileri: [
      {
        title: 'AYT Matematik İleri Düzey',
        level: 'ileri',
        type: 'soru_bankasi',
        description: 'Zor problemler ve çözüm teknikleri',
        priority: 5,
        publisher: 'Palme Yayınları',
        estimatedPrice: 65
      }
    ]
  },
  
  'AYT Fizik': {
    baslangic: [
      {
        title: 'AYT Fizik Konu Anlatımı',
        level: 'baslangic',
        type: 'kitap',
        description: 'Temel fizik kavramları',
        priority: 5,
        publisher: 'Final Yayınları',
        estimatedPrice: 55
      }
    ],
    orta: [
      {
        title: 'AYT Fizik Soru Bankası',
        level: 'orta',
        type: 'soru_bankasi',
        description: 'Çözümlü fizik soruları',
        priority: 5,
        publisher: 'Okyanus Yayınları',
        estimatedPrice: 45
      }
    ],
    ileri: [
      {
        title: 'AYT Fizik İleri Seviye',
        level: 'ileri',
        type: 'soru_bankasi',
        description: 'Olimpiyat seviyesi fizik',
        priority: 5,
        publisher: 'Gür Yayınları',
        estimatedPrice: 60
      }
    ]
  },
  
  'TYT Türkçe': {
    baslangic: [
      {
        title: 'TYT Türkçe Konu Anlatımı',
        level: 'baslangic',
        type: 'kitap',
        description: 'Dil bilgisi ve okuma anlama',
        priority: 5,
        publisher: 'Puan Yayınları',
        estimatedPrice: 40
      }
    ],
    orta: [
      {
        title: 'TYT Türkçe Soru Bankası',
        level: 'orta',
        type: 'soru_bankasi',
        description: 'Kapsamlı soru çözümü',
        priority: 5,
        publisher: 'Başka Yayıncılık',
        estimatedPrice: 38
      }
    ],
    ileri: [
      {
        title: 'TYT Türkçe İleri Düzey',
        level: 'ileri',
        type: 'soru_bankasi',
        description: 'Zor metin analizi soruları',
        priority: 5,
        publisher: 'Acil Yayınları',
        estimatedPrice: 42
      }
    ]
  }
  // Diğer dersler için de benzer yapı...
};

/**
 * Belirli bir ders ve seviye için kaynak önerilerini getirir
 * Önce yeni veri yapısından, yoksa eski sistemden kaynak döner
 */
export function getResourcesForSubject(
  subject: string, 
  level: Level, 
  period?: string
): ResourceSuggestion[] {
  // Önce yeni veri yapısından dene
  let resources = getEnhancedResources(subject, level, period);
  
  // Eğer bulunamazsa eski sistemden dene
  if (resources.length === 0) {
    resources = RESOURCE_DATABASE[subject]?.[level] || [];
    
    // Eğer 'Eyl-Kas' dönemi ise sadece soru bankası ağırlıklı öner
    if (period === 'Eyl-Kas') {
      return resources
        .filter(r => r.type === 'soru_bankasi')
        .sort((a, b) => b.priority - a.priority);
    }
    
    return resources.sort((a, b) => b.priority - a.priority);
  }
  
  return resources;
}

/**
 * Alanına göre öğrencinin çalışması gereken dersleri döner
 * Önce yeni veri yapısından, yoksa eski sistemden ders listesi döner
 */
export function getSubjectsForField(field: Field): string[] {
  // Önce yeni veri yapısından dene
  const enhancedSubjects = getEnhancedSubjects(field);
  
  if (enhancedSubjects.length > 0) {
    return enhancedSubjects;
  }
  
  // Eski sistem fallback
  return Object.entries(SUBJECT_CONFIGS)
    .filter(([_, config]) => config.field.includes(field))
    .map(([_, config]) => config.name);
}

// Yeni eklenen yardımcı fonksiyonları dışa aktar
export { 
  getAllSubjects, 
  getTopicsForSubject, 
  getResourcesForTopic 
};

/**
 * Tüm kaynakları alana ve seviyeye göre gruplandırır
 */
export function getAllResourcesForStudent(
  field: Field, 
  level: Level, 
  period?: string
): Record<string, ResourceSuggestion[]> {
  const subjects = getSubjectsForField(field);
  const result: Record<string, ResourceSuggestion[]> = {};
  
  subjects.forEach(subject => {
    result[subject] = getResourcesForSubject(subject, level, period);
  });
  
  return result;
}

/**
 * Varsayılan zaman slotları
 */
export const DEFAULT_TIME_SLOTS = [
  {
    start: '09:00',
    end: '10:30',
    label: '09:00-10:30',
    durationMinutes: 90
  },
  {
    start: '11:00',
    end: '12:30',
    label: '11:00-12:30',
    durationMinutes: 90
  },
  {
    start: '14:00',
    end: '15:30',
    label: '14:00-15:30',
    durationMinutes: 90
  },
  {
    start: '16:00',
    end: '17:30',
    label: '16:00-17:30',
    durationMinutes: 90
  }
];

/**
 * Özel süreye göre zaman slotları üretir
 */
export function generateTimeSlots(sessionDuration: number = 90, slotsPerDay: number = 4) {
  const slots = [];
  let currentHour = 9;
  let currentMinute = 0;
  
  for (let i = 0; i < slotsPerDay; i++) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Süre ekleme
    currentMinute += sessionDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
    
    const endTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    slots.push({
      start: startTime,
      end: endTime,
      label: `${startTime}-${endTime}`,
      durationMinutes: sessionDuration
    });
    
    // Ara verme (30 dakika)
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
}
