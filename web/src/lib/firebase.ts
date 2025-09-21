import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Firebase configuration - to be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

export interface UserProfile {
  kullanıcı_ID: string
  name: string
  email: string
  seviye: 'başlangıç' | 'orta' | 'ileri'
  haftalık_saat: number
  hedef_tarih: string
  field?: 'sayisal' | 'ea' | 'sozel' | 'dil'
  tercihler?: Record<string, any>
  createdAt: any
  updatedAt: any
}

export interface StudyPlan {
  kullanıcı_ID: string
  plan_id: string
  tarih: string
  haftalık_plan: any[]
  kaynak_önerileri: any[]
  ux_önerileri?: string[]
  adaptasyon_notları?: string
  createdAt: any
  updatedAt: any
}

export interface UserProgress {
  user_id: string
  progress_id: string
  blok_id: string
  plan_id: string
  tamamlandı: boolean
  zaman: string
  createdAt: any
}

// Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google sign in error:', error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email sign in error:', error)
    throw error
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email sign up error:', error)
    throw error
  }
}

export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Database Functions
export const createUserProfile = async (user: User, profileData: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userProfile: UserProfile = {
      kullanıcı_ID: user.uid,
      name: profileData.name || user.displayName || 'Kullanıcı',
      email: user.email || '',
      seviye: profileData.seviye || 'başlangıç',
      haftalık_saat: profileData.haftalık_saat || 20,
      hedef_tarih: profileData.hedef_tarih || '',
      field: profileData.field,
      tercihler: profileData.tercihler || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userRef, userProfile)
    return userProfile
  } catch (error) {
    console.error('Create user profile error:', error)
    throw error
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    throw error
  }
}

export const savePlan = async (plan: StudyPlan) => {
  try {
    const planRef = doc(db, 'users', plan.kullanıcı_ID, 'plans', plan.plan_id)
    await setDoc(planRef, {
      ...plan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Save plan error:', error)
    throw error
  }
}

export const getUserPlan = async (userId: string, planId?: string): Promise<StudyPlan | null> => {
  try {
    // If planId not provided, get the latest plan
    if (!planId) {
      // For now, use a default plan ID - in production, you'd query for the latest
      planId = 'latest'
    }
    
    const planRef = doc(db, 'users', userId, 'plans', planId)
    const planDoc = await getDoc(planRef)
    
    if (planDoc.exists()) {
      return planDoc.data() as StudyPlan
    }
    return null
  } catch (error) {
    console.error('Get user plan error:', error)
    throw error
  }
}

export const saveProgress = async (progress: UserProgress) => {
  try {
    const progressRef = doc(db, 'users', progress.user_id, 'progress', progress.progress_id)
    await setDoc(progressRef, {
      ...progress,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Save progress error:', error)
    throw error
  }
}

// Auth State Listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Guest Mode Functions
export const createGuestUser = (): { id: string; isGuest: boolean } => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('guest_user_id', guestId)
  localStorage.setItem('is_guest_user', 'true')
  
  return {
    id: guestId,
    isGuest: true
  }
}

export const getGuestUser = (): { id: string; isGuest: boolean } | null => {
  const guestId = localStorage.getItem('guest_user_id')
  const isGuest = localStorage.getItem('is_guest_user') === 'true'
  
  if (guestId && isGuest) {
    return {
      id: guestId,
      isGuest: true
    }
  }
  
  return null
}

export const clearGuestUser = () => {
  localStorage.removeItem('guest_user_id')
  localStorage.removeItem('is_guest_user')
  localStorage.removeItem('guest_user_profile')
}

// Guest user profile management (localStorage)
export const saveGuestProfile = (profile: UserProfile) => {
  localStorage.setItem('guest_user_profile', JSON.stringify(profile))
}

export const getGuestProfile = (): UserProfile | null => {
  const profileData = localStorage.getItem('guest_user_profile')
  if (profileData) {
    try {
      return JSON.parse(profileData)
    } catch (error) {
      console.error('Parse guest profile error:', error)
      return null
    }
  }
  return null
}

