import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  userName?: string
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, userName }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#', label: 'Ana Sayfa' },
    { href: '#about', label: 'Hakkında' },
    { href: '#contact', label: 'İletişim' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                kfmatematik
              </h1>
              <p className="text-xs text-muted-foreground">
                YKS AI Asistanı
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* User Info */}
            {userName && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userName}</span>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            className="md:hidden mt-4 pb-4 border-t pt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              {userName && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg w-fit">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{userName}</span>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  )
}
