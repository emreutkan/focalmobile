import { supabase } from '../lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

const BASE_URL = 'http://192.168.1.2:3000';

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method ?? 'GET';
  console.log(`\n┌── API REQUEST ───────────────────────────────────`);
  console.log(`│ ${method} ${url}`);
  console.log(`│ headers:`, JSON.stringify(options.headers ?? {}, null, 2));
  if (options.body && typeof options.body === 'string') {
    try {
      console.log(`│ body:`, JSON.stringify(JSON.parse(options.body), null, 2));
    } catch {
      console.log(`│ body: [non-JSON / FormData]`);
    }
  } else if (options.body) {
    console.log(`│ body: [FormData / binary]`);
  }
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const elapsed = Date.now() - start;
    // Clone so the caller can still read the body
    const clone = res.clone();
    let responseBody: any = '[could not parse]';
    try {
      responseBody = await clone.json();
    } catch {
      try { responseBody = await clone.text(); } catch {}
    }
    console.log(`│ status:  ${res.status} (${elapsed}ms)`);
    console.log(`│ response:`, JSON.stringify(responseBody, null, 2));
    console.log(`└──────────────────────────────────────────────────`);
    return res;
  } catch (e) {
    console.log(`│ NETWORK ERROR: ${e} (${Date.now() - start}ms)`);
    console.log(`└──────────────────────────────────────────────────`);
    throw e;
  }
}

// ─── Shared types ────────────────────────────────────────────────────────────

export type LabelNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSizeGrams: number;
};

export type AnalyzedFoodItem = {
  name: string;
  quantity: string;
  estimatedGrams: number;
  confidence?: number;
  labelNutrition?: LabelNutrition;
};

export type AnalyzeImageResponse = {
  isFood: boolean;
  mealName: string;
  message?: string;
  items: AnalyzedFoodItem[];
};

export type Micro = {
  name: string;
  amount: number;
  unit: string;
};

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
};

export type NutritionFoodItem = {
  itemName: string;
  amountGrams: number;
  healthScore: number;
  proteinType?: 'animal' | 'plant' | 'mixed';
  badIngredients: string[];
  goodIngredients: string[];
  macros: Macros;
  micros: Micro[];
};

export type AnalyzeItemsResponse = {
  mealName: string;
  healthScore: number;
  reasoning: string;
  badIngredients: string[];
  goodIngredients: string[];
  foodItems: NutritionFoodItem[];
};

