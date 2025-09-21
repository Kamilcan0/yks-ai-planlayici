import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Smartphone, 
  Search, 
  Filter,
  Star,
  ExternalLink,
  Download,
  Heart,
  Share
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  getResourcesForSubject, 
  getSubjectsForField, 
  getAllSubjects,
  getTopicsForSubject,
  getResourcesForTopic 
} from '@/lib/plan-generator/resource-mapper'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useToast } from '@/components/ui/toaster'

interface ResourceItem {
  title: string
  type: string
  level: string
  description: string
  priority: number
  publisher?: string
  estimatedPrice?: number
  url?: string
  subject?: string
  category?: string
}

const resourceTypeIcons = {
  kitap: BookOpen,
  video: Video,
  soru_bankasi: FileText,
  online_kurs: ExternalLink,
  test: FileText,
  uygulama: Smartphone
}

const resourceTypeLabels = {
  kitap: 'Kitap',
  video: 'Video',
  soru_bankasi: 'Soru Bankası',
  online_kurs: 'Online Kurs',
  test: 'Test',
  uygulama: 'Uygulama'
}

export const SourcesPage: React.FC = () => {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [favoriteResources, setFavoriteResources] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadResources()
  }, [profile])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedSubject, selectedType, selectedLevel])

  const loadResources = async () => {
    try {
      setLoading(true)
      
      if (!profile) return

      const subjects = getSubjectsForField(profile.field)
      const allResources: ResourceItem[] = []

      // Her ders için kaynakları yükle
      for (const subject of subjects) {
        const subjectResources = getResourcesForSubject(subject, profile.seviye)
        allResources.push(...subjectResources.map(r => ({
          ...r,
          subject: subject
        })))

        // Konuya özel kaynaklar
        const topics = getTopicsForSubject(subject)
        for (const topic of topics.slice(0, 2)) { // İlk 2 konu
          const topicResources = getResourcesForTopic(subject, topic, profile.seviye)
          allResources.push(...topicResources.map(r => ({
            ...r,
            subject: `${subject} - ${topic}`
          })))
        }
      }

      setResources(allResources)
    } catch (error) {
      console.error('Error loading resources:', error)
      toast({
        title: 'Hata',
        description: 'Kaynaklar yüklenirken hata oluştu',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = resources

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Ders filtresi
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(resource => 
        resource.subject?.includes(selectedSubject)
      )
    }

    // Tür filtresi
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType)
    }

    // Seviye filtresi
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(resource => resource.level === selectedLevel)
    }

    // Önceliğe göre sırala
    filtered.sort((a, b) => b.priority - a.priority)

    setFilteredResources(filtered)
  }

  const toggleFavorite = (resourceTitle: string) => {
    const newFavorites = new Set(favoriteResources)
    if (newFavorites.has(resourceTitle)) {
      newFavorites.delete(resourceTitle)
    } else {
      newFavorites.add(resourceTitle)
    }
    setFavoriteResources(newFavorites)
    
    toast({
      title: newFavorites.has(resourceTitle) ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
      description: resourceTitle,
      type: 'success'
    })
  }

  const getResourceIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || BookOpen
    return <IconComponent className="w-5 h-5" />
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'baslangic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'orta': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'ileri': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'baslangic': return 'Başlangıç'
      case 'orta': return 'Orta'
      case 'ileri': return 'İleri'
      default: return level
    }
  }

  const uniqueSubjects = Array.from(new Set(resources.map(r => r.subject?.split(' - ')[0]).filter(Boolean)))
  const uniqueTypes = Array.from(new Set(resources.map(r => r.type)))

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6"
        >
          <h1 className="text-3xl font-bold mb-2">Kaynak Önerileri</h1>
          <p className="text-purple-100">
            Seviyenize ve alanınıza özel seçilmiş kaliteli kaynaklar
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>{filteredResources.filter(r => r.type === 'kitap').length} Kitap</span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>{filteredResources.filter(r => r.type === 'video').length} Video</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{filteredResources.filter(r => r.type === 'soru_bankasi').length} Soru Bankası</span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtreler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Kaynak ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Subject Filter */}
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Ders seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Dersler</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {resourceTypeLabels[type as keyof typeof resourceTypeLabels] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seviye seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Seviyeler</SelectItem>
                  <SelectItem value="baslangic">Başlangıç</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="ileri">İleri</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={`${resource.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {resourceTypeLabels[resource.type as keyof typeof resourceTypeLabels] || resource.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {resource.subject}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(resource.title)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favoriteResources.has(resource.title) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getLevelColor(resource.level)}`}>
                      {getLevelLabel(resource.level)}
                    </Badge>
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

                  {resource.publisher && (
                    <p className="text-xs text-muted-foreground">
                      📖 {resource.publisher}
                    </p>
                  )}

                  {resource.estimatedPrice && resource.estimatedPrice > 0 && (
                    <p className="text-xs font-medium text-green-600">
                      💰 ~{resource.estimatedPrice}₺
                    </p>
                  )}

                  <div className="flex space-x-2 pt-2">
                    {resource.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Kaynağa Git
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        navigator.share?.({
                          title: resource.title,
                          text: resource.description,
                          url: resource.url
                        }).catch(() => {
                          navigator.clipboard.writeText(resource.url || resource.title)
                          toast({
                            title: 'Kopyalandı',
                            description: 'Kaynak bilgisi panoya kopyalandı',
                            type: 'success'
                          })
                        })
                      }}
                    >
                      <Share className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Kaynak bulunamadı</h3>
            <p className="text-muted-foreground">
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
