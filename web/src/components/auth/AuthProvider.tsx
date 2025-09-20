import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, createGuestUser, getGuestUser, clearGuestUser, getUserProfile, UserProfile } from '@/lib/firebase'

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
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      try {
        if (firebaseUser) {
          // Firebase authenticated user
          const userProfile = await getUserProfile(firebaseUser.uid)
          
          const authUser: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || userProfile?.name || 'Kullanıcı',
            isGuest: false,
            profile: userProfile
          }
          
          setUser(authUser)
          setProfile(userProfile)
        } else {
          // Check for guest user
          const guestUser = getGuestUser()
          if (guestUser) {
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
              id: guestUser.id,
              name: parsedProfile?.name || 'Misafir Kullanıcı',
              isGuest: true,
              profile: parsedProfile
            }
            
            setUser(authUser)
            setProfile(parsedProfile)
          } else {
            // No user at all
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      if (user?.isGuest) {
        clearGuestUser()
      } else {
        const { logOut } = await import('@/lib/firebase')
        await logOut()
      }
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
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
    setProfile: handleSetProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to create guest user when needed
export const useGuestSignIn = () => {
  const { user } = useAuth()
  
  const signInAsGuest = () => {
    if (!user) {
      const guestUser = createGuestUser()
      // Force a page reload to trigger auth state change
      window.location.reload()
    }
  }
  
  return { signInAsGuest }
}

