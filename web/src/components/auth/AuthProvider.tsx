import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, getCurrentUser, getUserProfile, UserProfile, signOutFromSupabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  email?: string
  name?: string
  isGuest: boolean
  profile?: UserProfile | null
}

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  setProfile: (profile: UserProfile) => void
  createGuestUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Supabase auth listener
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // Supabase authenticated user
          const userProfile = await getUserProfile(session.user.id)
          
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || undefined,
            name: userProfile?.name || session.user.user_metadata?.name || 'Kullanıcı',
            isGuest: false,
            profile: userProfile
          }
          
          setUser(authUser)
          setProfile(userProfile)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Supabase auth state change error:', error)
      }
      
      // Check for guest user in localStorage
      const guestUser = localStorage.getItem('guest_user')
      if (guestUser) {
        try {
          const parsedGuestUser = JSON.parse(guestUser)
          const guestProfile = localStorage.getItem('guest_user_profile')
          let parsedProfile: UserProfile | null = null
          
          if (guestProfile) {
            try {
              parsedProfile = JSON.parse(guestProfile)
            } catch (error) {
              console.error('Error parsing guest profile:', error)
            }
          }
          
          const authUser: AuthUser = {
            id: parsedGuestUser.id,
            name: parsedProfile?.name || 'Misafir Kullanıcı',
            isGuest: true,
            profile: parsedProfile
          }
          
          setUser(authUser)
          setProfile(parsedProfile)
        } catch (error) {
          console.error('Error parsing guest user:', error)
          localStorage.removeItem('guest_user')
          localStorage.removeItem('guest_user_profile')
        }
      } else {
        // No user at all
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      if (user?.isGuest) {
        localStorage.removeItem('guest_user')
        localStorage.removeItem('guest_user_profile')
      } else {
        await signOutFromSupabase()
      }
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleCreateGuestUser = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const guestUser = {
      id: guestId,
      created_at: new Date().toISOString()
    }
    
    localStorage.setItem('guest_user', JSON.stringify(guestUser))
    
    const authUser: AuthUser = {
      id: guestId,
      name: 'Misafir Kullanıcı',
      isGuest: true
    }
    
    setUser(authUser)
    setProfile(null)
  }

  const handleSetProfile = (newProfile: UserProfile) => {
    setProfile(newProfile)
    
    if (user?.isGuest) {
      localStorage.setItem('guest_user_profile', JSON.stringify(newProfile))
    }
    
    // Update user name if changed
    if (user && newProfile.name !== user.name) {
      setUser({
        ...user,
        name: newProfile.name,
        profile: newProfile
      })
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    setProfile: handleSetProfile,
    createGuestUser: handleCreateGuestUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to create guest user when needed
export const useGuestSignIn = () => {
  const { createGuestUser } = useAuth()
  
  return { signInAsGuest: createGuestUser }
}

