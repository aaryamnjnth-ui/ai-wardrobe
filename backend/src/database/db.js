import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path resolution - default to local directory if not specified in env
const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(dbDir, 'wardrobe.db');

// Ensure parent directory for database file exists
const dbFileDir = path.dirname(dbPath);
if (!fs.existsSync(dbFileDir)) {
  fs.mkdirSync(dbFileDir, { recursive: true });
}

// Initialize SQLite database instance
const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode for high performance concurrent reads and writes
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables, indexes, and initial constraints.
 */
export function initDb() {
  const schema = `
    -- Wardrobe items table
    CREATE TABLE IF NOT EXISTS clothes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('tops', 'bottoms', 'shoes', 'accessories', 'outerwear')),
      color TEXT,
      brand TEXT,
      size TEXT,
      tags TEXT DEFAULT '[]', -- JSON string array of tags e.g. ["cotton", "formal"]
      image_path TEXT,
      times_worn INTEGER DEFAULT 0,
      last_worn TEXT,
      favorite INTEGER DEFAULT 0 CHECK(favorite IN (0, 1)),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Saved outfit collections
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON string array of clothing IDs e.g. ["id1", "id2"]
      occasion TEXT,
      season TEXT,
      rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Daily style logs tracking worn outfits and context
    CREATE TABLE IF NOT EXISTS style_logs (
      id TEXT PRIMARY KEY,
      outfit_id TEXT,
      worn_date TEXT DEFAULT (datetime('now')),
      weather TEXT,
      mood TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE SET NULL
    );

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_clothes_category ON clothes(category);
    CREATE INDEX IF NOT EXISTS idx_clothes_favorite ON clothes(favorite);
    CREATE INDEX IF NOT EXISTS idx_clothes_color ON clothes(color);
    CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
    CREATE INDEX IF NOT EXISTS idx_outfits_season ON outfits(season);
    CREATE INDEX IF NOT EXISTS idx_style_logs_outfit_id ON style_logs(outfit_id);
    CREATE INDEX IF NOT EXISTS idx_style_logs_worn_date ON style_logs(worn_date);
  `;

  db.exec(schema);
}

// Auto-initialize schema upon module import
initDb();

/**
 * Helper to parse clothing record from SQLite row
 * @param {object} row - Raw DB row
 * @returns {object} Formatted clothing object
 */
export function formatClothingRow(row) {
  if (!row) return null;
  let parsedTags = [];
  try {
    if (typeof row.tags === 'string') {
      parsedTags = JSON.parse(row.tags);
    } else if (Array.isArray(row.tags)) {
      parsedTags = row.tags;
    }
  } catch (err) {
    // If not valid JSON, treat as comma-separated or single string
    parsedTags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  return {
    ...row,
    favorite: Boolean(row.favorite),
    tags: parsedTags
  };
}

/**
 * Helper to parse outfit record from SQLite row
 * @param {object} row - Raw DB row
 * @returns {object} Formatted outfit object
 */
export function formatOutfitRow(row) {
  if (!row) return null;
  let parsedItems = [];
  try {
    if (typeof row.items === 'string') {
      parsedItems = JSON.parse(row.items);
    } else if (Array.isArray(row.items)) {
      parsedItems = row.items;
    }
  } catch (err) {
    parsedItems = row.items ? row.items.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  return {
    ...row,
    items: parsedItems
  };
}

export default db;
