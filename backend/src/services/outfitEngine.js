/**
 * outfitEngine.js
 * Comprehensive Rule-Based Outfit Recommendation & Scoring Engine.
 * Implements:
 * 1. Color Theory harmony matrix (Neutrals, Complementary, Analogous, Monochromatic)
 * 2. Occasion & Dress Code matching
 * 3. Seasonality & Weather adaptation rules
 * 4. Wear-balance & Favorite weighting
 * 5. Deterministic outfit generation & scoring breakdown
 */

// Comprehensive color categorization and palettes
const COLOR_FAMILIES = {
  neutrals: ['black', 'white', 'grey', 'gray', 'charcoal', 'off-white', 'cream', 'ivory', 'silver'],
  earth: ['beige', 'tan', 'khaki', 'brown', 'camel', 'taupe', 'olive', 'sand'],
  blues: ['blue', 'navy', 'denim', 'sky blue', 'royal blue', 'indigo', 'cyan', 'teal'],
  reds: ['red', 'burgundy', 'maroon', 'crimson', 'wine', 'rust', 'coral', 'pink', 'rose'],
  greens: ['green', 'olive', 'forest green', 'sage', 'mint', 'emerald', 'army green'],
  yellows: ['yellow', 'mustard', 'gold', 'amber'],
  purples: ['purple', 'lavender', 'violet', 'plum', 'lilac'],
  oranges: ['orange', 'peach', 'terracotta', 'rust', 'apricot']
};

// Harmony pairs based on color theory
const COMPLEMENTARY_PAIRS = [
  ['blues', 'oranges'],
  ['blues', 'earth'],
  ['reds', 'greens'],
  ['yellows', 'purples'],
  ['blues', 'reds'] // Classic navy & burgundy / red
];

const ANALOGOUS_GROUPS = [
  ['blues', 'greens'],
  ['reds', 'oranges'],
  ['reds', 'purples'],
  ['yellows', 'greens'],
  ['earth', 'greens'],
  ['earth', 'yellows']
];

// Occasion tags and expectations
const OCCASION_PROFILES = {
  formal: {
    preferredTags: ['formal', 'suit', 'blazer', 'tuxedo', 'dress', 'silk', 'wool', 'tie', 'oxford', 'heels', 'cufflinks'],
    penalizedTags: ['gym', 'hoodie', 'sweatpants', 'athletic', 'distressed', 'graphic', 'shorts', 'flip-flops', 'sneakers'],
    requiresOuterwearOrJacket: false
  },
  business: {
    preferredTags: ['business', 'smart', 'office', 'chinos', 'slacks', 'button-down', 'polo', 'loafers', 'blazer', 'cardigan'],
    penalizedTags: ['sweatpants', 'beach', 'graphic-tee', 'distressed', 'athletic', 'sandals'],
    requiresOuterwearOrJacket: false
  },
  casual: {
    preferredTags: ['casual', 't-shirt', 'tee', 'jeans', 'sneakers', 'hoodie', 'denim', 'cotton', 'flannel', 'relaxed'],
    penalizedTags: ['tuxedo', 'ballgown', 'cufflinks'],
    requiresOuterwearOrJacket: false
  },
  date_night: {
    preferredTags: ['stylish', 'chic', 'elegant', 'fitted', 'jacket', 'leather', 'boots', 'perfume', 'silk', 'perfume', 'black'],
    penalizedTags: ['baggy', 'gym', 'sweatpants', 'distressed-heavy', 'beach'],
    requiresOuterwearOrJacket: false
  },
  athletic: {
    preferredTags: ['athletic', 'gym', 'sport', 'running', 'dri-fit', 'sneakers', 'track', 'leggings', 'shorts', 'breathable'],
    penalizedTags: ['formal', 'leather', 'boots', 'heels', 'blazer', 'wool', 'suit', 'slacks'],
    requiresOuterwearOrJacket: false
  },
  party: {
    preferredTags: ['party', 'bold', 'stylish', 'trendy', 'statement', 'leather', 'boots', 'sparkle', 'accessories'],
    penalizedTags: ['sweatpants', 'office', 'slacks', 'corporate'],
    requiresOuterwearOrJacket: false
  }
};

