const OpenAI = require('openai')
const Ajv = require('ajv')

// JSON Schema for plan validation
const planSchema = {
  type: 'object',
  required: ['kullanıcı_ID', 'tarih', 'haftalık_plan', 'kaynak_önerileri'],
  properties: {
    kullanıcı_ID: { type: 'string' },
    tarih: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    haftalık_plan: {
      type: 'array',
      items: {
        type: 'object',
        required: ['gün', 'TYT', 'AYT'],
        properties: {
          gün: { type: 'string' },
          TYT: {
            type: 'array',
            items: {
              type: 'object',
              required: ['konu', 'soru_sayısı', 'süre_dakika', 'odak_konular', 'confidence'],
              properties: {
                konu: { type: 'string' },
                soru_sayısı: { type: 'number' },
                süre_dakika: { type: 'number' },
                odak_konular: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                not: { type: 'string' }
              }
            }
          },
          AYT: {
            type: 'array',
            items: {
              type: 'object',
              required: ['konu', 'soru_sayısı', 'süre_dakika', 'odak_konular', 'confidence'],
              properties: {
                konu: { type: 'string' },
                soru_sayısı: { type: 'number' },
                süre_dakika: { type: 'number' },
                odak_konular: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                not: { type: 'string' }
              }
            }
          }
        }
      }
    },
    kaynak_önerileri: {
      type: 'array',
      items: {
        type: 'object',
        required: ['konu', 'tip', 'isim', 'zorluk', 'beklenen_süre_dakika', 'öncelik'],
        properties: {
          konu: { type: 'string' },
          tip: { type: 'string', enum: ['kitap', 'video', 'soru_bankası', 'online_kaynak'] },
          isim: { type: 'string' },
          zorluk: { type: 'string', enum: ['kolay', 'orta', 'zor'] },
          beklenen_süre_dakika: { type: 'number' },
          öncelik: { type: 'number', minimum: 1, maximum: 5 },
          link: { type: 'string' },
          repeat_after_days: { type: 'number' }
        }
      }
    },
    ux_önerileri: {
      type: 'array',
      items: { type: 'string' }
    },
    adaptasyon_notları: { type: 'string' },
    confidence_overall: { type: 'number', minimum: 0, maximum: 1 }
  }
}

const ajv = new Ajv()
const validate = ajv.compile(planSchema)

// Mock plan generator for when OpenAI is not available
function generateMockPlan(userData) {
  const günler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const tytKonular = ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya']
  const aytKonular = userData.field === 'sayisal' 
    ? ['Matematik', 'Fizik', 'Kimya', 'Biyoloji']
    : userData.field === 'sozel'
    ? ['Edebiyat', 'Tarih-1', 'Coğrafya-1', 'Felsefe']
    : ['Matematik', 'Edebiyat', 'Tarih-1', 'Coğrafya-1']

  const haftalık_plan = günler.map(gün => ({
    gün,
    TYT: gün !== 'Pazar' ? [{
      konu: tytKonular[Math.floor(Math.random() * tytKonular.length)],
      soru_sayısı: Math.floor(Math.random() * 20) + 10,
      süre_dakika: Math.floor(Math.random() * 60) + 30,
      odak_konular: ['Temel kavramlar', 'Soru çözme teknikleri'],
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
      not: 'Sabit tempo ile çalış'
    }] : [],
    AYT: gün !== 'Pazar' && gün !== 'Cumartesi' ? [{
      konu: aytKonular[Math.floor(Math.random() * aytKonular.length)],
      soru_sayısı: Math.floor(Math.random() * 15) + 8,
      süre_dakika: Math.floor(Math.random() * 45) + 25,
      odak_konular: ['İleri seviye sorular', 'Zaman yönetimi'],
      confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
      not: 'Analitik düşünmeye odaklan'
    }] : []
  }))

  const kaynak_önerileri = [
    {
      konu: 'Matematik',
      tip: 'soru_bankası',
      isim: 'TYT Matematik Soru Bankası',
      zorluk: userData.seviye === 'başlangıç' ? 'kolay' : userData.seviye === 'orta' ? 'orta' : 'zor',
      beklenen_süre_dakika: 120,
      öncelik: 5,
      link: 'https://example.com/matematik-soru-bankasi',
      repeat_after_days: 3
    },
    {
      konu: 'Türkçe',
      tip: 'video',
      isim: 'TYT Türkçe Konu Anlatımları',
      zorluk: 'orta',
      beklenen_süre_dakika: 90,
      öncelik: 4,
      link: 'https://example.com/turkce-videolar',
      repeat_after_days: 7
    },
    {
      konu: 'Fen Bilimleri',
      tip: 'kitap',
      isim: 'TYT Fen Bilimleri Konu Kitabı',
      zorluk: userData.seviye === 'başlangıç' ? 'kolay' : 'orta',
      beklenen_süre_dakika: 150,
      öncelik: 3,
      link: 'https://example.com/fen-bilimleri-kitap',
      repeat_after_days: 14
    }
  ]

  return {
    kullanıcı_ID: userData.kullanıcı_ID,
    tarih: new Date().toISOString().split('T')[0],
    haftalık_plan,
    kaynak_önerileri,
    ux_önerileri: [
      'Planınızı takip etmek için günlük kontrol listesi kullanın',
      'Zorlandığınız konulara ekstra zaman ayırın',
      'Düzenli mola vererek veriminizi artırın'
    ],
    adaptasyon_notları: `${userData.seviye} seviyesine uygun ${userData.haftalık_saat} saatlik haftalık plan`,
    confidence_overall: 0.85
  }
}

