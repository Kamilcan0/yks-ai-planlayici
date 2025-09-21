/**
 * YKS Akıllı Asistanı - Veri Deposu
 * İstatistik yönetimi, performans takibi ve veri analizi
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import { 
  UserProfile, 
  StudySession, 
  TopicPerformance, 
  UpdatePerformanceRequest, 
  AIAssistantError,
  TOPIC_CATEGORIES 
} from './types';
import { userManager } from './user-manager';

// Oturum verileri için interface
interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  topicId: string;
  questionsAnswered: number;
  correctAnswers: number;
  sessionType: 'study' | 'review' | 'test';
  completed: boolean;
}

/**
 * Veri Deposu ve İstatistik Yöneticisi
 */
export class DataStore {
  private sessions: Map<string, SessionData> = new Map();
  private dailyStats: Map<string, any> = new Map(); // tarih -> stats

  constructor() {
    this.loadStoredData();
  }

  /**
   * Yeni çalışma oturumu başlat
   */
  startStudySession(topicId: string, sessionType: 'study' | 'review' | 'test' = 'study'): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const session: SessionData = {
      id: sessionId,
      startTime: Date.now(),
      topicId,
      questionsAnswered: 0,
      correctAnswers: 0,
      sessionType,
      completed: false
    };

    this.sessions.set(sessionId, session);
    this.saveToStorage();
    
