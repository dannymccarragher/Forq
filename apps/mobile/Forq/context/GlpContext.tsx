import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useApp } from './AppContext';
import * as NotificationService from '@/services/notificationService';

export interface MedicationInfo {
  name: string;
  currentDose: string;
  injectionDay: string; // e.g., "Monday", "Every 3 days"
  startDate: Date;
}

export interface DoseEntry {
  id: string;
  timestamp: Date;
  dose: string;
  notes?: string;
}

export interface SideEffect {
  id: string;
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  notes?: string;
  timestamp: Date;
}

export interface AppetiteLog {
  id: string;
  timestamp: Date;
  hungerLevel: number; // 0-10
  cravingsIntensity: number; // 0-10
  notes?: string;
}

export interface WeightEntry {
  id: string;
  timestamp: Date;
  weight: number;
  unit: 'lbs' | 'kg';
}

export interface DoseProgression {
  phase: number;
  dose: string;
  startDate: Date;
  endDate?: Date;
  status: 'completed' | 'current' | 'upcoming';
}

export interface EducationTip {
  id: string;
  title: string;
  content: string;
  category: 'normal' | 'eating' | 'side-effects' | 'general';
}

interface GlpContextType {
  // Medication info
  medicationInfo: MedicationInfo | null;
  setMedicationInfo: (info: MedicationInfo) => Promise<void>;

  // Dose tracking
  doseHistory: DoseEntry[];
  recordDose: (dose: string, notes?: string) => Promise<void>;
  getLastDose: () => DoseEntry | null;
  getNextDoseDate: () => Date | null;
  getDaysUntilNextDose: () => number | null;

  // Side effects
  sideEffects: SideEffect[];
  recordSideEffect: (name: string, severity: 'none' | 'mild' | 'moderate' | 'severe', notes?: string) => Promise<void>;
  updateSideEffect: (id: string, severity: 'none' | 'mild' | 'moderate' | 'severe', notes?: string) => Promise<void>;
  getTodaysSideEffects: () => SideEffect[];

  // Appetite tracking
  appetiteLogs: AppetiteLog[];
  recordAppetite: (hungerLevel: number, cravingsIntensity: number, notes?: string) => Promise<void>;
  getTodaysAppetite: () => AppetiteLog | null;

  // Weight tracking
  weightEntries: WeightEntry[];
  recordWeight: (weight: number, unit: 'lbs' | 'kg') => Promise<void>;
  getWeeklyWeightTrend: () => WeightEntry[];
  getWeightChange: () => { amount: number; percentage: number } | null;

  // Dose progression
  doseProgression: DoseProgression[];
  setDoseProgression: (progression: DoseProgression[]) => Promise<void>;
  getCurrentPhase: () => DoseProgression | null;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;

  // Loading state
  loading: boolean;
}

const GlpContext = createContext<GlpContextType | undefined>(undefined);

export const useGlp = () => {
  const context = useContext(GlpContext);
  if (!context) {
    throw new Error('useGlp must be used within GlpProvider');
  }
  return context;
};

interface GlpProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  MEDICATION_INFO: 'glp_medication_info',
  DOSE_HISTORY: 'glp_dose_history',
  SIDE_EFFECTS: 'glp_side_effects',
  APPETITE_LOGS: 'glp_appetite_logs',
  WEIGHT_ENTRIES: 'glp_weight_entries',
  DOSE_PROGRESSION: 'glp_dose_progression',
  NOTIFICATIONS_ENABLED: 'glp_notifications_enabled',
};

