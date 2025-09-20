// Netlify function for user profile operations
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  const { httpMethod, path, body } = event
  const pathParts = path.split('/').filter(Boolean)
  const userId = pathParts[pathParts.length - 1] // Last part should be user ID

  try {
    switch (httpMethod) {
      case 'GET':
        return await getUserProfile(userId, headers)
      case 'POST':
        return await createUserProfile(userId, JSON.parse(body), headers)
      case 'PUT':
        return await updateUserProfile(userId, JSON.parse(body), headers)
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('User profile operation error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

async function getUserProfile(userId, headers) {
  // For now, return mock data or check localStorage simulation
  // In production, this would query the actual database
  
  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'User ID required' })
    }
  }

  // Mock user profile response
  const mockProfile = {
    kullanıcı_ID: userId,
    name: 'Örnek Kullanıcı',
    email: 'ornek@email.com',
    seviye: 'orta',
    haftalık_saat: 25,
    hedef_tarih: '2024-06-15',
    field: 'sayisal',
    tercihler: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      profile: mockProfile
    })
  }
}

async function createUserProfile(userId, profileData, headers) {
  if (!userId || !profileData) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'User ID and profile data required' })
    }
  }

  // Validate required fields
  const requiredFields = ['name', 'seviye', 'haftalık_saat', 'hedef_tarih']
  for (const field of requiredFields) {
    if (!profileData[field]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Missing required field: ${field}` })
      }
    }
  }

  // Create profile object
  const profile = {
    kullanıcı_ID: userId,
    name: profileData.name,
    email: profileData.email || '',
    seviye: profileData.seviye,
    haftalık_saat: profileData.haftalık_saat,
    hedef_tarih: profileData.hedef_tarih,
    field: profileData.field || 'sayisal',
    tercihler: profileData.tercihler || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // In a real implementation, this would save to a database
  console.log('Profile created:', profile)

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      profile,
      message: 'Profile created successfully'
    })
  }
}

async function updateUserProfile(userId, updates, headers) {
  if (!userId || !updates) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'User ID and update data required' })
    }
  }

  // Get existing profile (mock)
  const existingProfile = {
    kullanıcı_ID: userId,
    name: 'Mevcut Kullanıcı',
    email: 'mevcut@email.com',
    seviye: 'orta',
    haftalık_saat: 20,
    hedef_tarih: '2024-06-15',
    field: 'sayisal',
    tercihler: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }

  // Apply updates
  const updatedProfile = {
    ...existingProfile,
    ...updates,
    kullanıcı_ID: userId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  }

  // In a real implementation, this would update the database
  console.log('Profile updated:', updatedProfile)

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })
  }
}