// Weather mapping
const WEATHER_RULES = {
  cold: {
    favorsOuterwear: true,
    preferredTags: ['wool', 'down', 'fleece', 'heavy', 'knit', 'sweater', 'coat', 'jacket', 'boots', 'thermal', 'long-sleeve'],
    penalizedTags: ['shorts', 'linen', 'tank', 'sandals', 'sleeveless']
  },
  hot: {
    favorsOuterwear: false,
    preferredTags: ['linen', 'cotton', 'shorts', 'light', 'breathable', 'sandals', 't-shirt', 'short-sleeve'],
    penalizedTags: ['wool', 'down', 'heavy', 'coat', 'sweater', 'thermal', 'fleece', 'boots']
  },
  rainy: {
    favorsOuterwear: true,
    preferredTags: ['waterproof', 'jacket', 'boots', 'trench', 'windbreaker'],
    penalizedTags: ['suede', 'sandals', 'canvas']
  },
  mild: {
    favorsOuterwear: false,
    preferredTags: ['cardigan', 'light-jacket', 'denim', 'cotton', 'sneakers'],
    penalizedTags: ['heavy-coat', 'thermal', 'heavy-wool']
  }
};

/**
 * Normalizes and determines color family of a color string
 * @param {string} colorName
 * @returns {string} family name or 'unknown'
 */
export function getColorFamily(colorName) {
  if (!colorName) return 'neutrals';
  const clean = colorName.toLowerCase().trim();

  for (const [family, colors] of Object.entries(COLOR_FAMILIES)) {
    if (colors.some(c => clean.includes(c) || c.includes(clean))) {
      return family;
    }
  }
  return 'unknown';
}

/**
 * Evaluates color synergy between multiple items
 * @param {Array<object>} items - List of clothing items
 * @returns {object} { score: number (0-100), rationale: string }
 */
export function calculateColorHarmony(items) {
  if (!items || items.length === 0) return { score: 50, rationale: 'No items to evaluate' };

  const colors = items.map(i => (i.color || '').toLowerCase().trim()).filter(Boolean);
  if (colors.length < 2) {
    return { score: 85, rationale: 'Single or dominant color with minimal contrast' };
  }

  const families = items.map(i => getColorFamily(i.color));
  const uniqueFamilies = [...new Set(families)];

  // Check if all colors are neutrals (Classic minimal monochrome / neutral palette)
  const allNeutrals = families.every(f => f === 'neutrals');
  if (allNeutrals) {
    return {
      score: 95,
      rationale: 'Clean, effortless neutral palette. Timeless and versatile.'
    };
  }

  // Check if monochromatic (same non-neutral color family with neutral accents)
  const nonNeutralFamilies = families.filter(f => f !== 'neutrals' && f !== 'unknown');
  const uniqueNonNeutrals = [...new Set(nonNeutralFamilies)];

  if (uniqueNonNeutrals.length === 1) {
    return {
      score: 92,
      rationale: `Subtle monochromatic style anchored around ${uniqueNonNeutrals[0]} with neutral balance.`
    };
  }

  // Complementary or analogous combinations
  let hasComplementary = false;
  let hasAnalogous = false;

  for (let i = 0; i < uniqueNonNeutrals.length; i++) {
    for (let j = i + 1; j < uniqueNonNeutrals.length; j++) {
      const f1 = uniqueNonNeutrals[i];
      const f2 = uniqueNonNeutrals[j];

      const isComp = COMPLEMENTARY_PAIRS.some(pair => 
        (pair[0] === f1 && pair[1] === f2) || (pair[0] === f2 && pair[1] === f1)
      );
      if (isComp) hasComplementary = true;

      const isAna = ANALOGOUS_GROUPS.some(group => 
        (group[0] === f1 && group[1] === f2) || (group[0] === f2 && group[1] === f1)
      );
      if (isAna) hasAnalogous = true;
    }
  }

  if (hasComplementary) {
    return {
      score: 90,
      rationale: 'High-contrast complementary color balance creates visual depth.'
    };
  }

  if (hasAnalogous) {
    return {
      score: 88,
      rationale: 'Analogous color harmony brings a cohesive, organic flow.'
    };
  }

  // Penalty if too many distinct non-neutral color families (color clash)
  if (uniqueNonNeutrals.length >= 3) {
    return {
      score: 65,
      rationale: 'Busy palette with 3 or more competing non-neutral tones. May feel cluttered.'
    };
  }

  // Default moderate match
  return {
    score: 80,
    rationale: 'Balanced contrast between selected garment colors.'
  };
}

