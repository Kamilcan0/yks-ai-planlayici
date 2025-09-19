import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePlanStore, Subject } from '@/store/planStore'
import { cn } from '@/lib/utils'

const subjectColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

export function SubjectForm() {
  const { subjects, addSubject, updateSubject, removeSubject } = usePlanStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    level: 3,
    color: subjectColors[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      updateSubject(editingId, formData)
      setEditingId(null)
    } else {
      addSubject(formData.name, formData.level, formData.color)
      setIsAdding(false)
    }
    
    setFormData({ name: '', level: 3, color: subjectColors[0] })
  }

  const startEdit = (subject: Subject) => {
    setFormData({ name: subject.name, level: subject.level, color: subject.color })
    setEditingId(subject.id)
    setIsAdding(true)
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', level: 3, color: subjectColors[0] })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dersler</CardTitle>
          <Button 
            onClick={() => setIsAdding(true)} 
            disabled={isAdding}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ders Ekle
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 p-4 border rounded-lg bg-muted/30"
          >
            <div>
              <label className="text-sm font-medium">Ders Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Matematik, Fizik..."
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Seviye (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Başlangıç</span>
                <span className="font-medium">{formData.level}</span>
                <span>İleri</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Renk</label>
              <div className="flex space-x-2 mt-2">
                {subjectColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "w-6 h-6 rounded-full border-2",
                      formData.color === color ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" size="sm">
                {editingId ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                İptal
              </Button>
            </div>
          </motion.form>
        )}

        <div className="space-y-2">
          {subjects.map(subject => (
            <motion.div
              key={subject.id}
              layout
              className={cn(
                "flex items-center justify-between p-3 border rounded-lg transition-colors",
                subject.isActive ? "bg-background" : "bg-muted/50 opacity-75"
              )}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <div>
                  <p className="font-medium">{subject.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Seviye {subject.level}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateSubject(subject.id, { isActive: !subject.isActive })}
                >
                  {subject.isActive ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(subject)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSubject(subject.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
