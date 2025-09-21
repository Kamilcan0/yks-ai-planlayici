import OpenAI from 'openai'

// OpenAI client instance
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Client-side kullanım için gerekli
})

// API anahtarı kontrolü
export const isOpenAIConfigured = (): boolean => {
  return !!import.meta.env.VITE_OPENAI_API_KEY
}

// Test bağlantısı
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    if (!isOpenAIConfigured()) {
      return false
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test" }],
      max_tokens: 5
    })
    
    return !!response.choices[0]?.message?.content
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}
