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

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await apiFetch(`${BASE_URL}/v1/health`);
    const data = await res.json();
    return data?.status === 'UP';
  } catch {
    return false;
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

  const res = await apiFetch(
    `${BASE_URL}/v1/meals/today?timezone=${encodeURIComponent(timezone)}`,
    { headers },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Fetch meals failed: ${res.status}`);
  }

  const rawMeals: any[] = await res.json();
  
  // Map snake_case from API to camelCase for frontend
  const meals: SavedMeal[] = rawMeals.map(m => ({
    id: m.id,
    meal_name: m.meal_name,
    healthScore: m.health_score,
    createdAt: m.created_at,
    foodItems: m.food_items.map((fi: any) => ({
      itemName: fi.item_name,
      amountGrams: fi.amount_g,
      healthScore: fi.health_score || 0,
      badIngredients: fi.bad_ingredients || [],
      goodIngredients: fi.good_ingredients || [],
      macros: fi.macros,
      micros: fi.micros
    }))
  }));

  // Manually calculate daily totals
  const dailyTotals: DailyTotals = meals.reduce((acc, meal) => {
    meal.foodItems.forEach(item => {
      acc.calories += item.macros.calories;
      acc.protein += item.macros.protein;
      acc.carbs += item.macros.carbs;
      acc.fat += item.macros.fat;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return { meals, dailyTotals };
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
