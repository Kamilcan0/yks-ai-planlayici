import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDayType } from '@/lib/utils'

export interface Subject {
  id: string
  name: string
  level: number
  color: string
  isActive: boolean
}

export interface StudySession {
  id: string
  subjectId: string
  startTime: string
  duration: number // minutes
  dayIndex: number
  isCompleted: boolean
}

export interface StudyStats {
  totalHours: number
  streak: number
  completedSessions: number
  subjectHours: Record<string, number>
}

interface PlanState {
  // User settings
  name: string
  field: 'sayisal' | 'ea' | 'sozel' | 'dil'
  level: number
  isDarkMode: boolean
  
  // Subjects and sessions
  subjects: Subject[]
  sessions: StudySession[]
  stats: StudyStats
  
  // Actions
  setUserInfo: (name: string, field: string, level: number) => void
  toggleDarkMode: () => void
  addSubject: (name: string, level: number, color: string) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  removeSubject: (id: string) => void
  generateWeeklyPlan: () => void
  markSessionComplete: (sessionId: string) => void
  updateStats: () => void
}

const defaultSubjects: Record<string, Subject[]> = {
  sayisal: [
    { id: '1', name: 'Matematik', level: 3, color: '#3b82f6', isActive: true },
    { id: '2', name: 'Fizik', level: 3, color: '#10b981', isActive: true },
    { id: '3', name: 'Kimya', level: 3, color: '#f59e0b', isActive: true },
    { id: '4', name: 'Biyoloji', level: 3, color: '#ef4444', isActive: true },
    { id: '5', name: 'Türkçe', level: 3, color: '#8b5cf6', isActive: true },
  ],
  ea: [
    { id: '1', name: 'Matematik', level: 3, color: '#3b82f6', isActive: true },
    { id: '2', name: 'Türkçe', level: 3, color: '#8b5cf6', isActive: true },
    { id: '3', name: 'Sosyal Bilimler', level: 3, color: '#06b6d4', isActive: true },
    { id: '4', name: 'Geometri', level: 3, color: '#84cc16', isActive: true },
  ],
  sozel: [
    { id: '1', name: 'Türkçe', level: 3, color: '#8b5cf6', isActive: true },
    { id: '2', name: 'Sosyal Bilimler', level: 3, color: '#06b6d4', isActive: true },
    { id: '3', name: 'Matematik', level: 2, color: '#3b82f6', isActive: true },
  ],
  dil: [
    { id: '1', name: 'İngilizce', level: 3, color: '#f97316', isActive: true },
    { id: '2', name: 'Türkçe', level: 3, color: '#8b5cf6', isActive: true },
  ]
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      field: 'sayisal',
      level: 3,
      isDarkMode: false,
      subjects: defaultSubjects.sayisal,
      sessions: [],
      stats: {
        totalHours: 0,
        streak: 0,
        completedSessions: 0,
        subjectHours: {}
      },

      // Actions
      setUserInfo: (name, field, level) => {
        set({
          name,
          field: field as any,
          level,
          subjects: defaultSubjects[field as keyof typeof defaultSubjects] || defaultSubjects.sayisal
        })
        get().generateWeeklyPlan()
      },

      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

      addSubject: (name, level, color) => {
        const newSubject: Subject = {
          id: Date.now().toString(),
          name,
          level,
          color,
          isActive: true
        }
        set(state => ({ subjects: [...state.subjects, newSubject] }))
        get().generateWeeklyPlan()
      },

      updateSubject: (id, updates) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
        }))
        get().generateWeeklyPlan()
      },

      removeSubject: (id) => {
        set(state => ({
          subjects: state.subjects.filter(s => s.id !== id),
          sessions: state.sessions.filter(s => s.subjectId !== id)
        }))
      },

      generateWeeklyPlan: () => {
        const { subjects, level } = get()
        const activeSubjects = subjects.filter(s => s.isActive)
        if (activeSubjects.length === 0) return

        const sessions: StudySession[] = []
        const sessionsPerDay = 4
        const sessionDuration = 90 // minutes

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const dayType = getDayType(dayIndex)
          
          if (dayType === 'TEKRAR') {
            // Sunday: Review and mock tests
            sessions.push({
              id: `${dayIndex}-review`,
              subjectId: 'review',
              startTime: '09:00',
              duration: 120,
              dayIndex,
              isCompleted: false
            })
            continue
          }

          // Smart subject distribution
          for (let sessionIndex = 0; sessionIndex < sessionsPerDay; sessionIndex++) {
            const subjectIndex = (dayIndex + sessionIndex) % activeSubjects.length
            const subject = activeSubjects[subjectIndex]
            const startHour = 9 + Math.floor(sessionIndex / 2) * 3 + (sessionIndex % 2) * 1.5
            
            sessions.push({
              id: `${dayIndex}-${sessionIndex}`,
              subjectId: subject.id,
              startTime: `${Math.floor(startHour).toString().padStart(2, '0')}:${((startHour % 1) * 60).toString().padStart(2, '0')}`,
              duration: sessionDuration,
              dayIndex,
              isCompleted: false
            })
          }
        }

        set({ sessions })
      },

      markSessionComplete: (sessionId) => {
        set(state => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId ? { ...s, isCompleted: true } : s
          )
        }))
        get().updateStats()
      },

      updateStats: () => {
        const { sessions, subjects } = get()
        const completedSessions = sessions.filter(s => s.isCompleted)
        const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0)
        
        const subjectHours: Record<string, number> = {}
        completedSessions.forEach(session => {
          const subject = subjects.find(s => s.id === session.subjectId)
          if (subject) {
            subjectHours[subject.name] = (subjectHours[subject.name] || 0) + session.duration / 60
          }
        })

        set({
          stats: {
            totalHours: totalMinutes / 60,
            streak: calculateStreak(sessions),
            completedSessions: completedSessions.length,
            subjectHours
          }
        })
      }
    }),
    { name: 'study-planner' }
  )
)

function calculateStreak(sessions: StudySession[]): number {
  const today = new Date()
  let streak = 0
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dayIndex = checkDate.getDay()
    
    const dayHasCompletedSession = sessions.some(s => 
      s.dayIndex === dayIndex && s.isCompleted
    )
    
    if (dayHasCompletedSession) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  
  return streak
}
