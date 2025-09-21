import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock configuration.')
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://mock-project.supabase.co',
  supabaseAnonKey || 'mock-anon-key'
)

// Database Types
export interface UserProfile {
  id: string
  user_id: string
  email: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  weekly_hours: number
  target_date?: string
  field: 'science' | 'social' | 'language' | 'mixed'
  preferences?: Record<string, any>
  avatar_url?: string
  is_guest: boolean
  created_at: string
  updated_at: string
}

export interface StudyPlan {
  id: string
  user_id: string
  plan_id: string
  week_number: number
  plan_date: string
  schedule: any[]
  resources: any[]
  tips?: string[]
  notes?: string
  confidence_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  plan_id: string
  item_id: string
  completed_items: Record<string, any>
  study_time_minutes: number
  completion_date?: string
  created_at: string
}

// Auth Functions
export const signUpWithSupabase = async (email: string, password: string, metadata?: Record<string, any>) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase sign up error:', error)
    throw error
  }
}

export const signInWithSupabase = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase sign in error:', error)
    throw error
  }
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase Google sign in error:', error)
    throw error
  }
}

export const signOutFromSupabase = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Supabase sign out error:', error)
    throw error
  }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Database Functions
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Create user profile error:', error)
    throw error
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Update user profile error:', error)
    throw error
  }
}

export const savePlan = async (plan: Omit<StudyPlan, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        ...plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Save plan error:', error)
    throw error
  }
}

export const getUserPlan = async (userId: string, planId?: string): Promise<StudyPlan | null> => {
  try {
    let query = supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (planId) {
      query = query.eq('plan_id', planId)
    } else {
      query = query.eq('is_active', true).limit(1) // Get latest active plan
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Get user plan error:', error)
    return null
  }
}

export const saveProgress = async (progress: Omit<UserProgress, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .insert([{
        ...progress,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Save progress error:', error)
    throw error
  }
}

export const getUserProgress = async (userId: string, planId?: string): Promise<UserProgress[]> => {
  try {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (planId) {
      query = query.eq('plan_id', planId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get user progress error:', error)
    return []
  }
}

// Real-time subscriptions
export const subscribeToUserProgress = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('user_progress_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'progress',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export const subscribeToPlans = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('plans_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'plans',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

// Storage functions (for file uploads like profile pictures, documents etc.)
export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

export const getFileUrl = (bucket: string, path: string) => {
  return supabase.storage
    .from(bucket)
    .getPublicUrl(path)
}

export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  } catch (error) {
    console.error('File delete error:', error)
    throw error
  }
}
