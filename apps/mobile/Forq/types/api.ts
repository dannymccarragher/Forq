// API Types and Interfaces

export interface User {
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
  goalFiber?: number;
  goalWater?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  id: number;
  userId: number;
  name: string;
  brand?: string;
  barcode?: string;
  fatSecretId?: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  water?: number;
  description?: string;
  category?: string;
  isCustom: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodLog {
  id: number;
  userId: number;
  foodId: number;
  mealType: MealType;
  logDate: string;
  servings: number;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  totalFiber?: number;
  totalWater?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodLogWithFood {
  log: FoodLog;
  food: Food;
}

export interface FavoriteFood {
  id: number;
  userId: number;
  foodId: number;
  createdAt: string;
}

export interface FavoriteFoodWithDetails {
  favorite: FavoriteFood;
  food: Food;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionalSummary {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    entries: number;
  };
  byMealType: {
    mealType: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    entries: number;
  }[];
}

// FatSecret API Types
export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_description: string;
  brand_name?: string;
  food_url?: string;
}

export interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  serving_url?: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

export interface FatSecretFoodDetail {
  food_id: string;
  food_name: string;
  food_type: string;
  brand_name?: string;
  food_description: string;
  food_url?: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

export interface SearchResponse {
  foods?: {
    food: FatSecretFood[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FoodsResponse {
  success: boolean;
  count: number;
  foods: Food[];
}

export interface FoodLogsResponse {
  success: boolean;
  count: number;
  logs: FoodLogWithFood[];
}

export interface FavoritesResponse {
  success: boolean;
  count: number;
  favorites: FavoriteFoodWithDetails[];
}

export interface SummaryResponse {
  success: boolean;
  summary: NutritionalSummary;
}
