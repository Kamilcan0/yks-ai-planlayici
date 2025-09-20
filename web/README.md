# YKS Planlayıcı - AI Destekli Çalışma Programı

Yapay zeka destekli kişiselleştirilmiş YKS çalışma planlayıcısı. TYT ve AYT için adaptif öğrenme algoritması, spaced repetition ve confidence scoring ile maksimum verimlilik sağlar.

## 🚀 Özellikler

### 🤖 AI Entegrasyonu
- **OpenAI GPT-3.5** ile plan oluşturma
- **Adaptive Scheduler**: Haftalık saatlere göre optimizasyon
- **Spaced Repetition**: Bilimsel tekrar aralıkları
- **Confidence Scoring**: AI güven seviyesi ile konu önceliklendirme
- **Mock Mode**: API anahtarı olmadan test edebilme

### 👥 Kullanıcı Yönetimi
- **Firebase Auth**: Google ve e-posta ile giriş
- **Guest Mode**: Kayıt olmadan kullanım
- **Onboarding**: Adım adım profil oluşturma
- **Profil Yönetimi**: Seviye, alan, hedef tarih ayarlama

### 📚 Plan Özellikleri
- **Kişiselleştirilmiş Planlar**: Seviye ve alan bazında
- **TYT/AYT Ayrımı**: Alan bazında ders dağılımı
- **İnteraktif PlanCard**: Genişletilir/daraltılır detay görünümü
- **Progress Tracking**: Blok bazında tamamlanma takibi
- **Kaynak Önerileri**: Kitap, video, soru bankası tavsiyeleri

### 🎨 UI/UX
- **Modern Tasarım**: TailwindCSS ile responsive
- **Dark/Light Mode**: Kullanıcı tercihi
- **Animasyonlar**: Framer Motion ile
- **Mobile-First**: Telefon dostu tasarım
- **Inter Font**: Google Fonts entegrasyonu

### 📊 Analitik & Test
- **A/B Testing**: Kullanıcı deneyimi optimizasyonu
- **Telemetry**: Performans ve kullanım izleme
- **Jest Testing**: Kapsamlı test coverage
- **Mock Data**: Test için örnek veri

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Framer Motion** (animations)
- **Zustand** (state management)
- **Radix UI** (components)

### Backend
- **Netlify Functions** (serverless)
- **Node.js** + **Express**
- **OpenAI API**
- **Firebase/Firestore**
- **Ajv** (JSON validation)

### DevOps
- **GitHub Actions** (CI/CD)
- **Netlify** (hosting)
- **Jest** (testing)
- **ESLint** (linting)

## 🚀 Kurulum

