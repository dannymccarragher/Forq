import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Food, FoodLogWithFood, NutritionalSummary, MealType } from '@/types/api';
import * as api from '@/services/api';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  goalCalories?: number;
  goalProtein?: number;
  goalCarbs?: number;
  goalFat?: number;
}

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  loginUser: (emailOrUsername: string, password: string) => Promise<void>;
  registerUser: (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;

  // User state (deprecated - use user.id instead)
  userId: number;
  setUserId: (id: number) => void;

  // Current date for logging
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Nutritional summary
  dailySummary: NutritionalSummary | null;
  loadingSummary: boolean;
  refreshSummary: () => Promise<void>;

  // Food logs
  foodLogs: FoodLogWithFood[];
  loadingLogs: boolean;
  refreshLogs: () => Promise<void>;

  // Favorites
  favorites: Food[];
  loadingFavorites: boolean;
  refreshFavorites: () => Promise<void>;
  isFavorite: (foodId: number) => boolean;
  toggleFavorite: (food: Food) => Promise<void>;

  // Quick actions
  logFood: (foodId: number, mealType: MealType, servings?: number, notes?: string) => Promise<void>;
  deleteFoodLog: (logId: number) => Promise<void>;

  // Goals (can be expanded)
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  setDailyGoals: (goals: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const SECURE_STORE_KEY = 'forq_user_id';

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // For demo purposes, using hardcoded userId. In production, get from auth
  const [userId, setUserId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Summary state
  const [dailySummary, setDailySummary] = useState<NutritionalSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  // Logs state
  const [foodLogs, setFoodLogs] = useState<FoodLogWithFood[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user has a saved session
  const checkAuthStatus = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync(SECURE_STORE_KEY);

      if (storedUserId) {
        // Verify with backend
        const response = await api.verifyUser(parseInt(storedUserId));

        if (response.success && response.user) {
          setUser(response.user);
          setUserId(response.user.id);
          setIsAuthenticated(true);
        } else {
          // Invalid session, clear storage
          await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      // Clear invalid session
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const loginUser = async (emailOrUsername: string, password: string) => {
    try {
      const response = await api.login(emailOrUsername, password);

      if (response.success && response.user) {
        // Save user ID to secure storage
        await SecureStore.setItemAsync(SECURE_STORE_KEY, response.user.id.toString());

        setUser(response.user);
        setUserId(response.user.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Register user
  const registerUser = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const response = await api.register(userData);

      if (response.success && response.user) {
        // Save user ID to secure storage
        await SecureStore.setItemAsync(SECURE_STORE_KEY, response.user.id.toString());

        setUser(response.user);
        setUserId(response.user.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout user
  const logoutUser = async () => {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);

      // Clear state
      setUser(null);
      setUserId(0);
      setIsAuthenticated(false);
      setDailySummary(null);
      setFoodLogs([]);
      setFavorites([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format date for API
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Refresh summary
  const refreshSummary = async () => {
    if (!userId) return;

    setLoadingSummary(true);
    try {
      const response = await api.getNutritionalSummary(userId, {
        date: formatDate(selectedDate),
      });
      setDailySummary(response.summary);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Refresh logs
  const refreshLogs = async () => {
    if (!userId) return;

    setLoadingLogs(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await api.getFoodLogs(userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setFoodLogs(response.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Refresh favorites
  const refreshFavorites = async () => {
    if (!userId) return;

    setLoadingFavorites(true);
    try {
      const response = await api.getFavorites(userId);
      setFavorites(response.favorites.map((f) => f.food));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Check if food is favorite
  const isFavorite = (foodId: number): boolean => {
    return favorites.some((f) => f.id === foodId);
  };

  // Toggle favorite
  const toggleFavorite = async (food: Food) => {
    if (!userId) return;

    try {
      if (isFavorite(food.id)) {
        await api.removeFavorite(userId, food.id);
        setFavorites((prev) => prev.filter((f) => f.id !== food.id));
      } else {
        await api.addFavorite(userId, food.id);
        setFavorites((prev) => [...prev, food]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  // Log food
  const logFood = async (
    foodId: number,
    mealType: MealType,
    servings: number = 1,
    notes?: string
  ) => {
    if (!userId) return;

    try {
      await api.logFood({
        userId,
        foodId,
        mealType,
        logDate: selectedDate.toISOString(),
        servings,
        notes,
      });

      // Refresh data
      await Promise.all([refreshLogs(), refreshSummary()]);
    } catch (error) {
      console.error('Failed to log food:', error);
      throw error;
    }
  };

  // Delete food log
  const deleteFoodLog = async (logId: number) => {
    if (!userId) return;

    try {
      await api.deleteFoodLog(logId, userId);

      // Refresh data
      await Promise.all([refreshLogs(), refreshSummary()]);
    } catch (error) {
      console.error('Failed to delete log:', error);
      throw error;
    }
  };

  // Load user goals from database
  const loadGoals = async () => {
    if (!userId) return;

    setLoadingGoals(true);
    try {
      const response = await api.getUserGoals(userId);
      setDailyGoals(response.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
      // Keep default goals on error
    } finally {
      setLoadingGoals(false);
    }
  };

  // Save goals to database
  const saveGoals = async (goals: { calories: number; protein: number; carbs: number; fat: number }) => {
    if (!userId) return;

    try {
      const response = await api.updateUserGoals(userId, goals);
      setDailyGoals(response.goals);
    } catch (error) {
      console.error('Failed to save goals:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadGoals();
      refreshSummary();
      refreshLogs();
      refreshFavorites();
    }
  }, [userId]);

  // Refresh summary and logs when date changes
  useEffect(() => {
    if (userId) {
      refreshSummary();
      refreshLogs();
    }
  }, [selectedDate]);

  const value: AppContextType = {
    isAuthenticated,
    isLoading,
    user,
    loginUser,
    registerUser,
    logoutUser,
    userId,
    setUserId,
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    refreshSummary,
    foodLogs,
    loadingLogs,
    refreshLogs,
    favorites,
    loadingFavorites,
    refreshFavorites,
    isFavorite,
    toggleFavorite,
    logFood,
    deleteFoodLog,
    dailyGoals,
    setDailyGoals: saveGoals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
