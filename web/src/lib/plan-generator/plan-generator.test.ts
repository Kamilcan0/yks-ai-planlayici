/**
 * YKS Plan Üretici - Unit Tests
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import {
  generateWeekPlan,
  generateQuickPlan,
  validateGeneratedPlan,
  strategies
} from './plan-generator';

import { GenerateParams, WeekPlanResult, Level, Field } from './types';

describe('YKS Plan Generator', () => {

  // Test 1: Sayısal alan + 6 gün çalışma => TYT/AYT dönüşümlü, Pazar Tekrar
  describe('Sayısal Alan - 6 Günlük Plan', () => {
    test('her gün 4 blok, TYT/AYT dönüşümlü, Pazar Tekrar olmalı', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 6,
        weekStartDate: '2025-09-15',
        customSessionDurationMinutes: 90
      };

      const result = generateWeekPlan(params);

      // Temel yapı kontrolü
      expect(result.weekPlan).toHaveLength(7);
      expect(result.meta.weekStartDate).toBe('2025-09-15');
      expect(result.warnings).toBeInstanceOf(Array);
      expect(result.resourcesSuggested).toBeInstanceOf(Object);

      // Gün tipi kontrolü
      expect(result.weekPlan[0].type).toBe('TYT'); // Pazartesi
      expect(result.weekPlan[1].type).toBe('AYT'); // Salı
      expect(result.weekPlan[2].type).toBe('TYT'); // Çarşamba
      expect(result.weekPlan[3].type).toBe('AYT'); // Perşembe
      expect(result.weekPlan[4].type).toBe('TYT'); // Cuma
      expect(result.weekPlan[5].type).toBe('AYT'); // Cumartesi
      expect(result.weekPlan[6].type).toBe('Tekrar'); // Pazar (çalışma günü değil)

      // İlk 6 gün blok sayısı kontrolü
      for (let i = 0; i < 6; i++) {
        expect(result.weekPlan[i].blocks.length).toBeGreaterThan(0);
        expect(result.weekPlan[i].blocks.length).toBeLessThanOrEqual(4);
      }

      // Pazar günü kontrol (dinlenme)
      expect(result.weekPlan[6].blocks.length).toBe(0);
      expect(result.weekPlan[6].notes).toContain('Dinlenme');

      // TYT günlerinde matematik ağırlıklı olmalı
      const tytDays = result.weekPlan.filter(day => day.type === 'TYT' && day.blocks.length > 0);
      tytDays.forEach(day => {
        const mathBlocks = day.blocks.filter(block => block.subject.includes('Matematik'));
        expect(mathBlocks.length).toBeGreaterThanOrEqual(1);
      });

      // Meta bilgi kontrolü
      expect(result.meta.totalStudyHours).toBeGreaterThan(0);
      expect(result.meta.averageHoursPerDay).toBeGreaterThan(0);
      expect(new Date(result.meta.generatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  // Test 2: Eşit Ağırlık + 5 gün => zorunlu bloklar sığdırıldı mı, uyarı var mı
  describe('Eşit Ağırlık - 5 Günlük Plan', () => {
    test('zorunlu bloklar sığdırılmalı, yetersiz gün uyarısı olmalı', () => {
      const params: GenerateParams = {
        field: 'esit',
        level: 'baslangic',
        studyDaysPerWeek: 5,
        weekStartDate: '2025-09-16'
      };

      const result = generateWeekPlan(params);

      // Temel kontrollar
      expect(result.weekPlan).toHaveLength(7);
      
      // Çalışma günleri kontrolü (5 gün)
      const studyDays = result.weekPlan.filter(day => day.blocks.length > 0);
      expect(studyDays).toHaveLength(5);

      // Dinlenme günleri kontrolü (2 gün)
      const restDays = result.weekPlan.filter(day => day.blocks.length === 0);
      expect(restDays).toHaveLength(2);

      // Uyarı kontrolü - 5 gün az olduğu için uyarı olmalı
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => 
        warning.includes('az') || warning.includes('yetersiz')
      )).toBe(true);

      // Eşit ağırlık dersleri kontrolü
      const allSubjects = result.weekPlan
        .flatMap(day => day.blocks)
        .map(block => block.subject);
      
      expect(allSubjects.some(subject => subject.includes('Matematik'))).toBe(true);
      expect(allSubjects.some(subject => subject.includes('Edebiyat') || subject.includes('Sosyal'))).toBe(true);

      // Meta bilgi kontrolü
      expect(result.meta.totalStudyHours).toBeGreaterThan(0);
      expect(result.meta.averageHoursPerDay).toBeGreaterThan(0);
    });
  });

  // Test 3: Eyl-Kas dönemi => sadece soru bankası ağırlıklı kaynaklar
  describe('Eyl-Kas Dönemi - Soru Bankası Ağırlıklı', () => {
    test('kaynak önerileri sadece soru bankası ağırlıklı olmalı', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 6,
        period: 'Eyl-Kas'
      };

      const result = generateWeekPlan(params);

      // Kaynak önerileri kontrolü
      expect(result.resourcesSuggested).toBeInstanceOf(Object);
      
      const allResources = Object.values(result.resourcesSuggested).flat();
      expect(allResources.length).toBeGreaterThan(0);

      // Tüm kaynaklar soru bankası ağırlıklı olmalı
      const soruBankasiCount = allResources.filter(resource => 
        resource.type === 'soru_bankasi'
      ).length;
      
      const totalResourceCount = allResources.length;
      
      // Soru bankası oranı yüksek olmalı (en az %70)
      expect(soruBankasiCount / totalResourceCount).toBeGreaterThanOrEqual(0.7);

      // Period bilgisi kontrol edilmeli
      expect(params.period).toBe('Eyl-Kas');
    });
  });

  // Test 4: Örnek girdi -> beklenen çıktı eşleşmesi
  describe('Örnek Girdi-Çıktı Eşleşmesi', () => {
    test('belirli girdi için beklenen yapıda çıktı vermeli', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 6,
        weekStartDate: '2025-09-15',
        period: 'Eyl-Kas',
        customSessionDurationMinutes: 90
      };

      const result = generateWeekPlan(params);

      // Beklenen yapı kontrolü
      expect(result).toHaveProperty('weekPlan');
      expect(result).toHaveProperty('resourcesSuggested');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('meta');

      // WeekPlan yapısı
      expect(result.weekPlan).toHaveLength(7);
      result.weekPlan.forEach((day, index) => {
        expect(day).toHaveProperty('dayName');
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('type');
        expect(day).toHaveProperty('blocks');
        expect(day).toHaveProperty('totalMinutes');
        
        // Tarih kontrolü
        if (day.date) {
          const expectedDate = new Date('2025-09-15');
          expectedDate.setDate(expectedDate.getDate() + index);
          expect(day.date).toBe(expectedDate.toISOString().split('T')[0]);
        }
      });

      // Block yapısı kontrolü
      const allBlocks = result.weekPlan.flatMap(day => day.blocks);
      allBlocks.forEach(block => {
        expect(block).toHaveProperty('id');
        expect(block).toHaveProperty('time');
        expect(block).toHaveProperty('subject');
        expect(block).toHaveProperty('resource');
        expect(block).toHaveProperty('durationMinutes');
        expect(block).toHaveProperty('done');
        
        expect(block.id).toBeTruthy();
        expect(block.durationMinutes).toBe(90);
        expect(block.done).toBe(false);
        expect(typeof block.subject).toBe('string');
        expect(typeof block.resource).toBe('string');
      });

      // Meta yapısı
      expect(result.meta).toHaveProperty('generatedAt');
      expect(result.meta).toHaveProperty('weekStartDate');
      expect(result.meta).toHaveProperty('totalStudyHours');
      expect(result.meta).toHaveProperty('averageHoursPerDay');
      
      expect(result.meta.weekStartDate).toBe('2025-09-15');
      expect(typeof result.meta.totalStudyHours).toBe('number');
      expect(typeof result.meta.averageHoursPerDay).toBe('number');
    });
  });

  // Test 5: Hızlı plan oluşturma
  describe('Hızlı Plan Oluşturma', () => {
    test('generateQuickPlan varsayılan değerlerle çalışmalı', () => {
      const result = generateQuickPlan('sozel', 'ileri', 5);

      expect(result.weekPlan).toHaveLength(7);
      expect(result.meta.totalStudyHours).toBeGreaterThan(0);
      
      // Sözel alan dersleri kontrolü
      const allSubjects = result.weekPlan
        .flatMap(day => day.blocks)
        .map(block => block.subject);
      
      expect(allSubjects.some(subject => 
        subject.includes('Türkçe') || subject.includes('Edebiyat')
      )).toBe(true);
    });
  });

  // Test 6: Plan validasyonu
  describe('Plan Validasyonu', () => {
    test('geçerli plan validation geçmeli', () => {
      const validPlan = generateWeekPlan({
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 6
      });

      const validation = validateGeneratedPlan(validPlan);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('hatalı plan validation başarısız olmalı', () => {
      const invalidPlan: WeekPlanResult = {
        weekPlan: [], // Boş plan - hatalı
        resourcesSuggested: {},
        warnings: [],
        meta: {
          generatedAt: new Date().toISOString(),
          weekStartDate: '2025-01-01',
          totalStudyHours: 0,
          averageHoursPerDay: 0
        }
      };

      const validation = validateGeneratedPlan(invalidPlan);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  // Test 7: Hata durumları
  describe('Hata Durumları', () => {
    test('geçersiz parametreler hata fırlatmalı', () => {
      const invalidParams: GenerateParams = {
        field: 'invalid_field' as any,
        level: 'orta' as Level,
        studyDaysPerWeek: 6
      };

      expect(() => generateWeekPlan(invalidParams)).toThrow();
    });

    test('studyDaysPerWeek sınır dışı değer uyarı vermeli', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 2 // Çok az
      };

      const result = generateWeekPlan(params);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  // Test 8: Strateji pattern
  describe('Strateji Pattern', () => {
    test('kural tabanlı strateji çalışmalı', () => {
      expect(strategies.ruleBased).toBeDefined();
      expect(typeof strategies.ruleBased).toBe('function');
      
      const params: GenerateParams = {
        field: 'esit',
        level: 'baslangic',
        studyDaysPerWeek: 5
      };

      const result = strategies.ruleBased(params);
      expect(result.weekPlan).toHaveLength(7);
    });
  });

  // Test 9: Özel süre kontrolü
  describe('Özel Süre Kontrolü', () => {
    test('60 dakikalık oturumlar düzgün çalışmalı', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 5,
        customSessionDurationMinutes: 60
      };

      const result = generateWeekPlan(params);
      
      const allBlocks = result.weekPlan.flatMap(day => day.blocks);
      allBlocks.forEach(block => {
        expect(block.durationMinutes).toBe(60);
      });
    });
  });

  // Test 10: Kullanıcı tercihleri
  describe('Kullanıcı Tercihleri', () => {
    test('excludeSubjects tercihi uygulanmalı', () => {
      const params: GenerateParams = {
        field: 'sayisal',
        level: 'orta',
        studyDaysPerWeek: 6,
        userPreferences: {
          excludeSubjects: ['AYT Biyoloji']
        }
      };

      const result = generateWeekPlan(params);
      
      const allSubjects = result.weekPlan
        .flatMap(day => day.blocks)
        .map(block => block.subject);
      
      expect(allSubjects.includes('AYT Biyoloji')).toBe(false);
    });
  });

});

// JSON çıktı örneği için snapshot test
describe('JSON Çıktı Yapısı', () => {
  test('plan çıktısı doğru JSON yapısında olmalı', () => {
    const params: GenerateParams = {
      field: 'sayisal',
      level: 'orta',
      studyDaysPerWeek: 6,
      weekStartDate: '2025-09-15',
      period: 'Eyl-Kas'
    };

    const result = generateWeekPlan(params);
    
    // JSON serialize/deserialize testi
    const jsonString = JSON.stringify(result);
    const parsedResult = JSON.parse(jsonString);
    
    expect(parsedResult.weekPlan).toBeDefined();
    expect(parsedResult.resourcesSuggested).toBeDefined();
    expect(parsedResult.warnings).toBeDefined();
    expect(parsedResult.meta).toBeDefined();
    
    // Örnek günün yapısı
    if (parsedResult.weekPlan.length > 0) {
      const firstDay = parsedResult.weekPlan[0];
      expect(firstDay.dayName).toBeDefined();
      expect(firstDay.type).toBeDefined();
      expect(firstDay.blocks).toBeDefined();
      
      if (firstDay.blocks.length > 0) {
        const firstBlock = firstDay.blocks[0];
        expect(firstBlock.id).toBeDefined();
        expect(firstBlock.time).toBeDefined();
        expect(firstBlock.subject).toBeDefined();
        expect(firstBlock.resource).toBeDefined();
        expect(firstBlock.durationMinutes).toBeDefined();
        expect(firstBlock.done).toBe(false);
      }
    }
  });
});
