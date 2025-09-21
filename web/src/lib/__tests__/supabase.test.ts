import { 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile,
  savePlan,
  getUserPlan,
  saveProgress,
  getUserProgress,
  UserProfile,
  StudyPlan,
  UserProgress
} from '../supabase'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            single: jest.fn(),
            eq: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn()
              }))
            }))
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    })),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }))
}))

const mockUserProfile: UserProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  level: 'intermediate',
  weekly_hours: 20,
  target_date: '2024-06-15',
  field: 'science',
  preferences: {},
  avatar_url: null,
  is_guest: false,
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z'
}

const mockStudyPlan: StudyPlan = {
  id: 'plan-1',
  user_id: 'user-1',
  plan_id: 'plan_123',
  week_number: 1,
  plan_date: '2024-01-15',
  schedule: [],
  resources: [],
  tips: [],
  notes: 'Test plan',
  confidence_score: 0.85,
  is_active: true,
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z'
}

const mockUserProgress: UserProgress = {
  id: 'progress-1',
  user_id: 'user-1',
  plan_id: 'plan-1',
  item_id: 'item-1',
  completed_items: { 'item-1': true },
  study_time_minutes: 30,
  completion_date: '2024-01-15T12:00:00.000Z',
  created_at: '2024-01-15T00:00:00.000Z'
}

describe('Supabase Integration', () => {
  describe('User Profiles', () => {
    test('createUserProfile should insert new profile', async () => {
      const { supabase } = require('../supabase')
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockUserProfile, error: null })
        })
      })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const profileData = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        level: 'intermediate' as const,
        weekly_hours: 20,
        field: 'science' as const,
        is_guest: false,
        preferences: {}
      }

      const result = await createUserProfile(profileData)
      
      expect(mockInsert).toHaveBeenCalledWith([profileData])
      expect(result).toEqual(mockUserProfile)
    })

    test('getUserProfile should fetch profile by user_id', async () => {
      const { supabase } = require('../supabase')
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockUserProfile, error: null })
        })
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getUserProfile('user-1')
      
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toEqual(mockUserProfile)
    })

    test('getUserProfile should return null when profile not found', async () => {
      const { supabase } = require('../supabase')
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { code: 'PGRST116' } 
          })
        })
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getUserProfile('non-existent-user')
      
      expect(result).toBeNull()
    })

    test('updateUserProfile should update existing profile', async () => {
      const { supabase } = require('../supabase')
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUserProfile, error: null })
          })
        })
      })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const updates = { name: 'Updated Name' }
      const result = await updateUserProfile('user-1', updates)
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(String)
        })
      )
      expect(result).toEqual(mockUserProfile)
    })
  })

  describe('Study Plans', () => {
    test('savePlan should save new plan', async () => {
      const { supabase } = require('../supabase')
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStudyPlan, error: null })
        })
      })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const planData = {
        user_id: 'user-1',
        plan_id: 'plan_123',
        week_number: 1,
        plan_date: '2024-01-15',
        schedule: [],
        resources: [],
        tips: [],
        notes: 'Test plan',
        confidence_score: 0.85,
        is_active: true
      }

      const result = await savePlan(planData)
      
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          ...planData,
          created_at: expect.any(String),
          updated_at: expect.any(String)
        })
      ])
      expect(result).toEqual(mockStudyPlan)
    })

    test('getUserPlan should fetch latest active plan', async () => {
      const { supabase } = require('../supabase')
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockStudyPlan, error: null })
              })
            })
          })
        })
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getUserPlan('user-1')
      
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toEqual(mockStudyPlan)
    })
  })

  describe('User Progress', () => {
    test('saveProgress should save progress data', async () => {
      const { supabase } = require('../supabase')
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockUserProgress, error: null })
        })
      })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const progressData = {
        user_id: 'user-1',
        plan_id: 'plan-1',
        item_id: 'item-1',
        completed_items: { 'item-1': true },
        study_time_minutes: 30,
        completion_date: '2024-01-15T12:00:00.000Z'
      }

      const result = await saveProgress(progressData)
      
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          ...progressData,
          created_at: expect.any(String)
        })
      ])
      expect(result).toEqual(mockUserProgress)
    })

    test('getUserProgress should fetch progress history', async () => {
      const { supabase } = require('../supabase')
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockUserProgress], error: null })
        })
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getUserProgress('user-1')
      
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toEqual([mockUserProgress])
    })

    test('getUserProgress should return empty array on error', async () => {
      const { supabase } = require('../supabase')
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: null, 
            error: new Error('Database error') 
          })
        })
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await getUserProgress('user-1')
      
      expect(result).toEqual([])
    })
  })

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const { supabase } = require('../supabase')
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: new Error('Database connection failed') 
          })
        })
      })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const profileData = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        level: 'intermediate' as const,
        weekly_hours: 20,
        field: 'science' as const,
        is_guest: false,
        preferences: {}
      }

      await expect(createUserProfile(profileData)).rejects.toThrow()
    })
  })
})
