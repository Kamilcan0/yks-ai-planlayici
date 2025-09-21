/**
 * YKS Akıllı Asistanı - React Hook
 * AI asistan özelliklerini React uygulamasında kullanmak için hook
 * 
 * @author AI Assistant
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  aiAssistant,
  userManager,
  dataStore,
  uxEngine,
  AIAssistantOutput,
  UserProfile,
  CreateUserRequest,
  UpdatePerformanceRequest,
  AIAssistantError
} from './index';

// Hook state interface
interface AIAssistantState {
  isInitialized: boolean;
  isLoading: boolean;
  currentUser: UserProfile | null;
  aiOutput: AIAssistantOutput | null;
  notifications: string[];
  error: string | null;
  isGenerating: boolean;
  lastUpdateTime: string | null;
}

// Hook return interface
interface UseAIAssistantReturn {
  // State
  state: AIAssistantState;
  
  // User Management
  createUser: (request: CreateUserRequest) => Promise<UserProfile>;
  createGuestUser: (field: 'sayisal' | 'esit' | 'sozel', level: 'baslangic' | 'orta' | 'ileri') => UserProfile;
  signIn: (emailOrUsername: string) => Promise<UserProfile>;
  signOut: () => void;
  
  // AI Operations
  generatePlan: (forceRegenerate?: boolean, focusTopics?: string[]) => Promise<AIAssistantOutput>;
  updatePerformance: (request: UpdatePerformanceRequest) => Promise<AIAssistantOutput>;
  
  // Data Management
  startStudySession: (topicId: string, sessionType?: 'study' | 'review' | 'test') => string;
  updateSession: (sessionId: string, questionsAnswered: number, correctAnswers: number) => void;
  endStudySession: (sessionId: string) => Promise<AIAssistantOutput>;
  
  // Utilities
  exportData: (format: 'json' | 'csv') => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Analytics
  getProfileSummary: () => any;
  getWeeklyReport: () => any;
  healthCheck: () => any;
}

/**
 * AI Asistan React Hook
 */
