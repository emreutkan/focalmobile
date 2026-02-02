import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('focal.db');
// Initialize all tables
export const initDatabase = async () => {
  try {
    // Create USERS table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        goal_calories INTEGER NOT NULL,
        goal_protein INTEGER NOT NULL
      );
    `);

    // Create MEAL_LOGS table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_url TEXT,
        health_score INTEGER,
        reasoning TEXT,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fat INTEGER,
        micros TEXT,
        bad_ingredients TEXT,
        good_ingredients TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create FOOD_ITEMS table
    await db.execAsync(`
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
