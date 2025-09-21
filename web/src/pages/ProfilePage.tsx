import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  Settings,
  Edit,
  Save,
  X,
  BarChart3,
  PieChart,
  Activity,
  Trophy,
  Fire,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useToast } from '@/components/ui/toaster'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'

// Mock data for charts
const studyHoursData = [
  { day: 'Pzt', hours: 3.5 },
  { day: 'Sal', hours: 4.2 },
  { day: 'Çar', hours: 2.8 },
  { day: 'Per', hours: 5.1 },
  { day: 'Cum', hours: 4.5 },
  { day: 'Cmt', hours: 6.2 },
  { day: 'Paz', hours: 3.8 }
]

const subjectDistribution = [
  { name: 'Matematik', value: 35, color: '#3b82f6' },
  { name: 'Türkçe', value: 25, color: '#10b981' },
  { name: 'Fizik', value: 20, color: '#f59e0b' },
  { name: 'Kimya', value: 20, color: '#ef4444' }
]

const weeklyProgress = [
  { week: 'Hafta 1', completed: 85 },
  { week: 'Hafta 2', completed: 92 },
  { week: 'Hafta 3', completed: 78 },
  { week: 'Hafta 4', completed: 95 }
]

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  achieved: boolean
  achievedDate?: string
  progress?: number
  target?: number
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: '7 Gün Seri',
    description: '7 gün üst üste çalışma',
    icon: '🔥',
    achieved: true,
    achievedDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Matematik Ustası',
    description: '100 matematik sorusu çöz',
    icon: '🧮',
    achieved: true,
    achievedDate: '2024-01-12'
  },
  {
    id: '3',
    title: 'Hızlı Başlangıç',
    description: 'İlk haftada %90 tamamlama',
    icon: '⚡',
    achieved: false,
    progress: 85,
    target: 90
  },
  {
    id: '4',
    title: 'Kaynak Araştırmacısı',
    description: '50 farklı kaynak incele',
    icon: '📚',
    achieved: false,
    progress: 32,
    target: 50
  }
]

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    seviye: profile?.seviye || 'orta',
    field: profile?.field || 'sayisal',
    haftalık_saat: profile?.haftalık_saat || 20,
    hedef_tarih: profile?.hedef_tarih || ''
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalHours: 142.5,
    completedTasks: 156,
    streak: 12,
    averageDaily: 4.2,
    weeklyGoal: 85,
    achievements: 8
  })

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await updateProfile(editForm)
      setIsEditing(false)
      toast({
        title: 'Başarılı!',
        description: 'Profil bilgileriniz güncellendi',
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken hata oluştu',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: profile?.name || '',
      seviye: profile?.seviye || 'orta',
      field: profile?.field || 'sayisal',
      haftalık_saat: profile?.haftalık_saat || 20,
      hedef_tarih: profile?.hedef_tarih || ''
    })
    setIsEditing(false)
  }

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'sayisal': return 'Sayısal'
      case 'esit': return 'Eşit Ağırlık'
      case 'sozel': return 'Sözel'
      default: return field
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile?.name || 'Kullanıcı'}</h1>
                <p className="text-blue-100">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {getFieldLabel(profile?.field || 'sayisal')}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {getLevelLabel(profile?.seviye || 'orta')}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'İptal' : 'Düzenle'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profil Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Ad Soyad</label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Adınızı girin"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Seviye</label>
                      <Select value={editForm.seviye} onValueChange={(value) => setEditForm(prev => ({ ...prev, seviye: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baslangic">Başlangıç</SelectItem>
                          <SelectItem value="orta">Orta</SelectItem>
                          <SelectItem value="ileri">İleri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Alan</label>
                      <Select value={editForm.field} onValueChange={(value) => setEditForm(prev => ({ ...prev, field: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sayisal">Sayısal</SelectItem>
                          <SelectItem value="esit">Eşit Ağırlık</SelectItem>
                          <SelectItem value="sozel">Sözel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Haftalık Çalışma Saati</label>
                      <Input
                        type="number"
                        value={editForm.haftalık_saat}
                        onChange={(e) => setEditForm(prev => ({ ...prev, haftalık_saat: parseInt(e.target.value) || 20 }))}
                        min="5"
                        max="80"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Hedef Tarih</label>
                      <Input
                        type="date"
                        value={editForm.hedef_tarih}
                        onChange={(e) => setEditForm(prev => ({ ...prev, hedef_tarih: e.target.value }))}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4 mr-2" />}
                        Kaydet
                      </Button>
                      <Button 
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1"
                      >
                        İptal
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Seviye</span>
                      <span className="font-medium">{getLevelLabel(profile?.seviye || 'orta')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Alan</span>
                      <span className="font-medium">{getFieldLabel(profile?.field || 'sayisal')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Haftalık Hedef</span>
                      <span className="font-medium">{profile?.haftalık_saat || 20} saat</span>
                    </div>
                    {profile?.hedef_tarih && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Hedef Tarih</span>
                        <span className="font-medium">{new Date(profile.hedef_tarih).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Hızlı İstatistikler</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.totalHours}h</div>
                    <div className="text-xs text-muted-foreground">Toplam Çalışma</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Tamamlanan</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                    <div className="text-xs text-muted-foreground">Gün Serisi</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.achievements}</div>
                    <div className="text-xs text-muted-foreground">Başarım</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics & Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Haftalık Çalışma Saatleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={studyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} saat`, 'Çalışma Saati']}
                      labelFormatter={(label) => `Gün: ${label}`}
                    />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Ders Dağılımı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={subjectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {subjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {subjectDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Haftalık İlerleme</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Tamamlanma']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Başarımlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.achieved 
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          
                          {achievement.achieved ? (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge variant="default" className="bg-green-600">
                                Tamamlandı
                              </Badge>
                              {achievement.achievedDate && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(achievement.achievedDate).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                            </div>
                          ) : achievement.progress !== undefined && achievement.target !== undefined ? (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>İlerleme</span>
                                <span>{achievement.progress}/{achievement.target}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.target) * 100} 
                                className="h-2"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