### 1. Repository'yi klonla
\`\`\`bash
git clone https://github.com/your-username/yks-planlayici.git
cd yks-planlayici/web
\`\`\`

### 2. Bağımlılıkları yükle
\`\`\`bash
npm install
\`\`\`

### 3. Environment variables ayarla
\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` dosyasını düzenle:
\`\`\`env
# OpenAI (opsiyonel - yoksa mock mode aktif)
OPENAI_API_KEY=your_openai_api_key_here

# Mock Mode
MOCK_MODE=false

# Firebase (opsiyonel - guest mode için)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
\`\`\`

### 4. Development server başlat
\`\`\`bash
npm run dev
\`\`\`

Uygulama http://localhost:5173 adresinde çalışacak.

## 🧪 Test Etme

### Unit testleri çalıştır
\`\`\`bash
npm run test
\`\`\`

### Coverage raporu
\`\`\`bash
npm run test:coverage
\`\`\`

### E2E testler (opsiyonel)
\`\`\`bash
npm run test:e2e
\`\`\`

## 📦 Production Build

### 1. Build oluştur
\`\`\`bash
npm run build
\`\`\`

### 2. Preview
\`\`\`bash
npm run preview
\`\`\`

### 3. Netlify'a deploy
\`\`\`bash
# Otomatik (GitHub push ile)
git push origin main

# Manuel
netlify deploy --prod --dir=dist
\`\`\`

## 🔧 Environment Variables

### Gerekli Variables (Netlify Dashboard'da ayarla)

#### OpenAI (AI özellikleri için)
- \`OPENAI_API_KEY\`: OpenAI API anahtarı

#### Firebase (auth için)
- \`VITE_FIREBASE_API_KEY\`
- \`VITE_FIREBASE_AUTH_DOMAIN\`
- \`VITE_FIREBASE_PROJECT_ID\`
- \`VITE_FIREBASE_STORAGE_BUCKET\`
- \`VITE_FIREBASE_MESSAGING_SENDER_ID\`
- \`VITE_FIREBASE_APP_ID\`

#### Opsiyonel
- \`MOCK_MODE=true\`: AI olmadan test modu
- \`NETLIFY_AUTH_TOKEN\`: Otomatik deploy için
- \`NETLIFY_SITE_ID\`: Site ID

## 📝 API Endpoints

### \`/api/generate-plan\`
**POST** - AI destekli plan oluşturma
\`\`\`json
{
  "kullanıcı_ID": "user123",
  "seviye": "orta",
  "haftalık_saat": 25,
  "hedef_tarih": "2024-06-15",
  "field": "sayisal"
}
\`\`\`

### \`/api/user-profile/:id\`
**GET/POST/PUT** - Kullanıcı profil yönetimi

### \`/api/user-progress/:id\`
**POST/GET** - Progress tracking

## 🎯 Kullanım Senaryoları

### 1. Yeni Kullanıcı
1. Siteye giriş
2. "Misafir olarak devam et" veya hesap oluştur
3. Onboarding: ad, seviye, haftalık saat, hedef tarih, alan
4. AI plan oluşturma
5. Plan takibi

### 2. Mevcut Kullanıcı
1. Giriş yap
2. Dashboard'da progress görüntüle
3. Yeni plan oluştur veya mevcut planı güncelle
4. Progress kaydet

### 3. Guest Kullanıcı
1. "Misafir olarak devam et"
2. Tüm özellikler localStorage ile
3. İsteğe bağlı hesap oluşturma

## 🔍 Acceptance Criteria

- [x] Onboarding modal çıkıyor ilk açılışta (guest/localStorage fallback)
- [x] Yeni kullanıcı profile DB'ye kaydediliyor (ve GET ile çekilebiliyor)
- [x] "Plan Oluştur" sonrası /api/generate-plan çağrılıyor ve JSON valid plan döndürülüyor
- [x] PlanCard collapse/expand ve tamamlandı toggle çalışıyor
- [x] Progress backend'e POST ediyor
- [x] OpenAI çağrısı başarısızsa fallback statik plan gösteriyor
- [x] Responsive tasarım ve lazy loading
- [x] Netlify deploy konfigürasyonu

## 📊 Performans Optimizasyonları

### Frontend
- **Lazy Loading**: Resimler ve bileşenler
- **Code Splitting**: Route bazında
- **Critical CSS**: Inline styles
- **Font Optimization**: Inter preload
- **Image Optimization**: WebP format

### Backend
- **Serverless Functions**: Netlify Edge
- **Caching**: API responses
- **Rate Limiting**: Abuse prevention
- **Error Handling**: Graceful degradation

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open Pull Request

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Sorun Giderme

### Mock Mode Aktif
- \`OPENAI_API_KEY\` environment variable'ı kontrol et
- Netlify Dashboard'da variable'lar ayarlı mı?

### Firebase Auth Çalışmıyor
- Firebase config kontrol et
- Guest mode ile test et

### Build Hatası
- Node version 18+ kullandığından emin ol
- \`node_modules\` sil ve \`npm install\` yap

### Deploy Problemi
- Environment variables Netlify'da ayarlı mı?
- Build logs kontrol et

## 📞 İletişim

- **Website**: https://symphonious-druid-2fda91.netlify.app/
- **GitHub**: https://github.com/your-username/yks-planlayici
- **Email**: support@kfmatematik.com

---

**kfmatematik** ile YKS hedefinize ulaşın! 🎯

