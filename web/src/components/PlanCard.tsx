import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Target,
  Lightbulb,
  ExternalLink,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudyBlock, ResourceRecommendation } from '@/lib/api'
import { saveProgress } from '@/lib/api'
import { useAuth } from '@/components/auth/AuthProvider'

interface PlanCardProps {
  day: {
    gün: string
    TYT: StudyBlock[]
    AYT: StudyBlock[]
  }
  kaynak_önerileri?: ResourceRecommendation[]
  planId: string
  onProgressUpdate?: (blockId: string, completed: boolean) => void
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  day, 
  kaynak_önerileri = [], 
  planId,
  onProgressUpdate 
}) => {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set())
  const [savingProgress, setSavingProgress] = useState<string | null>(null)

  const allBlocks = [...day.TYT, ...day.AYT]
  const totalDuration = allBlocks.reduce((sum, block) => sum + block.süre_dakika, 0)
  const totalQuestions = allBlocks.reduce((sum, block) => sum + block.soru_sayısı, 0)
  const completedCount = allBlocks.filter(block => block.blok_id && completedBlocks.has(block.blok_id)).length
  const completionRate = allBlocks.length > 0 ? (completedCount / allBlocks.length) * 100 : 0

  // Get relevant resources for this day's topics
  const relevantResources = kaynak_önerileri.filter(resource =>
    allBlocks.some(block => 
      block.konu.toLowerCase().includes(resource.konu.toLowerCase()) ||
      resource.konu.toLowerCase().includes(block.konu.toLowerCase())
    )
  ).slice(0, 3) // Limit to 3 most relevant resources

  const handleToggleComplete = async (block: StudyBlock, completed: boolean) => {
    if (!block.blok_id || !user) return

    setSavingProgress(block.blok_id)

    try {
      await saveProgress(user.id, {
        blok_id: block.blok_id,
        plan_id: planId,
        tamamlandı: completed,
        zaman: new Date().toISOString()
      })

      const newCompletedBlocks = new Set(completedBlocks)
      if (completed) {
        newCompletedBlocks.add(block.blok_id)
      } else {
        newCompletedBlocks.delete(block.blok_id)
      }
      setCompletedBlocks(newCompletedBlocks)
      onProgressUpdate?.(block.blok_id, completed)
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSavingProgress(null)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Yüksek'
    if (confidence >= 0.6) return 'Orta'
    return 'Düşük'
  }

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Summary View */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Day and Progress */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">{day.gün}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{allBlocks.length}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${completionRate}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{totalDuration} dk</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{totalQuestions} soru</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{day.TYT.length + day.AYT.length} blok</span>
              </div>
            </div>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[...new Set(allBlocks.map(b => b.konu))].slice(0, 3).map((konu, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                >
                  {konu}
                </span>
              ))}
              {[...new Set(allBlocks.map(b => b.konu))].length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                  +{[...new Set(allBlocks.map(b => b.konu))].length - 3} daha
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border"
          >
            <div className="p-6 space-y-6">
              {/* TYT Section */}
              {day.TYT.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    TYT ({day.TYT.length} blok)
                  </h4>
                  <div className="space-y-3">
                    {day.TYT.map((block, idx) => (
                      <StudyBlockCard
                        key={idx}
                        block={block}
                        type="TYT"
                        isCompleted={block.blok_id ? completedBlocks.has(block.blok_id) : false}
                        onToggleComplete={handleToggleComplete}
                        isLoading={savingProgress === block.blok_id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* AYT Section */}
              {day.AYT.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    AYT ({day.AYT.length} blok)
                  </h4>
                  <div className="space-y-3">
                    {day.AYT.map((block, idx) => (
                      <StudyBlockCard
                        key={idx}
                        block={block}
                        type="AYT"
                        isCompleted={block.blok_id ? completedBlocks.has(block.blok_id) : false}
                        onToggleComplete={handleToggleComplete}
                        isLoading={savingProgress === block.blok_id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Resource Recommendations */}
              {relevantResources.length > 0 && (
                <div>
                  <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Önerilen Kaynaklar
                  </h4>
                  <div className="space-y-2">
                    {relevantResources.map((resource, idx) => (
                      <ResourceCard key={idx} resource={resource} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface StudyBlockCardProps {
  block: StudyBlock
  type: 'TYT' | 'AYT'
  isCompleted: boolean
  onToggleComplete: (block: StudyBlock, completed: boolean) => void
  isLoading?: boolean
}

const StudyBlockCard: React.FC<StudyBlockCardProps> = ({ 
  block, 
  type, 
  isCompleted, 
  onToggleComplete,
  isLoading 
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Yüksek'
    if (confidence >= 0.6) return 'Orta'
    return 'Düşük'
  }

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isCompleted 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-muted/50 border-border hover:bg-muted'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {block.konu}
            </h5>
            <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(block.confidence)}`}>
              {getConfidenceText(block.confidence)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <span>{block.soru_sayısı} soru</span>
            <span>{block.süre_dakika} dk</span>
          </div>

          {block.odak_konular.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">Odak konular:</p>
              <div className="flex flex-wrap gap-1">
                {block.odak_konular.map((konu, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-background text-foreground text-xs rounded border"
                  >
                    {konu}
                  </span>
                ))}
              </div>
            </div>
          )}

          {block.not && (
            <p className="text-xs text-muted-foreground italic">💡 {block.not}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleComplete(block, !isCompleted)}
          disabled={isLoading || !block.blok_id}
          className="ml-4 flex-shrink-0"
        >
          {isLoading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

interface ResourceCardProps {
  resource: ResourceRecommendation
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getDifficultyColor = (zorluk: string) => {
    switch (zorluk) {
      case 'kolay': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'orta': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'zor': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getTypeIcon = (tip: string) => {
    switch (tip) {
      case 'kitap': return '📚'
      case 'video': return '🎥'
      case 'soru_bankası': return '📝'
      case 'online_kaynak': return '🌐'
      default: return '📖'
    }
  }

  return (
    <div className="p-3 bg-background border border-border rounded-lg hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getTypeIcon(resource.tip)}</span>
            <h6 className="font-medium text-sm text-foreground">{resource.isim}</h6>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
            <span>{resource.beklenen_süre_dakika} dk</span>
            <span className={`px-2 py-1 rounded-full ${getDifficultyColor(resource.zorluk)}`}>
              {resource.zorluk}
            </span>
            <span>Öncelik: {resource.öncelik}/5</span>
          </div>

          {resource.repeat_after_days && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              🔄 {resource.repeat_after_days} gün sonra tekrar et
            </p>
          )}
        </div>

        {resource.link && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 flex-shrink-0 w-8 h-8 p-0"
            onClick={() => window.open(resource.link, '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}