/**
 * Evaluates occasion alignment of an outfit
 * @param {Array<object>} items
 * @param {string} occasion
 * @returns {object} { score: number (0-100), rationale: string }
 */
export function calculateOccasionScore(items, occasion = 'casual') {
  const normOccasion = (occasion || 'casual').toLowerCase().replace(/\s+/g, '_');
  const profile = OCCASION_PROFILES[normOccasion] || OCCASION_PROFILES.casual;

  let totalPoints = 80;
  const matchHits = [];
  const penaltyHits = [];

  for (const item of items) {
    const itemTags = Array.isArray(item.tags) 
      ? item.tags.map(t => t.toLowerCase())
      : (typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : []);
    
    const itemName = (item.name || '').toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const textBlob = `${itemName} ${itemBrand} ${itemTags.join(' ')}`;

    // Check positive matches
    for (const tag of profile.preferredTags) {
      if (textBlob.includes(tag)) {
        totalPoints += 5;
        matchHits.push(tag);
        break;
      }
    }

    // Check negative mismatches
    for (const pen of profile.penalizedTags) {
      if (textBlob.includes(pen)) {
        totalPoints -= 12;
        penaltyHits.push(pen);
        break;
      }
    }
  }

  const score = Math.max(20, Math.min(100, totalPoints));
  let rationale = `Matches ${normOccasion} aesthetic well.`;
  if (penaltyHits.length > 0) {
    rationale = `Somewhat mixed for ${normOccasion}; contains informal or contrasting elements (${[...new Set(penaltyHits)].join(', ')}).`;
  } else if (matchHits.length > 0) {
    rationale = `Strongly aligns with ${normOccasion} dressing codes (${[...new Set(matchHits)].join(', ')}).`;
  }

  return { score, rationale };
}

/**
 * Evaluates weather and seasonality appropriateness
 * @param {Array<object>} items
 * @param {string} weather - 'cold' | 'hot' | 'rainy' | 'mild'
 * @param {string} season - 'winter' | 'summer' | 'spring' | 'fall'
 * @returns {object} { score: number, rationale: string }
 */
export function calculateWeatherScore(items, weather, season) {
  let effectiveWeather = (weather || '').toLowerCase();
  
  if (!effectiveWeather && season) {
    const normSeason = season.toLowerCase();
    if (normSeason === 'winter') effectiveWeather = 'cold';
    else if (normSeason === 'summer') effectiveWeather = 'hot';
    else if (normSeason === 'fall' || normSeason === 'autumn') effectiveWeather = 'mild';
    else if (normSeason === 'spring') effectiveWeather = 'mild';
  }

  if (!effectiveWeather || !WEATHER_RULES[effectiveWeather]) {
    return { score: 85, rationale: 'Standard all-season comfort configuration.' };
  }

  const rule = WEATHER_RULES[effectiveWeather];
  const hasOuterwear = items.some(i => i.category === 'outerwear');

  let points = 80;
  if (rule.favorsOuterwear && !hasOuterwear) {
    points -= 15; // penalize lack of jacket in cold/rain
  } else if (!rule.favorsOuterwear && hasOuterwear && effectiveWeather === 'hot') {
    points -= 25; // penalize wearing heavy outerwear in hot weather
  } else if (rule.favorsOuterwear && hasOuterwear) {
    points += 10;
  }

  for (const item of items) {
    const itemTags = Array.isArray(item.tags) 
      ? item.tags.map(t => t.toLowerCase())
      : [];
    const textBlob = `${item.name || ''} ${itemTags.join(' ')}`.toLowerCase();

    for (const tag of rule.preferredTags) {
      if (textBlob.includes(tag)) {
        points += 4;
        break;
      }
    }
    for (const tag of rule.penalizedTags) {
      if (textBlob.includes(tag)) {
        points -= 10;
        break;
      }
    }
  }

  const score = Math.max(30, Math.min(100, points));
  return {
    score,
    rationale: `Tailored for ${effectiveWeather} conditions with appropriate layering and material selection.`
  };
}

