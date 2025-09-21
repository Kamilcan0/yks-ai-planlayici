/**
 * Eğitim Kaynakları Yükleme Modülü
 * JSON dosyasından eğitim kaynaklarını yükler ve işler
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import { Level, ResourceSuggestion, Field } from './types';
import educationalResourcesData from '../../data/educational-resources.json';

// Türkçe ve İngilizce kaynak türü eşlemeleri
const RESOURCE_TYPE_MAPPING: Record<string, 'kitap' | 'soru_bankasi' | 'video' | 'online_kurs' | 'test'> = {
  'Kitap': 'kitap',
  'Video': 'video', 
  'PDF': 'soru_bankasi',
  'Uygulama': 'online_kurs'
};

// Seviye eşlemeleri
const LEVEL_MAPPING: Record<string, Level> = {
  'başlangıç': 'baslangic',
  'orta': 'orta',
  'ileri': 'ileri'
};

// Alan eşlemeleri
const FIELD_MAPPING: Record<string, Field> = {
  'sayisal': 'sayisal',
  'esit': 'esit',
  'sozel': 'sozel'
};

/**
 * Ham eğitim verilerini sisteme uygun formata dönüştürür
 */
function transformEducationalData(): Record<string, Record<Level, ResourceSuggestion[]>> {
  const transformedData: Record<string, Record<Level, ResourceSuggestion[]>> = {};

  educationalResourcesData.dersler.forEach(ders => {
    const dersAdi = ders.ders;
    
    // Her ders için seviye bazında kaynak grupları oluştur
    transformedData[dersAdi] = {
      baslangic: [],
      orta: [],
      ileri: []
    };

    // Konular ve kaynaklarını işle
    ders.konular.forEach(konu => {
      konu.kaynaklar.forEach(kaynak => {
        const seviye = LEVEL_MAPPING[kaynak.seviye] || 'orta';
        const tur = RESOURCE_TYPE_MAPPING[kaynak.tur] || 'kitap';

        const resource: ResourceSuggestion = {
          title: kaynak.isim || kaynak.baslik || `${ders.ders} - ${konu.konu}`,
          level: seviye,
          type: tur,
          description: kaynak.description || `${konu.konu} konusu için ${kaynak.tur.toLowerCase()} kaynağı`,
          priority: kaynak.priority || 3,
          publisher: kaynak.yayinevi || kaynak.kanal || 'Çeşitli',
          estimatedPrice: kaynak.estimatedPrice || 0,
          url: kaynak.link,
          subject: konu.konu,
          category: ders.kategori || 'TYT'
        };

        transformedData[dersAdi][seviye].push(resource);
      });
    });

    // Her seviye için kaynakları önceliğe göre sırala
    Object.keys(transformedData[dersAdi]).forEach(seviye => {
      transformedData[dersAdi][seviye as Level].sort((a, b) => b.priority - a.priority);
    });
  });

  return transformedData;
}

// Dönüştürülmüş veri yapısı
const ENHANCED_RESOURCE_DATABASE = transformEducationalData();

/**
 * Belirli bir ders ve seviye için kaynak önerilerini getirir
 */
export function getResourcesForSubject(
  subject: string, 
  level: Level, 
  period?: string
): ResourceSuggestion[] {
  // Önce yeni veri tabanından ara
  let resources = ENHANCED_RESOURCE_DATABASE[subject]?.[level] || [];
  
  // Eğer bulunamazsa, mevcut sistem kaynaklarını kullan
  if (resources.length === 0) {
    resources = getFallbackResources(subject, level);
  }
  
  // Eğer 'Eyl-Kas' dönemi ise sadece soru bankası ağırlıklı öner
  if (period === 'Eyl-Kas') {
    return resources
      .filter(r => r.type === 'soru_bankasi' || r.type === 'online_kurs')
      .sort((a, b) => b.priority - a.priority);
  }
  
  return resources.sort((a, b) => b.priority - a.priority);
}

/**
 * Fallback kaynak önerileri (mevcut sistem)
 */
function getFallbackResources(subject: string, level: Level): ResourceSuggestion[] {
  const fallbackMap: Record<string, Record<Level, ResourceSuggestion[]>> = {
    'Matematik': {
      baslangic: [
        {
          title: 'TYT Matematik Konu Anlatımı',
          level: 'baslangic',
          type: 'kitap',
          description: 'Temel konular ve örnek çözümler',
          priority: 5,
          publisher: 'Limit Yayınları',
          estimatedPrice: 45
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
    }
  };

  return fallbackMap[subject]?.[level] || [];
}

/**
 * Alanına göre öğrencinin çalışması gereken dersleri döner
 */
export function getSubjectsForField(field: Field): string[] {
  const subjectsByField: Record<Field, string[]> = {
    sayisal: ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Geometri'],
    esit: ['Matematik', 'Türkçe', 'Türk Dili ve Edebiyatı'],
    sozel: ['Türkçe', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'Felsefe', 'Mantık', 'Psikoloji', 'Sosyoloji', 'Din Kültürü ve Ahlak Bilgisi']
  };

  return subjectsByField[field] || [];
}

/**
 * Tüm mevcut dersleri getirir
 */
export function getAllSubjects(): string[] {
  return Object.keys(ENHANCED_RESOURCE_DATABASE);
}

/**
 * Belirli bir ders için mevcut konuları getirir
 */
export function getTopicsForSubject(subject: string): string[] {
  const dersData = educationalResourcesData.dersler.find(d => d.ders === subject);
  return dersData?.konular.map(k => k.konu) || [];
}

/**
 * Belirli bir konu için kaynakları getirir
 */
export function getResourcesForTopic(subject: string, topic: string, level?: Level): ResourceSuggestion[] {
  const dersData = educationalResourcesData.dersler.find(d => d.ders === subject);
  const konuData = dersData?.konular.find(k => k.konu === topic);
  
  if (!konuData) return [];

  return konuData.kaynaklar
    .filter(kaynak => !level || LEVEL_MAPPING[kaynak.seviye] === level)
    .map(kaynak => ({
      title: kaynak.isim || kaynak.baslik || `${subject} - ${topic}`,
      level: LEVEL_MAPPING[kaynak.seviye] || 'orta',
      type: RESOURCE_TYPE_MAPPING[kaynak.tur] || 'kitap',
      description: kaynak.description || `${topic} konusu için ${kaynak.tur.toLowerCase()} kaynağı`,
      priority: kaynak.priority || 3,
      publisher: kaynak.yayinevi || kaynak.kanal || 'Çeşitli',
      estimatedPrice: kaynak.estimatedPrice || 0,
      url: kaynak.link,
      subject: topic,
      category: dersData?.kategori || 'TYT'
    }))
    .sort((a, b) => b.priority - a.priority);
}

export { ENHANCED_RESOURCE_DATABASE };
