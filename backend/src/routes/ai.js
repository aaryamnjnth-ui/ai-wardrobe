import express from 'express';
import db, { formatClothingRow, formatOutfitRow } from '../database/db.js';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/ai/style-advice
 * Get AI-powered or rule-guided style advice tailored to context and wardrobe pieces.
 */
router.post('/style-advice', async (req, res, next) => {
  try {
    const {
      prompt = '',
      outfitId,
      outfitItems,
      occasion = 'casual',
      weather = 'mild',
      mood = 'confident'
    } = req.body;

    let itemsToAnalyze = [];

    // If an outfit ID is provided, look it up and fetch its clothing items
    if (outfitId) {
      const outfitRow = db.prepare('SELECT * FROM outfits WHERE id = ?').get(outfitId);
      if (outfitRow) {
        const parsedOutfit = formatOutfitRow(outfitRow);
        if (parsedOutfit.items.length > 0) {
          const placeholders = parsedOutfit.items.map(() => '?').join(',');
          const rows = db.prepare(`SELECT * FROM clothes WHERE id IN (${placeholders})`).all(...parsedOutfit.items);
          itemsToAnalyze = rows.map(formatClothingRow);
        }
      }
    } else if (Array.isArray(outfitItems) && outfitItems.length > 0) {
      // Check if outfitItems is array of IDs or array of objects
      if (typeof outfitItems[0] === 'string') {
        const placeholders = outfitItems.map(() => '?').join(',');
        const rows = db.prepare(`SELECT * FROM clothes WHERE id IN (${placeholders})`).all(...outfitItems);
        itemsToAnalyze = rows.map(formatClothingRow);
      } else {
        itemsToAnalyze = outfitItems;
      }
    }

    const adviceResult = await aiService.getStyleAdvice({
      prompt,
      outfitItems: itemsToAnalyze,
      occasion,
      weather,
      mood
    });

    return res.json({
      success: true,
      data: adviceResult
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/wardrobe-gaps
 * Analyzes the user's wardrobe for missing essentials, color imbalances, and buying recommendations.
 */
router.get('/wardrobe-gaps', async (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM clothes').all();
    const items = rows.map(formatClothingRow);

    const gapAnalysis = await aiService.analyzeWardrobeGaps(items);

    return res.json({
      success: true,
      data: gapAnalysis
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/score
 * Evaluate and critique an outfit combination.
 */
router.post('/score', async (req, res, next) => {
  try {
    const {
      items = [],
      occasion = 'casual',
      weather = 'mild',
      season = 'all',
      mood = 'confident'
    } = req.body;

    let resolvedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      if (typeof items[0] === 'string') {
        const placeholders = items.map(() => '?').join(',');
        const rows = db.prepare(`SELECT * FROM clothes WHERE id IN (${placeholders})`).all(...items);
        resolvedItems = rows.map(formatClothingRow);
      } else {
        resolvedItems = items;
      }
    }

    if (resolvedItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one clothing item or ID to score.'
      });
    }

    const scoreResult = await aiService.scoreOutfitAI(resolvedItems, {
      occasion,
      weather,
      season,
      mood
    });

    return res.json({
      success: true,
      data: scoreResult
    });
  } catch (error) {
    next(error);
  }
});

export default router;
