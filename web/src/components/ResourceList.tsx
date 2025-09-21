import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Book, 
  Video, 
  FileText, 
  ExternalLink, 
  Star, 
  Clock, 
  Filter,
  Search,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Resource {
  subject: string
  type: 'kitap' | 'video' | 'soru_bankasi' | 'online_kurs' | 'test' | 'book' | 'question_bank' | 'online_resource'
  title: string
  difficulty: 'baslangic' | 'orta' | 'ileri' | 'easy' | 'medium' | 'hard'
  estimated_time_minutes?: number
  priority: number
  url?: string
  repeat_after_days?: number
  level?: 'baslangic' | 'orta' | 'ileri'
  description?: string
  publisher?: string
  category?: string
}

interface ResourceListProps {
  resources: Resource[]
  onResourceClick?: (resource: Resource) => void
  className?: string
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  onResourceClick,
  className = ''
}) => {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'title'>('priority')

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'kitap':
      case 'book':
        return <Book className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'soru_bankasi':
      case 'question_bank':
        return <FileText className="w-5 h-5" />
      case 'online_kurs':
      case 'online_resource':
        return <ExternalLink className="w-5 h-5" />
      case 'test':
        return <FileText className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'kitap':
      case 'book':
        return 'Kitap'
      case 'video':
        return 'Video'
      case 'soru_bankasi':
      case 'question_bank':
        return 'Soru Bankası'
      case 'online_kurs':
      case 'online_resource':
        return 'Online Kaynak'
      case 'test':
        return 'Test'
      default:
        return type
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'baslangic':
      case 'easy':
        return 'Başlangıç'
      case 'orta':
      case 'medium':
        return 'Orta'
      case 'ileri':
      case 'hard':
        return 'İleri'
      default:
        return difficulty
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'baslangic':
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'orta':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'ileri':
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatTime = (minutes?: number) => {
    if (!minutes || minutes < 60) {
      return minutes ? `${minutes} dk` : 'Süre belirtilmemiş'
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours} saat`
  }

  const filteredAndSortedResources = resources
    .filter(resource => {
      const matchesType = filterType === 'all' || resource.type === filterType
      const difficulty = resource.difficulty || resource.level || 'orta'
      const matchesDifficulty = filterDifficulty === 'all' || difficulty === filterDifficulty
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.subject.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesDifficulty && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority
        case 'time':
          return (a.estimated_time_minutes || 0) - (b.estimated_time_minutes || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Önerilen Kaynaklar</h3>
        <span className="text-sm text-muted-foreground">
          {filteredAndSortedResources.length} kaynak
        </span>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kaynak ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background"
            >
              <option value="all">Tüm Türler</option>
              <option value="kitap">Kitap</option>
              <option value="video">Video</option>
              <option value="soru_bankasi">Soru Bankası</option>
              <option value="online_kurs">Online Kaynak</option>
              <option value="test">Test</option>
            </select>
          </div>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="baslangic">Başlangıç</option>
            <option value="orta">Orta</option>
            <option value="ileri">İleri</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background"
          >
            <option value="priority">Önceliğe Göre</option>
            <option value="time">Süreye Göre</option>
            <option value="title">Alfabetik</option>
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedResources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => onResourceClick?.(resource)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {getResourceTypeLabel(resource.type)}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {resource.subject}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < resource.priority 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {resource.title}
            </h4>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(resource.difficulty || resource.level || 'orta')}`}>
                {getDifficultyLabel(resource.difficulty || resource.level || 'orta')}
              </span>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTime(resource.estimated_time_minutes)}</span>
              </div>
            </div>

            {resource.repeat_after_days && (
              <div className="text-xs text-muted-foreground mb-3">
                🔄 {resource.repeat_after_days} günde bir tekrar
              </div>
            )}

            {resource.url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(resource.url, '_blank')
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Kaynağa Git
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {filteredAndSortedResources.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">Kaynak bulunamadı</h4>
          <p className="text-muted-foreground">
            Arama kriterlerinizi değiştirmeyi deneyin.
          </p>
        </div>
      )}
    </div>
  )
}
