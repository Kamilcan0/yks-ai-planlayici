# 🚀 YKS Akıllı Asistanı - PWA Deploy Talimatları

## 📋 Ön Hazırlık

### 1️⃣ **Build Oluşturma**
```bash
# Web dizinine geç
cd web

# Bağımlılıkları kur
npm install

# Production build oluştur
npm run build

# Build test et (opsiyonel)
npm run preview
```

### 2️⃣ **İkon Oluşturma**
```bash
# İkon üretici sayfasını aç
open public/icons/create-svg-icons.html

# Tüm ikonları oluştur ve indir
# Dosyaları public/icons/ klasörüne yerleştir
```

---

## 🔥 **Firebase Hosting (Önerilen)**

### Kurulum
```bash
# Firebase CLI kur
npm install -g firebase-tools

# Firebase login
firebase login

# Proje başlat
firebase init hosting
```

### Konfigürasyon
1. `deploy/firebase.json` dosyasını proje köküne kopyala
2. Public directory: `dist`
3. Single-page app: `Yes`
4. Automatic builds: `No` (manuel deploy)

### Deploy
```bash
# Build oluştur
npm run build

# Deploy et
firebase deploy --only hosting

# Custom domain (opsiyonel)
firebase hosting:channel:deploy live --expires 1h
```

### Sonuç
- ✅ URL: `https://your-project.web.app`
- ✅ HTTPS otomatik
- ✅ CDN desteği
- ✅ Ücretsiz quota: 10GB/ay

---

## ⚡ **Vercel (En Hızlı)**

### Yöntem 1: CLI ile
```bash
# Vercel CLI kur
npm i -g vercel

# Deploy et
vercel

# Production deploy
vercel --prod
```

### Yöntem 2: GitHub ile
1. GitHub'a push et
2. [vercel.com](https://vercel.com) → Import project
3. Repository seç
4. Deploy

### Konfigürasyon
- `deploy/vercel.json` dosyasını proje köküne kopyala
- Build command: `npm run build`
- Output directory: `dist`

### Sonuç
- ✅ URL: `https://your-app.vercel.app`
- ✅ Otomatik deploy (GitHub push ile)
- ✅ Preview deployments
- ✅ Ücretsiz quota: 100GB/ay

---

## 🌐 **Netlify**

### Yöntem 1: Drag & Drop
1. `npm run build`
2. [netlify.com](https://netlify.com) → Sites
3. `dist` klasörünü sürükle-bırak

### Yöntem 2: GitHub ile
1. GitHub'a push et
2. Netlify → New site from Git
3. Repository seç
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Konfigürasyon
- `deploy/netlify.toml` dosyasını proje köküne kopyala

### Sonuç
- ✅ URL: `https://your-app.netlify.app`
- ✅ Form handling
- ✅ Edge functions
- ✅ Ücretsiz quota: 100GB/ay

---

## 📱 **PWA Test Listesi**

### ✅ **Temel PWA Özellikleri**
- [ ] Manifest.json doğru çalışıyor
- [ ] Service Worker aktif
- [ ] Offline sayfası görüntüleniyor
- [ ] İkonlar yükleniyor (192x192, 512x512)
- [ ] "Ana ekrana ekle" promptu çıkıyor

### ✅ **Mobile Test**
- [ ] Touch navigation çalışıyor
- [ ] Safe area padding doğru
- [ ] Keyboard sorunları yok
- [ ] Performance hızlı (3G'de <3s)

### ✅ **Notifications Test**
- [ ] Permission request çalışıyor
- [ ] Test notification gönderiliyor
- [ ] Scheduled notifications zamanında çalışıyor

---

## 🔧 **Environment Variables**

### Production için gerekli değişkenler:
```bash
# .env.production
VITE_APP_NAME="YKS Akıllı Asistanı"
VITE_APP_VERSION="1.0.0"
VITE_API_URL="https://your-api.com"
VITE_FIREBASE_CONFIG="{...}"
VITE_NOTIFICATION_VAPID_KEY="your-vapid-key"
```

---

## 📊 **Performance Optimizasyonu**

### Build size kontrol
```bash
# Bundle analyzer (opsiyonel)
npm install --save-dev vite-bundle-analyzer
npm run build -- --analyze
```

### CDN Optimizasyonu
- İkonları CDN'e yükle
- Büyük asset'leri compress et
- Lazy loading uygula

---

## 🌍 **Custom Domain**

### Firebase
```bash
firebase hosting:channel:deploy production
firebase hosting:sites:create your-domain.com
```

### Vercel
```bash
vercel domains add your-domain.com
```

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. DNS ayarları yap

---

## 📈 **Analytics ve Monitoring**

### Google Analytics 4
```javascript
// public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Performance Monitoring
- Lighthouse CI
- Web Vitals tracking
- Error monitoring (Sentry)

---

## 🔐 **Security Headers**

Netlify ve Vercel otomatik ekliyor, Firebase için:

```javascript
// firebase.json
"headers": [
  {
    "source": "**",
    "headers": [
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      },
      {
        "key": "X-Frame-Options", 
        "value": "DENY"
      }
    ]
  }
]
```

---

## 📱 **QR Code Paylaşım**

Deploy sonrası QR kod oluştur:

```bash
# qr-code generator
npx qrcode-terminal https://your-app.vercel.app
```

Ya da online tool kullan:
- [qr-code-generator.com](https://www.qr-code-generator.com)
- [qrcode.com](https://qrcode.com)

---

## ✅ **Deployment Checklist**

### Pre-Deploy
- [ ] Tests geçiyor (`npm test`)
- [ ] Build başarılı (`npm run build`)
- [ ] İkonlar hazır
- [ ] Manifest.json doğru
- [ ] Environment variables set

### Post-Deploy
- [ ] PWA install çalışıyor
- [ ] Offline mode test edildi
- [ ] Mobile responsive kontrol edildi
- [ ] Performance score >90 (Lighthouse)
- [ ] QR kod oluşturuldu

### Go Live
- [ ] Domain bağlandı
- [ ] Analytics kuruldu
- [ ] Error monitoring aktif
- [ ] Backup planı hazır

---

## 🎉 **Sonuç**

Deploy tamamlandıktan sonra kullanıcılar:

1. **Web**: `https://your-domain.com` adresinden erişebilir
2. **Mobile**: QR kod ile veya direkt link ile
3. **Install**: "Ana ekrana ekle" ile PWA olarak kurabilir
4. **Offline**: İnternet olmasa da temel özellikleri kullanabilir

**🚀 YKS Akıllı Asistanı artık tüm dünyada erişilebilir!**
