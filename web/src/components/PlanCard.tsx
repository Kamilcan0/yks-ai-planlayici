import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  Circle,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StudyPlan } from '@/lib/supabase'

interface PlanCardProps {
  plan: StudyPlan
  onToggleItem?: (itemId: string, completed: boolean) => void
  onUpdateProgress?: (planId: string, progress: any) => void
  className?: string
}

interface SubjectItem {
  subject: string
  question_count: number
  duration_minutes: number
  focus_topics: string[]
  confidence: number
  type: 'TYT' | 'AYT'
  notes?: string
}

interface DaySchedule {
  day: string
  subjects: SubjectItem[]
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  onToggleItem, 
  onUpdateProgress,
  className = '' 
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(day)) {
      newExpanded.delete(day)
    } else {
      newExpanded.add(day)
    }
    setExpandedDays(newExpanded)
  }

  const toggleItemComplete = (dayIndex: number, subjectIndex: number) => {
    const itemId = `${dayIndex}-${subjectIndex}`
    const newCompleted = new Set(completedItems)
    const isCompleted = !completedItems.has(itemId)
    
    if (isCompleted) {
      newCompleted.add(itemId)
    } else {
      newCompleted.delete(itemId)
    }
    
    setCompletedItems(newCompleted)
    onToggleItem?.(itemId, isCompleted)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return '🎯'
    if (confidence >= 0.6) return '⚡'
    return '💪'
  }

  const getTotalProgress = () => {
    const schedule = plan.schedule as DaySchedule[]
    const totalItems = schedule.reduce((acc, day) => acc + day.subjects.length, 0)
    return totalItems > 0 ? (completedItems.size / totalItems) * 100 : 0
  }

  const getDayProgress = (dayIndex: number, subjects: SubjectItem[]) => {
    const dayItems = subjects.length
    const completedDayItems = subjects.filter((_, subjectIndex) => 
      completedItems.has(`${dayIndex}-${subjectIndex}`)
    ).length
    return dayItems > 0 ? (completedDayItems / dayItems) * 100 : 0
  }

  const schedule = plan.schedule as DaySchedule[]
  const resources = plan.resources as any[]
  const tips = plan.tips || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hafta {plan.week_number} Planı</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(plan.plan_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">
                {Math.round(plan.confidence_score * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Genel İlerleme</span>
            <span className="font-medium">{Math.round(getTotalProgress())}%</span>
          </div>
          <Progress value={getTotalProgress()} className="h-2" />
        </div>
      </div>

      {/* Schedule */}
      <div className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Haftalık Program
        </h4>
        
        <div className="space-y-3">
          {schedule.map((daySchedule, dayIndex) => {
            const isExpanded = expandedDays.has(daySchedule.day)
            const dayProgress = getDayProgress(dayIndex, daySchedule.subjects)
            
            return (
              <motion.div
                key={daySchedule.day}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleDay(daySchedule.day)}
                  className="w-full p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{daySchedule.day}</span>
                      <span className="text-sm text-muted-foreground">
                        {daySchedule.subjects.length} konu
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 text-xs text-right">
                        {Math.round(dayProgress)}%
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <Progress value={dayProgress} className="h-1 mt-2" />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3 bg-background">
                        {daySchedule.subjects.map((subject, subjectIndex) => {
                          const itemId = `${dayIndex}-${subjectIndex}`
                          const isCompleted = completedItems.has(itemId)
                          
                          return (
                            <motion.div
                              key={subjectIndex}
                              className={`p-3 rounded-lg border transition-all ${
                                isCompleted 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                  : 'bg-card border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() => toggleItemComplete(dayIndex, subjectIndex)}
                                      className="flex-shrink-0"
                                    >
                                      {isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                      )}
                                    </button>
                                    <h5 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                      {subject.subject}
                                    </h5>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      subject.type === 'TYT' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                      {subject.type}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                                    <div className="flex items-center space-x-1">
                                      <Target className="w-4 h-4" />
                                      <span>{subject.question_count} soru</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{subject.duration_minutes} dk</span>
                                    </div>
                                  </div>

                                  {subject.focus_topics.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs text-muted-foreground mb-1">Odak Konular:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {subject.focus_topics.map((topic, index) => (
                                          <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-muted rounded-md"
                                          >
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {subject.notes && (
                                    <p className="text-xs text-muted-foreground italic">
                                      {subject.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col items-end space-y-1 ml-4">
                                  <div className={`text-lg ${getConfidenceColor(subject.confidence)}`}>
                                    {getConfidenceIcon(subject.confidence)}
                                  </div>
                                  <span className={`text-xs ${getConfidenceColor(subject.confidence)}`}>
                                    %{Math.round(subject.confidence * 100)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Tips Section */}
      {tips.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Öneriler
          </h4>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-400">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {plan.notes && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Notlar</h4>
          <p className="text-sm bg-muted/50 p-3 rounded-lg">{plan.notes}</p>
        </div>
      )}
    </motion.div>
  )
}