export function useAIAssistant(): UseAIAssistantReturn {
  const [state, setState] = useState<AIAssistantState>({
    isInitialized: false,
    isLoading: false,
    currentUser: null,
    aiOutput: null,
    notifications: [],
    error: null,
    isGenerating: false,
    lastUpdateTime: null
  });

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sistem başlangıcı
  useEffect(() => {
    initializeSystem();
  }, []);

  // Bildirim temizleme
  useEffect(() => {
    if (state.notifications.length > 0) {
      notificationTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, notifications: [] }));
      }, 5000);
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [state.notifications]);

  /**
   * Sistem başlatma
   */
  const initializeSystem = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Mevcut kullanıcıyı yükle
      const currentUser = userManager.getUserProfile();
      
      // Eğer kullanıcı varsa AI çıktısını yükle
      let aiOutput = null;
      if (currentUser) {
        // Mevcut planı kontrol et, gerekirse yenile
        const lastUpdate = new Date(currentUser.lastUpdated);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        if (lastUpdate < oneDayAgo) {
          aiOutput = await aiAssistant.generateFullOutput(true);
        } else {
          // Mevcut planı kullan, sadece format değişikliği yapılabilir
          aiOutput = await aiAssistant.generateFullOutput(false);
        }
      }

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        currentUser,
        aiOutput,
        lastUpdateTime: aiOutput ? new Date().toISOString() : null
      }));

      addNotification('AI Asistan başarıyla yüklendi! 🤖');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sistem başlatılamadı';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Bildirim ekle
   */
  const addNotification = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, message].slice(-3) // Son 3 bildirimi tut
    }));
  }, []);

  /**
   * Hata ayarla
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * Kullanıcı oluştur
   */
  const createUser = useCallback(async (request: CreateUserRequest): Promise<UserProfile> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await userManager.createUser(request);
      
      // Yeni kullanıcı için AI planı oluştur
      const aiOutput = await aiAssistant.generateFullOutput(true);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentUser: newUser,
        aiOutput,
        lastUpdateTime: new Date().toISOString()
      }));

      addNotification(`Hoş geldin ${request.email || request.username}! 🎉`);
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [addNotification, setError]);

  /**
   * Guest kullanıcı oluştur
   */
  const createGuestUser = useCallback((
    field: 'sayisal' | 'esit' | 'sozel', 
    level: 'baslangic' | 'orta' | 'ileri'
  ): UserProfile => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const guestUser = userManager.createGuestUser(field, level);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentUser: guestUser
      }));

      addNotification('Misafir olarak giriş yaptın! 👤');
      
      // Async olarak plan oluştur
      aiAssistant.generateFullOutput(true).then(aiOutput => {
        setState(prev => ({
          ...prev,
          aiOutput,
          lastUpdateTime: new Date().toISOString()
        }));
      });

      return guestUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Misafir kullanıcı oluşturulamadı';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [addNotification, setError]);

  /**
   * Giriş yap
   */
  const signIn = useCallback(async (emailOrUsername: string): Promise<UserProfile> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await userManager.signIn(emailOrUsername);
      const aiOutput = await aiAssistant.generateFullOutput(false);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentUser: user,
        aiOutput,
        lastUpdateTime: new Date().toISOString()
      }));

      addNotification('Başarıyla giriş yaptın! 🎉');
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [addNotification, setError]);

  /**
   * Çıkış yap
   */
  const signOut = useCallback(() => {
    userManager.signOut();
    setState({
      isInitialized: true,
      isLoading: false,
      currentUser: null,
      aiOutput: null,
      notifications: [],
      error: null,
      isGenerating: false,
      lastUpdateTime: null
    });
    addNotification('Başarıyla çıkış yaptın! 👋');
  }, [addNotification]);

  /**
   * AI planı üret
   */
  const generatePlan = useCallback(async (
    forceRegenerate: boolean = false,
    focusTopics?: string[]
  ): Promise<AIAssistantOutput> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const aiOutput = await aiAssistant.generateFullOutput(forceRegenerate, focusTopics);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        aiOutput,
        lastUpdateTime: new Date().toISOString()
      }));

      addNotification('Yeni plan oluşturuldu! 📋');
      return aiOutput;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Plan oluşturulamadı';
      setError(errorMessage);
      setState(prev => ({ ...prev, isGenerating: false }));
      throw error;
    }
  }, [addNotification, setError]);

  /**
   * Performans güncelle
   */
  const updatePerformance = useCallback(async (
    request: UpdatePerformanceRequest
  ): Promise<AIAssistantOutput> => {
    try {
      const aiOutput = await aiAssistant.updatePerformanceAndAdapt(request);
      
      setState(prev => ({
        ...prev,
        aiOutput,
        currentUser: userManager.getUserProfile(),
        lastUpdateTime: new Date().toISOString()
      }));

      // Performansa göre bildirim
      const accuracy = request.correctAnswers / request.questionsAnswered;
      if (accuracy >= 0.9) {
        addNotification('Mükemmel performans! 🌟');
      } else if (accuracy >= 0.7) {
        addNotification('İyi gidiyorsun! 📈');
      } else {
        addNotification('Devam et, gelişiyorsun! 💪');
      }

      return aiOutput;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Performans güncellenemedi';
      setError(errorMessage);
      throw error;
    }
  }, [addNotification, setError]);

  /**
   * Çalışma oturumu başlat
   */
  const startStudySession = useCallback((
    topicId: string,
    sessionType: 'study' | 'review' | 'test' = 'study'
  ): string => {
    const sessionId = dataStore.startStudySession(topicId, sessionType);
    addNotification(`${sessionType === 'study' ? 'Çalışma' : sessionType === 'review' ? 'Tekrar' : 'Test'} oturumu başladı! ⏱️`);
    return sessionId;
  }, [addNotification]);

  /**
   * Oturum güncelle
   */
  const updateSession = useCallback((
    sessionId: string,
    questionsAnswered: number,
    correctAnswers: number
  ): void => {
    dataStore.updateSession(sessionId, questionsAnswered, correctAnswers);
  }, []);

  /**
   * Çalışma oturumu bitir
   */
  const endStudySession = useCallback(async (sessionId: string): Promise<AIAssistantOutput> => {
    try {
      const studySession = dataStore.endStudySession(sessionId);
      
      // Performansı güncelle ve AI adaptasyonu yap
      const aiOutput = await updatePerformance({
        userId: state.currentUser?.identity.id || '',
        topicId: studySession.topicId,
        questionsAnswered: studySession.questionsSolved,
        correctAnswers: studySession.correctAnswers,
        timeSpent: studySession.metadata.duration,
        sessionType: studySession.sessionType
      });

      const accuracy = (studySession.correctAnswers / studySession.questionsSolved) * 100;
      addNotification(`Oturum tamamlandı! Başarı: %${accuracy.toFixed(0)} 🎯`);

      return aiOutput;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Oturum bitirilemedi';
      setError(errorMessage);
      throw error;
    }
  }, [state.currentUser, updatePerformance, addNotification, setError]);

  /**
   * Veri export et
   */
  const exportData = useCallback((format: 'json' | 'csv') => {
    try {
      if (!state.aiOutput) {
        throw new Error('Export edilecek veri bulunamadı');
      }

      if (format === 'json') {
        aiAssistant.saveOutputToFile(state.aiOutput);
      } else {
        // CSV export logic burada implement edilecek
        const csvData = `data:text/csv;charset=utf-8,${encodeURIComponent('CSV export yakında!')}`;
        const link = document.createElement('a');
        link.href = csvData;
        link.download = `yks_plan_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      addNotification(`${format.toUpperCase()} dosyası indirildi! 💾`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export başarısız';
      setError(errorMessage);
    }
  }, [state.aiOutput, addNotification, setError]);

  /**
   * Hatayı temizle
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Verileri yenile
   */
  const refreshData = useCallback(async () => {
    if (!state.currentUser) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const aiOutput = await aiAssistant.generateFullOutput(true);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        aiOutput,
        currentUser: userManager.getUserProfile(),
        lastUpdateTime: new Date().toISOString()
      }));

      addNotification('Veriler yenilendi! 🔄');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Veriler yenilenemedi';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.currentUser, addNotification, setError]);

  /**
   * Profil özeti al
   */
  const getProfileSummary = useCallback(() => {
    return aiAssistant.getProfileSummary();
  }, []);

  /**
   * Haftalık rapor al
   */
  const getWeeklyReport = useCallback(() => {
    if (!state.currentUser) return null;
    return dataStore.getWeeklyReport(state.currentUser);
  }, [state.currentUser]);

  /**
   * Sistem sağlığı kontrol et
   */
  const healthCheck = useCallback(() => {
    return aiAssistant.healthCheck();
  }, []);

  return {
    state,
    createUser,
    createGuestUser,
    signIn,
    signOut,
    generatePlan,
    updatePerformance,
    startStudySession,
    updateSession,
    endStudySession,
    exportData,
    clearError,
    refreshData,
    getProfileSummary,
    getWeeklyReport,
    healthCheck
  };
}

// Hook kullanım kolaylığı için export
export default useAIAssistant;