/**
 * Calculates complete outfit score
 * @param {Array<object>} items
 * @param {object} context - { occasion, weather, season, mood }
 * @returns {object} detailed scoring breakdown
 */
export function scoreOutfit(items, context = {}) {
  const { occasion = 'casual', weather, season, mood } = context;

  const colorResult = calculateColorHarmony(items);
  const occasionResult = calculateOccasionScore(items, occasion);
  const weatherResult = calculateWeatherScore(items, weather, season);

  // Favor items that are marked as favorites or that maintain wardrobe rotation
  let rotationBonus = 0;
  let favoriteCount = 0;
  for (const item of items) {
    if (item.favorite) favoriteCount++;
    // If an item hasn't been worn much, give a slight rotation nudge
    if (item.times_worn === 0 || item.times_worn < 3) {
      rotationBonus += 2;
    }
  }

  const favScore = Math.min(10, favoriteCount * 4);
  const bonus = Math.min(10, favScore + rotationBonus);

  // Weights:
  // Color Harmony: 35%
  // Occasion Suitability: 35%
  // Weather / Seasonality: 20%
  // Bonus (Favorites & Rotation): 10%
  const weightedScore = Math.round(
    colorResult.score * 0.35 +
    occasionResult.score * 0.35 +
    weatherResult.score * 0.20 +
    bonus
  );

  const finalScore = Math.min(100, Math.max(1, weightedScore));

  // Determine outfit vibe / title
  let vibe = 'Effortless Everyday';
  if (occasion === 'formal') vibe = 'Refined Elegance';
  else if (occasion === 'business') vibe = 'Executive Smart Casual';
  else if (occasion === 'date_night') vibe = 'Sleek & Charismatic';
  else if (occasion === 'athletic') vibe = 'Performance Active';
  else if (occasion === 'party') vibe = 'Bold & Radiant';

  return {
    overallScore: finalScore,
    breakdown: {
      colorHarmony: {
        score: colorResult.score,
        notes: colorResult.rationale
      },
      occasionSuitability: {
        score: occasionResult.score,
        notes: occasionResult.rationale
      },
      weatherSeasonality: {
        score: weatherResult.score,
        notes: weatherResult.rationale
      },
      favoriteBonus: bonus
    },
    vibe,
    stylingTips: [
      `Anchor the outfit with your ${items.find(i => i.category === 'shoes')?.name || 'chosen footwear'}.`,
      colorResult.score < 80 ? 'Consider introducing a neutral layer to balance contrasting colors.' : 'Color synergy is harmonious.',
      occasion === 'formal' ? 'Keep accessories clean, understated, and minimal.' : 'Feel free to personalize with subtle accessories.'
    ]
  };
}

/**
 * Generates outfit combinations from available wardrobe items
 * @param {Array<object>} allItems - All items from the database
 * @param {object} options - { occasion, weather, season, mood, limit }
 * @returns {Array<object>} Scored and ranked outfit suggestions
 */
