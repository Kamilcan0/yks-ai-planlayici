#!/usr/bin/env node

/**
 * Smoke Test Script for YKS Planlayıcı
 * 
 * Tests basic functionality without requiring external services.
 * Can be run in CI/CD pipelines and development environments.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Change to project root
process.chdir(path.join(__dirname, '..'))

console.log('🧪 Running YKS Planlayıcı Smoke Tests...\n')

let passed = 0
let failed = 0
let warnings = 0

function test(name, testFn) {
  try {
    process.stdout.write(`   ${name}... `)
    const result = testFn()
    if (result === true) {
      console.log('✅ PASS')
      passed++
    } else if (result === 'warning') {
      console.log('⚠️  WARN')
      warnings++
    } else {
      console.log('❌ FAIL')
      failed++
    }
  } catch (error) {
    console.log('❌ FAIL -', error.message)
    failed++
  }
}

// Test 1: Check if required files exist
console.log('📁 File Structure Tests:')
test('package.json exists', () => fs.existsSync('package.json'))
test('src directory exists', () => fs.existsSync('src'))
test('netlify functions exist', () => fs.existsSync('netlify/functions'))
test('tailwind.config.js exists', () => fs.existsSync('tailwind.config.js'))
test('index.html exists', () => fs.existsSync('index.html'))

// Test 2: Check schema and mock files
console.log('\n📄 Schema & Mock Tests:')
test('Plan JSON schema exists', () => fs.existsSync('schemas/plan.schema.json'))
test('Mock OpenAI response exists', () => fs.existsSync('mocks/openai_plan_response.json'))
test('DB schema mock exists', () => fs.existsSync('mocks/db_schema.json'))
test('OpenAI prompt template exists', () => fs.existsSync('functions/openai_prompt.txt'))

// Test 3: Validate JSON files
console.log('\n🔍 JSON Validation Tests:')
test('package.json is valid JSON', () => {
  const content = fs.readFileSync('package.json', 'utf8')
  JSON.parse(content)
  return true
})

test('Plan schema is valid JSON', () => {
  if (!fs.existsSync('schemas/plan.schema.json')) return 'warning'
  const content = fs.readFileSync('schemas/plan.schema.json', 'utf8')
  const schema = JSON.parse(content)
  return schema.$schema && schema.type === 'object'
})

test('Mock OpenAI response is valid', () => {
  if (!fs.existsSync('mocks/openai_plan_response.json')) return 'warning'
  const content = fs.readFileSync('mocks/openai_plan_response.json', 'utf8')
  const mock = JSON.parse(content)
  return mock.kullanıcı_ID && mock.haftalık_plan && Array.isArray(mock.haftalık_plan)
})

// Test 4: Check component files
console.log('\n⚛️  Component Tests:')
test('OnboardingModal component exists', () => fs.existsSync('src/components/OnboardingModal.tsx'))
test('PlanCard component exists', () => fs.existsSync('src/components/PlanCard.tsx'))
test('Header component exists', () => fs.existsSync('src/components/Header.tsx'))
test('AuthProvider exists', () => fs.existsSync('src/components/auth/AuthProvider.tsx'))
test('PlanGenerator exists', () => fs.existsSync('src/components/PlanGenerator.tsx'))

// Test 5: Check function files
console.log('\n⚡ Function Tests:')
test('generatePlan function exists', () => fs.existsSync('netlify/functions/generate-plan.js'))
test('user-profile function exists', () => fs.existsSync('netlify/functions/user-profile.js'))
test('user-progress function exists', () => fs.existsSync('netlify/functions/user-progress.js'))

// Test 6: Environment and config
console.log('\n⚙️  Configuration Tests:')
test('Environment example exists', () => fs.existsSync('.env.example'))
test('Netlify config exists', () => fs.existsSync('netlify.toml'))
test('Tailwind configured with Inter font', () => {
  const content = fs.readFileSync('tailwind.config.js', 'utf8')
  return content.includes('Inter')
})

// Test 7: Package.json scripts
console.log('\n📦 Package Scripts Tests:')
test('Has build script', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.scripts && pkg.scripts.build
})

test('Has dev script', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.scripts && pkg.scripts.dev
})

test('Has test script', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.scripts && pkg.scripts.test ? true : 'warning'
})

// Test 8: Dependencies
console.log('\n📚 Dependencies Tests:')
test('Has React dependency', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.dependencies && pkg.dependencies.react
})

test('Has Firebase dependency', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.dependencies && pkg.dependencies.firebase ? true : 'warning'
})

test('Has OpenAI dependency (functions)', () => {
  const content = fs.readFileSync('netlify/functions/generate-plan.js', 'utf8')
  return content.includes('require(\'openai\')')
})

// Test 9: Mock Mode functionality
console.log('\n🎭 Mock Mode Tests:')
test('generatePlan has mock mode', () => {
  const content = fs.readFileSync('netlify/functions/generate-plan.js', 'utf8')
  return content.includes('MOCK_MODE') && content.includes('generateMockPlan')
})

test('Mock plan has required fields', () => {
  if (!fs.existsSync('mocks/openai_plan_response.json')) return 'warning'
  const mock = JSON.parse(fs.readFileSync('mocks/openai_plan_response.json', 'utf8'))
  return mock.kullanıcı_ID && 
         mock.tarih && 
         mock.haftalık_plan && 
         mock.kaynak_önerileri &&
         Array.isArray(mock.haftalık_plan) &&
         Array.isArray(mock.kaynak_önerileri)
})

// Test 10: Test files
console.log('\n🧪 Test Files Tests:')
test('Has component tests', () => {
  return fs.existsSync('src/components/__tests__') || 
         fs.existsSync('src/__tests__') ? true : 'warning'
})

test('PlanCard test exists', () => {
  return fs.existsSync('src/components/__tests__/PlanCard.test.tsx') ? true : 'warning'
})

// Summary
console.log('\n' + '='.repeat(50))
console.log('📊 SMOKE TEST RESULTS:')
console.log(`✅ Passed: ${passed}`)
console.log(`⚠️  Warnings: ${warnings}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

if (failed === 0) {
  console.log('\n🎉 All critical tests passed! Project is ready for deployment.')
  
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warnings found. These are non-critical but should be addressed.`)
  }
  
  console.log('\n💡 Next steps:')
  console.log('   1. Set environment variables in Netlify dashboard')
  console.log('   2. Run: npm run build')
  console.log('   3. Deploy to Netlify')
  console.log('   4. Test with MOCK_MODE=true first, then add OpenAI key')
  
  process.exit(0)
} else {
  console.log(`\n💥 ${failed} critical tests failed. Please fix before deploying.`)
  process.exit(1)
}
