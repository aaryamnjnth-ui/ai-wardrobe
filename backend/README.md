# 👗 AI Wardrobe Management System - Backend

A production-grade Node.js/Express REST API backend for an intelligent wardrobe management system. Features rule-based color theory and occasion matching, Google Gemini AI integration for natural language style consulting and wardrobe gap analysis, image uploads, and SQLite persistence with WAL mode.

---

## 🌟 Key Features

- **Wardrobe Inventory Management**: Full CRUD operations for clothing items across 5 categories (`tops`, `bottoms`, `shoes`, `outerwear`, `accessories`), with tag indexing, wear counts, and favorite toggles.
- **Image Upload Pipeline**: Secure image upload handling via `multer` with MIME type validation, UUID-based file storage, and static serving at `/uploads`.
- **Hybrid AI Outfit Recommendation Engine**:
  - **Color Harmony**: Evaluates monochromatic, neutral, complementary, and analogous color combinations.
  - **Occasion Matching**: Dynamic scoring against occasion guidelines (`casual`, `formal`, `business`, `date_night`, `athletic`, `party`).
  - **Weather & Season Adaptability**: Layering logic that factors in cold, rainy, hot, and mild climates.
  - **Wear Balance**: Encourages closet rotation and rewards favorited garments.
- **Google Gemini API Integration**:
  - Natural language style advice and accessory recommendations.
  - Intelligent wardrobe gap analysis detecting missing essentials.
  - Automated fallback to a rule-based AI stylist when Gemini API keys are unconfigured or offline.
- **Style History & Tracking**: Log daily outfits worn with weather and mood, updating wear counts automatically.
- **Wardrobe Analytics**: Real-time stats on wardrobe utilization rate, category distributions, top worn items, and forgotten items.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules, `type: "module"`)
- **Web Framework**: Express.js 4.x
- **Database**: SQLite via `better-sqlite3` (WAL mode enabled)
- **AI / LLM**: Google Gemini API via `@google/generative-ai` (`gemini-1.5-flash`)
- **File Uploads**: `multer`
- **Utilities**: `uuid`, `dotenv`, `cors`
- **Test Runner**: Node.js Native Test Runner (`node:test`, `node:assert`)

---

## 📁 Project Structure

```text
ai-wardrobe/backend/
├── package.json              # Project dependencies and npm scripts
├── server.js                 # Main Express server entry point
├── seed.js                   # Database seed script with sample wardrobe
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── .gitignore                # Git ignore rules
├── uploads/                  # Uploaded clothing images directory
├── test/
│   └── api.test.js           # Integration test suite (17 tests)
└── src/
    ├── database/
    │   ├── db.js             # SQLite initialization and schema definitions
    │   └── wardrobe.db       # SQLite database file
    ├── middleware/
    │   └── upload.js         # Multer disk storage and file validation
    ├── routes/
    │   ├── clothes.js        # Clothing CRUD, upload, and wear counter endpoints
    │   ├── outfits.js        # Outfit suggestion, generation, and saved collection endpoints
    │   ├── ai.js             # Gemini AI style advice and wardrobe gap analysis
    │   └── stats.js          # Wardrobe utilization and analytics
    └── services/
        ├── outfitEngine.js   # Rule-based outfit matching and color theory algorithm
        └── aiService.js      # Gemini API integration and fallback AI stylist
```

---

## 🚀 Quick Start

### 1. Installation

```bash
cd C:\Users\aarya\.gemini\antigravity\scratch\ai-wardrobe\backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
NODE_ENV=development
DB_PATH=./src/database/wardrobe.db
CORS_ORIGIN=*

# Optional: Add your Google Gemini API Key from https://aistudio.google.com/
# If left blank, the system automatically runs in Rule-Based AI Fallback mode!
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Seed Sample Wardrobe

Populate the database with a curated 11-piece wardrobe:

```bash
npm run seed  # or: node seed.js
```

### 4. Run the Server

```bash
# Production start
npm start

# Development mode with hot-reloading
npm run dev
```

The API will be available at: `http://localhost:5000`

### 5. Run Integration Tests

```bash
npm test
```

---

## 📊 Database Schema

### `clothes` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUIDv4 identifier |
| `name` | `TEXT NOT NULL` | Garment title |
| `category` | `TEXT NOT NULL` | One of: `tops`, `bottoms`, `shoes`, `accessories`, `outerwear` |
| `color` | `TEXT` | Color name (e.g. `navy`, `white`, `emerald`) |
| `brand` | `TEXT` | Brand / manufacturer |
| `size` | `TEXT` | Size designation |
| `tags` | `TEXT` | JSON array of descriptive tags (e.g. `["formal", "wool"]`) |
| `image_path` | `TEXT` | Image path (e.g. `/uploads/uuid.jpg`) |
| `times_worn` | `INTEGER DEFAULT 0`| Number of times this item was logged in outfits |
| `last_worn` | `TEXT` | ISO 8601 date timestamp |
| `favorite` | `INTEGER DEFAULT 0`| Boolean flag (0 or 1) |
| `created_at` | `TEXT` | Creation timestamp |

