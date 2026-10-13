import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import outfitEngine from './outfitEngine.js';

dotenv.config();

// Initialize Google Gemini Client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
let geminiModel = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    geminiModel = genAI.getGenerativeModel({ model: modelName });
  } catch (error) {
    console.warn('[AI Service] Failed to initialize Google Generative AI client:', error.message);
  }
}

/**
 * Checks if Gemini API integration is actively configured
 */
export function isGeminiEnabled() {
  return Boolean(geminiModel);
}

/**
 * Natural language style advice generator.
 * Uses Gemini API when available, with an intelligent rule-based stylist fallback.
 * 
 * @param {object} params
 * @param {string} params.prompt - Optional user question or specific request
 * @param {Array<object>} params.outfitItems - Items currently in the outfit
 * @param {string} params.occasion - Occasion context (casual, business, etc.)
 * @param {string} params.weather - Weather condition
 * @param {string} params.mood - Desired mood/vibe
 * @returns {Promise<object>} Advice response with markdown text and metadata
 */
export async function getStyleAdvice({
  prompt = '',
  outfitItems = [],
  occasion = 'casual',
  weather = 'mild',
  mood = 'confident'
} = {}) {
  const outfitSummary = outfitItems.map(item => 
    `- ${item.name} (${item.category}, ${item.color || 'unspecified color'}, ${item.brand || 'no brand'})`
  ).join('\n');

  // Attempt Gemini API call if enabled
  if (geminiModel) {
    try {
      const systemPrompt = `You are a world-class personal fashion stylist and wardrobe consultant.
Provide thoughtful, encouraging, and sophisticated fashion advice.
Context:
- Occasion: ${occasion}
- Weather: ${weather}
- Mood / Vibe: ${mood}
${outfitItems.length > 0 ? `Selected Outfit Items:\n${outfitSummary}` : 'No specific outfit selected yet.'}

User Question / Goal: "${prompt || 'How can I elevate this look and ensure it fits the occasion?'}"

Provide actionable advice structured in clean Markdown with:
1. **The Vibe & Verdict**: Overall impression.
2. **Styling & Layering Tips**: How to wear the pieces (e.g. cuffing, tucking, layering).
3. **Footwear & Accessories**: How to complement the look with shoes, jewelry, bags, or watches.
4. **Color & Fabric Synergy**: Observations on tones and textures.
Keep it practical, stylish, and inspiring.`;

      const result = await geminiModel.generateContent(systemPrompt);
      const response = await result.response;
      const adviceText = response.text();

      return {
        source: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        advice: adviceText,
        occasion,
        weather,
        mood
      };
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, falling back to rule-based engine:', err.message);
      // Seamlessly fall through to rule-based stylist
    }
  }

  // Rule-based stylist engine fallback
  const ruleEvaluation = outfitItems.length > 0 
    ? outfitEngine.scoreOutfit(outfitItems, { occasion, weather, mood })
    : null;

  const ruleAdvice = buildRuleBasedAdvice({
    prompt,
    outfitItems,
    occasion,
    weather,
    mood,
    ruleEvaluation
  });

  return {
    source: 'rule-based',
    advice: ruleAdvice,
    occasion,
    weather,
    mood,
    evaluation: ruleEvaluation
  };
}

/**
 * AI-generate an outfit tailored for occasion, weather, and mood.
 * Combines outfitEngine suggestions with Gemini creative synthesis.
 * 
 * @param {object} params
 * @param {string} params.occasion
 * @param {string} params.weather
 * @param {string} params.mood
 * @param {Array<object>} params.wardrobeItems
 * @returns {Promise<object>}
 */
export async function generateOutfitAI({
  occasion = 'casual',
  weather = 'mild',
  mood = 'confident',
  wardrobeItems = []
} = {}) {
  if (!wardrobeItems || wardrobeItems.length === 0) {
    throw new Error('Wardrobe is empty. Please add items to your wardrobe first.');
  }

  // Generate top rule-based candidate outfits
  const suggestions = outfitEngine.generateOutfitSuggestions(wardrobeItems, {
    occasion,
    weather,
    mood,
    limit: 3
  });

  if (suggestions.length === 0) {
    throw new Error('Could not form an outfit. Ensure your wardrobe contains at least tops and bottoms.');
  }

  const bestOutfit = suggestions[0];
  const itemsText = bestOutfit.items.map(i => `${i.name} (${i.category}, ${i.color || 'color neutral'})`).join(', ');

  let aiCommentary = `Curated for a ${mood} ${occasion} look suitable for ${weather} weather. The combination balances tones seamlessly.`;

  // Enhance with Gemini if available
  if (geminiModel) {
    try {
      const geminiPrompt = `You are an elite wardrobe stylist.
I have assembled this outfit from a user's closet:
Items: ${itemsText}
Context:
- Occasion: ${occasion}
- Weather: ${weather}
- Mood: ${mood}
- Rule Engine Score: ${bestOutfit.score}/100

In 3-4 concise, stylish sentences:
1. Explain why this outfit works well for the occasion and weather.
2. Give one expert tip on how to carry or accessorize it.
Keep your response engaging and modern.`;

      const result = await geminiModel.generateContent(geminiPrompt);
      const response = await result.response;
      aiCommentary = response.text().trim();
    } catch (err) {
      console.warn('[AI Service] Gemini commentary skipped due to error:', err.message);
    }
  }

  return {
    ...bestOutfit,
    aiStylistCommentary: aiCommentary,
    alternativeSuggestions: suggestions.slice(1)
  };
}

