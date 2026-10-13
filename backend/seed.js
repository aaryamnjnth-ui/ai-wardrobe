/**
 * Seed script to populate the AI Wardrobe database with high-quality sample items.
 * Run with: node seed.js
 */
import { v4 as uuidv4 } from 'uuid';
import db from './src/database/db.js';

const sampleClothes = [
  {
    name: 'Classic White Linen Button-Down',
    category: 'tops',
    color: 'white',
    brand: 'Ralph Lauren',
    size: 'M',
    tags: ['linen', 'formal', 'summer', 'breathable', 'smart'],
    image_path: '/uploads/sample-white-shirt.jpg',
    favorite: 1,
    times_worn: 5
  },
  {
    name: 'Navy Striped Crewneck Tee',
    category: 'tops',
    color: 'navy',
    brand: 'Uniqlo',
    size: 'M',
    tags: ['casual', 'cotton', 'everyday', 'summer'],
    image_path: '/uploads/sample-navy-tee.jpg',
    favorite: 0,
    times_worn: 12
  },
  {
    name: 'Black Merino Wool Turtleneck',
    category: 'tops',
    color: 'black',
    brand: 'Zara',
    size: 'M',
    tags: ['wool', 'warm', 'minimalist', 'date_night', 'chic'],
    image_path: '/uploads/sample-black-turtleneck.jpg',
    favorite: 1,
    times_worn: 4
  },
  {
    name: 'Dark Indigo Slim Selvedge Jeans',
    category: 'bottoms',
    color: 'blue',
    brand: "Levi's",
    size: '32',
    tags: ['denim', 'casual', 'everyday', 'classic'],
    image_path: '/uploads/sample-indigo-jeans.jpg',
    favorite: 1,
    times_worn: 18
  },
  {
    name: 'Tailored Charcoal Wool Trousers',
    category: 'bottoms',
    color: 'grey',
    brand: 'COS',
    size: '32',
    tags: ['wool', 'formal', 'business', 'slacks'],
    image_path: '/uploads/sample-charcoal-trousers.jpg',
    favorite: 0,
    times_worn: 6
  },
  {
    name: 'Olive Relaxed Chino Pants',
    category: 'bottoms',
    color: 'olive',
    brand: 'J.Crew',
    size: '32',
    tags: ['earth', 'casual', 'smart', 'cotton'],
    image_path: '/uploads/sample-olive-chinos.jpg',
    favorite: 0,
    times_worn: 3
  },
  {
    name: 'White Leather Low-Top Sneakers',
    category: 'shoes',
    color: 'white',
    brand: 'Common Projects',
    size: '42',
    tags: ['casual', 'sneakers', 'minimalist', 'leather'],
    image_path: '/uploads/sample-white-sneakers.jpg',
    favorite: 1,
    times_worn: 22
  },
  {
    name: 'Dark Brown Leather Penny Loafers',
    category: 'shoes',
    color: 'brown',
    brand: 'Cole Haan',
    size: '42',
    tags: ['formal', 'leather', 'business', 'loafers'],
    image_path: '/uploads/sample-brown-loafers.jpg',
    favorite: 0,
    times_worn: 7
  },
  {
    name: 'Charcoal Wool Tailored Overcoat',
    category: 'outerwear',
    color: 'charcoal',
    brand: 'AllSaints',
    size: 'L',
    tags: ['wool', 'formal', 'winter', 'coat', 'heavy'],
    image_path: '/uploads/sample-wool-overcoat.jpg',
    favorite: 1,
    times_worn: 8
  },
  {
    name: 'Cognac Suede Bomber Jacket',
    category: 'outerwear',
    color: 'camel',
    brand: 'Schott',
    size: 'L',
    tags: ['stylish', 'date_night', 'leather', 'jacket'],
    image_path: '/uploads/sample-suede-bomber.jpg',
    favorite: 0,
    times_worn: 2
  },
  {
    name: 'Silver Minimalist Chronograph Watch',
    category: 'accessories',
    color: 'silver',
    brand: 'Seiko',
    size: 'OS',
    tags: ['metallic', 'formal', 'smart', 'watch'],
    image_path: '/uploads/sample-watch.jpg',
    favorite: 1,
    times_worn: 15
  }
];

export function seedWardrobe() {
  console.log('🌱 Seeding wardrobe items...');
  const insertStmt = db.prepare(`
    INSERT INTO clothes (
      id, name, category, color, brand, size, tags, image_path, times_worn, last_worn, favorite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 days'), ?)
  `);

  const count = db.prepare('SELECT COUNT(*) as count FROM clothes').get().count;
  if (count > 0) {
    console.log(`Database already contains ${count} items. Skipping initial clothing seed.`);
    return;
  }

  const ids = [];
  for (const item of sampleClothes) {
    const id = uuidv4();
    ids.push(id);
    insertStmt.run(
      id,
      item.name,
      item.category,
      item.color,
      item.brand,
      item.size,
      JSON.stringify(item.tags),
      item.image_path,
      item.times_worn,
      item.favorite
    );
  }
  console.log(`✅ Seeded ${sampleClothes.length} clothing items successfully!`);

  // Seed sample outfit
  const sampleOutfitId = uuidv4();
  const outfitItems = [ids[0], ids[4], ids[7], ids[8], ids[10]]; // White shirt, charcoal trousers, loafers, overcoat, watch
  db.prepare(`
    INSERT INTO outfits (id, name, items, occasion, season, rating)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    sampleOutfitId,
    'Executive Winter Classic',
    JSON.stringify(outfitItems),
    'business',
    'winter',
    5
  );

  // Seed sample style log
  db.prepare(`
    INSERT INTO style_logs (id, outfit_id, worn_date, weather, mood, notes)
    VALUES (?, ?, datetime('now', '-1 day'), ?, ?, ?)
  `).run(
    uuidv4(),
    sampleOutfitId,
    'cold',
    'confident',
    'Wore to board meeting. Received multiple compliments on the coat and trousers combo.'
  );

  console.log('✅ Seeded sample outfit & style log successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedWardrobe();
}
