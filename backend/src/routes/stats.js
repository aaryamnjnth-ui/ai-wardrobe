import express from 'express';
import db, { formatClothingRow } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/stats
 * Compute comprehensive wardrobe statistics and insights.
 */
router.get('/', (req, res, next) => {
  try {
    // 1. Total items count
    const { totalItems } = db.prepare('SELECT COUNT(*) as totalItems FROM clothes').get();

    // 2. Count by category
    const categoryRows = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM clothes 
      GROUP BY category
    `).all();

    const categoryBreakdown = {
      tops: 0,
      bottoms: 0,
      shoes: 0,
      accessories: 0,
      outerwear: 0
    };

    for (const row of categoryRows) {
      if (categoryBreakdown[row.category] !== undefined) {
        categoryBreakdown[row.category] = row.count;
      }
    }

    // 3. Color distribution
    const colorRows = db.prepare(`
      SELECT LOWER(TRIM(color)) as color, COUNT(*) as count
      FROM clothes
      WHERE color IS NOT NULL AND TRIM(color) != ''
      GROUP BY LOWER(TRIM(color))
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 4. Favorites count
    const { totalFavorites } = db.prepare('SELECT COUNT(*) as totalFavorites FROM clothes WHERE favorite = 1').get();

    // 5. Most worn items (top 5)
    const mostWornRows = db.prepare(`
      SELECT * FROM clothes
      ORDER BY times_worn DESC, last_worn DESC
      LIMIT 5
    `).all();

    // 6. Never worn items count and samples
    const neverWornRows = db.prepare(`
      SELECT * FROM clothes
      WHERE times_worn = 0
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const { neverWornCount } = db.prepare('SELECT COUNT(*) as neverWornCount FROM clothes WHERE times_worn = 0').get();

    // 7. Wardrobe utilization rate (percentage of items worn at least once)
    const wornCount = totalItems - neverWornCount;
    const utilizationRate = totalItems > 0 
      ? Math.round((wornCount / totalItems) * 100) 
      : 0;

    // 8. Outfits metrics
    const { totalSavedOutfits } = db.prepare('SELECT COUNT(*) as totalSavedOutfits FROM outfits').get();
    const { avgOutfitRating } = db.prepare('SELECT COALESCE(ROUND(AVG(rating), 1), 0) as avgOutfitRating FROM outfits WHERE rating > 0').get();

    // 9. Style logs metrics
    const { totalLogs } = db.prepare('SELECT COUNT(*) as totalLogs FROM style_logs').get();
    const recentLogs = db.prepare(`
      SELECT s.*, o.name as outfit_name
      FROM style_logs s
      LEFT JOIN outfits o ON s.outfit_id = o.id
      ORDER BY s.worn_date DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalFavorites,
          utilizationRate: `${utilizationRate}%`,
          totalSavedOutfits,
          avgOutfitRating,
          totalStyleLogs: totalLogs
        },
        categoryBreakdown,
        colorDistribution: colorRows,
        wearStatistics: {
          wornAtLeastOnce: wornCount,
          neverWornCount,
          mostWorn: mostWornRows.map(formatClothingRow),
          neverWornPreview: neverWornRows.map(formatClothingRow)
        },
        recentStyleActivity: recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
