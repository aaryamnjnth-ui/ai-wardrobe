import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import db, { formatClothingRow } from '../database/db.js';
import { handleSingleUpload } from '../middleware/upload.js';

const router = express.Router();

const VALID_CATEGORIES = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

/**
 * GET /api/clothes
 * Retrieve wardrobe items with filtering, search, and pagination.
 */
router.get('/', (req, res, next) => {
  try {
    const {
      category,
      color,
      brand,
      favorite,
      tag,
      search,
      sort = 'created_at',
      order = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category.toLowerCase());
    }

    if (color) {
      conditions.push('LOWER(color) LIKE ?');
      params.push(`%${color.toLowerCase()}%`);
    }

    if (brand) {
      conditions.push('LOWER(brand) LIKE ?');
      params.push(`%${brand.toLowerCase()}%`);
    }

    if (favorite !== undefined) {
      const isFav = favorite === 'true' || favorite === '1' ? 1 : 0;
      conditions.push('favorite = ?');
      params.push(isFav);
    }

    if (tag) {
      conditions.push('tags LIKE ?');
      params.push(`%${tag}%`);
    }

    if (search) {
      conditions.push('(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(color) LIKE ? OR tags LIKE ?)');
      const searchWildcard = `%${search.toLowerCase()}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column to avoid SQL injection
    const allowedSortColumns = ['name', 'category', 'color', 'brand', 'times_worn', 'last_worn', 'favorite', 'created_at'];
    const safeSort = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const safeOrder = (order || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query total count
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM clothes ${whereClause}`);
    const { total } = countStmt.get(...params);

    // Query items
    const query = `
      SELECT * FROM clothes
      ${whereClause}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const items = db.prepare(query).all(...params, Number(limit), Number(offset));
    const formatted = items.map(formatClothingRow);

    return res.json({
      success: true,
      total,
      limit: Number(limit),
      offset: Number(offset),
      data: formatted
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clothes/upload
 * Handles uploading an image file for a clothing item.
 */
router.post('/upload', handleSingleUpload('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file uploaded. Please provide an image using key "image".'
    });
  }

  // Construct relative URL path for client consumption
  const imagePath = `/uploads/${req.file.filename}`;

  return res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      image_path: imagePath
    }
  });
});

/**
 * GET /api/clothes/:id
 * Retrieve a single clothing item by ID.
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        error: `Clothing item with ID '${id}' not found`
      });
    }

    return res.json({
      success: true,
      data: formatClothingRow(row)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clothes
 * Add a new clothing item to the wardrobe.
 */
router.post('/', (req, res, next) => {
  try {
    const {
      name,
      category,
      color = null,
      brand = null,
      size = null,
      tags = [],
      image_path = null,
      favorite = false
    } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Field "name" is required and must be a non-empty string.'
      });
    }

    if (!category || !VALID_CATEGORIES.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Field "category" is required. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    const id = uuidv4();
    const cleanCategory = category.toLowerCase();
    const cleanTags = Array.isArray(tags) 
      ? JSON.stringify(tags.map(t => String(t).trim()).filter(Boolean))
      : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]');
    
    const favInt = favorite ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO clothes (
        id, name, category, color, brand, size, tags, image_path, times_worn, last_worn, favorite
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)
    `);

    stmt.run(id, name.trim(), cleanCategory, color, brand, size, cleanTags, image_path, favInt);

    const inserted = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      message: 'Clothing item added successfully',
      data: formatClothingRow(inserted)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/clothes/:id
 * Update an existing clothing item.
 */
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Clothing item with ID '${id}' not found`
      });
    }

    const {
      name,
      category,
      color,
      brand,
      size,
      tags,
      image_path,
      favorite,
      times_worn,
      last_worn
    } = req.body;

    if (category && !VALID_CATEGORIES.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    let updatedTags = existing.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updatedTags = JSON.stringify(tags.map(t => String(t).trim()).filter(Boolean));
      } else if (typeof tags === 'string') {
        try {
          // Check if valid JSON string
          JSON.parse(tags);
          updatedTags = tags;
        } catch {
          updatedTags = JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean));
        }
      }
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedCategory = category !== undefined ? category.toLowerCase() : existing.category;
    const updatedColor = color !== undefined ? color : existing.color;
    const updatedBrand = brand !== undefined ? brand : existing.brand;
    const updatedSize = size !== undefined ? size : existing.size;
    const updatedImagePath = image_path !== undefined ? image_path : existing.image_path;
    const updatedFavorite = favorite !== undefined ? (favorite ? 1 : 0) : existing.favorite;
    const updatedTimesWorn = times_worn !== undefined ? Number(times_worn) : existing.times_worn;
    const updatedLastWorn = last_worn !== undefined ? last_worn : existing.last_worn;

    const stmt = db.prepare(`
      UPDATE clothes SET
        name = ?,
        category = ?,
        color = ?,
        brand = ?,
        size = ?,
        tags = ?,
        image_path = ?,
        favorite = ?,
        times_worn = ?,
        last_worn = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedName,
      updatedCategory,
      updatedColor,
      updatedBrand,
      updatedSize,
      updatedTags,
      updatedImagePath,
      updatedFavorite,
      updatedTimesWorn,
      updatedLastWorn,
      id
    );

    const updated = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: 'Clothing item updated successfully',
      data: formatClothingRow(updated)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clothes/:id/wear
 * Helper endpoint to increment times_worn and update last_worn timestamp
 */
router.post('/:id/wear', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Clothing item with ID '${id}' not found`
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE clothes 
      SET times_worn = times_worn + 1, last_worn = ? 
      WHERE id = ?
    `).run(now, id);

    const updated = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);
    return res.json({
      success: true,
      message: 'Item wear logged',
      data: formatClothingRow(updated)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clothes/:id
 * Remove a clothing item from the wardrobe.
 */
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM clothes WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Clothing item with ID '${id}' not found`
      });
    }

    // Optionally delete uploaded image file from disk if it exists in local uploads directory
    if (existing.image_path && existing.image_path.startsWith('/uploads/')) {
      const filename = path.basename(existing.image_path);
      const filePath = path.resolve(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`Could not delete file ${filePath}:`, err.message);
        }
      }
    }

    db.prepare('DELETE FROM clothes WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: `Clothing item '${existing.name}' deleted successfully`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
});

export default router;