    return sessionId;
  }

  /**
   * Oturum güncelle (soru çözümü)
   */
  updateSession(sessionId: string, questionsAnswered: number, correctAnswers: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AIAssistantError('Oturum bulunamadı', 'SESSION_NOT_FOUND');
    }

    session.questionsAnswered += questionsAnswered;
    session.correctAnswers += correctAnswers;
    
    this.sessions.set(sessionId, session);
    this.saveToStorage();
  }

  /**
   * Oturum bitir
   */
  endStudySession(sessionId: string): StudySession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AIAssistantError('Oturum bulunamadı', 'SESSION_NOT_FOUND');
    }

    session.endTime = Date.now();
    session.completed = true;

    // Kullanıcı performansını güncelle
    this.updateUserPerformance({
      userId: userManager.getCurrentUser()?.id || '',
      topicId: session.topicId,
      questionsAnswered: session.questionsAnswered,
      correctAnswers: session.correctAnswers,
      timeSpent: (session.endTime - session.startTime) / 1000 / 60, // dakika
      sessionType: session.sessionType
    });

    // StudySession formatına çevir
    const studySession: StudySession = {
      id: sessionId,
      userId: userManager.getCurrentUser()?.id || '',
      topicId: session.topicId,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      questionsSolved: session.questionsAnswered,
      correctAnswers: session.correctAnswers,
      sessionType: session.sessionType,
      metadata: {
        duration: (session.endTime - session.startTime) / 1000 / 60,
        accuracy: session.questionsAnswered > 0 ? (session.correctAnswers / session.questionsAnswered) * 100 : 0
      }
    };

    // Günlük istatistikleri güncelle
    this.updateDailyStats(studySession);

    this.sessions.delete(sessionId);
    this.saveToStorage();

    return studySession;
  }

  /**
   * Kullanıcı performansını güncelle
   */
  updateUserPerformance(request: UpdatePerformanceRequest): void {
    const profile = userManager.getUserProfile();
    if (!profile) return;

    // Genel performans güncelle
    const performance = profile.performance;
    performance.totalQuestionsSolved += request.questionsAnswered;
    performance.correctAnswers += request.correctAnswers;
    performance.incorrectAnswers += (request.questionsAnswered - request.correctAnswers);
    
    // Başarı oranını yeniden hesapla
    if (performance.totalQuestionsSolved > 0) {
      performance.successRate = (performance.correctAnswers / performance.totalQuestionsSolved) * 100;
    }

    // Ortalama süre güncelle
    const avgTime = request.timeSpent / request.questionsAnswered;
    if (performance.averageTimePerQuestion === 0) {
      performance.averageTimePerQuestion = avgTime;
    } else {
      performance.averageTimePerQuestion = (performance.averageTimePerQuestion + avgTime) / 2;
    }

    // Çalışma sürelerini güncelle
    performance.studyTimeToday += request.timeSpent;
    performance.studyTimeWeek += request.timeSpent;
    performance.studyTimeTotal += request.timeSpent;

    // Konu bazlı performans güncelle
    this.updateTopicPerformance(profile, request);

    // Streak günlerini hesapla
    this.updateStreakDays(profile);

    // Profili kaydet
    userManager.updateProfile({ performance, topicPerformances: profile.topicPerformances });
  }

  /**
   * Konu bazlı performans güncelle
   */
  private updateTopicPerformance(profile: UserProfile, request: UpdatePerformanceRequest): void {
    const topicId = request.topicId;
    const existing = profile.topicPerformances[topicId];
    
    if (existing) {
      // Mevcut veriyi güncelle
      existing.questionsSolved += request.questionsAnswered;
      existing.correctAnswers += request.correctAnswers;
      existing.successRate = (existing.correctAnswers / existing.questionsSolved) * 100;
      existing.lastStudied = new Date().toISOString();
      
      // Ortalama süre güncelle
      const newAvgTime = request.timeSpent / request.questionsAnswered;
      existing.averageTime = (existing.averageTime + newAvgTime) / 2;
      
      // Tekrar gerekli mi değerlendir
      existing.needsReview = existing.successRate < 70 || 
                            (Date.now() - new Date(existing.lastStudied).getTime()) > 7 * 24 * 60 * 60 * 1000;
      
      // Öncelik güncelle (başarısızlık oranına göre)
      existing.priority = existing.successRate < 50 ? 5 : 
                         existing.successRate < 70 ? 4 :
                         existing.successRate < 85 ? 3 : 2;
    } else {
      // Yeni konu performansı oluştur
      const successRate = (request.correctAnswers / request.questionsAnswered) * 100;
      
      profile.topicPerformances[topicId] = {
        topicId,
        topicName: this.getTopicName(topicId),
        questionsSolved: request.questionsAnswered,
        correctAnswers: request.correctAnswers,
        averageTime: request.timeSpent / request.questionsAnswered,
        successRate,
        difficultyLevel: profile.level,
        lastStudied: new Date().toISOString(),
        needsReview: successRate < 70,
        priority: successRate < 50 ? 5 : 
                 successRate < 70 ? 4 :
                 successRate < 85 ? 3 : 2
      };
    }
  }

  /**
   * Konu adını al
   */
  private getTopicName(topicId: string): string {
    // Basit topic ID'den isim çıkarma
    const parts = topicId.split('_');
    if (parts.length >= 2) {
      const category = parts[0]; // TYT veya AYT
      const subject = parts[1]; // matematik, fizik vb.
      const topic = parts.slice(2).join(' '); // Konu adı
      
      return `${category.toUpperCase()} ${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${topic}`;
    }
    
    return topicId;
  }

  /**
   * Streak günlerini güncelle
   */
  private updateStreakDays(profile: UserProfile): void {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const todayStats = this.dailyStats.get(today);
    const yesterdayStats = this.dailyStats.get(yesterday);
    
    if (todayStats && todayStats.studyTime > 0) {
      if (yesterdayStats && yesterdayStats.studyTime > 0) {
        // Dünde çalışılmış, streak devam ediyor
        profile.performance.streakDays += 1;
      } else {
        // Dün çalışılmamış, streak sıfırlanır
        profile.performance.streakDays = 1;
      }
    }
  }

  /**
   * Günlük istatistikleri güncelle
   */
  private updateDailyStats(session: StudySession): void {
    const dateKey = session.startTime.toDateString();
    const existing = this.dailyStats.get(dateKey) || {
      date: dateKey,
      studyTime: 0,
      questionsSolved: 0,
      correctAnswers: 0,
      sessionCount: 0,
      topics: new Set()
    };

    existing.studyTime += session.metadata.duration;
    existing.questionsSolved += session.questionsSolved;
    existing.correctAnswers += session.correctAnswers;
    existing.sessionCount += 1;
    existing.topics.add(session.topicId);

    this.dailyStats.set(dateKey, existing);
    this.saveToStorage();
  }

  /**
   * Zayıf konuları analiz et
   */
  getWeakTopics(profile: UserProfile, limit: number = 5): TopicPerformance[] {
    return Object.values(profile.topicPerformances)
      .filter(topic => topic.successRate < 70 || topic.needsReview)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, limit);
  }

  /**
   * Güçlü konuları analiz et
   */
  getStrongTopics(profile: UserProfile, limit: number = 5): TopicPerformance[] {
    return Object.values(profile.topicPerformances)
      .filter(topic => topic.successRate >= 85)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  /**
   * Haftalık özet al
   */
  getWeeklyReport(profile: UserProfile): any {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyStats = {
      totalStudyTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      sessionsCount: 0,
      topicsStudied: new Set(),
      dailyBreakdown: [] as any[]
    };

    // Son 7 günün verilerini topla
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toDateString();
      const dayStats = this.dailyStats.get(dateKey);

      if (dayStats) {
        weeklyStats.totalStudyTime += dayStats.studyTime;
        weeklyStats.totalQuestions += dayStats.questionsSolved;
        weeklyStats.correctAnswers += dayStats.correctAnswers;
        weeklyStats.sessionsCount += dayStats.sessionCount;
        dayStats.topics.forEach((topic: string) => weeklyStats.topicsStudied.add(topic));
      }

      weeklyStats.dailyBreakdown.push({
        date: date.toLocaleDateString('tr-TR'),
        studyTime: dayStats?.studyTime || 0,
        questions: dayStats?.questionsSolved || 0,
        accuracy: dayStats ? (dayStats.correctAnswers / dayStats.questionsSolved * 100) : 0
      });
    }

    return {
      ...weeklyStats,
      topicsStudied: weeklyStats.topicsStudied.size,
      averageAccuracy: weeklyStats.totalQuestions > 0 ? 
        (weeklyStats.correctAnswers / weeklyStats.totalQuestions * 100) : 0,
      averageStudyTime: weeklyStats.totalStudyTime / 7
    };
  }

  /**
   * Performans trendi analizi
   */
  getPerformanceTrend(profile: UserProfile, days: number = 14): any {
    const trends = {
      accuracy: [] as number[],
      studyTime: [] as number[],
      questionVolume: [] as number[],
      improvement: 'stable' as 'improving' | 'declining' | 'stable'
    };

    // Son N günün verilerini analiz et
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toDateString();
      const dayStats = this.dailyStats.get(dateKey);

      if (dayStats) {
        const accuracy = dayStats.questionsSolved > 0 ? 
          (dayStats.correctAnswers / dayStats.questionsSolved * 100) : 0;
        
        trends.accuracy.push(accuracy);
        trends.studyTime.push(dayStats.studyTime);
        trends.questionVolume.push(dayStats.questionsSolved);
      } else {
        trends.accuracy.push(0);
        trends.studyTime.push(0);
        trends.questionVolume.push(0);
      }
    }

    // Trend analizi
    const recentAccuracy = trends.accuracy.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const olderAccuracy = trends.accuracy.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
    
    if (recentAccuracy > olderAccuracy + 5) {
      trends.improvement = 'improving';
    } else if (recentAccuracy < olderAccuracy - 5) {
      trends.improvement = 'declining';
    }

    return trends;
  }

  /**
   * Verileri localStorage'a kaydet
   */
  private saveToStorage(): void {
    try {
      const data = {
        sessions: Array.from(this.sessions.entries()),
        dailyStats: Array.from(this.dailyStats.entries()),
        lastSaved: Date.now()
      };
      
      localStorage.setItem('yks_ai_data_store', JSON.stringify(data));
    } catch (error) {
      console.error('Veri kaydedilemedi:', error);
    }
  }

  /**
   * localStorage'dan verileri yükle
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('yks_ai_data_store');
      if (stored) {
        const data = JSON.parse(stored);
        
        this.sessions = new Map(data.sessions || []);
        this.dailyStats = new Map(data.dailyStats || []);
      }
    } catch (error) {
      console.warn('Veri yüklenemedi:', error);
    }
  }

  /**
   * Verileri temizle
   */
  clearAllData(): void {
    this.sessions.clear();
    this.dailyStats.clear();
    localStorage.removeItem('yks_ai_data_store');
  }

  /**
   * Veri yedeklemesi (JSON export)
   */
  exportData(): string {
    const data = {
      userProfile: userManager.getUserProfile(),
      sessions: Array.from(this.sessions.entries()),
      dailyStats: Array.from(this.dailyStats.entries()),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Veri geri yükleme (JSON import)
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.sessions) {
        this.sessions = new Map(data.sessions);
      }
      
      if (data.dailyStats) {
        this.dailyStats = new Map(data.dailyStats);
      }
      
      if (data.userProfile) {
        userManager.updateProfile(data.userProfile);
      }
      
      this.saveToStorage();
    } catch (error) {
      throw new AIAssistantError('Veri geri yüklenemedi', 'IMPORT_ERROR', error);
    }
  }
}

// Singleton instance
export const dataStore = new DataStore();
