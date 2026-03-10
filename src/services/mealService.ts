import { supabase } from '../lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

const BASE_URL = 'http://192.168.1.2:3000';

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method ?? 'GET';
  console.log(`\n┌── API REQUEST ──────────────────────`);
  console.log(`│ ${method} ${url}`);
  if (options.headers) console.log(`│ headers:`, options.headers);
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    console.log(`│ status:  ${res.status} (${Date.now() - start}ms)`);
    console.log(`└─────────────────────────────────────`);
    return res;
  } catch (e) {
    console.log(`│ ERROR:   ${e} (${Date.now() - start}ms)`);
    console.log(`└─────────────────────────────────────`);
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
  fiber: number;
  sugar: number;
  saturatedFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
};

export type NutritionFoodItem = {
  itemName: string;
  amountGrams: number;
  healthScore: number;
  badIngredients: string[];
  goodIngredients: string[];
  macros: Macros;
  micros: Micro[];
};

export type AnalyzeItemsResponse = {
  mealName: string;
  healthScore: number;
  reasoning: string;
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
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');
  return userId;
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

  const res = await apiFetch(`${BASE_URL}/v1/meals/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.message ?? `Analyze image failed: ${res.status}`;
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
  foodItems: NutritionFoodItem[];
  localStoragePrefix?: string;
}): Promise<{ id: string }> {
  const headers = await getAuthHeader();
  const userId = await getUserId();

  const res = await apiFetch(`${BASE_URL}/v1/meals/save`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      mealName: payload.mealName,
      local_storage_prefix: payload.localStoragePrefix ?? null,
      healthScore: payload.healthScore,
      reasoning: payload.reasoning,
      foodItems: payload.foodItems,
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

  return res.json();
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
