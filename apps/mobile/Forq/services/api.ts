// API Service for backend communication
import Constants from 'expo-constants';
import {
  Food,
  FoodLog,
  FoodLogWithFood,
  FavoriteFoodWithDetails,
  NutritionalSummary,
  FatSecretFood,
  FatSecretFoodDetail,
  SearchResponse,
  MealType,
} from '@/types/api';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// Helper function for making requests
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ==================== FATSECRET API ROUTES ====================

/**
 * Search for foods using FatSecret API
 */
export async function searchFoods(
  query: string,
  page: number = 0,
  maxResults: number = 20
): Promise<SearchResponse> {
  return request<SearchResponse>(
    `/api/foods/search?query=${encodeURIComponent(query)}&page=${page}&maxResults=${maxResults}`
  );
}

/**
 * Get food details by FatSecret ID
 */
export async function getFoodById(foodId: string): Promise<FatSecretFoodDetail> {
  return request<FatSecretFoodDetail>(`/api/foods/${foodId}`);
}

/**
 * Autocomplete food search
 */
export async function autocompleteFoodSearch(
  query: string,
  maxResults: number = 10
): Promise<{ suggestions: { suggestion: string[] } }> {
  return request(
    `/api/foods/autocomplete?query=${encodeURIComponent(query)}&maxResults=${maxResults}`
  );
}

/**
 * Scan barcode
 */
export async function scanBarcode(barcode: string): Promise<FatSecretFoodDetail> {
  return request<FatSecretFoodDetail>(`/api/barcode/${barcode}`);
}

// ==================== DATABASE ROUTES ====================

// ========== FOODS ==========

/**
 * Get user's foods (custom + saved)
 */
export async function getUserFoods(
  userId: number,
  filters?: {
    search?: string;
    category?: string;
    isCustom?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ success: boolean; count: number; foods: Food[] }> {
  const params = new URLSearchParams({
    userId: userId.toString(),
    ...filters,
  } as any);

  return request(`/api/db/foods?${params.toString()}`);
}

/**
 * Get food by ID
 */
export async function getFoodByDbId(
  foodId: number,
  userId: number
): Promise<{ success: boolean; food: Food }> {
  return request(`/api/db/foods/${foodId}?userId=${userId}`);
}

/**
 * Create custom food
 */
export async function createFood(foodData: {
  userId: number;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  description?: string;
  category?: string;
}): Promise<{ success: boolean; message: string; food: Food }> {
  return request('/api/db/foods', {
    method: 'POST',
    body: JSON.stringify(foodData),
  });
}

/**
 * Update custom food
 */
export async function updateFood(
  foodId: number,
  userId: number,
  updates: Partial<Omit<Food, 'id' | 'userId'>>
): Promise<{ success: boolean; message: string; food: Food }> {
  return request(`/api/db/foods/${foodId}`, {
    method: 'PUT',
    body: JSON.stringify({ userId, ...updates }),
  });
}

/**
 * Delete custom food
 */
export async function deleteFood(
  foodId: number,
  userId: number
): Promise<{ success: boolean; message: string }> {
  return request(`/api/db/foods/${foodId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

/**
 * Save food from FatSecret API to database
 */
export async function saveFoodFromApi(
  userId: number,
  fatSecretFood: any
): Promise<{ success: boolean; message: string; food: Food; alreadyExisted: boolean }> {
  return request('/api/db/foods/save-from-api', {
    method: 'POST',
    body: JSON.stringify({ userId, fatSecretFood }),
  });
}

// ========== FOOD LOGS ==========

/**
 * Get food logs
 */
export async function getFoodLogs(
  userId: number,
  filters?: {
    startDate?: string;
    endDate?: string;
    mealType?: MealType;
    limit?: number;
    offset?: number;
  }
): Promise<{ success: boolean; count: number; logs: FoodLogWithFood[] }> {
  const params = new URLSearchParams({
    userId: userId.toString(),
    ...filters,
  } as any);

  return request(`/api/db/food-logs?${params.toString()}`);
}

/**
 * Get nutritional summary
 */
export async function getNutritionalSummary(
  userId: number,
  filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ success: boolean; summary: NutritionalSummary }> {
  const params = new URLSearchParams({
    userId: userId.toString(),
    ...filters,
  } as any);

  return request(`/api/db/food-logs/summary?${params.toString()}`);
}

/**
 * Create food log entry
 */
export async function logFood(logData: {
  userId: number;
  foodId: number;
  mealType: MealType;
  logDate: string;
  servings?: number;
  notes?: string;
}): Promise<{ success: boolean; message: string; log: FoodLogWithFood }> {
  return request('/api/db/food-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

/**
 * Update food log entry
 */
export async function updateFoodLog(
  logId: number,
  userId: number,
  updates: {
    servings?: number;
    mealType?: MealType;
    logDate?: string;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; log: FoodLogWithFood }> {
  return request(`/api/db/food-logs/${logId}`, {
    method: 'PUT',
    body: JSON.stringify({ userId, ...updates }),
  });
}

/**
 * Delete food log entry
 */
export async function deleteFoodLog(
  logId: number,
  userId: number
): Promise<{ success: boolean; message: string }> {
  return request(`/api/db/food-logs/${logId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

// ========== FAVORITES ==========

/**
 * Get favorite foods
 */
export async function getFavorites(
  userId: number
): Promise<{ success: boolean; count: number; favorites: FavoriteFoodWithDetails[] }> {
  return request(`/api/db/favorites?userId=${userId}`);
}

/**
 * Add food to favorites
 */
export async function addFavorite(
  userId: number,
  foodId: number
): Promise<{ success: boolean; message: string; favorite: FavoriteFoodWithDetails }> {
  return request('/api/db/favorites', {
    method: 'POST',
    body: JSON.stringify({ userId, foodId }),
  });
}

/**
 * Remove food from favorites
 */
export async function removeFavorite(
  userId: number,
  foodId: number
): Promise<{ success: boolean; message: string }> {
  return request(`/api/db/favorites/${foodId}?userId=${userId}`, {
    method: 'DELETE',
  });
}

// ==================== AUTHENTICATION ROUTES ====================

/**
 * Register a new user
 */
export async function register(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; message: string; user: any }> {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Login user
 */
export async function login(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user: any }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrUsername, password }),
  });
}

/**
 * Verify user session
 */
export async function verifyUser(
  userId: number
): Promise<{ success: boolean; user: any }> {
  return request('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

// ==================== USER ROUTES ====================

/**
 * Get user profile
 */
export async function getUserProfile(
  userId: number
): Promise<{ success: boolean; user: any }> {
  return request(`/api/db/users/${userId}`);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  updates: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }
): Promise<{ success: boolean; message: string; user: any }> {
  return request(`/api/db/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Get user's nutrition goals
 */
export async function getUserGoals(
  userId: number
): Promise<{ success: boolean; goals: { calories: number; protein: number; carbs: number; fat: number } }> {
  return request(`/api/db/users/${userId}/goals`);
}

/**
 * Update user's nutrition goals
 */
export async function updateUserGoals(
  userId: number,
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
): Promise<{ success: boolean; message: string; goals: { calories: number; protein: number; carbs: number; fat: number } }> {
  return request(`/api/db/users/${userId}/goals`, {
    method: 'PUT',
    body: JSON.stringify(goals),
  });
}

// ==================== UTILITY METHODS ====================

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
  return request('/api/health');
}
