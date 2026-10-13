import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server.js';
import db from '../src/database/db.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Start test server on random high port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server?.closeAllConnections) {
    server.closeAllConnections();
  }
  await new Promise((resolve) => server.close(resolve));
  try {
    db.close();
  } catch {}
  process.exit(0);
});

// Helper for making JSON HTTP requests against the test server
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

test('Health check endpoint returns healthy status', async () => {
  const res = await request('/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'healthy');
  assert.equal(typeof res.data.geminiEnabled, 'boolean');
});

test('GET /api/clothes returns wardrobe items list', async () => {
  const res = await request('/api/clothes');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.total >= 11);

  // Check structure of first item
  const item = res.data.data[0];
  assert.ok(item.id);
  assert.ok(item.name);
  assert.ok(item.category);
  assert.ok(Array.isArray(item.tags));
});

test('GET /api/clothes filtering by category and favorite', async () => {
  const res = await request('/api/clothes?category=tops&favorite=true');
  assert.equal(res.status, 200);
  for (const item of res.data.data) {
    assert.equal(item.category, 'tops');
    assert.equal(item.favorite, true);
  }
});

let createdItemId;
test('POST /api/clothes creates a new item with validation', async () => {
  // Test validation error
  const invalidRes = await request('/api/clothes', {
    method: 'POST',
    body: { name: 'Hat' } // missing category
  });
  assert.equal(invalidRes.status, 400);

  // Test successful creation
  const res = await request('/api/clothes', {
    method: 'POST',
    body: {
      name: 'Emerald Silk Slip Dress',
      category: 'tops',
      color: 'emerald',
      brand: 'Reformation',
      size: 'S',
      tags: ['silk', 'chic', 'date_night'],
      favorite: true
    }
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Emerald Silk Slip Dress');
  assert.equal(res.data.data.category, 'tops');
  assert.equal(res.data.data.favorite, true);
  assert.deepEqual(res.data.data.tags, ['silk', 'chic', 'date_night']);

  createdItemId = res.data.data.id;
});

test('GET /api/clothes/:id returns specific item', async () => {
  const res = await request(`/api/clothes/${createdItemId}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.data.id, createdItemId);
  assert.equal(res.data.data.name, 'Emerald Silk Slip Dress');
});

test('PUT /api/clothes/:id updates item', async () => {
  const res = await request(`/api/clothes/${createdItemId}`, {
    method: 'PUT',
    body: {
      name: 'Emerald Silk Luxury Top',
      size: 'M'
    }
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.data.name, 'Emerald Silk Luxury Top');
  assert.equal(res.data.data.size, 'M');
});

test('POST /api/clothes/:id/wear increments times_worn', async () => {
  const initial = await request(`/api/clothes/${createdItemId}`);
  const initialTimes = initial.data.data.times_worn;

  const res = await request(`/api/clothes/${createdItemId}/wear`, {
    method: 'POST'
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.data.times_worn, initialTimes + 1);
  assert.ok(res.data.data.last_worn);
});

test('DELETE /api/clothes/:id removes the item', async () => {
  const res = await request(`/api/clothes/${createdItemId}`, {
    method: 'DELETE'
  });
  assert.equal(res.status, 200);

  // Verify it is gone
  const getRes = await request(`/api/clothes/${createdItemId}`);
  assert.equal(getRes.status, 404);
});

test('GET /api/outfits produces rule-based suggestions with scoring breakdown', async () => {
  const res = await request('/api/outfits?occasion=business&season=winter&weather=cold');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.length > 0);

  const topOutfit = res.data.data[0];
  assert.ok(topOutfit.score >= 1);
  assert.ok(topOutfit.items.length >= 2);
  assert.ok(topOutfit.breakdown.colorHarmony);
  assert.ok(topOutfit.breakdown.occasionSuitability);
  assert.ok(topOutfit.breakdown.weatherSeasonality);
});

test('POST /api/outfits/generate generates outfit tailored to weather and mood', async () => {
  const res = await request('/api/outfits/generate', {
    method: 'POST',
    body: {
      occasion: 'date_night',
      weather: 'cold',
      mood: 'sleek'
    }
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.items);
  assert.ok(res.data.data.aiStylistCommentary);
  assert.ok(res.data.data.score);
});

let testSavedOutfitId;
test('POST /api/outfits/saved saves a new outfit with item validation', async () => {
  // Get top 2 items
  const clothesRes = await request('/api/clothes?limit=2');
  const ids = clothesRes.data.data.map(i => i.id);

  const res = await request('/api/outfits/saved', {
    method: 'POST',
    body: {
      name: 'Weekend Coffee Run',
      items: ids,
      occasion: 'casual',
      season: 'spring',
      rating: 4
    }
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Weekend Coffee Run');
  assert.equal(res.data.data.rating, 4);
  assert.equal(res.data.data.hydratedItems.length, 2);

  testSavedOutfitId = res.data.data.id;
});

test('GET /api/outfits/saved lists saved outfits with hydrated items', async () => {
  const res = await request('/api/outfits/saved');
  assert.equal(res.status, 200);
  assert.ok(res.data.data.length >= 1);
  const found = res.data.data.find(o => o.id === testSavedOutfitId);
  assert.ok(found);
  assert.equal(found.hydratedItems.length, 2);
});

test('POST /api/outfits/saved/:id/log logs outfit wearing in style history', async () => {
  const res = await request(`/api/outfits/saved/${testSavedOutfitId}/log`, {
    method: 'POST',
    body: {
      weather: 'sunny',
      mood: 'energized',
      notes: 'Very comfortable casual look'
    }
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.outfitId, testSavedOutfitId);
});

test('DELETE /api/outfits/saved/:id removes saved outfit', async () => {
  const res = await request(`/api/outfits/saved/${testSavedOutfitId}`, {
    method: 'DELETE'
  });
  assert.equal(res.status, 200);

  const getRes = await request(`/api/outfits/saved/${testSavedOutfitId}`);
  assert.equal(getRes.status, 404);
});

test('GET /api/stats returns comprehensive wardrobe metrics', async () => {
  const res = await request('/api/stats');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.summary.totalItems >= 11);
  assert.ok(res.data.data.categoryBreakdown.tops >= 1);
  assert.ok(res.data.data.categoryBreakdown.bottoms >= 1);
  assert.ok(res.data.data.categoryBreakdown.shoes >= 1);
  assert.ok(res.data.data.categoryBreakdown.outerwear >= 1);
  assert.ok(Array.isArray(res.data.data.colorDistribution));
  assert.ok(res.data.data.wearStatistics.mostWorn.length > 0);
  assert.ok(res.data.data.summary.utilizationRate);
});

test('POST /api/ai/style-advice returns styling recommendations', async () => {
  const clothesRes = await request('/api/clothes?limit=2');
  const items = clothesRes.data.data;

  const res = await request('/api/ai/style-advice', {
    method: 'POST',
    body: {
      prompt: 'What shoes and watch should I pair with this?',
      outfitItems: items,
      occasion: 'business',
      weather: 'cold',
      mood: 'powerful'
    }
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.advice);
  assert.ok(['gemini', 'rule-based'].includes(res.data.data.source));
});

test('GET /api/ai/wardrobe-gaps performs wardrobe gap analysis', async () => {
  const res = await request('/api/ai/wardrobe-gaps');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.categoryDistribution);
  assert.ok(Array.isArray(res.data.data.identifiedGaps));
  assert.ok(Array.isArray(res.data.data.recommendedPurchases));
});

test('POST /api/ai/score evaluates outfit combination', async () => {
  const clothesRes = await request('/api/clothes?limit=3');
  const items = clothesRes.data.data;

  const res = await request('/api/ai/score', {
    method: 'POST',
    body: {
      items,
      occasion: 'casual',
      weather: 'mild'
    }
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.overallScore >= 0);
  assert.ok(res.data.data.breakdown);
});
