import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Sun, Moon, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/AuthButton'
import { useAuth } from '@/components/auth/AuthProvider'

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const Header: React.FC<HeaderProps> = React.memo(({ isDarkMode, toggleDarkMode }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [signOut, navigate])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">YKS AI Asistanı</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              // Authenticated user menu
              <>
                <Link to="/plan" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <AuthButton
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  ariaLabel="Çıkış yap"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </AuthButton>
              </>
            ) : (
              // Guest user menu
              <>
                <AuthButton
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                  ariaLabel="Giriş yap"
                >
                  Giriş
                </AuthButton>
                <AuthButton
                  onClick={() => navigate('/register')}
                  size="sm"
                  ariaLabel="Kayıt ol"
                >
                  Kayıt Ol
                </AuthButton>
              </>
            )}

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'