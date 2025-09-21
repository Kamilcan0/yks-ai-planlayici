/**
 * YKS Plan Generator React Hook
 * Plan üretici modülünü React uygulamasında kullanmak için hook
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  generateWeekPlan, 
  generateQuickPlan,
  validateGeneratedPlan 
} from './plan-generator';
import { 
  GenerateParams, 
  WeekPlanResult, 
  Field, 
  Level,
  ValidationResult 
} from './types';

// Hook state interface
interface PlanGeneratorState {
  plan: WeekPlanResult | null;
  isGenerating: boolean;
  error: string | null;
  validation: ValidationResult | null;
  lastParams: GenerateParams | null;
}

// Hook dönüş değerleri
interface UsePlanGeneratorReturn {
  // State
  plan: WeekPlanResult | null;
  isGenerating: boolean;
  error: string | null;
  validation: ValidationResult | null;
  
  // Actions
  generate: (params: GenerateParams) => Promise<WeekPlanResult>;
  generateQuick: (field: Field, level: Level, days?: number) => Promise<WeekPlanResult>;
  regenerate: () => Promise<WeekPlanResult | null>;
  clearPlan: () => void;
  clearError: () => void;
  
  // Utilities
  savePlan: () => void;
  loadPlan: () => WeekPlanResult | null;
  exportPlan: (format: 'json' | 'csv') => void;
  
  // Statistics
  getStats: () => {
    totalHours: number;
    averageHoursPerDay: number;
    completedBlocks: number;
    totalBlocks: number;
    completionRate: number;
  };
}

// LocalStorage anahtarları
const STORAGE_KEYS = {
  PLAN: 'yks_plan_generator_plan',
  PARAMS: 'yks_plan_generator_params',
  COMPLETION: 'yks_plan_generator_completion'
};

/**
 * YKS Plan Generator Hook
 */
export function usePlanGenerator(): UsePlanGeneratorReturn {
  const [state, setState] = useState<PlanGeneratorState>({
    plan: null,
    isGenerating: false,
    error: null,
    validation: null,
    lastParams: null
  });

  // Plan üretme fonksiyonu
  const generate = useCallback(async (params: GenerateParams): Promise<WeekPlanResult> => {
    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      const plan = generateWeekPlan(params);
      const validation = validateGeneratedPlan(plan);
      
      setState(prev => ({
        ...prev,
        plan,
        validation,
        lastParams: params,
        isGenerating: false
      }));

      // LocalStorage'a kaydet
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
      localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params));

      return plan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Plan oluşturulurken bir hata oluştu';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false
      }));

      throw error;
    }
  }, []);

  // Hızlı plan üretme
  const generateQuick = useCallback(async (
    field: Field, 
    level: Level, 
    days: number = 6
  ): Promise<WeekPlanResult> => {
    return generate({
      field,
      level,
      studyDaysPerWeek: days,
      customSessionDurationMinutes: 90
    });
  }, [generate]);

  // Mevcut parametrelerle tekrar üret
  const regenerate = useCallback(async (): Promise<WeekPlanResult | null> => {
    if (!state.lastParams) {
      setState(prev => ({ ...prev, error: 'Tekrar oluşturmak için önce bir plan oluşturun' }));
      return null;
    }

    return generate(state.lastParams);
  }, [state.lastParams, generate]);

  // Planı temizle
  const clearPlan = useCallback(() => {
    setState(prev => ({
      ...prev,
      plan: null,
      error: null,
      validation: null
    }));
    
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.PARAMS);
  }, []);

  // Hatayı temizle
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Planı kaydet
  const savePlan = useCallback(() => {
    if (state.plan) {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(state.plan));
      
      if (state.lastParams) {
        localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(state.lastParams));
      }
    }
  }, [state.plan, state.lastParams]);

  // Planı yükle
  const loadPlan = useCallback((): WeekPlanResult | null => {
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
      const savedParams = localStorage.getItem(STORAGE_KEYS.PARAMS);
      
      if (savedPlan) {
        const plan = JSON.parse(savedPlan) as WeekPlanResult;
        const params = savedParams ? JSON.parse(savedParams) as GenerateParams : null;
        
        setState(prev => ({
          ...prev,
          plan,
          lastParams: params,
          validation: validateGeneratedPlan(plan)
        }));
        
        return plan;
      }
    } catch (error) {
      console.error('Plan yüklenirken hata:', error);
      setState(prev => ({ ...prev, error: 'Kaydedilen plan yüklenemedi' }));
    }
    
    return null;
  }, []);

  // Planı export et
  const exportPlan = useCallback((format: 'json' | 'csv') => {
    if (!state.plan) {
      setState(prev => ({ ...prev, error: 'Export edilecek plan bulunamadı' }));
      return;
    }

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(state.plan, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `yks-plan-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvData = convertPlanToCSV(state.plan);
        const dataBlob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `yks-plan-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Export işlemi başarısız oldu' }));
    }
  }, [state.plan]);

  // İstatistikler
  const getStats = useCallback(() => {
    if (!state.plan) {
      return {
        totalHours: 0,
        averageHoursPerDay: 0,
        completedBlocks: 0,
        totalBlocks: 0,
        completionRate: 0
      };
    }

    const totalBlocks = state.plan.weekPlan.reduce((sum, day) => sum + day.blocks.length, 0);
    const completedBlocks = state.plan.weekPlan.reduce((sum, day) => 
      sum + day.blocks.filter(block => block.done).length, 0);
    
    return {
      totalHours: state.plan.meta.totalStudyHours,
      averageHoursPerDay: state.plan.meta.averageHoursPerDay,
      completedBlocks,
      totalBlocks,
      completionRate: totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0
    };
  }, [state.plan]);

  // Component mount olduğunda kaydedilen planı yükle
  useEffect(() => {
    loadPlan();
  }, []);

  return {
    // State
    plan: state.plan,
    isGenerating: state.isGenerating,
    error: state.error,
    validation: state.validation,
    
    // Actions
    generate,
    generateQuick,
    regenerate,
    clearPlan,
    clearError,
    
    // Utilities
    savePlan,
    loadPlan,
    exportPlan,
    
    // Statistics
    getStats
  };
}

// Yardımcı fonksiyon: Plan'ı CSV'ye çevir
function convertPlanToCSV(plan: WeekPlanResult): string {
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
          block.subject,
          block.resource,
          block.durationMinutes.toString(),
          block.done ? 'Evet' : 'Hayır'
        ].join(','));
      });
    }
  });
  
  return rows.join('\n');
}

// Hook kullanım kolaylığı için export
export default usePlanGenerator;
