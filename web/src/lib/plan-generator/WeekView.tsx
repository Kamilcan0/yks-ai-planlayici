/**
 * YKS Plan Generator - Week View Component
 * Haftalık planı görüntülemek için React komponenti
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  TrendingUp
} from 'lucide-react';

import { WeekPlanResult, DayPlan, StudyBlock } from './types';
import usePlanGenerator from './usePlanGenerator';

// Component props
interface WeekViewProps {
  plan?: WeekPlanResult;
  onBlockComplete?: (dayIndex: number, blockId: string) => void;
  showStats?: boolean;
  className?: string;
}

// Gün renklerinin tanımı
const DAY_COLORS = {
  TYT: 'bg-blue-50 border-blue-200 text-blue-900',
  AYT: 'bg-green-50 border-green-200 text-green-900',
  Tekrar: 'bg-purple-50 border-purple-200 text-purple-900'
};

const BLOCK_COLORS = {
  TYT: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
  AYT: 'bg-green-100 hover:bg-green-200 border-green-300',
  Tekrar: 'bg-purple-100 hover:bg-purple-200 border-purple-300'
};

/**
 * Çalışma bloğu komponenti
 */
const StudyBlockCard: React.FC<{
  block: StudyBlock;
  dayType: string;
  onToggleComplete: () => void;
}> = ({ block, dayType, onToggleComplete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`
        p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${BLOCK_COLORS[dayType as keyof typeof BLOCK_COLORS]}
        ${block.done ? 'opacity-60 bg-gray-100' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggleComplete}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{block.time}</span>
          </div>
          
          <h4 className={`font-semibold mb-1 ${block.done ? 'line-through' : ''}`}>
            {block.subject}
          </h4>
          
          <div className="flex items-center gap-1 mb-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{block.resource}</span>
          </div>
          
          {block.topicsToFocus && block.topicsToFocus.length > 0 && (
            <div className="text-xs text-gray-500">
              Odak: {block.topicsToFocus.join(', ')}
            </div>
          )}
        </div>
        
        <button
          className={`ml-2 p-1 rounded-full transition-colors ${
            block.done 
              ? 'text-green-600 hover:text-green-700' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {block.done ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {isHovered && block.difficulty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs"
        >
          <span className={`px-2 py-1 rounded-full text-white ${
            block.difficulty === 'kolay' ? 'bg-green-500' :
            block.difficulty === 'orta' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {block.difficulty.charAt(0).toUpperCase() + block.difficulty.slice(1)}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Günlük plan komponenti
 */
const DayPlanCard: React.FC<{
  day: DayPlan;
  dayIndex: number;
  onBlockComplete: (blockId: string) => void;
}> = ({ day, dayIndex, onBlockComplete }) => {
  const completedBlocks = day.blocks.filter(block => block.done).length;
  const completionRate = day.blocks.length > 0 ? (completedBlocks / day.blocks.length) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: dayIndex * 0.1 }}
      className={`
        p-4 rounded-xl border-2 ${DAY_COLORS[day.type as keyof typeof DAY_COLORS]}
        ${day.blocks.length === 0 ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{day.dayName}</h3>
          {day.date && (
            <p className="text-sm opacity-75">
              {new Date(day.date).toLocaleDateString('tr-TR')}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            day.type === 'TYT' ? 'bg-blue-200 text-blue-800' :
            day.type === 'AYT' ? 'bg-green-200 text-green-800' :
            'bg-purple-200 text-purple-800'
          }`}>
            {day.type}
          </span>
          
          {day.totalMinutes && day.totalMinutes > 0 && (
            <p className="text-sm mt-1 opacity-75">
              {Math.round(day.totalMinutes / 60 * 10) / 10} saat
            </p>
          )}
        </div>
      </div>

      {day.blocks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>İlerleme</span>
            <span>{completedBlocks}/{day.blocks.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {day.blocks.length > 0 ? (
            day.blocks.map((block) => (
              <StudyBlockCard
                key={block.id}
                block={block}
                dayType={day.type}
                onToggleComplete={() => onBlockComplete(block.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">
                {day.notes || 'Bu gün çalışma planlanmadı'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {day.notes && day.blocks.length > 0 && (
        <div className="mt-3 p-2 bg-white bg-opacity-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="text-sm">{day.notes}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Ana haftalık görünüm komponenti
 */
export const WeekView: React.FC<WeekViewProps> = ({ 
  plan: externalPlan, 
  onBlockComplete,
  showStats = true,
  className = ""
}) => {
  const { 
    plan: hookPlan, 
    regenerate, 
    exportPlan, 
    isGenerating,
    getStats 
  } = usePlanGenerator();
  
  const plan = externalPlan || hookPlan;
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  const handleBlockComplete = (dayIndex: number, blockId: string) => {
    const newCompleted = new Set(completedBlocks);
    
    if (newCompleted.has(blockId)) {
      newCompleted.delete(blockId);
    } else {
      newCompleted.add(blockId);
    }
    
    setCompletedBlocks(newCompleted);
    onBlockComplete?.(dayIndex, blockId);
  };

  const stats = getStats();

  if (!plan) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Henüz bir plan oluşturulmadı
        </h3>
        <p className="text-gray-500">
          Çalışma planı oluşturmak için form doldurarak başlayın
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - İstatistikler ve Aksiyonlar */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Haftalık Çalışma Planın
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stats.totalHours} saat toplam
                </span>
                <span>
                  Günde ortalama {stats.averageHoursPerDay} saat
                </span>
                <span>
                  {stats.completedBlocks}/{stats.totalBlocks} blok tamamlandı
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => regenerate()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Yenile
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => exportPlan('json')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                İndir
              </motion.button>
            </div>
          </div>
          
          {/* İlerleme Çubuğu */}
          {stats.totalBlocks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Genel İlerleme</span>
                <span>{Math.round(stats.completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Uyarılar */}
      {plan.warnings && plan.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Dikkat Edilmesi Gerekenler:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {plan.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Günlük Planlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plan.weekPlan.map((day, index) => (
          <DayPlanCard
            key={`${day.dayName}-${index}`}
            day={day}
            dayIndex={index}
            onBlockComplete={(blockId) => handleBlockComplete(index, blockId)}
          />
        ))}
      </div>

      {/* Meta Bilgiler */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-gray-500 pt-4"
      >
        Plan oluşturulma: {new Date(plan.meta.generatedAt).toLocaleString('tr-TR')}
        {plan.meta.weekStartDate && (
          <span className="ml-4">
            Hafta: {new Date(plan.meta.weekStartDate).toLocaleDateString('tr-TR')}
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default WeekView;
