import * as SQLite from 'expo-sqlite';
import { NutritionResult } from './nutritionCalculator';
import { FoodItem } from '../components/ReviewItems';

let db: SQLite.SQLiteDatabase | null = null;

// Get database instance (lazy initialization)
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('focal.db');
  }
  return db;
};

// Initialize all tables
export const initDatabase = async () => {
  try {
    const database = await getDatabase();

    // Create USERS table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        goal_calories INTEGER DEFAULT 2000,
        goal_protein INTEGER DEFAULT 150,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create default user if not exists
    await database.execAsync(`
      INSERT OR IGNORE INTO users (id, username, goal_calories, goal_protein)
      VALUES (1, 'default', 2000, 150);
    `);

    // Create MEAL_LOGS table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 1,
        image_url TEXT,
        health_score INTEGER,
        reasoning TEXT,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fat INTEGER,
        fiber INTEGER DEFAULT 0,
        sugar INTEGER DEFAULT 0,
        saturated_fat INTEGER DEFAULT 0,
        sodium INTEGER DEFAULT 0,
        cholesterol INTEGER DEFAULT 0,
        micros TEXT,
        bad_ingredients TEXT,
        good_ingredients TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create FOOD_ITEMS table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_log_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity_label TEXT,
        estimated_grams INTEGER,
        FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE CASCADE
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Save a meal to the database
export interface SaveMealParams {
  imageUrl?: string;
  nutrition: NutritionResult;
  foodItems: FoodItem[];
}

export const saveMeal = async (params: SaveMealParams): Promise<number> => {
  const { imageUrl, nutrition, foodItems } = params;
  const database = await getDatabase();

  try {
    // Insert meal log
    const result = await database.runAsync(
      `INSERT INTO meal_logs (
        user_id, image_url, health_score, reasoning,
        calories, protein, carbs, fat, fiber, sugar,
        saturated_fat, sodium, cholesterol,
        micros, bad_ingredients, good_ingredients
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // default user
        imageUrl || null,
        nutrition.healthScore,
        nutrition.reasoning,
        Math.round(nutrition.macros.calories),
        Math.round(nutrition.macros.protein),
        Math.round(nutrition.macros.carbs),
        Math.round(nutrition.macros.fat),
        Math.round(nutrition.macros.fiber || 0),
        Math.round(nutrition.macros.sugar || 0),
        Math.round(nutrition.macros.saturatedFat || 0),
        Math.round(nutrition.macros.sodium || 0),
        Math.round(nutrition.macros.cholesterol || 0),
        JSON.stringify(nutrition.micros),
        JSON.stringify(nutrition.badIngredients),
        JSON.stringify(nutrition.goodIngredients),
      ]
    );

    const mealLogId = result.lastInsertRowId;

    // Insert food items
    for (const item of foodItems) {
      await database.runAsync(
        `INSERT INTO food_items (meal_log_id, name, quantity_label, estimated_grams)
         VALUES (?, ?, ?, ?)`,
        [mealLogId, item.name, item.quantity, item.estimatedGrams]
      );
    }

    console.log('Meal saved successfully with ID:', mealLogId);
    return mealLogId;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
};

// Get all meals for today
export const getTodaysMeals = async () => {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const meals = await database.getAllAsync<{
    id: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    health_score: number;
    created_at: string;
  }>(
    `SELECT id, calories, protein, carbs, fat, health_score, created_at
     FROM meal_logs
     WHERE date(created_at) = date(?)
     ORDER BY created_at DESC`,
    [today]
  );

  return meals;
};

// Get daily totals
export const getDailyTotals = async () => {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const result = await database.getFirstAsync<{
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    meal_count: number;
    avg_health_score: number;
  }>(
    `SELECT
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(carbs), 0) as total_carbs,
      COALESCE(SUM(fat), 0) as total_fat,
      COUNT(*) as meal_count,
      COALESCE(AVG(health_score), 0) as avg_health_score
     FROM meal_logs
     WHERE date(created_at) = date(?)`,
    [today]
  );

  return result || {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meal_count: 0,
    avg_health_score: 0,
  };
};

// Get meal with food items by ID
export const getMealById = async (mealId: number) => {
  const database = await getDatabase();

  const meal = await database.getFirstAsync<{
    id: number;
    image_url: string | null;
    health_score: number;
    reasoning: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    micros: string;
    bad_ingredients: string;
    good_ingredients: string;
    created_at: string;
  }>(
    `SELECT * FROM meal_logs WHERE id = ?`,
    [mealId]
  );

  if (!meal) return null;

  const foodItems = await database.getAllAsync<{
    id: number;
    name: string;
    quantity_label: string;
    estimated_grams: number;
  }>(
    `SELECT * FROM food_items WHERE meal_log_id = ?`,
    [mealId]
  );

  return {
    ...meal,
    micros: JSON.parse(meal.micros || '[]'),
    bad_ingredients: JSON.parse(meal.bad_ingredients || '[]'),
    good_ingredients: JSON.parse(meal.good_ingredients || '[]'),
    foodItems,
  };
};

// Delete a meal
export const deleteMeal = async (mealId: number) => {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM meal_logs WHERE id = ?`, [mealId]);
  console.log('Meal deleted:', mealId);
};

// Get user goals
export const getUserGoals = async () => {
  const database = await getDatabase();
  const user = await database.getFirstAsync<{
    goal_calories: number;
    goal_protein: number;
  }>(`SELECT goal_calories, goal_protein FROM users WHERE id = 1`);

  return user || { goal_calories: 2000, goal_protein: 150 };
};

// Update user goals
export const updateUserGoals = async (calories: number, protein: number) => {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE users SET goal_calories = ?, goal_protein = ? WHERE id = 1`,
    [calories, protein]
  );
};
