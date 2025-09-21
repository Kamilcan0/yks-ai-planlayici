const OpenAI = require('openai')
const Ajv = require('ajv')

// JSON Schema for plan validation
const planSchema = {
  type: 'object',
  required: ['user_id', 'plan_date', 'schedule', 'resources'],
  properties: {
    user_id: { type: 'string' },
    plan_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    week_number: { type: 'number', minimum: 1 },
    schedule: {
      type: 'array',
      items: {
        type: 'object',
        required: ['day', 'subjects'],
        properties: {
          day: { type: 'string' },
          subjects: {
            type: 'array',
            items: {
              type: 'object',
              required: ['subject', 'question_count', 'duration_minutes', 'focus_topics', 'confidence'],
              properties: {
                subject: { type: 'string' },
                question_count: { type: 'number' },
                duration_minutes: { type: 'number' },
                focus_topics: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                type: { type: 'string', enum: ['TYT', 'AYT'] },
                notes: { type: 'string' }
              }
            }
          }
        }
      }
    },
    resources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['subject', 'type', 'title', 'difficulty', 'estimated_time_minutes', 'priority'],
        properties: {
          subject: { type: 'string' },
          type: { type: 'string', enum: ['book', 'video', 'question_bank', 'online_resource'] },
          title: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          estimated_time_minutes: { type: 'number' },
          priority: { type: 'number', minimum: 1, maximum: 5 },
          url: { type: 'string' },
          repeat_after_days: { type: 'number' }
        }
      }
    },
    tips: {
      type: 'array',
      items: { type: 'string' }
    },
    notes: { type: 'string' },
    confidence_score: { type: 'number', minimum: 0, maximum: 1 }
  }
}

const ajv = new Ajv()
const validate = ajv.compile(planSchema)

// Mock plan generator for when OpenAI is not available
function generateMockPlan(userData) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const tytSubjects = ['Mathematics', 'Turkish', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography']
  const aytSubjects = userData.field === 'science' 
    ? ['Mathematics', 'Physics', 'Chemistry', 'Biology']
    : userData.field === 'social'
    ? ['Literature', 'History-1', 'Geography-1', 'Philosophy']
    : ['Mathematics', 'Literature', 'History-1', 'Geography-1']

  const schedule = days.map(day => ({
    day,
    subjects: day !== 'Sunday' ? [
      {
        subject: tytSubjects[Math.floor(Math.random() * tytSubjects.length)],
        question_count: Math.floor(Math.random() * 20) + 10,
        duration_minutes: Math.floor(Math.random() * 60) + 30,
        focus_topics: ['Basic concepts', 'Problem solving techniques'],
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
        type: 'TYT',
        notes: 'Work at steady pace'
      },
      ...(day !== 'Saturday' ? [{
        subject: aytSubjects[Math.floor(Math.random() * aytSubjects.length)],
        question_count: Math.floor(Math.random() * 15) + 8,
        duration_minutes: Math.floor(Math.random() * 45) + 25,
        focus_topics: ['Advanced level questions', 'Time management'],
        confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
        type: 'AYT',
        notes: 'Focus on analytical thinking'
      }] : [])
    ] : []
  }))

  const resources = [
    {
      subject: 'Mathematics',
      type: 'question_bank',
      title: 'TYT Mathematics Question Bank',
      difficulty: userData.level === 'beginner' ? 'easy' : userData.level === 'intermediate' ? 'medium' : 'hard',
      estimated_time_minutes: 120,
      priority: 5,
      url: 'https://example.com/matematik-soru-bankasi',
      repeat_after_days: 3
    },
    {
      subject: 'Turkish',
      type: 'video',
      title: 'TYT Turkish Course Videos',
      difficulty: 'medium',
      estimated_time_minutes: 90,
      priority: 4,
      url: 'https://example.com/turkce-videolar',
      repeat_after_days: 7
    },
    {
      subject: 'Science',
      type: 'book',
      title: 'TYT Science Textbook',
      difficulty: userData.level === 'beginner' ? 'easy' : 'medium',
      estimated_time_minutes: 150,
      priority: 3,
      url: 'https://example.com/fen-bilimleri-kitap',
      repeat_after_days: 14
    }
  ]

  return {
    user_id: userData.user_id,
    plan_date: new Date().toISOString().split('T')[0],
    week_number: 1,
    schedule,
    resources,
    tips: [
      'Use daily checklists to track your progress',
      'Allocate extra time to topics you find challenging',
      'Take regular breaks to improve efficiency'
    ],
    notes: `${userData.level} level plan with ${userData.weekly_hours} hours per week`,
    confidence_score: 0.85
  }
}

// OpenAI plan generator
async function generateOpenAIPlan(userData, openai) {
  const systemPrompt = "You are an exam study plan generator. Produce exactly one JSON output matching the schema described. Do not add any prose."
  
  const userPrompt = `
User: ${userData.user_id}, level: ${userData.level}, weekly_hours: ${userData.weekly_hours}, target_date: ${userData.target_date}, field: ${userData.field || 'science'}, preferences: ${JSON.stringify(userData.preferences || {})}

Required: Weekly study plan (divided by days), for each subject block include: subject, question_count, duration_minutes, focus_topics, resources and confidence score.
Also generate tips, notes and resources list.

IMPORTANT RULES:
1. TYT subjects: Mathematics, Turkish, Physics, Chemistry, Biology, History, Geography
2. AYT subjects based on field:
   - science: Mathematics, Physics, Chemistry, Biology
   - social: Literature, History-1, Geography-1, Philosophy
   - mixed: Mathematics, Literature, History-1, Geography-1
   - language: English, Turkish, Literature
3. confidence values should be between 0.6-1.0
4. Adaptive Scheduler: optimize based on weekly hours
5. Spaced Repetition: use repeat_after_days values (1,3,7,14 days)
6. Sunday should be rest day (minimal study)

Required JSON schema: user_id (string), plan_date (YYYY-MM-DD), schedule (array of days with subjects arrays), resources (array).
Respond ONLY in valid JSON. If cannot, return { "error": "..." }.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
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

  const { user_id, level, weekly_hours, target_date, field, preferences } = requestBody

  // Validate required fields
  if (!user_id || !level || !weekly_hours) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Missing required fields: user_id, level, weekly_hours' 
      })
    }
  }

  const userData = {
    user_id,
    level,
    weekly_hours,
    target_date: target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year from now
    field: field || 'science',
    preferences: preferences || {}
  }

  let plan
  const isMockMode = process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY
  
  // Log API key status (without exposing the key)
  console.log('OpenAI API Key Status:', {
    hasKey: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    mockMode: isMockMode
  })

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
        plan.notes += ' (AI temporarily unavailable, using static plan)'
      }
    }

    // Validate the generated plan
    const isValid = validate(plan)
    if (!isValid) {
      console.error('Plan validation failed:', validate.errors)
      // Generate fallback plan
      plan = generateMockPlan(userData)
      plan.notes += ' (Plan validation failed, using safe fallback plan)'
    }

    // Log analytics
    console.log('Plan generated successfully:', {
      user_id,
      level,
      weekly_hours,
      field,
      plan_confidence: plan.confidence_score || 0.85,
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
    fallbackPlan.notes = 'Simple plan generated due to temporary technical issues'
    
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

