# YKS Haftalık Plan Üretici Modülü

> **Production-ready, TypeScript tabanlı YKS çalışma planı üretici modülü**

Bu modül, öğrenci bilgilerine göre **kural-tabanlı** haftalık çalışma programı üretir. İleride LLM tabanlı öneri motoru eklemeye uygun mimari ile tasarlanmıştır.

## 🚀 Hızlı Başlangıç

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Testleri çalıştır
npm test

# Coverage raporu al
npm run test:coverage
```

### Temel Kullanım

```typescript
import { generateWeekPlan } from '@/lib/plan-generator';

const plan = generateWeekPlan({
  field: 'sayisal',
  level: 'orta',
  studyDaysPerWeek: 6,
  weekStartDate: '2025-09-15',
  period: 'Eyl-Kas',
  customSessionDurationMinutes: 90
});

console.log(plan.weekPlan); // 7 günlük plan
console.log(plan.resourcesSuggested); // Kaynak önerileri
```

### React Hook ile Kullanım

```typescript
import { usePlanGenerator } from '@/lib/plan-generator';

function MyComponent() {
  const { plan, generate, isGenerating, error } = usePlanGenerator();

  const handleGenerate = async () => {
    try {
      await generate({
        field: 'esit',
        level: 'ileri',
        studyDaysPerWeek: 5
      });
    } catch (err) {
      console.error('Plan oluşturulamadı:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Oluşturuluyor...' : 'Plan Oluştur'}
      </button>
      
      {error && <div className="error">{error}</div>}
      {plan && <WeekView plan={plan} />}
    </div>
  );
}
```

## 📋 API Referansı

### `generateWeekPlan(params: GenerateParams): WeekPlanResult`

Ana plan üretici fonksiyon. Verilen parametrelere göre 7 günlük çalışma planı oluşturur.

#### Parametreler

```typescript
interface GenerateParams {
  field: 'sayisal' | 'esit' | 'sozel';           // Öğrenci alanı
  level: 'baslangic' | 'orta' | 'ileri';         // Seviye
  studyDaysPerWeek: number;                      // Çalışma günü (1-7)
  weekStartDate?: string;                        // ISO tarih (opsiyonel)
  period?: string;                               // Dönem ('Eyl-Kas')
  customSessionDurationMinutes?: number;         // Varsayılan: 90
  userPreferences?: {                            // Kullanıcı tercihleri
    preferMorning?: boolean;
    excludeSubjects?: string[];
  };
}
```

#### Dönüş Değeri

```typescript
interface WeekPlanResult {
  weekPlan: DayPlan[];                          // 7 günlük plan
  resourcesSuggested: Record<string, ResourceSuggestion[]>;
  warnings: string[];                           // Uyarılar
  meta: {
    generatedAt: string;                        // Oluşturma zamanı
    weekStartDate: string;                      // Hafta başlangıcı
    totalStudyHours: number;                    // Toplam saat
    averageHoursPerDay: number;                 // Günlük ortalama
  };
}
```

### `generateQuickPlan(field, level, days?): WeekPlanResult`

Hızlı plan oluşturma fonksiyonu.

```typescript
const quickPlan = generateQuickPlan('sayisal', 'orta', 5);
```

### `validateGeneratedPlan(plan): ValidationResult`

Oluşturulan planı doğrular.

```typescript
const validation = validateGeneratedPlan(plan);
if (!validation.isValid) {
  console.log('Hatalar:', validation.errors);
}
```

## 🎯 Kurallar ve Algoritma

### TYT/AYT Dağılımı

- **TYT/AYT aynı gün karıştırılmaz**
- Dönüşümlü: Pazartesi TYT, Salı AYT, vb.
- **Pazar = Tekrar günü** (veya dinlenme)

### Alan Bazlı Günlük Dağılım

#### Sayısal (4 blok/gün)
- **TYT günleri**: 2×Matematik + 1×Fen + 1×Türkçe
- **AYT günleri**: 2×Matematik + 1×Fizik + 1×Kimya

#### Eşit Ağırlık (4 blok/gün)
- **TYT günleri**: 2×Matematik + 1×Sosyal + 1×Türkçe
- **AYT günleri**: 1×Matematik + 1×Edebiyat + 1×Tarih + 1×Coğrafya

#### Sözel (4 blok/gün)
- **TYT günleri**: 2×Türkçe + 2×Sosyal
- **AYT günleri**: 1×Edebiyat + 1×Tarih + 1×Coğrafya + 1×Felsefe

### Zaman Slotları

Varsayılan 1.5 saatlik bloklar:
- 09:00-10:30
- 11:00-12:30
- 14:00-15:30
- 16:00-17:30

## 🔍 Örnekler

### Örnek 1: Sayısal Öğrenci (6 gün)

```typescript
const plan = generateWeekPlan({
  field: 'sayisal',
  level: 'orta',
  studyDaysPerWeek: 6,
  weekStartDate: '2025-09-15'
});

// Çıktı:
// Pazartesi (TYT): TYT Mat, TYT Mat, TYT Fen, TYT Türkçe
// Salı (AYT): AYT Mat, AYT Mat, AYT Fizik, AYT Kimya
// Çarşamba (TYT): TYT Mat, TYT Mat, TYT Fen, TYT Türkçe
// ...
// Pazar: Dinlenme
```

### Örnek 2: Eyl-Kas Dönemi (Soru Bankası Ağırlıklı)

```typescript
const plan = generateWeekPlan({
  field: 'esit',
  level: 'ileri',
  studyDaysPerWeek: 5,
  period: 'Eyl-Kas'  // Sadece soru bankası önerilir
});

console.log(plan.resourcesSuggested);
// Çıktı: Sadece 'soru_bankasi' tipindeki kaynaklar
```

### Örnek 3: Özel Tercihler

```typescript
const plan = generateWeekPlan({
  field: 'sayisal',
  level: 'baslangic',
  studyDaysPerWeek: 5,
  userPreferences: {
    preferMorning: true,
    excludeSubjects: ['AYT Biyoloji']
  }
});
```

## 🧪 Test Senaryoları

Modül kapsamlı Jest testleri ile test edilmiştir:

```bash
npm test
```

### Test Kapsamı

1. **Sayısal + 6 gün** → TYT/AYT dönüşümlü, her gün 4 blok
2. **Eşit Ağırlık + 5 gün** → Zorunlu bloklar sığdırılır, uyarı verilir
3. **Eyl-Kas dönemi** → Sadece soru bankası ağırlıklı kaynaklar
4. **Girdi-çıktı eşleşmesi** → JSON yapısı doğrulanır
5. **Hata durumları** → Geçersiz parametreler test edilir
6. **Validasyon** → Plan doğrulama fonksiyonu test edilir

## ⚡ Performans

- **Hafif**: Saf TypeScript, external bağımlılık yok
- **Hızlı**: O(1) plan üretimi
- **Memory-efficient**: Immutable yapılar
- **Type-safe**: Full TypeScript desteği

## 🔧 Konfigürasyon

### Ders Ayarları

```typescript
import { SUBJECT_CONFIGS } from '@/lib/plan-generator';

// Ders öncelik sıralarını değiştir
SUBJECT_CONFIGS.tyt_matematik.priority = 1;
SUBJECT_CONFIGS.ayt_fizik.minBlocksPerWeek = 3;
```

### Kaynak Veritabanı

```typescript
import { getResourcesForSubject } from '@/lib/plan-generator';

const mathResources = getResourcesForSubject('TYT Matematik', 'orta', 'Eyl-Kas');
console.log(mathResources); // Matematik için önerilen kaynaklar
```

## 🚨 Uyarı Sistemi

Plan üretimi sırasında çeşitli uyarılar verilir:

- `studyDaysPerWeek < 4` → "Çalışma günü sayısı yetersiz"
- `customSessionDurationMinutes > 120` → "Ders süresi çok uzun"
- Blok sıkıştırması → "Program sıkıştırıldı"

## 🔮 İleride Eklenecekler

### LLM Entegrasyonu

```typescript
// Gelecekte eklenecek
const llmPlan = generatePlanWithStrategy(params, strategies.llmBased);
```

### Strategi Pattern

```typescript
export const strategies = {
  ruleBased: generateWeekPlan,
  llmBased: generateLLMPlan,    // İleride eklenecek
  hybridBased: generateHybridPlan  // İleride eklenecek
};
```

## 📊 Utilities

### Plan Analizi

```typescript
import { utils } from '@/lib/plan-generator';

const totalHours = utils.calculateTotalHours(plan);
const completed = utils.calculateCompletedBlocks(plan);
const csvData = utils.exportToCSV(plan);
const comparison = utils.comparePlans(plan1, plan2);
```

### Validasyon Yardımcıları

```typescript
import { validators } from '@/lib/plan-generator';

const errors = validators.validateParams(params);
const quality = validators.assessPlanQuality(plan);

console.log('Plan kalitesi:', quality.score); // 0-100 arası
```

## 📱 React Bileşenleri

### WeekView Component

```typescript
import { WeekView } from '@/lib/plan-generator';

<WeekView 
  plan={plan}
  showStats={true}
  onBlockComplete={(dayIndex, blockId) => {
    console.log('Blok tamamlandı:', dayIndex, blockId);
  }}
/>
```

### Hook Özellikleri

- ✅ LocalStorage entegrasyonu
- ✅ Plan validation
- ✅ Export fonksiyonları
- ✅ İstatistik hesaplama
- ✅ Hata yönetimi

## 📄 Lisans

MIT License - Detaylar için `LICENSE` dosyasını kontrol edin.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek

Herhangi bir sorun veya öneriniz için lütfen issue açın.

---

**v1.0.0** - Production Ready ✨
