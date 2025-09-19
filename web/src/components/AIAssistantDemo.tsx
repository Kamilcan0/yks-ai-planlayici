/**
 * YKS Akıllı Asistanı - Demo Komponenti
 * AI asistan özelliklerini test etmek için demo arayüzü
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  User,
  Settings,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Download,
  RefreshCw,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIAssistant } from '@/lib/ai-assistant/useAIAssistant';

export function AIAssistantDemo() {
  const {
    state,
    createUser,
    createGuestUser,
    generatePlan,
    updatePerformance,
    startStudySession,
    endStudySession,
    exportData,
    clearError,
    refreshData,
    getProfileSummary,
    getWeeklyReport,
    healthCheck
  } = useAIAssistant();

  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simulationData, setSimulationData] = useState({
    questionsAnswered: 20,
    correctAnswers: 16,
    topicId: 'tyt_matematik_fonksiyonlar'
  });

  const handleCreateGuestUser = () => {
    createGuestUser('sayisal', 'orta');
  };

  const handleGeneratePlan = async () => {
    try {
      await generatePlan(true);
    } catch (error) {
      console.error('Plan oluşturma hatası:', error);
    }
  };

  const handleStartSession = () => {
    const sessionId = startStudySession(simulationData.topicId, 'study');
    setActiveSession(sessionId);
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    
    try {
      await endStudySession(activeSession);
      setActiveSession(null);
    } catch (error) {
      console.error('Oturum bitirme hatası:', error);
    }
  };

  const handleSimulatePerformance = async () => {
    try {
      await updatePerformance({
        userId: state.currentUser?.identity.id || 'guest',
        topicId: simulationData.topicId,
        questionsAnswered: simulationData.questionsAnswered,
        correctAnswers: simulationData.correctAnswers,
        timeSpent: 60,
        sessionType: 'study'
      });
    } catch (error) {
      console.error('Performans simülasyonu hatası:', error);
    }
  };

  const profileSummary = getProfileSummary();
  const weeklyReport = getWeeklyReport();
  const systemHealth = healthCheck();

  if (!state.isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>AI Asistan yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            YKS Akıllı Asistanı Demo
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bildirimler */}
          <AnimatePresence>
            {state.notifications.map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm"
              >
                <Info className="w-4 h-4 inline mr-2" />
                {notification}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Hata mesajı */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {state.error}
              <Button variant="outline" size="sm" onClick={clearError} className="ml-auto">
                Tamam
              </Button>
            </motion.div>
          )}

          {/* Hızlı Başlangıç */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Button
              onClick={handleCreateGuestUser}
              disabled={state.isLoading}
              className="flex items-center gap-2"
              variant="outline"
            >
              <User className="w-4 h-4" />
              Guest Giriş
            </Button>
            
            <Button
              onClick={handleGeneratePlan}
              disabled={!state.currentUser || state.isGenerating}
              className="flex items-center gap-2"
            >
              {state.isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              Plan Üret
            </Button>

            <Button
              onClick={refreshData}
              disabled={state.isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </Button>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gelişmiş
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Durumu */}
      {state.currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Kullanıcı Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>ID: {state.currentUser.identity.id}</div>
                <div>Alan: {state.currentUser.field}</div>
                <div>Seviye: {state.currentUser.level}</div>
                <div>Tip: {state.currentUser.identity.isGuest ? 'Misafir' : 'Kayıtlı'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Performans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Başarı: %{state.currentUser.performance.successRate.toFixed(1)}</div>
                <div>Soru: {state.currentUser.performance.totalQuestionsSolved}</div>
                <div>Seri: {state.currentUser.performance.streakDays} gün</div>
                <div>Haftalık: {Math.round(state.currentUser.performance.studyTimeWeek)} dk</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Sistem Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {systemHealth.durum}
                </div>
                <div>Plan: {state.aiOutput ? 'Var' : 'Yok'}</div>
                <div>Son Güncelleme: {state.lastUpdateTime ? 
                  new Date(state.lastUpdateTime).toLocaleTimeString('tr-TR') : 'Yok'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Çıktısı */}
      {state.aiOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Çıktısı</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('json')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {state.aiOutput.haftalık_plan.length}
                </div>
                <div className="text-sm text-blue-600">Gün</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {state.aiOutput.haftalık_plan.reduce((sum, day) => 
                    sum + day.TYT.length + day.AYT.length + (day.tekrar?.length || 0), 0
                  )}
                </div>
                <div className="text-sm text-green-600">Toplam Blok</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  %{state.aiOutput.istatistikler.başarı_oranı}
                </div>
                <div className="text-sm text-purple-600">Başarı Oranı</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {state.aiOutput.adaptasyon_notları.length}
                </div>
                <div className="text-sm text-orange-600">Adaptasyon</div>
              </div>
            </div>

            {/* Haftalık Plan Özeti */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.aiOutput.haftalık_plan.map((day, index) => (
                <div key={index} className="p-2 border rounded-lg">
                  <div className="font-medium">{day.gün}</div>
                  <div className="text-sm text-gray-600">
                    TYT: {day.TYT.length} blok, AYT: {day.AYT.length} blok
                    {day.tekrar && `, Tekrar: ${day.tekrar.length} blok`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gelişmiş Özellikler */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle>Gelişmiş Test Araçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Oturum Simülasyonu */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Çalışma Oturumu Simülasyonu</h4>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Soru Sayısı</label>
                  <input
                    type="number"
                    value={simulationData.questionsAnswered}
                    onChange={(e) => setSimulationData(prev => ({
                      ...prev,
                      questionsAnswered: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Doğru Cevap</label>
                  <input
                    type="number"
                    value={simulationData.correctAnswers}
                    onChange={(e) => setSimulationData(prev => ({
                      ...prev,
                      correctAnswers: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Konu ID</label>
                  <select
                    value={simulationData.topicId}
                    onChange={(e) => setSimulationData(prev => ({
                      ...prev,
                      topicId: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="tyt_matematik_fonksiyonlar">TYT Matematik - Fonksiyonlar</option>
                    <option value="tyt_fizik_mekanik">TYT Fizik - Mekanik</option>
                    <option value="ayt_matematik_turev">AYT Matematik - Türev</option>
                    <option value="ayt_kimya_atom">AYT Kimya - Atom</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                {activeSession ? (
                  <Button onClick={handleEndSession} className="flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    Oturumu Bitir
                  </Button>
                ) : (
                  <Button onClick={handleStartSession} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Oturum Başlat
                  </Button>
                )}
                
                <Button
                  onClick={handleSimulatePerformance}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Performans Simüle Et
                </Button>
              </div>
            </div>

            {/* Veri Görüntüleme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Profil Özeti</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(profileSummary, null, 2)}
                </pre>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Haftalık Rapor</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(weeklyReport, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
