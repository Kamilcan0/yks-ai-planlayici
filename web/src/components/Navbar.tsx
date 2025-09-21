import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Brain, 
  Home, 
  Calendar, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  User,
  Moon,
  Sun,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { usePlanStore } from '@/store/planStore'

interface NavbarProps {
  isDarkMode?: boolean
  toggleDarkMode?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsProfileMenuOpen(false)
  }

  const navigationItems = [
    { path: '/', label: 'Ana Sayfa', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/plan', label: 'Planım', icon: Calendar },
    { path: '/settings', label: 'Ayarlar', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              YKS AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-9 h-9 p-0"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2"
                  aria-label="Open user menu"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                    {user.isGuest ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || 'Kullanıcı'}
                  </span>
                </Button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium">{user.name}</p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                          {user.isGuest && (
                            <p className="text-xs text-orange-600">Misafir Kullanıcı</p>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Ayarlar</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Giriş</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Kayıt Ol</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="md:hidden w-9 h-9 p-0"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-border"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
