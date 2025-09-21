# YKS AI Assistant - Deployment Guide

Bu rehber, YKS AI Assistant uygulamasının production ortamına deploy edilmesi için gerekli adımları içermektedir.

## 🔧 Teknoloji Yığını

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-4
- **Hosting**: Netlify

## 📋 Deploy Öncesi Hazırlık

### 1. Supabase Proje Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase_schema.sql` dosyasını çalıştırın
4. Settings > API'den aşağıdaki bilgileri alın:
   - Project URL
   - anon public key
   - service_role key (gizli)

### 2. OpenAI API Kurulumu

1. [OpenAI](https://openai.com) hesabı oluşturun
2. API key oluşturun (ücretli hesap gerekli)
3. Usage limits ayarlayın

### 3. Environment Variables

Aşağıdaki environment variable'ları hazır bulundurun:

#### Frontend (VITE_ prefix)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_ENV=production
```

#### Backend (Netlify Functions)
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

## 🚀 Netlify Deployment

### Otomatik Deploy (Önerilen)

1. **GitHub Repository Hazırlama**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Netlify'da Site Oluşturma**
   - [Netlify](https://app.netlify.com) hesabınıza giriş yapın
   - "New site from Git" tıklayın
   - GitHub repository'nizi seçin
   - Build ayarları:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Base directory: `web`

3. **Environment Variables Ayarlama**
   - Site Settings > Environment variables
   - Yukarıdaki tüm environment variable'ları ekleyin

4. **Domain Ayarları**
   - Site Settings > Domain management
   - Custom domain ekleyin (opsiyonel)
   - HTTPS otomatik olarak aktif edilir

### Manuel Deploy

```bash
# Proje dizinine gidin
cd web

# Dependencies yükleyin
npm install

# Production build oluşturun
npm run build

# Netlify CLI ile deploy edin
npx netlify deploy --prod --dir=dist
```

## 🔐 Güvenlik Ayarları

### 1. Supabase RLS (Row Level Security)

RLS politikaları otomatik olarak aktif edilmiştir. Kullanıcılar sadece kendi verilerine erişebilir.

### 2. API Key Güvenliği

- OpenAI API key'i sadece backend'de kullanılır
- Service role key asla frontend'de expose edilmez
- Environment variables Netlify dashboard'da güvenli saklanır

### 3. CORS Ayarları

Netlify functions otomatik olarak CORS header'ları döner.

## 📊 Monitoring ve Analytics

### 1. Health Check

Uygulama health check endpoint'i sunar:
```
GET /.netlify/functions/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "services": {
    "api": "operational",
    "database": "configured",
    "ai": "configured"
  }
}
```

### 2. Netlify Analytics

- Site Settings > Analytics'ten aktif edin
- Performance metrics otomatik takip edilir

### 3. Error Tracking

Netlify Functions logları otomatik olarak kaydedilir:
- Functions > View functions logs

## 🧪 Testing

### Production Öncesi Testler

```bash
# Unit testler
npm run test

# Integration testler
npm run test:integration

# Build test
npm run build

# Type checking
npm run type-check
```

### Smoke Test

```bash
# Health check
curl https://your-app.netlify.app/.netlify/functions/health

# Plan generation test
curl -X POST https://your-app.netlify.app/.netlify/functions/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","level":"intermediate","weekly_hours":20}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Working**
   - Netlify dashboard'da doğru şekilde set edildiğini kontrol edin
   - Redeploy yapın

3. **Supabase Connection Error**
   - URL ve key'lerin doğru olduğunu kontrol edin
   - RLS politikalarının aktif olduğunu doğrulayın

4. **OpenAI API Errors**
   - API key'in geçerli olduğunu kontrol edin
   - Rate limiting olup olmadığını kontrol edin
   - MOCK_MODE=true yapıp test edin

### Logs

```bash
# Netlify CLI ile logları takip edin
netlify logs:function generate-plan

# Browser console'da network sekmesini kontrol edin
# React DevTools kullanın
```

## 📈 Performance Optimization

### 1. Frontend

- Vite otomatik code splitting yapar
- Images lazy loading ile yüklenir
- Tailwind CSS otomatik purge edilir

### 2. Backend

- Netlify Functions edge'de çalışır
- OpenAI response'ları cache edilebilir
- Database connection pooling Supabase'de aktif

### 3. Monitoring

```bash
# Bundle analyzer
npm run build:analyze

# Performance metrics
npm run lighthouse
```

## 🔄 Updates

### Güncelleme Süreci

1. Development'ta test edin
2. GitHub'a push yapın
3. Netlify otomatik deploy eder
4. Health check yapın
5. Smoke test çalıştırın

### Rollback

```bash
# Netlify dashboard'da previous deployment'a dönün
# Ya da CLI ile:
netlify rollback
```

## 📞 Support

Herhangi bir sorun yaşarsanız:

1. Logs'ları kontrol edin
2. Health endpoint'ini test edin
3. Environment variables'ları doğrulayın
4. Community support kullanın

---

✅ **Deployment Checklist**

- [ ] Supabase proje kuruldu
- [ ] Schema çalıştırıldı
- [ ] OpenAI API key alındı
- [ ] Environment variables set edildi
- [ ] GitHub repository hazırlandı
- [ ] Netlify site oluşturuldu
- [ ] Domain ayarlandı (opsiyonel)
- [ ] Health check test edildi
- [ ] Smoke test çalıştırıldı
- [ ] Analytics aktif edildi

🎉 **Başarılı deployment sonrası uygulamanız hazır!**