export type SavedMeal = {
  id: string;
  meal_name: string;
  healthScore: number;
  foodItems: NutritionFoodItem[];
  createdAt: string;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  cholesterol: number;
  sodium: number;
  micros: Micro[];
  animalProtein: number;
  plantProtein: number;
};

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthHeader(): Promise<Record<string, string>> {
  // 1. Get current session from cache
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new AuthError('Not authenticated');
  }

  const now = Math.floor(Date.now() / 1000);
  const needsRefresh = !session || (session.expires_at != null && session.expires_at - now < 300);

  // 2. Refresh if missing or expiring soon
  //    This also handles the race condition where getSession() returns null
  //    before AsyncStorage has been read (common on first load / after navigation).
  if (needsRefresh) {
    console.log('Session missing or expiring soon, refreshing...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshedSession) {
      return { Authorization: `Bearer ${refreshedSession.access_token}` };
    }

    if (refreshError) {
      console.error('Refresh failed:', refreshError);
    }

    // Refresh failed but we still have a valid session — use it
    if (session) {
      return { Authorization: `Bearer ${session.access_token}` };
    }

    throw new AuthError('Not authenticated');
  }

  return { Authorization: `Bearer ${session!.access_token}` };
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  return user.id;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export interface HealthStatus {
  api: boolean;
  db: boolean;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await apiFetch(`${BASE_URL}/v1/health`);
    const data = await res.json();
    return {
      api: data?.status === 'UP',
      db: data?.db === 'UP',
    };
  } catch {
    return { api: false, db: false };
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function analyzeImage(imageUris: string | string[]): Promise<AnalyzeImageResponse> {
  const headers = await getAuthHeader();
  const uris = Array.isArray(imageUris) ? imageUris : [imageUris];

  const formData = new FormData();

  for (const [index, uri] of uris.entries()) {
    const processed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );

    formData.append('images', {
      uri: processed.uri,
      type: 'image/jpeg',
      name: `image_${index}.jpg`,
    } as any);
  }

  let res = await apiFetch(`${BASE_URL}/v1/meals/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  // If we get a 401, force-refresh the token and retry once before giving up.
  // This handles the case where the token expired mid-flight or the server
  // received a stale token due to a race condition at startup.
  if (res.status === 401) {
    console.log('analyzeImage: 401 received, refreshing token and retrying...');
    const { data: { session: refreshed } } = await supabase.auth.refreshSession();
    if (refreshed) {
      res = await apiFetch(`${BASE_URL}/v1/meals/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshed.access_token}` },
        body: formData,
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.message ?? `Analyze image failed: ${res.status}`;

    if (res.status === 401) {
      throw new AuthError('Your session has expired. Please log in again.');
    }
    if (res.status === 429) {
      throw new RateLimitError(message);
    }
    throw new Error(message);
  }

  return res.json();
}

export async function analyzeItems(
  mealName: string,
  items: AnalyzedFoodItem[],
  userNotes?: string,
): Promise<AnalyzeItemsResponse> {
  const headers = await getAuthHeader();

  const res = await apiFetch(`${BASE_URL}/v1/meals/analyze-items`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealName, items, ...(userNotes ? { userNotes } : {}) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.message ?? `Analyze items failed: ${res.status}`;

    if (res.status === 401) {
      throw new AuthError('Your session has expired. Please log in again.');
    }
    if (res.status === 429) {
      throw new RateLimitError(message);
    }
    throw new Error(message);
  }

  return res.json();
}

export async function saveMeal(payload: {
  mealName: string;
  healthScore: number;
  reasoning: string;
  badIngredients: string[];
  goodIngredients: string[];
  foodItems: NutritionFoodItem[];
  localStoragePrefix?: string;
}): Promise<{ id: string }> {
  const headers = await getAuthHeader();
  const userId = await getUserId();

  // Strip item-level fields the backend doesn't expect in the save schema
  const foodItems = payload.foodItems.map(({ itemName, amountGrams, macros, micros }) => ({
    itemName,
    amountGrams,
    macros,
    micros,
  }));

  const res = await apiFetch(`${BASE_URL}/v1/meals/save`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      mealName: payload.mealName,
      ...(payload.localStoragePrefix ? { local_storage_prefix: payload.localStoragePrefix } : {}),
      healthScore: payload.healthScore,
      reasoning: payload.reasoning,
      badIngredients: payload.badIngredients,
      goodIngredients: payload.goodIngredients,
      foodItems,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Save meal failed: ${res.status}`);
  }

  return res.json();
}

