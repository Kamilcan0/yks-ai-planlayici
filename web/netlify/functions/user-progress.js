// Netlify function for user progress tracking
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  const { httpMethod, path, body, queryStringParameters } = event
  const pathParts = path.split('/').filter(Boolean)
  const userId = pathParts[pathParts.indexOf('user-progress') + 1]

  try {
    switch (httpMethod) {
      case 'POST':
        return await saveProgress(userId, JSON.parse(body), headers)
      case 'GET':
        return await getProgress(userId, queryStringParameters, headers)
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('Progress operation error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

async function saveProgress(userId, progressData, headers) {
  if (!userId || !progressData) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'User ID and progress data required' })
    }
  }

  // Validate required fields
  const requiredFields = ['blok_id', 'plan_id', 'tamamlandı']
  for (const field of requiredFields) {
    if (progressData[field] === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Missing required field: ${field}` })
      }
    }
  }

  // Create progress object
  const progress = {
    user_id: userId,
    progress_id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    blok_id: progressData.blok_id,
    plan_id: progressData.plan_id,
    tamamlandı: progressData.tamamlandı,
    zaman: progressData.zaman || new Date().toISOString(),
    createdAt: new Date().toISOString()
  }

  // In a real implementation, this would save to a database
  console.log('Progress saved:', progress)

  // Check if this triggers plan recalculation
  const shouldRecalculate = checkRecalculationTrigger(progress)
  
  let adaptiveResponse = {}
  if (shouldRecalculate) {
    console.log('Triggering adaptive plan recalculation for user:', userId)
    adaptiveResponse = {
      adaptive_trigger: true,
      message: 'Plan will be automatically updated based on your progress'
    }
  }

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      progress,
      ...adaptiveResponse,
      message: 'Progress saved successfully'
    })
  }
}

async function getProgress(userId, queryParams, headers) {
  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'User ID required' })
    }
  }

  const planId = queryParams?.plan_id
  const limit = parseInt(queryParams?.limit) || 50

  // Mock progress data
  const mockProgressList = [
    {
      user_id: userId,
      progress_id: 'progress_1',
      blok_id: 'matematik_block_1',
      plan_id: planId || 'plan_latest',
      tamamlandı: true,
      zaman: '2024-01-15T10:30:00.000Z',
      createdAt: '2024-01-15T10:35:00.000Z'
    },
    {
      user_id: userId,
      progress_id: 'progress_2',
      blok_id: 'turkce_block_1',
      plan_id: planId || 'plan_latest',
      tamamlandı: false,
      zaman: '2024-01-15T14:00:00.000Z',
      createdAt: '2024-01-15T14:05:00.000Z'
    }
  ]

  const filteredProgress = planId 
    ? mockProgressList.filter(p => p.plan_id === planId)
    : mockProgressList

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      progress: filteredProgress.slice(0, limit),
      total: filteredProgress.length,
      message: 'Progress retrieved successfully'
    })
  }
}

function checkRecalculationTrigger(progress) {
  // Adaptive algorithm to determine if plan should be recalculated
  // This is a simplified version - in production this would be more sophisticated
  
  // Trigger recalculation if:
  // 1. User is consistently completing tasks much faster/slower than expected
  // 2. User is skipping certain types of tasks
  // 3. Completion rate is significantly different from predicted
  
  // For now, trigger on every 5th completed task
  const completedTasksCount = Math.floor(Math.random() * 10) + 1 // Mock count
  
  return progress.tamamlandı && (completedTasksCount % 5 === 0)
}

