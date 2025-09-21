// Resource mapping for different levels and subjects
export interface ResourceMapping {
  [subject: string]: {
    [level: string]: {
      kitap: string[]
      video: string[]
      soru_bankası: string[]
      online_kaynak: string[]
    }
  }
}

export const RESOURCE_MAPPING: ResourceMapping = {
  "Matematik": {
    "başlangıç": {
      kitap: [
        "TYT Matematik Konu Anlatımı - Temel Seviye",
        "Matematik Temelleri - Başlangıç Seti",
        "YKS Matematik Başlangıç Rehberi"
      ],
      video: [
        "Matematik Temelleri Video Serisi",
        "TYT Matematik Konu Anlatımları",
        "Başlangıç Seviye Matematik Dersleri"
      ],
      soru_bankası: [
        "TYT Matematik Temel Soru Bankası",
        "Matematik Başlangıç Soruları",
        "Kolay Seviye TYT Matematik"
      ],
      online_kaynak: [
        "Khan Academy Matematik",
        "Matematik Oyunları Platformu",
        "İnteraktif Matematik Uygulaması"
      ]
    },
    "orta": {
      kitap: [
        "TYT Matematik Orta Seviye Soru Bankası",
        "AYT Matematik Konu Anlatımı",
        "Matematik Formül Kitabı"
      ],
      video: [
        "TYT-AYT Matematik Video Dersleri",
        "Matematik Soru Çözüm Teknikleri",
        "Matematik Stratejileri"
      ],
      soru_bankası: [
        "TYT Matematik Orta Seviye",
        "AYT Matematik Soru Bankası",
        "Matematik Karma Sorular"
      ],
      online_kaynak: [
        "Matematik Simülasyon Platformu",
        "Online Matematik Testleri",
        "Matematik Problem Çözücü"
      ]
    },
    "ileri": {
      kitap: [
        "İleri Seviye TYT Matematik",
        "AYT Matematik Üst Düzey Sorular",
        "Matematik Olimpiyat Soruları"
      ],
      video: [
        "İleri Matematik Teknikleri",
        "Zor Matematik Sorularının Çözümü",
        "Matematik Olimpiyat Hazırlığı"
      ],
      soru_bankası: [
        "En Zor TYT Matematik Soruları",
        "AYT Matematik İleri Seviye",
        "Matematik Denemeler"
      ],
      online_kaynak: [
        "Matematik Araştırma Platformu",
        "İleri Matematik Uygulamaları",
        "Matematik Teorisi Kaynakları"
      ]
    }
  },
  "Türkçe": {
    "başlangıç": {
      kitap: [
        "TYT Türkçe Temel Kavramlar",
        "Türkçe Dil Bilgisi Temelleri",
        "Türkçe Anlam Bilgisi"
      ],
      video: [
        "Türkçe Dil Bilgisi Videoları",
        "Türkçe Kelime Bilgisi",
        "Parça Anlama Teknikleri"
      ],
      soru_bankası: [
        "TYT Türkçe Temel Sorular",
        "Türkçe Başlangıç Soru Bankası",
        "Kolay Türkçe Soruları"
      ],
      online_kaynak: [
        "TDK Sözlük",
        "Türkçe Kelime Oyunları",
        "İnteraktif Türkçe Dersleri"
      ]
    },
    "orta": {
      kitap: [
        "TYT Türkçe Orta Seviye",
        "Türkçe Parça Çözümleme",
        "Türkçe Sözel Mantık"
      ],
      video: [
        "Türkçe Soru Çözüm Teknikleri",
        "Hızlı Okuma Yöntemleri",
        "Türkçe Stratejiler"
      ],
      soru_bankası: [
        "TYT Türkçe Orta Seviye Sorular",
        "Türkçe Karma Test",
        "Parça Soruları Bankası"
      ],
      online_kaynak: [
        "Online Türkçe Testleri",
        "Türkçe Kelime Hazinesi Uygulaması",
        "Hızlı Okuma Platformu"
      ]
    },
    "ileri": {
      kitap: [
        "İleri Seviye TYT Türkçe",
        "Türkçe Zor Parçalar",
        "Türkçe Edebiyat Bilgisi"
      ],
      video: [
        "Zor Türkçe Parçalarının Çözümü",
        "İleri Türkçe Teknikleri",
        "Edebiyat Tarihi"
      ],
      soru_bankası: [
        "En Zor TYT Türkçe Soruları",
        "Türkçe İleri Seviye Test",
        "Türkçe Denemeler"
      ],
      online_kaynak: [
        "Türk Dili ve Edebiyatı Arşivi",
        "İleri Türkçe Uygulamaları",
        "Klasik Türk Edebiyatı"
      ]
    }
  },
  "Fizik": {
    "başlangıç": {
      kitap: [
        "TYT Fizik Temelleri",
        "Fizik Temel Kavramlar",
        "Başlangıç Seviye Fizik"
      ],
      video: [
        "Fizik Temelleri Video Serisi",
        "TYT Fizik Konu Anlatımları",
        "Fizik Deneyleri"
      ],
      soru_bankası: [
        "TYT Fizik Temel Sorular",
        "Fizik Başlangıç Soru Bankası",
        "Kolay Fizik Soruları"
      ],
      online_kaynak: [
        "Fizik Simülasyonları",
        "İnteraktif Fizik Deneyleri",
        "Fizik Kavram Haritaları"
      ]
    },
    "orta": {
      kitap: [
        "TYT Fizik Orta Seviye",
        "AYT Fizik Konu Anlatımı",
        "Fizik Formül Kitabı"
      ],
      video: [
        "TYT-AYT Fizik Video Dersleri",
        "Fizik Soru Çözüm Teknikleri",
        "Modern Fizik Dersleri"
      ],
      soru_bankası: [
        "TYT Fizik Orta Seviye Sorular",
        "AYT Fizik Soru Bankası",
        "Fizik Karma Test"
      ],
      online_kaynak: [
        "Fizik Laboratuvarı Simülasyonu",
        "Online Fizik Testleri",
        "Fizik Problem Çözücü"
      ]
    },
    "ileri": {
      kitap: [
        "İleri Seviye TYT Fizik",
        "AYT Fizik Üst Düzey",
        "Fizik Olimpiyat Soruları"
      ],
      video: [
        "İleri Fizik Konuları",
        "Zor Fizik Sorularının Çözümü",
        "Fizik Olimpiyat Hazırlığı"
      ],
      soru_bankası: [
        "En Zor TYT Fizik Soruları",
        "AYT Fizik İleri Seviye",
        "Fizik Denemeler"
      ],
      online_kaynak: [
        "Fizik Araştırma Platformu",
        "İleri Fizik Uygulamaları",
        "Kuantum Fiziği Kaynakları"
      ]
    }
  },
  "Kimya": {
    "başlangıç": {
      kitap: [
        "TYT Kimya Temelleri",
        "Kimya Temel Kavramlar",
        "Atom ve Molekül Yapısı"
      ],
      video: [
        "Kimya Temelleri Video Serisi",
        "TYT Kimya Konu Anlatımları",
        "Kimya Deneyleri"
      ],
      soru_bankası: [
        "TYT Kimya Temel Sorular",
        "Kimya Başlangıç Soru Bankası",
        "Kolay Kimya Soruları"
      ],
      online_kaynak: [
        "Periyodik Tablo İnteraktif",
        "Kimya Molekül Görselleştirici",
        "Kimya Oyunları"
      ]
    },
    "orta": {
      kitap: [
        "TYT Kimya Orta Seviye",
        "AYT Kimya Konu Anlatımı",
        "Organik Kimya Temelleri"
      ],
      video: [
        "TYT-AYT Kimya Video Dersleri",
        "Organik Kimya Dersleri",
        "Kimya Reaksiyonları"
      ],
      soru_bankası: [
        "TYT Kimya Orta Seviye Sorular",
        "AYT Kimya Soru Bankası",
        "Organik Kimya Soruları"
      ],
      online_kaynak: [
        "Kimya Laboratuvarı Simülasyonu",
        "Molekül Modelleme Yazılımı",
        "Online Kimya Testleri"
      ]
    },
    "ileri": {
      kitap: [
        "İleri Seviye TYT Kimya",
        "AYT Kimya Üst Düzey",
        "İleri Organik Kimya"
      ],
      video: [
        "İleri Kimya Konuları",
        "Zor Kimya Sorularının Çözümü",
        "Kimya Olimpiyat Hazırlığı"
      ],
      soru_bankası: [
        "En Zor TYT Kimya Soruları",
        "AYT Kimya İleri Seviye",
        "Kimya Denemeler"
      ],
      online_kaynak: [
        "Kimya Araştırma Veritabanı",
        "İleri Kimya Uygulamaları",
        "Kimya Teorisi Kaynakları"
      ]
    }
  },
  "Biyoloji": {
    "başlangıç": {
      kitap: [
        "TYT Biyoloji Temelleri",
        "Hücre Biyolojisi Temelleri",
        "Temel Genetik"
      ],
      video: [
        "Biyoloji Temelleri Video Serisi",
        "Hücre Yapısı Animasyonları",
        "Genetik Temel Kavramları"
      ],
      soru_bankası: [
        "TYT Biyoloji Temel Sorular",
        "Biyoloji Başlangıç Soru Bankası",
        "Kolay Biyoloji Soruları"
      ],
      online_kaynak: [
        "Biyoloji Animasyon Platformu",
        "İnsan Anatomisi 3D",
        "Biyoloji Kavram Haritaları"
      ]
    },
    "orta": {
      kitap: [
        "TYT Biyoloji Orta Seviye",
        "AYT Biyoloji Konu Anlatımı",
        "Ekoloji ve Çevre"
      ],
      video: [
        "TYT-AYT Biyoloji Video Dersleri",
        "Ekoloji Belgeselleri",
        "Moleküler Biyoloji"
      ],
      soru_bankası: [
        "TYT Biyoloji Orta Seviye Sorular",
        "AYT Biyoloji Soru Bankası",
        "Ekoloji Soruları"
      ],
      online_kaynak: [
        "Virtual Biyoloji Laboratuvarı",
        "DNA Analiz Simülasyonu",
        "Online Biyoloji Testleri"
      ]
    },
    "ileri": {
      kitap: [
        "İleri Seviye TYT Biyoloji",
        "AYT Biyoloji Üst Düzey",
        "Moleküler Biyoloji İleri"
      ],
      video: [
        "İleri Biyoloji Konuları",
        "Zor Biyoloji Sorularının Çözümü",
        "Biyoloji Olimpiyat Hazırlığı"
      ],
      soru_bankası: [
        "En Zor TYT Biyoloji Soruları",
        "AYT Biyoloji İleri Seviye",
        "Biyoloji Denemeler"
      ],
      online_kaynak: [
        "Biyoloji Araştırma Veritabanı",
        "İleri Biyoloji Uygulamaları",
        "Biyoteknoloji Kaynakları"
      ]
    }
  }
}

export function getResourcesForSubject(
  subject: string, 
  level: string, 
  type?: string
): string[] {
  const subjectResources = RESOURCE_MAPPING[subject]
  if (!subjectResources) return []
  
  const levelResources = subjectResources[level]
  if (!levelResources) return []
  
  if (type && levelResources[type as keyof typeof levelResources]) {
    return levelResources[type as keyof typeof levelResources]
  }
  
  // Return all resources for the level
  return Object.values(levelResources).flat()
}

export function getAllSubjects(): string[] {
  return Object.keys(RESOURCE_MAPPING)
}

export function getLevels(): string[] {
  return ['başlangıç', 'orta', 'ileri']
}

export function getResourceTypes(): string[] {
  return ['kitap', 'video', 'soru_bankası', 'online_kaynak']
}

