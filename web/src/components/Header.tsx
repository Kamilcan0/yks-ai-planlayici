import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Settings, User, LogOut, Menu, X, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'

interface HeaderProps {
  isDarkMode?: boolean
  toggleDarkMode?: () => void
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">
                  YKS Planlayıcı
                </h1>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Merhaba, {user.name}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-9 h-9 p-0"
                aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <Settings className="w-4 h-4" />
              </Button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 h-9"
                  >
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </Button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email || 'Misafir Kullanıcı'}</p>
                        {user.isGuest && (
                          <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                            Misafir
                          </span>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Open settings modal
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-md"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Ayarlar</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-md text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  Giriş Yap
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border py-4"
            >
              <div className="space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email || 'Misafir Kullanıcı'}</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => {
                        setShowMobileMenu(false)
                        // Open settings
                      }}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Ayarlar
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-red-600 dark:text-red-400"
                      onClick={() => {
                        setShowMobileMenu(false)
                        handleSignOut()
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Çıkış Yap
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setShowMobileMenu(false)
                      setShowAuthModal(true)
                    }}
                  >
                    Giriş Yap
                  </Button>
                )}

                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">Tema</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleDarkMode?.()
                      setShowMobileMenu(false)
                    }}
                    className="w-9 h-9 p-0"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Click outside to close menus */}
        {(showUserMenu || showMobileMenu) && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setShowUserMenu(false)
              setShowMobileMenu(false)
            }}
          />
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  )
}