export function generateOutfitSuggestions(allItems, options = {}) {
  const { occasion = 'casual', weather = 'mild', season = 'all', mood = 'confident', limit = 5 } = options;

  // Separate clothes by category
  const categories = {
    tops: [],
    bottoms: [],
    shoes: [],
    outerwear: [],
    accessories: []
  };

  for (const item of allItems) {
    if (categories[item.category]) {
      categories[item.category].push(item);
    }
  }

  // Must have at least tops and bottoms to assemble an outfit
  if (categories.tops.length === 0 || categories.bottoms.length === 0) {
    return [];
  }

  const outfits = [];
  const maxCombinationsToEvaluate = 150; // Guard performance for large wardrobes
  let evaluated = 0;

  // Check if weather strongly recommends outerwear
  const isColdOrRain = ['cold', 'rainy', 'winter'].includes((weather || '').toLowerCase()) || 
                       ['winter', 'fall'].includes((season || '').toLowerCase());

  // Generate permutations
  for (const top of categories.tops) {
    for (const bottom of categories.bottoms) {
      // Pick 0 or 1 shoes
      const shoeCandidates = categories.shoes.length > 0 ? categories.shoes : [null];
      
      for (const shoe of shoeCandidates) {
        // Outerwear candidates: if cold, pick from outerwear; otherwise also test null
        const outerCandidates = [];
        if (isColdOrRain && categories.outerwear.length > 0) {
          outerCandidates.push(...categories.outerwear);
        } else {
          outerCandidates.push(null);
          if (categories.outerwear.length > 0) {
            outerCandidates.push(categories.outerwear[0]); // offer one layered option
          }
        }

        for (const outer of outerCandidates) {
          // Optional accessory
          const accessory = categories.accessories.length > 0 ? categories.accessories[0] : null;

          const comboItems = [top, bottom];
          if (shoe) comboItems.push(shoe);
          if (outer) comboItems.push(outer);
          if (accessory) comboItems.push(accessory);

          evaluated++;
          const scoreData = scoreOutfit(comboItems, { occasion, weather, season, mood });

          outfits.push({
            name: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} ${scoreData.vibe}`,
            items: comboItems,
            itemIds: comboItems.map(i => i.id),
            occasion,
            season,
            weather,
            mood,
            score: scoreData.overallScore,
            breakdown: scoreData.breakdown,
            vibe: scoreData.vibe,
            stylingTips: scoreData.stylingTips
          });

          if (evaluated >= maxCombinationsToEvaluate) break;
        }
        if (evaluated >= maxCombinationsToEvaluate) break;
      }
      if (evaluated >= maxCombinationsToEvaluate) break;
    }
    if (evaluated >= maxCombinationsToEvaluate) break;
  }

  // Sort by score descending and return top suggestions
  outfits.sort((a, b) => b.score - a.score);

  // Filter out near-duplicate combinations to provide diverse recommendations
  const uniqueSuggestions = [];
  const seenPairs = new Set();

  for (const outfit of outfits) {
    const topId = outfit.items.find(i => i.category === 'tops')?.id;
    const bottomId = outfit.items.find(i => i.category === 'bottoms')?.id;
    const pairKey = `${topId}-${bottomId}`;

    if (!seenPairs.has(pairKey)) {
      seenPairs.add(pairKey);
      uniqueSuggestions.push(outfit);
    }

    if (uniqueSuggestions.length >= limit) break;
  }

  // If unique suggestions were less than limit, fill with remaining outfits
  if (uniqueSuggestions.length < limit) {
    for (const outfit of outfits) {
      if (!uniqueSuggestions.some(u => u.itemIds.join(',') === outfit.itemIds.join(','))) {
        uniqueSuggestions.push(outfit);
      }
      if (uniqueSuggestions.length >= limit) break;
    }
  }

  return uniqueSuggestions;
}

export default {
  getColorFamily,
  calculateColorHarmony,
  calculateOccasionScore,
  calculateWeatherScore,
  scoreOutfit,
  generateOutfitSuggestions
};