/**
 * Analyzes the user's wardrobe for missing essentials, color imbalances, and versatility gaps.
 * 
 * @param {Array<object>} wardrobeItems
 * @returns {Promise<object>} Gap analysis report
 */
export async function analyzeWardrobeGaps(wardrobeItems = []) {
  const categoryCounts = {
    tops: 0,
    bottoms: 0,
    shoes: 0,
    outerwear: 0,
    accessories: 0
  };

  const colorCounts = {};
  for (const item of wardrobeItems) {
    const cat = item.category || 'other';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    }
    const color = (item.color || 'unspecified').toLowerCase().trim();
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  }

  const identifiedGaps = [];
  const recommendedPurchases = [];

  // Category balance checks
  if (categoryCounts.tops === 0) {
    identifiedGaps.push('Critical: No tops registered in wardrobe.');
    recommendedPurchases.push({
      item: 'Classic Crisp White Button-Down & High-Quality Crewneck T-Shirt',
      category: 'tops',
      reason: 'Foundational pieces for both casual and smart outfits.'
    });
  } else if (categoryCounts.tops < 3) {
    identifiedGaps.push('Limited top rotation: You only have a few tops, which limits outfit varieties.');
  }

  if (categoryCounts.bottoms === 0) {
    identifiedGaps.push('Critical: No bottoms registered in wardrobe.');
    recommendedPurchases.push({
      item: 'Tailored Dark Indigo Denim or Slim Neutral Chinos',
      category: 'bottoms',
      reason: 'Versatile base that pairs with any top color.'
    });
  } else if (categoryCounts.bottoms < 2) {
    identifiedGaps.push('Low bottom variety: Adding one more neutral pair of pants/trousers will double your outfits.');
  }

  if (categoryCounts.shoes === 0) {
    identifiedGaps.push('Missing footwear: No shoes in wardrobe.');
    recommendedPurchases.push({
      item: 'Minimalist White Leather Sneakers or Classic Loafers',
      category: 'shoes',
      reason: 'Matches everything from casual tees to blazers.'
    });
  }

  if (categoryCounts.outerwear === 0) {
    identifiedGaps.push('No outerwear: Lacks layering capacity for cold or rainy weather.');
    recommendedPurchases.push({
      item: 'Structured Trench Coat or Classic Denim/Leather Jacket',
      category: 'outerwear',
      reason: 'Provides warmth and instant structure to basic outfits.'
    });
  }

  // Color diversity analysis
  const uniqueColors = Object.keys(colorCounts).filter(c => c !== 'unspecified');
  const hasNeutrals = uniqueColors.some(c => ['black', 'white', 'grey', 'navy', 'beige', 'tan'].includes(c));

  if (!hasNeutrals && wardrobeItems.length > 3) {
    identifiedGaps.push('Palette imbalance: Wardrobe lacks neutral foundation pieces (black, white, navy, grey, beige).');
    recommendedPurchases.push({
      item: 'Neutral Staples (Charcoal, Navy, or Off-White)',
      category: 'tops',
      reason: 'Neutrals anchor statement colors and prevent color clashes.'
    });
  }

  // AI-generated deep review if Gemini is configured
  let aiInsights = null;
  if (geminiModel && wardrobeItems.length > 0) {
    try {
      const summaryList = wardrobeItems.map(i => `${i.name} [${i.category}, ${i.color || 'no color'}]`).join(', ');
      const prompt = `You are an elite wardrobe architect.
Analyze this user's current closet inventory:
${summaryList}

Category breakdown: Tops (${categoryCounts.tops}), Bottoms (${categoryCounts.bottoms}), Shoes (${categoryCounts.shoes}), Outerwear (${categoryCounts.outerwear}), Accessories (${categoryCounts.accessories}).

Identify:
1. Missing essential wardrobe staples (gaps).
2. The Top 3 versatile items they should purchase next to multiply outfit combinations.
3. Color palette and versatility advice.
Format your response in crisp Markdown with bullet points.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      aiInsights = response.text();
    } catch (err) {
      console.warn('[AI Service] Gemini wardrobe gap analysis error:', err.message);
    }
  }

  return {
    totalItems: wardrobeItems.length,
    categoryDistribution: categoryCounts,
    colorDistribution: colorCounts,
    identifiedGaps,
    recommendedPurchases,
    aiStylistInsights: aiInsights
  };
}

/**
 * AI-enhanced evaluation of a user-submitted outfit
 * @param {Array<object>} items
 * @param {object} context
 */
export async function scoreOutfitAI(items, context = {}) {
  const ruleScore = outfitEngine.scoreOutfit(items, context);

  let critique = null;
  if (geminiModel && items.length > 0) {
    try {
      const itemDesc = items.map(i => `${i.name} (${i.category}, ${i.color || 'neutral'})`).join(', ');
      const prompt = `Critique this outfit for occasion: "${context.occasion || 'casual'}" and weather: "${context.weather || 'mild'}".
Items: ${itemDesc}
Current rule score: ${ruleScore.overallScore}/100.

Provide a 2-sentence critique praising what works and suggesting 1 tweak.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      critique = response.text().trim();
    } catch (err) {
      console.warn('[AI Service] Gemini score critique failed:', err.message);
    }
  }

  return {
    ...ruleScore,
    aiCritique: critique
  };
}