### `outfits` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUIDv4 identifier |
| `name` | `TEXT NOT NULL` | Outfit title |
| `items` | `TEXT NOT NULL` | JSON array of clothing IDs `["id1", "id2", ...]` |
| `occasion` | `TEXT` | Target occasion (`casual`, `business`, `formal`, etc.) |
| `season` | `TEXT` | Suitable season (`spring`, `summer`, `fall`, `winter`, `all`) |
| `rating` | `INTEGER DEFAULT 0`| Rating score (0 to 5) |
| `created_at` | `TEXT` | Creation timestamp |

### `style_logs` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | UUIDv4 identifier |
| `outfit_id` | `TEXT` | Foreign key referencing `outfits(id)` |
| `worn_date` | `TEXT` | Date worn |
| `weather` | `TEXT` | Weather conditions (`cold`, `sunny`, `rainy`, `mild`) |
| `mood` | `TEXT` | User mood (`confident`, `relaxed`, `bold`) |
| `notes` | `TEXT` | Personal styling reflections |
| `created_at` | `TEXT` | Creation timestamp |

---

## 📡 Complete API Reference

### 1. Clothes (`/api/clothes`)

#### `GET /api/clothes`
Retrieve wardrobe items with filtering, search, and pagination.
- **Query Params**:
  - `category`: `tops` | `bottoms` | `shoes` | `accessories` | `outerwear`
  - `color`: string filter
  - `brand`: string filter
  - `favorite`: `true` | `false`
  - `tag`: search tag keyword
  - `search`: general text search
  - `sort`: `created_at` | `times_worn` | `name` (default: `created_at`)
  - `order`: `ASC` | `DESC` (default: `DESC`)
  - `limit`: number (default: 50)
  - `offset`: number (default: 0)

#### `POST /api/clothes`
Create a new clothing item.
- **Request Body**:
  ```json
  {
    "name": "Classic White Oxford Shirt",
    "category": "tops",
    "color": "white",
    "brand": "Brooks Brothers",
    "size": "M",
    "tags": ["cotton", "formal", "office"],
    "image_path": "/uploads/example.jpg",
    "favorite": true
  }
  ```

#### `GET /api/clothes/:id`
Retrieve a single clothing item by ID.

#### `PUT /api/clothes/:id`
Update an existing clothing item (supports partial updates).

#### `DELETE /api/clothes/:id`
Delete an item from the wardrobe. Also cleans up its local image file if present.

#### `POST /api/clothes/:id/wear`
Increment `times_worn` count and update `last_worn` timestamp to current time.

#### `POST /api/clothes/upload`
Upload a clothing image (`multipart/form-data` with field `image`).
- **Response**:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "filename": "d38fc899-7da7-4e6a-a2a9-7fa34be52968.jpg",
      "image_path": "/uploads/d38fc899-7da7-4e6a-a2a9-7fa34be52968.jpg",
      "size": 182410
    }
  }
  ```

---

### 2. Outfits (`/api/outfits`)

#### `GET /api/outfits`
Generate dynamic outfit suggestions from currently available wardrobe items.
- **Query Params**:
  - `occasion`: `casual` | `business` | `formal` | `date_night` | `athletic` | `party`
  - `weather`: `cold` | `hot` | `rainy` | `mild`
  - `season`: `spring` | `summer` | `fall` | `winter` | `all`
  - `mood`: `confident` | `relaxed` | `energetic`
  - `limit`: number (default: 5)
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "name": "Business Executive Smart Casual",
        "score": 93,
        "occasion": "business",
        "weather": "cold",
        "breakdown": {
          "colorHarmony": { "score": 95, "notes": "Clean, effortless neutral palette." },
          "occasionSuitability": { "score": 90, "notes": "Strongly aligns with business dressing codes." },
          "weatherSeasonality": { "score": 90, "notes": "Tailored for cold conditions with appropriate layering." },
          "favoriteBonus": 8
        },
        "items": [ /* Full hydrated clothing items */ ],
        "stylingTips": [
          "Anchor the outfit with your Dark Brown Leather Penny Loafers.",
          "Color synergy is harmonious."
        ]
      }
    ]
  }
  ```

#### `POST /api/outfits/generate`
AI-generate a customized outfit with AI stylist commentary.
- **Request Body**:
  ```json
  {
    "occasion": "date_night",
    "weather": "cold",
    "mood": "sleek"
  }
  ```

#### `GET /api/outfits/saved`
Retrieve all saved outfits, including full populated item details for each garment.
- **Query Params**: `occasion`, `season`, `minRating`.

