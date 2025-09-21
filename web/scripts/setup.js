#!/usr/bin/env node

/**
 * 🚀 YKS Plan Setup Script
 * Projeyi ilk kurulum için otomatik setup yapar
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`)
}

async function checkRequirements() {
  log.title('Sistem Gereksinimleri Kontrol Ediliyor')
  
  // Node.js version check
  const nodeVersion = process.version
  const nodeMajor = parseInt(nodeVersion.substring(1).split('.')[0])
  
  if (nodeMajor < 18) {
    log.error(`Node.js 18+ gerekli! Mevcut: ${nodeVersion}`)
    process.exit(1)
  }
  
  log.success(`Node.js ${nodeVersion} - OK`)
  
  // npm check
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    log.success(`npm ${npmVersion} - OK`)
  } catch (error) {
    log.error('npm bulunamadı!')
    process.exit(1)
  }
  
  // Git check
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim()
    log.success(`${gitVersion} - OK`)
  } catch (error) {
    log.error('Git bulunamadı!')
    process.exit(1)
  }
}

function createEnvFile() {
  log.title('Environment Variables Setup')
  
  const envPath = path.join(__dirname, '..', '.env')
  const envExamplePath = path.join(__dirname, '..', 'env.example')
  
  if (fs.existsSync(envPath)) {
    log.warning('.env dosyası zaten mevcut')
    return
  }
  
  if (!fs.existsSync(envExamplePath)) {
    log.error('env.example dosyası bulunamadı!')
    return
  }
  
  // Copy env.example to .env
  const envContent = fs.readFileSync(envExamplePath, 'utf8')
  fs.writeFileSync(envPath, envContent)
  
  log.success('.env dosyası oluşturuldu')
  log.warning('Lütfen .env dosyasını açıp API anahtarlarınızı ekleyin:')
  log.info('- VITE_OPENAI_API_KEY')
  log.info('- VITE_SUPABASE_URL') 
  log.info('- VITE_SUPABASE_ANON_KEY')
}

function installDependencies() {
  log.title('Dependencies Yükleniyor')
  
  try {
    log.info('npm install çalıştırılıyor...')
    execSync('npm install', { stdio: 'inherit' })
    log.success('Dependencies başarıyla yüklendi')
  } catch (error) {
    log.error('Dependencies yüklenemedi!')
    process.exit(1)
  }
}

function runInitialChecks() {
  log.title('İlk Kontroller Yapılıyor')
  
  try {
    log.info('TypeScript kontrol ediliyor...')
    execSync('npx tsc --noEmit', { stdio: 'inherit' })
    log.success('TypeScript - OK')
  } catch (error) {
    log.warning('TypeScript hataları var, düzeltilmesi öneriliyor')
  }
  
  try {
    log.info('Linting kontrol ediliyor...')
    execSync('npm run lint', { stdio: 'inherit' })
    log.success('Linting - OK')
  } catch (error) {
    log.warning('Linting hataları var, düzeltilmesi öneriliyor')
  }
}

function createGitHooks() {
  log.title('Git Hooks Kuruluyor')
  
  const hooksDir = path.join(__dirname, '..', '..', '.git', 'hooks')
  
  if (!fs.existsSync(hooksDir)) {
    log.warning('Git repository bulunamadı, hooks kurulmayacak')
    return
  }
  
  // Pre-commit hook
  const preCommitHook = `#!/bin/sh
# YKS Plan pre-commit hook

echo "🔍 Pre-commit checks çalıştırılıyor..."

cd web

# Lint check
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting hataları var!"
  exit 1
fi

# TypeScript check
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript hataları var!"
  exit 1
fi

echo "✅ Pre-commit checks başarılı"
exit 0
`
  
  const preCommitPath = path.join(hooksDir, 'pre-commit')
  fs.writeFileSync(preCommitPath, preCommitHook, { mode: 0o755 })
  
  log.success('Git pre-commit hook kuruldu')
}

function showNextSteps() {
  log.title('Setup Tamamlandı! 🎉')
  
  console.log(`${colors.bright}📋 Sonraki Adımlar:${colors.reset}
  
1. ${colors.yellow}Environment Variables:${colors.reset}
   - .env dosyasını açın
   - API anahtarlarınızı ekleyin
   
2. ${colors.yellow}Geliştirme Sunucusu:${colors.reset}
   ${colors.cyan}npm run dev${colors.reset}
   
3. ${colors.yellow}Supabase Database:${colors.reset}
   - Supabase projenizi oluşturun
   - SQL script'lerini çalıştırın:
     * ../supabase_schema.sql
     * ../supabase_educational_resources_schema.sql
   
4. ${colors.yellow}Test:${colors.reset}
   ${colors.cyan}npm test${colors.reset}
   
5. ${colors.yellow}Production Build:${colors.reset}
   ${colors.cyan}npm run build${colors.reset}
   
6. ${colors.yellow}Deploy:${colors.reset}
   ${colors.cyan}../deploy.sh${colors.reset}

${colors.bright}🔗 Faydalı Linkler:${colors.reset}
- OpenAI API: https://platform.openai.com/api-keys
- Supabase: https://app.supabase.com
- Netlify: https://app.netlify.com
- Vercel: https://vercel.com

${colors.bright}📚 Dokümantasyon:${colors.reset}
- README.md - Genel bilgiler
- CONTRIBUTING.md - Katkıda bulunma rehberi
- API_ENTEGRASYONU.md - API entegrasyonu

${colors.green}🎯 YKS Plan development environment hazır! 🚀${colors.reset}`)
}

async function main() {
  try {
    console.log(`${colors.bright}${colors.magenta}
╔═══════════════════════════════════════╗
║           YKS Plan Setup              ║
║     AI-Powered Study Planner         ║
╚═══════════════════════════════════════╝
${colors.reset}`)
    
    await checkRequirements()
    createEnvFile()
    installDependencies()
    runInitialChecks()
    createGitHooks()
    showNextSteps()
    
  } catch (error) {
    log.error(`Setup sırasında hata: ${error.message}`)
    process.exit(1)
  }
}

main()