/**
 * Builds rich rule-based markdown advice when Gemini is not active
 */
function buildRuleBasedAdvice({ prompt, outfitItems, occasion, weather, mood, ruleEvaluation }) {
  const lines = [];

  lines.push(`### 👗 Stylist Recommendation for **${occasion.toUpperCase()}**`);
  lines.push(`*Curated for ${weather} weather with a ${mood} vibe.*`);
  lines.push('');

  if (outfitItems.length > 0) {
    lines.push('#### 🔍 Outfit Assessment');
    lines.push(`You have selected **${outfitItems.length} piece(s)**:`);
    for (const item of outfitItems) {
      lines.push(`- **${item.name}** (*${item.category}*, color: \`${item.color || 'neutral'}\`)`);
    }
    lines.push('');

    if (ruleEvaluation) {
      lines.push(`- **Styling Score**: **${ruleEvaluation.overallScore}/100**`);
      lines.push(`- **Color Synergy**: ${ruleEvaluation.breakdown.colorHarmony.notes}`);
      lines.push(`- **Occasion Alignment**: ${ruleEvaluation.breakdown.occasionSuitability.notes}`);
      lines.push(`- **Weather Adaptation**: ${ruleEvaluation.breakdown.weatherSeasonality.notes}`);
      lines.push('');
    }
  }

  lines.push('#### 💡 Key Styling Tips');
  if (occasion === 'formal') {
    lines.push('- Ensure garments are crisp and well-pressed.');
    lines.push('- Stick with classic footwear (polished leather shoes, loafers, or clean heels).');
    lines.push('- Keep jewelry minimal and intentional.');
  } else if (occasion === 'business') {
    lines.push('- Balance structure with comfort: pair a tailored blazer with comfortable chinos or slacks.');
    lines.push('- Use one subtle accent color (e.g. watch strap, belt, or pocket square).');
  } else if (occasion === 'date_night') {
    lines.push('- Focus on clean silhouettes and fitted garments that enhance your posture.');
    lines.push('- Add a signature scent or a statement accessory like a sleek timepiece.');
  } else {
    lines.push('- Elevate casual wear with intentional footwear and a tailored fit.');
    lines.push('- Try the French tuck (front tuck) for a relaxed yet put-together silhouette.');
  }

  if (weather === 'cold') {
    lines.push('- Layer smartly: base layer (cotton/thermal) -> mid layer (knit/sweater) -> outer layer (structured coat).');
  } else if (weather === 'hot') {
    lines.push('- Choose breathable, natural fibers like linen or lightweight cotton to stay fresh.');
  }

  if (prompt) {
    lines.push('');
    lines.push(`#### 💬 Notes on your inquiry: "${prompt}"`);
    lines.push('- Focus on comfort and proportion: balance looser bottoms with a fitted top, or vice-versa.');
  }

  return lines.join('\n');
}

export default {
  isGeminiEnabled,
  getStyleAdvice,
  generateOutfitAI,
  analyzeWardrobeGaps,
  scoreOutfitAI
};