export async function getMealsToday(): Promise<{
  meals: SavedMeal[];
  dailyTotals: DailyTotals;
}> {
  const headers = await getAuthHeader();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch meals and daily totals concurrently
  const [mealsRes, historyRes] = await Promise.all([
    apiFetch(`${BASE_URL}/v1/meals/today?timezone=${encodeURIComponent(timezone)}`, { headers }),
    apiFetch(`${BASE_URL}/v1/meals/nutrition-history?timezone=${encodeURIComponent(timezone)}`, { headers }),
  ]);

  if (!mealsRes.ok) {
    const err = await mealsRes.json().catch(() => ({}));
    throw new Error(err.message ?? `Fetch meals failed: ${mealsRes.status}`);
  }
  if (!historyRes.ok) {
    const err = await historyRes.json().catch(() => ({}));
    throw new Error(err.message ?? `Fetch nutrition history failed: ${historyRes.status}`);
  }

  const rawMeals: any[] = await mealsRes.json();
  const rawHistory: any[] = await historyRes.json();
  
  // Calculate animal vs plant protein from rawMeals
  let animalProtein = 0;
  let plantProtein = 0;

  // Map snake_case from API to camelCase for frontend
  const meals: SavedMeal[] = rawMeals.map(m => ({
    id: m.id,
    meal_name: m.meal_name,
    healthScore: m.health_score,
    createdAt: m.created_at,
    foodItems: m.food_items.map((fi: any) => {
      const proteinAmount = fi.macros?.protein_g ?? fi.macros?.protein ?? 0;
      if (fi.protein_type === 'animal') {
        animalProtein += proteinAmount;
      } else if (fi.protein_type === 'plant') {
        plantProtein += proteinAmount;
      } else if (fi.protein_type === 'mixed') {
        animalProtein += proteinAmount / 2;
        plantProtein += proteinAmount / 2;
      }

      return {
        itemName: fi.item_name,
        amountGrams: fi.amount_g,
        healthScore: fi.health_score || 0,
        proteinType: fi.protein_type,
        badIngredients: fi.bad_ingredients || [],
        goodIngredients: fi.good_ingredients || [],
        macros: {
          calories: fi.macros?.calories ?? 0,
          protein: fi.macros?.protein_g ?? fi.macros?.protein ?? 0,
          carbs: fi.macros?.carbs_g ?? fi.macros?.carbs ?? 0,
          fat: fi.macros?.fat_g ?? fi.macros?.fat ?? 0,
          fiber: fi.macros?.fiber_g ?? fi.macros?.fiber ?? 0,
          sugar: fi.macros?.sugar_g ?? fi.macros?.sugar ?? 0,
          saturatedFat: fi.macros?.saturated_fat_g ?? fi.macros?.saturatedFat ?? 0,
          cholesterol: fi.macros?.cholesterol_mg ?? fi.macros?.cholesterol ?? 0,
          sodium: fi.macros?.sodium_mg ?? fi.macros?.sodium ?? 0,
        },
        micros: fi.micros
      };
    })
  }));

  // Get today's totals from the first entry of nutrition history
  let dailyTotals: DailyTotals = { 
    calories: 0, protein: 0, carbs: 0, fat: 0,
    fiber: 0, sugar: 0, saturatedFat: 0, cholesterol: 0, sodium: 0,
    micros: [], animalProtein, plantProtein
  };
  
  if (rawHistory && rawHistory.length > 0) {
    // History is DESC, today should be the first item
    const todayData = rawHistory[0];
    dailyTotals = {
      calories: todayData.total_calories ?? 0,
      protein: todayData.total_protein_g ?? 0,
      carbs: todayData.total_carbs_g ?? 0,
      fat: todayData.total_fat_g ?? 0,
      fiber: todayData.total_fiber_g ?? 0,
      sugar: todayData.total_sugar_g ?? 0,
      saturatedFat: todayData.total_saturated_fat_g ?? 0,
      cholesterol: todayData.total_cholesterol_mg ?? 0,
      sodium: todayData.total_sodium_mg ?? 0,
      micros: todayData.total_micros ?? [],
      animalProtein,
      plantProtein
    };
  }

  return { meals, dailyTotals };
}

// ─── Meal Detail ─────────────────────────────────────────────────────────────

export type MealDetailFoodItem = {
  id: string;
  itemName: string;
  amountGrams: number;
  confidence?: number;
  proteinType?: string;
  badIngredients: string[];
  goodIngredients: string[];
  macros: Macros;
  micros: Micro[];
};

export type MealDetail = {
  id: string;
  mealName: string;
  healthScore: number;
  healthScoreReasoning: string;
  badIngredients: string[];
  goodIngredients: string[];
  localStoragePrefix?: string;
  createdAt: string;
  foodItems: MealDetailFoodItem[];
};

export async function getMealById(id: string): Promise<MealDetail> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`${BASE_URL}/v1/meals/${id}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Get meal failed: ${res.status}`);
  }

  const raw = await res.json();
  return {
    id: raw.id,
    mealName: raw.meal_name,
    healthScore: raw.health_score,
    healthScoreReasoning: raw.health_score_reasoning,
    badIngredients: raw.bad_ingredients ?? [],
    goodIngredients: raw.good_ingredients ?? [],
    localStoragePrefix: raw.local_storage_prefix,
    createdAt: raw.created_at,
    foodItems: (raw.food_items ?? []).map((fi: any) => ({
      id: fi.id,
      itemName: fi.item_name,
      amountGrams: fi.amount_g,
      confidence: fi.confidence,
      proteinType: fi.protein_type,
      badIngredients: fi.bad_ingredients ?? [],
      goodIngredients: fi.good_ingredients ?? [],
      macros: fi.macros,
      micros: fi.micros ?? [],
    })),
  };
}

export async function deleteMeal(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`${BASE_URL}/v1/meals/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Delete meal failed: ${res.status}`);
}

export async function deleteAllMeals(): Promise<void> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`${BASE_URL}/v1/meals`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Delete all meals failed: ${res.status}`);
}
