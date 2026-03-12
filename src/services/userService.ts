import { supabase } from '../lib/supabase';

const BASE_URL = 'http://192.168.1.2:3000'; // Match mealService.ts

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method ?? 'GET';
  console.log(`\n┌── USER API REQUEST ───────────────────────────────`);
  console.log(`│ ${method} ${url}`);
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const elapsed = Date.now() - start;
    console.log(`│ status:  ${res.status} (${elapsed}ms)`);
    console.log(`└──────────────────────────────────────────────────`);
    return res;
  } catch (e) {
    console.log(`│ NETWORK ERROR: ${e} (${Date.now() - start}ms)`);
    console.log(`└──────────────────────────────────────────────────`);
    throw e;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data: { session: refreshed } } = await supabase.auth.refreshSession();
    if (!refreshed) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${refreshed.access_token}` };
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

export type UserProfile = {
  weight_kg?: number;
  height_cm?: number;
  biological_sex?: 'male' | 'female' | 'other';
  age?: number;
};

export type NutritionTarget = {
  nutrient_id: string;
  target_amount: number;
  unit: string;
  source: 'formula' | 'rda' | 'custom';
};

export type NutritionGap = {
  nutrient_id: string;
  target: number;
  intake: number;
  unit: string;
  pct: number;
  status: 'deficient' | 'approaching' | 'met' | 'exceeded';
};

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const headers = await getAuthHeader();
    const res = await apiFetch(`${BASE_URL}/v1/user/profile`, { headers });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    const headers = await getAuthHeader();
    const res = await apiFetch(`${BASE_URL}/v1/user/profile`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async getTargets(): Promise<NutritionTarget[]> {
    const headers = await getAuthHeader();
    const res = await apiFetch(`${BASE_URL}/v1/user/targets`, { headers });
    if (!res.ok) throw new Error('Failed to fetch targets');
    return res.json();
  },

  async updateTarget(nutrientId: string, targetAmount: number, unit: string): Promise<NutritionTarget> {
    const headers = await getAuthHeader();
    const res = await apiFetch(`${BASE_URL}/v1/user/targets/${nutrientId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_amount: targetAmount, unit }),
    });
    if (!res.ok) throw new Error('Failed to update target');
    return res.json();
  },

  async resetTarget(nutrientId: string): Promise<void> {
    const headers = await getAuthHeader();
    const res = await apiFetch(`${BASE_URL}/v1/user/targets/${nutrientId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to reset target');
  },

  async getTodayGaps(): Promise<NutritionGap[]> {
    const headers = await getAuthHeader();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await apiFetch(`${BASE_URL}/v1/user/today/gaps?timezone=${encodeURIComponent(timezone)}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch gaps');
    return res.json();
  },
};