export const GlpProvider: React.FC<GlpProviderProps> = ({ children }) => {
  const { userId } = useApp();
  const [loading, setLoading] = useState(true);

  const [medicationInfo, setMedicationInfoState] = useState<MedicationInfo | null>(null);
  const [doseHistory, setDoseHistory] = useState<DoseEntry[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [appetiteLogs, setAppetiteLogs] = useState<AppetiteLog[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [doseProgression, setDoseProgressionState] = useState<DoseProgression[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);

  // Load all data on mount and set up notifications
  useEffect(() => {
    if (userId) {
      loadAllData();
      setupNotifications();
    }
  }, [userId]);

  // Update notifications when settings change
  useEffect(() => {
    if (userId && medicationInfo && notificationsEnabled) {
      updateScheduledNotifications();
    } else if (!notificationsEnabled) {
      NotificationService.cancelDoseReminders();
    }
  }, [medicationInfo, notificationsEnabled]);

  const setupNotifications = async () => {
    try {
      await NotificationService.setupNotificationCategories();
      const token = await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        console.log('Push notification token:', token);
      }
    } catch (error) {
      console.error('Failed to set up notifications:', error);
    }
  };

  const updateScheduledNotifications = async () => {
    if (!medicationInfo || !notificationsEnabled) return;

    try {
      const nextDose = getNextDoseDate();
      if (nextDose) {
        await NotificationService.scheduleDoseReminder(
          nextDose,
          medicationInfo.name,
          medicationInfo.currentDose,
          2 // Remind 2 hours before
        );
      }
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const getStorageKey = (key: string) => `${key}_${userId}`;

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMedicationInfo(),
        loadDoseHistory(),
        loadSideEffects(),
        loadAppetiteLogs(),
        loadWeightEntries(),
        loadDoseProgression(),
        loadNotificationSettings(),
      ]);
    } catch (error) {
      console.error('Failed to load GLP data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Medication Info
  const loadMedicationInfo = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.MEDICATION_INFO));
      if (stored) {
        const info = JSON.parse(stored);
        setMedicationInfoState({
          ...info,
          startDate: new Date(info.startDate),
        });
      }
    } catch (error) {
      console.error('Failed to load medication info:', error);
    }
  };

  const setMedicationInfo = async (info: MedicationInfo) => {
    try {
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.MEDICATION_INFO), JSON.stringify(info));
      setMedicationInfoState(info);
    } catch (error) {
      console.error('Failed to save medication info:', error);
      throw error;
    }
  };

  // Dose History
  const loadDoseHistory = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.DOSE_HISTORY));
      if (stored) {
        const history = JSON.parse(stored);
        setDoseHistory(history.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load dose history:', error);
    }
  };

  const recordDose = async (dose: string, notes?: string) => {
    try {
      const newEntry: DoseEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        dose,
        notes,
      };
      const updated = [newEntry, ...doseHistory];
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.DOSE_HISTORY), JSON.stringify(updated));
      setDoseHistory(updated);

      // Update notifications after recording dose
      if (notificationsEnabled && medicationInfo) {
        await updateScheduledNotifications();
      }
    } catch (error) {
      console.error('Failed to record dose:', error);
      throw error;
    }
  };

  const getLastDose = (): DoseEntry | null => {
    return doseHistory.length > 0 ? doseHistory[0] : null;
  };

  const getNextDoseDate = (): Date | null => {
    const lastDose = getLastDose();
    if (!lastDose || !medicationInfo?.injectionDay) return null;

    // Parse injection frequency
    const nextDose = new Date(lastDose.timestamp);

    // Check if it's "Every X days" format
    if (medicationInfo.injectionDay.toLowerCase().includes('every')) {
      const days = parseInt(medicationInfo.injectionDay.match(/\d+/)?.[0] || '7');
      nextDose.setDate(nextDose.getDate() + days);
    } else {
      // It's a specific day of the week, find next occurrence
      nextDose.setDate(nextDose.getDate() + 7);
    }

    return nextDose;
  };

  const getDaysUntilNextDose = (): number | null => {
    const nextDose = getNextDoseDate();
    if (!nextDose) return null;

    const now = new Date();
    const diffTime = nextDose.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Side Effects
  const loadSideEffects = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.SIDE_EFFECTS));
      if (stored) {
        const effects = JSON.parse(stored);
        setSideEffects(effects.map((effect: any) => ({
          ...effect,
          timestamp: new Date(effect.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load side effects:', error);
    }
  };

  const recordSideEffect = async (name: string, severity: 'none' | 'mild' | 'moderate' | 'severe', notes?: string) => {
    try {
      const newEffect: SideEffect = {
        id: Date.now().toString(),
        name,
        severity,
        notes,
        timestamp: new Date(),
      };
      const updated = [newEffect, ...sideEffects];
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.SIDE_EFFECTS), JSON.stringify(updated));
      setSideEffects(updated);
    } catch (error) {
      console.error('Failed to record side effect:', error);
      throw error;
    }
  };

  const updateSideEffect = async (id: string, severity: 'none' | 'mild' | 'moderate' | 'severe', notes?: string) => {
    try {
      const updated = sideEffects.map(effect =>
        effect.id === id ? { ...effect, severity, notes, timestamp: new Date() } : effect
      );
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.SIDE_EFFECTS), JSON.stringify(updated));
      setSideEffects(updated);
    } catch (error) {
      console.error('Failed to update side effect:', error);
      throw error;
    }
  };

  const getTodaysSideEffects = (): SideEffect[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sideEffects.filter(effect => {
      const effectDate = new Date(effect.timestamp);
      effectDate.setHours(0, 0, 0, 0);
      return effectDate.getTime() === today.getTime();
    });
  };

  // Appetite Logs
  const loadAppetiteLogs = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.APPETITE_LOGS));
      if (stored) {
        const logs = JSON.parse(stored);
        setAppetiteLogs(logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load appetite logs:', error);
    }
  };

  const recordAppetite = async (hungerLevel: number, cravingsIntensity: number, notes?: string) => {
    try {
      const newLog: AppetiteLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        hungerLevel,
        cravingsIntensity,
        notes,
      };
      const updated = [newLog, ...appetiteLogs];
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.APPETITE_LOGS), JSON.stringify(updated));
      setAppetiteLogs(updated);
    } catch (error) {
      console.error('Failed to record appetite:', error);
      throw error;
    }
  };

  const getTodaysAppetite = (): AppetiteLog | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysLogs = appetiteLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    return todaysLogs.length > 0 ? todaysLogs[0] : null;
  };

  // Weight Entries
  const loadWeightEntries = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.WEIGHT_ENTRIES));
      if (stored) {
        const entries = JSON.parse(stored);
        setWeightEntries(entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load weight entries:', error);
    }
  };

  const recordWeight = async (weight: number, unit: 'lbs' | 'kg') => {
    try {
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        weight,
        unit,
      };
      const updated = [newEntry, ...weightEntries];
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.WEIGHT_ENTRIES), JSON.stringify(updated));
      setWeightEntries(updated);
    } catch (error) {
      console.error('Failed to record weight:', error);
      throw error;
    }
  };

  const getWeeklyWeightTrend = (): WeightEntry[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return weightEntries.filter(entry => entry.timestamp >= sevenDaysAgo);
  };

  const getWeightChange = (): { amount: number; percentage: number } | null => {
    if (weightEntries.length < 2) return null;

    const current = weightEntries[0];
    const start = weightEntries[weightEntries.length - 1];

    // Convert to same unit if needed
    let currentWeight = current.weight;
    let startWeight = start.weight;

    if (current.unit !== start.unit) {
      if (current.unit === 'kg' && start.unit === 'lbs') {
        startWeight = startWeight * 0.453592; // Convert lbs to kg
      } else if (current.unit === 'lbs' && start.unit === 'kg') {
        startWeight = startWeight * 2.20462; // Convert kg to lbs
      }
    }

    const amount = currentWeight - startWeight;
    const percentage = (amount / startWeight) * 100;

    return { amount, percentage };
  };

  // Dose Progression
  const loadDoseProgression = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.DOSE_PROGRESSION));
      if (stored) {
        const progression = JSON.parse(stored);
        setDoseProgressionState(progression.map((phase: any) => ({
          ...phase,
          startDate: new Date(phase.startDate),
          endDate: phase.endDate ? new Date(phase.endDate) : undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to load dose progression:', error);
    }
  };

  const setDoseProgression = async (progression: DoseProgression[]) => {
    try {
      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.DOSE_PROGRESSION), JSON.stringify(progression));
      setDoseProgressionState(progression);
    } catch (error) {
      console.error('Failed to save dose progression:', error);
      throw error;
    }
  };

  const getCurrentPhase = (): DoseProgression | null => {
    return doseProgression.find(phase => phase.status === 'current') || null;
  };

  // Notifications
  const loadNotificationSettings = async () => {
    try {
      const stored = await SecureStore.getItemAsync(getStorageKey(STORAGE_KEYS.NOTIFICATIONS_ENABLED));
      setNotificationsEnabledState(stored === 'true');
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Request permissions when enabling
        await NotificationService.registerForPushNotificationsAsync();
      }

      await SecureStore.setItemAsync(getStorageKey(STORAGE_KEYS.NOTIFICATIONS_ENABLED), enabled.toString());
      setNotificationsEnabledState(enabled);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      throw error;
    }
  };

  const value: GlpContextType = {
    medicationInfo,
    setMedicationInfo,
    doseHistory,
    recordDose,
    getLastDose,
    getNextDoseDate,
    getDaysUntilNextDose,
    sideEffects,
    recordSideEffect,
    updateSideEffect,
    getTodaysSideEffects,
    appetiteLogs,
    recordAppetite,
    getTodaysAppetite,
    weightEntries,
    recordWeight,
    getWeeklyWeightTrend,
    getWeightChange,
    doseProgression,
    setDoseProgression,
    getCurrentPhase,
    notificationsEnabled,
    setNotificationsEnabled,
    loading,
  };

  return <GlpContext.Provider value={value}>{children}</GlpContext.Provider>;
};
