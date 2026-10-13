import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { formatClothingRow, formatOutfitRow } from '../database/db.js';
import outfitEngine from '../services/outfitEngine.js';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * Helper to fetch and hydrate full clothing records from a list of item IDs
 * @param {Array<string>} itemIds
 * @returns {Array<object>} Hydrated clothing items
 */
function hydrateClothingItems(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return [];

  const placeholders = itemIds.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM clothes WHERE id IN (${placeholders})`).all(...itemIds);
  return rows.map(formatClothingRow);
}

/**
 * GET /api/outfits
 * Generate dynamic outfit suggestions from available wardrobe items.
 * Query parameters: occasion, season, weather, mood, limit
 */
router.get('/', (req, res, next) => {
  try {
    const {
      occasion = 'casual',
      season = 'all',
      weather = 'mild',
      mood = 'confident',
      limit = 5
    } = req.query;

    // Fetch all items from wardrobe
    const allRows = db.prepare('SELECT * FROM clothes').all();
    const allClothes = allRows.map(formatClothingRow);

    if (allClothes.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No items in wardrobe. Add tops, bottoms, and shoes first to get recommendations.'
      });
    }

    const suggestions = outfitEngine.generateOutfitSuggestions(allClothes, {
      occasion: String(occasion),
      season: String(season),
      weather: String(weather),
      mood: String(mood),
      limit: Math.max(1, Math.min(20, Number(limit)))
    });

    return res.json({
      success: true,
      query: { occasion, season, weather, mood, limit: Number(limit) },
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/outfits/generate
 * AI-generate an outfit tailored to specific occasion, weather, and mood.
 */
router.post('/generate', async (req, res, next) => {
  try {
    const {
      occasion = 'casual',
      weather = 'mild',
      mood = 'confident'
    } = req.body;

    const allRows = db.prepare('SELECT * FROM clothes').all();
    const allClothes = allRows.map(formatClothingRow);

    if (allClothes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wardrobe is empty. Please add items to your wardrobe before generating outfits.'
      });
    }

    const result = await aiService.generateOutfitAI({
      occasion,
      weather,
      mood,
      wardrobeItems: allClothes
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/outfits/saved
 * Retrieve all user-saved outfits with populated clothing details.
 */
router.get('/saved', (req, res, next) => {
  try {
    const {
      occasion,
      season,
      minRating,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const conditions = [];
    const params = [];

    if (occasion) {
      conditions.push('LOWER(occasion) = ?');
      params.push(occasion.toLowerCase());
    }

    if (season) {
      conditions.push('LOWER(season) = ?');
      params.push(season.toLowerCase());
    }

    if (minRating !== undefined) {
      conditions.push('rating >= ?');
      params.push(Number(minRating));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeOrder = (order || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const safeSort = ['created_at', 'rating', 'name'].includes(sort) ? sort : 'created_at';

    const rows = db.prepare(`
      SELECT * FROM outfits 
      ${whereClause} 
      ORDER BY ${safeSort} ${safeOrder}
    `).all(...params);

    const formattedOutfits = rows.map(row => {
      const parsed = formatOutfitRow(row);
      const fullItems = hydrateClothingItems(parsed.items);
      return {
        ...parsed,
        hydratedItems: fullItems
      };
    });

    return res.json({
      success: true,
      count: formattedOutfits.length,
      data: formattedOutfits
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/outfits/saved
 * Save an outfit to user collection.
 */
router.post('/saved', (req, res, next) => {
  try {
    const {
      name,
      items,
      occasion = 'casual',
      season = 'all',
      rating = 0
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Field "name" is required and must be a string.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "items" is required and must be a non-empty array of clothing IDs.'
      });
    }

    // Verify all item IDs exist in the clothes table
    const existingClothes = hydrateClothingItems(items);
    if (existingClothes.length !== items.length) {
      const foundIds = new Set(existingClothes.map(c => c.id));
      const missing = items.filter(id => !foundIds.has(id));
      return res.status(400).json({
        success: false,
        error: `One or more clothing IDs do not exist in wardrobe: ${missing.join(', ')}`
      });
    }

    const id = uuidv4();
    const itemsJson = JSON.stringify(items);
    const cleanRating = Math.max(0, Math.min(5, Number(rating) || 0));

    const stmt = db.prepare(`
      INSERT INTO outfits (id, name, items, occasion, season, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name.trim(), itemsJson, occasion, season, cleanRating);

    const inserted = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);
    const parsed = formatOutfitRow(inserted);

    return res.status(201).json({
      success: true,
      message: 'Outfit saved successfully',
      data: {
        ...parsed,
        hydratedItems: existingClothes
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/outfits/saved/:id
 * Retrieve a specific saved outfit.
 */
router.get('/saved/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        error: `Outfit with ID '${id}' not found`
      });
    }

    const parsed = formatOutfitRow(row);
    const hydrated = hydrateClothingItems(parsed.items);

    return res.json({
      success: true,
      data: {
        ...parsed,
        hydratedItems: hydrated
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/outfits/saved/:id
 * Update a saved outfit.
 */
router.put('/saved/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Outfit with ID '${id}' not found`
      });
    }

    const { name, items, occasion, season, rating } = req.body;

    let itemsJson = existing.items;
    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Field "items" must be a non-empty array of clothing IDs'
        });
      }
      itemsJson = JSON.stringify(items);
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedOccasion = occasion !== undefined ? occasion : existing.occasion;
    const updatedSeason = season !== undefined ? season : existing.season;
    const updatedRating = rating !== undefined ? Math.max(0, Math.min(5, Number(rating))) : existing.rating;

    db.prepare(`
      UPDATE outfits 
      SET name = ?, items = ?, occasion = ?, season = ?, rating = ?
      WHERE id = ?
    `).run(updatedName, itemsJson, updatedOccasion, updatedSeason, updatedRating, id);

    const updated = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);
    const parsed = formatOutfitRow(updated);

    return res.json({
      success: true,
      message: 'Outfit updated successfully',
      data: {
        ...parsed,
        hydratedItems: hydrateClothingItems(parsed.items)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/outfits/saved/:id
 * Delete a saved outfit from collection.
 */
router.delete('/saved/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Outfit with ID '${id}' not found`
      });
    }

    db.prepare('DELETE FROM outfits WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: `Outfit '${existing.name}' removed successfully`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/outfits/saved/:id/log
 * Log an outfit as worn on a specific date, logging to style_logs and updating clothes wear counters.
 */
router.post('/saved/:id/log', (req, res, next) => {
  try {
    const { id } = req.params;
    const outfit = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: `Outfit with ID '${id}' not found`
      });
    }

    const {
      worn_date = new Date().toISOString(),
      weather = 'mild',
      mood = 'happy',
      notes = ''
    } = req.body;

    const logId = uuidv4();
    const insertLog = db.prepare(`
      INSERT INTO style_logs (id, outfit_id, worn_date, weather, mood, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertLog.run(logId, id, worn_date, weather, mood, notes);

    // Update wear counters for all items in this outfit
    const parsedOutfit = formatOutfitRow(outfit);
    if (parsedOutfit.items.length > 0) {
      const placeholders = parsedOutfit.items.map(() => '?').join(',');
      db.prepare(`
        UPDATE clothes
        SET times_worn = times_worn + 1, last_worn = ?
        WHERE id IN (${placeholders})
      `).run(worn_date, ...parsedOutfit.items);
    }

    return res.status(201).json({
      success: true,
      message: 'Outfit wear logged in style history',
      data: {
        logId,
        outfitId: id,
        worn_date,
        weather,
        mood,
        notes
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
