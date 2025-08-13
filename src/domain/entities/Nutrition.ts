// Nutrition tracking entities for comprehensive fitness management

import { BodyCompositionChange } from "./Program";

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre_workout"
  | "post_workout";

export type MacronutrientType =
  | "protein"
  | "carbohydrates"
  | "fat"
  | "fiber"
  | "sugar";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  nutritionPer100g: NutritionFacts;
  servingSizes: ServingSize[];
  isVerified: boolean;
  createdBy: "system" | "user" | "database";
  aliases: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FoodCategory =
  | "protein"
  | "dairy"
  | "grains"
  | "vegetables"
  | "fruits"
  | "nuts_seeds"
  | "beverages"
  | "oils_fats"
  | "condiments"
  | "snacks"
  | "supplements"
  | "prepared_meals"
  | "fast_food"
  | "desserts"
  | "alcohol";

export interface NutritionFacts {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // milligrams
  cholesterol?: number; // milligrams
  saturatedFat?: number; // grams
  unsaturatedFat?: number; // grams
  vitamins?: VitaminContent;
  minerals?: MineralContent;
}

export interface VitaminContent {
  vitaminA?: number; // mcg
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  vitaminE?: number; // mg
  vitaminK?: number; // mcg
  thiamin?: number; // mg (B1)
  riboflavin?: number; // mg (B2)
  niacin?: number; // mg (B3)
  vitaminB6?: number; // mg
  folate?: number; // mcg
  vitaminB12?: number; // mcg
}

export interface MineralContent {
  calcium?: number; // mg
  iron?: number; // mg
  magnesium?: number; // mg
  phosphorus?: number; // mg
  potassium?: number; // mg
  zinc?: number; // mg
  selenium?: number; // mcg
}

export interface ServingSize {
  id: string;
  name: string; // e.g., "1 cup", "1 medium apple"
  grams: number;
  isDefault: boolean;
}

export interface FoodEntry {
  id: string;
  userId: string;
  foodId: string;
  date: Date;
  mealType: MealType;
  servingSize: ServingSize;
  quantity: number; // multiplier for serving size
  nutrition: NutritionFacts; // calculated nutrition for this entry
  notes?: string;
  loggedAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionPerServing: NutritionFacts;
  tags: string[];
  cuisine?: string;
  dietaryRestrictions: DietaryRestriction[];
  createdBy: string; // user ID
  isPublic: boolean;
  rating?: number;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string; // "grams", "cups", "pieces", etc.
  grams: number; // converted to grams for calculation
  isOptional: boolean;
}

export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "dairy_free"
  | "nut_free"
  | "low_carb"
  | "keto"
  | "paleo"
  | "mediterranean"
  | "low_sodium"
  | "low_fat"
  | "high_protein"
  | "diabetic_friendly";

export interface NutritionGoals {
  userId: string;
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sodium: number; // milligrams
  water: number; // liters
  mealsPerDay: number;
  proteinPerMeal: number; // grams
  activityLevel: ActivityLevel;
  goal:
    | "weight_loss"
    | "weight_gain"
    | "maintenance"
    | "muscle_gain"
    | "performance";
  startDate: Date;
  endDate?: Date;
  adjustmentDate?: Date; // last time goals were recalculated
  isActive: boolean;
}

export interface DailyNutrition {
  userId: string;
  date: Date;
  goals: NutritionGoals;
  consumed: NutritionFacts;
  remaining: NutritionFacts;
  foodEntries: FoodEntry[];
  waterIntake: number; // liters
  mealTiming: MealTiming[];
  adherenceScore: number; // 0-100
  notes?: string;
  mood?: NutritionMood;
}

export interface MealTiming {
  mealType: MealType;
  plannedTime?: Date;
  actualTime?: Date;
  calories: number;
  satisfied: boolean; // did they feel satisfied after this meal
}