// OpenAI plan generator
async function generateOpenAIPlan(userData, openai) {
  const systemPrompt = "You are an exam study plan generator. Produce exactly one JSON output matching the schema described. Do not add any prose."
  
  const userPrompt = `
Kullanıcı: ${userData.kullanıcı_ID}, seviye: ${userData.seviye}, haftalık_saat: ${userData.haftalık_saat}, hedef_tarih: ${userData.hedef_tarih}, alan: ${userData.field || 'sayisal'}, geçmiş_veriler: ${JSON.stringify(userData.tercihler || {})}

İstenen: Haftalık plan (günlere bölünmüş), her blok için konu, soru_sayısı, süre_dakika, odak_konular, kaynak_önerileri ve blok_confidence.
Ayrıca ux_önerileri, adaptasyon_notları ve kaynak_önerileri listesi oluştur.

IMPORTANT RULES:
1. TYT konuları: Matematik, Türkçe, Fizik, Kimya, Biyoloji, Tarih, Coğrafya
2. AYT konuları field'a göre:
   - sayisal: Matematik, Fizik, Kimya, Biyoloji
   - sozel: Edebiyat, Tarih-1, Coğrafya-1, Felsefe
   - ea: Matematik, Edebiyat, Tarih-1, Coğrafya-1
   - dil: İngilizce, Türkçe, Edebiyat
3. confidence değerleri 0.6-1.0 arasında olmalı
4. Adaptive Scheduler: haftalık saatlere göre optimize et
5. Spaced Repetition: repeat_after_days değerleri kullan (1,3,7,14 gün)
6. Sunday should be rest day (minimal study)

Zorunlu JSON schema: kullanıcı_ID (string), tarih (YYYY-MM-DD), haftalık_plan (array of days with TYT/AYT arrays), kaynak_önerileri (array).
Respond ONLY in valid JSON. If cannot, return { "error": "..." }.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content.trim()
    
    try {
      return JSON.parse(response)
    } catch (parseError) {
      console.error('OpenAI response parse error:', parseError)
      throw new Error('Invalid JSON response from OpenAI')
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

// Main function
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let requestBody
  try {
    requestBody = JSON.parse(event.body)
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON' })
    }
  }

  const { kullanıcı_ID, seviye, haftalık_saat, hedef_tarih, field, tercihler } = requestBody

  // Validate required fields
  if (!kullanıcı_ID || !seviye || !haftalık_saat || !hedef_tarih) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Missing required fields: kullanıcı_ID, seviye, haftalık_saat, hedef_tarih' 
      })
    }
  }

  const userData = {
    kullanıcı_ID,
    seviye,
    haftalık_saat,
    hedef_tarih,
    field: field || 'sayisal',
    tercihler: tercihler || {}
  }

  let plan
  const isMockMode = process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY

  try {
    if (isMockMode) {
      console.log('Using mock mode for plan generation')
      plan = generateMockPlan(userData)
    } else {
      console.log('Using OpenAI for plan generation')
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      
      try {
        plan = await generateOpenAIPlan(userData, openai)
      } catch (openaiError) {
        console.error('OpenAI failed, falling back to mock:', openaiError)
        plan = generateMockPlan(userData)
        plan.adaptasyon_notları += ' (AI geçici olarak kullanılamıyor, statik plan kullanıldı)'
      }
    }

    // Validate the generated plan
    const isValid = validate(plan)
    if (!isValid) {
      console.error('Plan validation failed:', validate.errors)
      // Generate fallback plan
      plan = generateMockPlan(userData)
      plan.adaptasyon_notları += ' (Plan doğrulama hatası, güvenli plan kullanıldı)'
    }

    // Log analytics
    console.log('Plan generated successfully:', {
      user_id: kullanıcı_ID,
      seviye,
      haftalık_saat,
      field,
      plan_confidence: plan.confidence_overall || 0.85,
      mock_mode: isMockMode
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        plan,
        mock_mode: isMockMode
      })
    }

  } catch (error) {
    console.error('Plan generation error:', error)
    
    // Last resort fallback
    const fallbackPlan = generateMockPlan(userData)
    fallbackPlan.adaptasyon_notları = 'Geçici teknik sorun nedeniyle basit plan oluşturuldu'
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        plan: fallbackPlan,
        warning: 'Fallback plan used due to technical issues',
        mock_mode: true
      })
    }
  }
}

