/**
 * YKS Plan Generator Demo Component
 * Plan üretici modülünü test etmek için demo komponenti
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  Settings, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock
} from 'lucide-react';

import { 
  generateWeekPlan, 
  generateQuickPlan,
  validators,
  utils,
  type GenerateParams,
  type WeekPlanResult,
  type Field,
  type Level
} from '@/lib/plan-generator';

import { WeekView } from '@/lib/plan-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PlanGeneratorDemo() {
  const [plan, setPlan] = useState<WeekPlanResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GenerateParams>({
    field: 'sayisal',
    level: 'orta',
    studyDaysPerWeek: 6,
    weekStartDate: '2025-09-15',
    period: 'Eyl-Kas',
    customSessionDurationMinutes: 90
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Önce parametreleri validate et
      const validationErrors = validators.validateParams(params);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const newPlan = generateWeekPlan(params);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan oluşturulurken hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async (field: Field, level: Level) => {
    setIsGenerating(true);
    setError(null);

    try {
      const newPlan = generateQuickPlan(field, level, 5);
      setPlan(newPlan);
      setParams({
        field,
        level,
        studyDaysPerWeek: 5,
        customSessionDurationMinutes: 90
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hızlı plan oluşturulurken hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!plan) return;

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(plan, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `yks-plan-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
      } else {
        const csvData = utils.exportToCSV(plan);
        const dataBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `yks-plan-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Export işlemi başarısız oldu');
    }
  };

  const stats = plan ? {
    totalHours: utils.calculateTotalHours(plan),
    completedBlocks: utils.calculateCompletedBlocks(plan),
    totalBlocks: plan.weekPlan.reduce((sum, day) => sum + day.blocks.length, 0),
    quality: validators.assessPlanQuality(plan)
  } : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Plan Üretici Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hızlı Test Butonları */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('sayisal', 'baslangic')}
              disabled={isGenerating}
            >
              Sayısal Başlangıç
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('sayisal', 'orta')}
              disabled={isGenerating}
            >
              Sayısal Orta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('esit', 'orta')}
              disabled={isGenerating}
            >
              Eşit Ağırlık
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('sozel', 'ileri')}
              disabled={isGenerating}
            >
              Sözel İleri
            </Button>
          </div>

          {/* Parametreler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alan</label>
              <select
                value={params.field}
                onChange={(e) => setParams(prev => ({ ...prev, field: e.target.value as Field }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="sayisal">Sayısal</option>
                <option value="esit">Eşit Ağırlık</option>
                <option value="sozel">Sözel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Seviye</label>
              <select
                value={params.level}
                onChange={(e) => setParams(prev => ({ ...prev, level: e.target.value as Level }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="baslangic">Başlangıç</option>
                <option value="orta">Orta</option>
                <option value="ileri">İleri</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Çalışma Günü</label>
              <input
                type="number"
                min="1"
                max="7"
                value={params.studyDaysPerWeek}
                onChange={(e) => setParams(prev => ({ ...prev, studyDaysPerWeek: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Süre (dk)</label>
              <input
                type="number"
                min="30"
                max="180"
                step="15"
                value={params.customSessionDurationMinutes}
                onChange={(e) => setParams(prev => ({ ...prev, customSessionDurationMinutes: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hafta Başlangıcı</label>
              <input
                type="date"
                value={params.weekStartDate}
                onChange={(e) => setParams(prev => ({ ...prev, weekStartDate: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dönem</label>
              <select
                value={params.period || ''}
                onChange={(e) => setParams(prev => ({ ...prev, period: e.target.value || undefined }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Normal</option>
                <option value="Eyl-Kas">Eyl-Kas (Soru Bankası)</option>
              </select>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {isGenerating ? 'Oluşturuluyor...' : 'Plan Oluştur'}
            </Button>

            {plan && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON İndir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV İndir
                </Button>
              </>
            )}
          </div>

          {/* Hata Mesajı */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* İstatistikler */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600">Toplam Saat</span>
                </div>
                <div className="font-bold text-blue-900">{stats.totalHours.toFixed(1)}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Toplam Blok</span>
                </div>
                <div className="font-bold text-green-900">{stats.totalBlocks}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600">Kalite Skoru</span>
                </div>
                <div className="font-bold text-purple-900">{stats.quality.score}/100</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-600">Günlük Ort.</span>
                </div>
                <div className="font-bold text-orange-900">
                  {plan?.meta.averageHoursPerDay.toFixed(1)}h
                </div>
              </div>
            </motion.div>
          )}

          {/* Kalite Geri Bildirimi */}
          {stats && stats.quality.feedback.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Plan Değerlendirmesi:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {stats.quality.feedback.map((feedback, index) => (
                  <li key={index}>• {feedback}</li>
                ))}
              </ul>
              {stats.quality.recommendations.length > 0 && (
                <>
                  <h5 className="font-medium text-yellow-800 mt-2 mb-1">Öneriler:</h5>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {stats.quality.recommendations.map((rec, index) => (
                      <li key={index}>→ {rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Görüntüleme */}
      {plan && (
        <WeekView 
          plan={plan}
          showStats={false} // Yukarıda zaten gösteriyoruz
          onBlockComplete={(dayIndex, blockId) => {
            console.log('Blok tamamlandı:', { dayIndex, blockId });
          }}
        />
      )}
    </div>
  );
}
