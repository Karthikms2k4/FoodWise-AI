export type StorageLocation = 'Fridge Crisper' | 'Fridge Top Shelf' | 'Fridge Door' | 'Freezer' | 'Counter Basket' | 'Pantry Shelf';

export type FoodCategory = 'Produce' | 'Dairy' | 'Bakery' | 'Meat & Seafood' | 'Pantry' | 'Beverages';

export type ExpiryStatus = 'optimal' | 'expiring_soon' | 'expired';

export interface FoodItem {
  id: string;
  userId?: string;
  name: string;
  category: FoodCategory;
  quantity: string;
  location: StorageLocation;
  daysRemaining: number;
  expiryDateText: string;
  status: ExpiryStatus;
  imageUrl: string;
  co2ImpactKg: number;
  estCost: number; // in USD or INR
  addedDate: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Intermediate';
  imageUrl: string;
  badgeText: string;
  savingsText: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  description: string;
  instructions: string[];
  calories: number;
  protein: string;
  proteinGrams?: number;
  isAiGenerated?: boolean;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'alert' | 'success' | 'tip';
  read: boolean;
  itemId?: string;
}

export interface UserProfile {
  userId?: string;
  name: string;
  email: string;
  avatarUrl: string;
  ecoScore: number;
  totalSavedDollars: number;
  co2PreventedKg: number;
  wasteReductionRate: number;
  householdSize: number;
  dietaryPreference: string;
  themePreference?: 'light' | 'dark';
}
