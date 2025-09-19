# 🚀 YKS Akıllı Asistanı - GitHub Pages Deploy

## Hızlı Deploy Talimatları

### 1️⃣ Dist Klasörünü GitHub'a Upload Et

1. **GitHub'da yeni repo oluştur**: `yks-ai-assistant`
2. **Dist klasörünün içeriğini repo'ya yükle**:
   ```bash
   # Dist klasöründeki tüm dosyaları kopyala
   cp -r dist/* .
   
   # GitHub'a push et
   git add .
   git commit -m "Deploy YKS AI Assistant"
   git push origin main
   ```

### 2️⃣ GitHub Pages Aktifleştir

1. Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save

### 3️⃣ Alternatif: Netlify Drop

1. [netlify.com](https://netlify.com) → Sites
2. "Drag and drop your site folder here"
3. `dist` klasörünü sürükle-bırak
4. Site otomatik yayınlanır

## 📱 Erişim URL'leri

Deploy sonrası URL'ler:
- **GitHub Pages**: `https://username.github.io/yks-ai-assistant`
- **Netlify**: `https://random-name.netlify.app`

## ✅ Test Listesi

Deploy sonrası kontrol et:
- [ ] Ana sayfa yükleniyor
- [ ] PWA özellikler çalışıyor
- [ ] Mobile responsive
- [ ] AI asistan aktif
- [ ] Offline mod çalışıyor

## 🔗 QR Kod

Deploy sonrası URL'i al ve `deploy/qr-generator.html` ile QR kod oluştur.

**🎉 YKS Akıllı Asistanı artık canlı!**
