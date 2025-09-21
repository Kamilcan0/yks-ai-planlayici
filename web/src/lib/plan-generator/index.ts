/**
 * YKS Plan Generator - Ana Export Modülü
 * Tüm fonksiyon ve tip tanımlarını export eder
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

// Ana fonksiyonlar
export {
  generateWeekPlan,
  generateQuickPlan,
  validateGeneratedPlan,
  generatePlanWithStrategy,
  strategies
} from './plan-generator';

// Tip tanımları
export type {
  Field,
  Level,
  DayType,
  ResourceType,
  UserPreferences,
  GenerateParams,
  StudyBlock,
  DayPlan,
  ResourceSuggestion,
  WeekPlanResult,
  TimeSlot,
  SubjectConfig,
  PlanGenerationStrategy,
  ValidationResult,
  I18nStrings
} from './types';

export { PlanGenerationError } from './types';

// Kaynak yönetimi
export {
  getResourcesForSubject,
  getSubjectsForField,
  getAllResourcesForStudent,
  generateTimeSlots,
  DEFAULT_TIME_SLOTS,
  SUBJECT_CONFIGS,
  i18n
} from './resource-mapper';

// React bileşenleri
export { default as usePlanGenerator } from './usePlanGenerator';
export { default as WeekView } from './WeekView';

// Version bilgisi
export const VERSION = '1.0.0';

// API dokümantasyonu için örnek kullanım
export const EXAMPLE_USAGE = {
  basic: {
    field: 'sayisal' as const,
    level: 'orta' as const,
    studyDaysPerWeek: 6,
    weekStartDate: '2025-09-15',
    period: 'Eyl-Kas',
    customSessionDurationMinutes: 90
  },
  
  withPreferences: {
    field: 'esit' as const,
    level: 'ileri' as const,
    studyDaysPerWeek: 5,
    userPreferences: {
      preferMorning: true,
      excludeSubjects: ['AYT Biyoloji']
    }
  }
};

// Yardımcı fonksiyonlar
export const utils = {
  /**
   * Bir planın toplam çalışma saatini hesaplar
   */
  calculateTotalHours: (plan: any): number => {
    return plan.weekPlan.reduce((total, day) => {
      return total + day.blocks.reduce((dayTotal, block) => {
        return dayTotal + (block.durationMinutes / 60);
      }, 0);
    }, 0);
  },

  /**
   * Tamamlanan blok sayısını hesaplar
   */
  calculateCompletedBlocks: (plan: any): number => {
    return plan.weekPlan.reduce((total, day) => {
      return total + day.blocks.filter(block => block.done).length;
    }, 0);
  },

  /**
   * Plan verilerini CSV formatına çevirir
   */
  exportToCSV: (plan: any): string => {
    const headers = ['Gün', 'Tarih', 'Tip', 'Saat', 'Ders', 'Kaynak', 'Süre', 'Tamamlandı'];
    const rows = [headers.join(',')];
    
    plan.weekPlan.forEach(day => {
      if (day.blocks.length === 0) {
        rows.push([
          day.dayName,
          day.date || '',
          day.type,
          '',
          'Dinlenme',
          '',
          '0',
          ''
        ].join(','));
      } else {
        day.blocks.forEach(block => {
          rows.push([
            day.dayName,
            day.date || '',
            day.type,
            block.time,
            `"${block.subject}"`,
            `"${block.resource}"`,
            block.durationMinutes.toString(),
            block.done ? 'Evet' : 'Hayır'
          ].join(','));
        });
      }
    });
    
    return rows.join('\n');
  },

  /**
   * İki plan arasındaki farkları hesaplar
   */
  comparePlans: (plan1: any, plan2: any) => {
    const differences = {
      totalHoursChange: plan2.meta.totalStudyHours - plan1.meta.totalStudyHours,
      avgHoursChange: plan2.meta.averageHoursPerDay - plan1.meta.averageHoursPerDay,
      newSubjects: [] as string[],
      removedSubjects: [] as string[],
      changedDays: [] as string[]
    };

    const subjects1 = new Set(plan1.weekPlan.flatMap(day => day.blocks.map(block => block.subject)));
    const subjects2 = new Set(plan2.weekPlan.flatMap(day => day.blocks.map(block => block.subject)));

    subjects2.forEach(subject => {
      if (!subjects1.has(subject)) {
        differences.newSubjects.push(subject as string);
      }
    });
    
    subjects1.forEach(subject => {
      if (!subjects2.has(subject)) {
        differences.removedSubjects.push(subject as string);
      }
    });

    plan1.weekPlan.forEach((day1, index) => {
      const day2 = plan2.weekPlan[index];
      if (day1.blocks.length !== day2.blocks.length || day1.type !== day2.type) {
        differences.changedDays.push(day1.dayName);
      }
    });

    return differences;
  }
};

// Validasyon yardımcıları
export const validators = {
  /**
   * Parametreleri önceden kontrol eder
   */
  validateParams: (params: any): string[] => {
    const errors: string[] = [];

    if (!params.field || !['sayisal', 'esit', 'sozel'].includes(params.field)) {
      errors.push('Geçerli bir alan seçiniz (sayisal, esit, sozel)');
    }

    if (!params.level || !['baslangic', 'orta', 'ileri'].includes(params.level)) {
      errors.push('Geçerli bir seviye seçiniz (baslangic, orta, ileri)');
    }

    if (!params.studyDaysPerWeek || params.studyDaysPerWeek < 1 || params.studyDaysPerWeek > 7) {
      errors.push('Çalışma günü sayısı 1-7 arasında olmalıdır');
    }

    if (params.customSessionDurationMinutes && 
        (params.customSessionDurationMinutes < 30 || params.customSessionDurationMinutes > 180)) {
      errors.push('Ders süresi 30-180 dakika arasında olmalıdır');
    }

    return errors;
  },

  /**
   * Plan kalitesini değerlendirir
   */
  assessPlanQuality: (plan: any): {
    score: number;
    feedback: string[];
    recommendations: string[];
  } => {
    const feedback: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Çalışma yoğunluğu kontrolü
    if (plan.meta.averageHoursPerDay > 8) {
      score -= 20;
      feedback.push('Günlük çalışma süresi çok yüksek');
      recommendations.push('Günlük çalışma saatini azaltmayı düşünün');
    } else if (plan.meta.averageHoursPerDay < 3) {
      score -= 10;
      feedback.push('Günlük çalışma süresi düşük');
      recommendations.push('Daha fazla çalışma saati ekleyebilirsiniz');
    }

    // Ders çeşitliliği kontrolü
    const uniqueSubjects = new Set(plan.weekPlan.flatMap(day => 
      day.blocks.map(block => block.subject)
    ));
    
    if (uniqueSubjects.size < 4) {
      score -= 15;
      feedback.push('Ders çeşitliliği az');
      recommendations.push('Daha fazla ders ekleyerek dengeyi sağlayın');
    }

    // Uyarı sayısı kontrolü
    if (plan.warnings.length > 2) {
      score -= 10;
      feedback.push('Çok fazla uyarı var');
      recommendations.push('Plan parametrelerini gözden geçirin');
    }

    return {
      score: Math.max(0, score),
      feedback,
      recommendations
    };
  }
};
