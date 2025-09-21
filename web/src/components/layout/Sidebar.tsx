import React from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  BookOpen, 
  User, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Trophy,
  Target,
  Calendar,
  Zap
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    icon: Home,
    path: '/home'
  },
  {
    id: 'sources',
    label: 'Kaynak Önerileri',
    icon: BookOpen,
    path: '/sources'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    path: '/profile'
  },
  {
    id: 'analytics',
    label: 'İstatistikler',
    icon: BarChart3,
    path: '/analytics',
    badge: 'Yakında'
  },
  {
    id: 'mentor',
    label: 'AI Mentor',
    icon: MessageSquare,
    path: '/mentor',
    badge: 'Beta'
  },
  {
    id: 'achievements',
    label: 'Başarılar',
    icon: Trophy,
    path: '/achievements',
    badge: 'Yeni'
  }
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border p-4 z-30 hidden lg:block"
    >
      <div className="space-y-2">
        {sidebarItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={isActive(item.path) ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 ${
                isActive(item.path) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={isActive(item.path) ? 'secondary' : 'outline'}
                  className="ml-2 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-muted rounded-lg"
      >
        <h3 className="font-medium text-sm mb-3">Bugünkü Hedef</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm">Çalışma</span>
            </div>
            <span className="text-sm font-medium">2/4 saat</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-1/2"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Motivasyon</span>
            </div>
            <span className="text-sm font-medium">85%</span>
          </div>
        </div>
      </motion.div>

      {/* Study Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
      >
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🔥</div>
          <div>
            <p className="text-lg font-bold">7 Gün</p>
            <p className="text-sm opacity-90">Çalışma serisi</p>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  )
}