#### `POST /api/outfits/saved`
Save an outfit combination.
- **Request Body**:
  ```json
  {
    "name": "Winter Date Night Ensemble",
    "items": ["uuid-top", "uuid-bottom", "uuid-shoes", "uuid-coat"],
    "occasion": "date_night",
    "season": "winter",
    "rating": 5
  }
  ```

#### `GET /api/outfits/saved/:id`
Retrieve a single saved outfit by ID.

#### `PUT /api/outfits/saved/:id`
Update an outfit's name, rating, or items.

#### `DELETE /api/outfits/saved/:id`
Delete a saved outfit.

#### `POST /api/outfits/saved/:id/log`
Log wearing a saved outfit on a given date. Automatically increments `times_worn` for all items in that outfit.
- **Request Body**:
  ```json
  {
    "worn_date": "2026-10-13T12:00:00Z",
    "weather": "cold",
    "mood": "confident",
    "notes": "Felt warm and received great feedback on the coat."
  }
  ```

---

### 3. AI & Style Advice (`/api/ai`)

#### `POST /api/ai/style-advice`
Request personal styling recommendations from Google Gemini (or rule-based stylist).
- **Request Body**:
  ```json
  {
    "prompt": "How should I accessorize this for an evening gallery opening?",
    "outfitId": "optional-saved-outfit-id",
    "outfitItems": ["optional-clothing-id-1", "optional-clothing-id-2"],
    "occasion": "date_night",
    "weather": "mild",
    "mood": "creative"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "source": "gemini",
      "model": "gemini-1.5-flash",
      "advice": "### 👗 Stylist Recommendation\n\n1. **The Vibe & Verdict**...",
      "occasion": "date_night",
      "weather": "mild"
    }
  }
  ```

#### `GET /api/ai/wardrobe-gaps`
Wardrobe architecture analysis. Scans all registered clothes for category imbalances, color palette gaps, and recommends high-ROI staple items to purchase.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalItems": 11,
      "categoryDistribution": {
        "tops": 3,
        "bottoms": 3,
        "shoes": 2,
        "outerwear": 2,
        "accessories": 1
      },
      "identifiedGaps": [],
      "recommendedPurchases": [
        {
          "item": "Minimalist White Leather Sneakers",
          "category": "shoes",
          "reason": "Matches everything from casual tees to blazers."
        }
      ],
      "aiStylistInsights": "Markdown insights from Gemini..."
    }
  }
  ```

#### `POST /api/ai/score`
Evaluate and score an arbitrary set of clothing items.
- **Request Body**:
  ```json
  {
    "items": ["uuid-top", "uuid-bottom", "uuid-shoes"],
    "occasion": "casual",
    "weather": "mild"
  }
  ```

---

### 4. Wardrobe Statistics (`/api/stats`)

#### `GET /api/stats`
Comprehensive wardrobe overview:
- Total items & favorites
- Wardrobe utilization rate (`% of closet worn at least once`)
- Category counts breakdown
- Color distribution (most frequent colors)
- Top 5 most worn items
- Forgotten / never worn items list
- Saved outfits count and average rating
- Recent style log activity

---

## 🎨 Recommendation Engine Mechanics

```
                         Outfit Candidates
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Color Harmony Matrix             Occasion Profiler
      (Neutrals, Complementary,        (Tags & Dress Code
       Analogous, Monochromatic)         Positive/Negative)
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        Weather & Seasonality            Wardrobe Balance
       (Layering, Fabric rules)        (Favorites & Rotation)
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Composite Score (0 - 100)
                                 │
                                 ▼
                  Gemini AI Stylist Synthesis
             (Personalized Critique & Layering Tips)
```

1. **Color Harmony (35%)**: Evaluates color families across garments. Neutral anchors (black, white, grey, navy, beige) score top marks. Complementary and analogous palettes receive bonuses, while conflicting saturated tones are flagged.
2. **Occasion Suitability (35%)**: Tests items against formality expectations, penalizing inappropriate pairings (e.g. gym shorts with blazers).
3. **Weather & Seasonality (20%)**: Enforces smart layering in cold/rainy conditions and warns against heavy garments in high temperatures.
4. **Rotation & Favorites (10%)**: Provides a freshness boost to under-rotated clothes to maximize closet versatility.
5. **AI Synthesis**: If `GEMINI_API_KEY` is provided, Gemini writes editorial reviews and tailored styling advice. Otherwise, an internal rule-based engine provides structured markdown advice.

---

## 🧪 Testing

The test suite runs with Node's native test runner (`node:test`):

```bash
npm test
```

All 17 automated integration tests cover:
- Health check
- Clothing CRUD operations
- Validation handling
- Image upload endpoints
- Wear count tracking
- Suggestion engine scoring
- AI generation & style advice
- Saved outfits collection and hydration
- Style log history
- Wardrobe gap analysis
- Statistics calculation

---

## 📄 License

ISC License.
