#!/bin/bash

# 🚀 YKS Plan Deployment Script
# Bu script projeyi production'a deploy eder

echo "🚀 YKS Plan Deployment başlatılıyor..."

# Gerekli ortam kontrolü
echo "📋 Gereksinimler kontrol ediliyor..."

# Node.js version check
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı! Lütfen Node.js 18+ yükleyin."
    exit 1
fi

NODE_VERSION=$(node -v | cut -c 2-3)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ gerekli! Mevcut versiyon: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) - OK"

# npm check
if ! command -v npm &> /dev/null; then
    echo "❌ npm bulunamadı!"
    exit 1
fi

echo "✅ npm $(npm -v) - OK"

# Git check
if ! command -v git &> /dev/null; then
    echo "❌ Git bulunamadı!"
    exit 1
fi

echo "✅ Git $(git --version) - OK"

# Environment variables check
if [ ! -f "web/.env" ]; then
    echo "❌ web/.env dosyası bulunamadı!"
    echo "📝 Lütfen web/.env.example dosyasını kopyalayıp API anahtarlarınızı ekleyin."
    exit 1
fi

echo "✅ Environment variables - OK"

# Dependencies yükleme
echo "📦 Dependencies yükleniyor..."
cd web
npm ci

if [ $? -ne 0 ]; then
    echo "❌ Dependencies yüklenemedi!"
    exit 1
fi

echo "✅ Dependencies yüklendi"

# Linting kontrolü
echo "🔍 Code quality kontrol ediliyor..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Linting hataları bulundu! Lütfen düzeltin."
    exit 1
fi

echo "✅ Linting - OK"

# Type checking
echo "🔍 TypeScript kontrol ediliyor..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ TypeScript hataları bulundu! Lütfen düzeltin."
    exit 1
fi

echo "✅ TypeScript - OK"

# Tests çalıştırma
echo "🧪 Tests çalıştırılıyor..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests başarısız! Lütfen düzeltin."
    exit 1
fi

echo "✅ Tests - OK"

# Production build
echo "🏗️ Production build oluşturuluyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo "✅ Build tamamlandı"

# Build size kontrolü
BUILD_SIZE=$(du -sh dist/ | cut -f1)
echo "📦 Build boyutu: $BUILD_SIZE"

# Git commit kontrolü
cd ..
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Commit edilmemiş değişiklikler var!"
    echo "📝 Önce tüm değişiklikleri commit etmelisiniz."
    git status
    exit 1
fi

echo "✅ Git durumu temiz"

# Deploy seçenekleri
echo ""
echo "🚀 Deploy seçenekleriniz:"
echo "1. Netlify Deploy"
echo "2. Vercel Deploy"
echo "3. GitHub Pages Deploy"
echo "4. Manual Deploy (sadece build)"
echo ""

read -p "Seçiminizi yapın (1-4): " choice

case $choice in
    1)
        echo "🌐 Netlify deploy..."
        if command -v netlify &> /dev/null; then
            cd web
            netlify deploy --prod --dir=dist
            echo "✅ Netlify deploy tamamlandı!"
            echo "🔗 Site URL: https://yksplan.netlify.app"
        else
            echo "❌ Netlify CLI bulunamadı!"
            echo "📝 Kurulum: npm install -g netlify-cli"
        fi
        ;;
    2)
        echo "▲ Vercel deploy..."
        if command -v vercel &> /dev/null; then
            cd web
            vercel --prod
            echo "✅ Vercel deploy tamamlandı!"
        else
            echo "❌ Vercel CLI bulunamadı!"
            echo "📝 Kurulum: npm install -g vercel"
        fi
        ;;
    3)
        echo "📄 GitHub Pages deploy..."
        cd web
        npm run build
        
        # GitHub Pages için setup
        echo "📝 GitHub Pages setup talimatları:"
        echo "1. GitHub repository Settings > Pages bölümüne gidin"
        echo "2. Source: Deploy from a branch seçin"
        echo "3. Branch: gh-pages seçin"
        echo "4. Save'e tıklayın"
        echo ""
        echo "📦 Build dosyaları hazır: web/dist/"
        ;;
    4)
        echo "📦 Manual deploy - Build tamamlandı!"
        echo "📁 Build dosyaları: web/dist/"
        echo "🔗 Bu dosyaları hosting servisinize yükleyebilirsiniz."
        ;;
    *)
        echo "❌ Geçersiz seçim!"
        exit 1
        ;;
esac

# Post-deploy kontrolü
echo ""
echo "🎉 Deploy işlemi tamamlandı!"
echo ""
echo "📋 Post-deploy checklist:"
echo "✅ Build başarılı"
echo "✅ Tests geçti"
echo "✅ Linting temiz"
echo "✅ TypeScript hatasız"
echo ""
echo "🔧 Sonraki adımlar:"
echo "1. Site URL'nizi test edin"
echo "2. Environment variables'ları kontrol edin"
echo "3. Analytics setup yapın"
echo "4. SEO kontrolleri yapın"
echo ""
echo "📊 Site monitoring:"
echo "- Google Analytics"
echo "- Google Search Console"
echo "- Netlify Analytics (Netlify kullanıyorsanız)"
echo ""
echo "🎯 YKS Plan başarıyla deploy edildi! 🚀"