export interface NutritionMood {
  energy: number; // 1-10
  hunger: number; // 1-10
  cravings: number; // 1-10
  satisfaction: number; // 1-10
  bloating: number; // 1-10
  notes?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // days
  startDate: Date;
  goals: NutritionGoals;
  dailyPlans: DailyMealPlan[];
  shoppingList: ShoppingListItem[];
  prepInstructions: string[];
  estimatedCost?: number;
  createdBy: "ai" | "user" | "nutritionist";
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyMealPlan {
  dayNumber: number;
  date: Date;
  plannedMeals: PlannedMeal[];
  totalNutrition: NutritionFacts;
  notes?: string;
}

export interface PlannedMeal {
  mealType: MealType;
  time: string; // HH:MM format
  foods: PlannedFood[];
  totalNutrition: NutritionFacts;
  prepTime?: number; // minutes
  notes?: string;
}

export interface PlannedFood {
  foodId?: string;
  recipeId?: string;
  name: string;
  quantity: number;
  unit: string;
  nutrition: NutritionFacts;
}

export interface ShoppingListItem {
  foodId?: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  estimated_price?: number;
  isPurchased: boolean;
  notes?: string;
}

export interface NutritionProgress {
  userId: string;
  weekStartDate: Date;
  weeklyStats: WeeklyNutritionStats;
  monthlyStats: MonthlyNutritionStats;
  trends: NutritionTrend[];
  achievements: NutritionAchievement[];
  updatedAt: Date;
}

export interface WeeklyNutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageAdherence: number;
  daysLogged: number;
  topFoods: TopFood[];
  mealSkipCount: number;
}

export interface MonthlyNutritionStats {
  averageCalories: number;
  consistencyScore: number; // how consistent their eating patterns are
  goalAdherence: number;
  weightChange?: number;
  bodyCompositionChange?: BodyCompositionChange[];
  habitStreak: number; // consecutive days of logging
}

export interface TopFood {
  foodId: string;
  name: string;
  timesConsumed: number;
  totalCalories: number;
  category: FoodCategory;
}

export interface NutritionTrend {
  metric: MacronutrientType | "calories" | "adherence";
  direction: "increasing" | "decreasing" | "stable";
  changePercentage: number;
  periodDays: number;
}

export interface NutritionAchievement {
  id: string;
  name: string;
  description: string;
  type: "streak" | "goal" | "habit" | "milestone";
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string;
}

// Business logic for nutrition calculations
export class NutritionService {
  static calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: "male" | "female"
  ): number {
    // Mifflin-St Jeor Equation
    const bmr = 10 * weight + 6.25 * height - 5 * age;
    return gender === "male" ? bmr + 5 : bmr - 161;
  }

  static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    return Math.round(bmr * multipliers[activityLevel]);
  }

  static calculateMacroDistribution(
    calories: number,
    goal: string,
    bodyWeight: number
  ): { protein: number; carbs: number; fat: number } {
    let proteinRatio: number;
    let fatRatio: number;

    switch (goal) {
      case "muscle_gain":
        proteinRatio = Math.max(0.3, (bodyWeight * 2.2) / calories); // 2.2g per kg minimum
        fatRatio = 0.25;
        break;
      case "weight_loss":
        proteinRatio = Math.max(0.35, (bodyWeight * 2.0) / calories); // 2.0g per kg minimum
        fatRatio = 0.25;
        break;
      case "performance":
        proteinRatio = 0.25;
        fatRatio = 0.2;
        break;
      default:
        proteinRatio = 0.3;
        fatRatio = 0.25;
    }

    const carbRatio = 1 - proteinRatio - fatRatio;

    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbRatio) / 4), // 4 cal per gram
      fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
    };
  }

  static calculateAdherenceScore(
    consumed: NutritionFacts,
    goals: NutritionGoals
  ): number {
    const calorieScore = Math.max(
      0,
      100 -
        (Math.abs(consumed.calories - goals.calories) / goals.calories) * 100
    );
    const proteinScore = Math.max(
      0,
      100 - (Math.abs(consumed.protein - goals.protein) / goals.protein) * 100
    );
    const carbScore = Math.max(
      0,
      100 -
        (Math.abs(consumed.carbohydrates - goals.carbohydrates) /
          goals.carbohydrates) *
          100
    );
    const fatScore = Math.max(
      0,
      100 - (Math.abs(consumed.fat - goals.fat) / goals.fat) * 100
    );

    return Math.round((calorieScore + proteinScore + carbScore + fatScore) / 4);
  }

  static isWithinRange(
    actual: number,
    target: number,
    tolerance: number = 0.1
  ): boolean {
    const difference = Math.abs(actual - target);
    return difference <= target * tolerance;
  }

  static calculateNutritionDensity(nutrition: NutritionFacts): number {
    // Simple nutrition density score based on protein, fiber, and micronutrients
    const proteinScore = (nutrition.protein / nutrition.calories) * 100;
    const fiberScore = (nutrition.fiber / nutrition.calories) * 100;

    return Math.min(100, Math.round(proteinScore + fiberScore));
  }
}
