import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import database to ensure schemas are initialized
import './src/database/db.js';

// Import route handlers
import clothesRouter from './src/routes/clothes.js';
import outfitsRouter from './src/routes/outfits.js';
import aiRouter from './src/routes/ai.js';
import statsRouter from './src/routes/stats.js';
import { isGeminiEnabled } from './src/services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve and ensure uploads folder exists for static asset serving
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ----------------------------------------------------
// Core Middleware Configuration
// ----------------------------------------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static images from /uploads
app.use('/uploads', express.static(uploadsDir));

// ----------------------------------------------------
// Health Check & Root Endpoints
// ----------------------------------------------------
const healthCheck = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    geminiEnabled: isGeminiEnabled(),
    version: '1.0.0'
  });
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

app.get('/', (req, res) => {
  res.json({
    message: '👗 AI Wardrobe Management System API',
    status: 'running',
    docs: '/api/health',
    endpoints: {
      clothes: '/api/clothes',
      clothesUpload: 'POST /api/clothes/upload',
      outfitsSuggestions: 'GET /api/outfits',
      outfitsGenerate: 'POST /api/outfits/generate',
      outfitsSaved: '/api/outfits/saved',
      stats: 'GET /api/stats',
      aiStyleAdvice: 'POST /api/ai/style-advice',
      aiWardrobeGaps: 'GET /api/ai/wardrobe-gaps',
      aiScore: 'POST /api/ai/score'
    }
  });
});

// ----------------------------------------------------
// RESTful API Routes
// ----------------------------------------------------
app.use('/api/clothes', clothesRouter);
app.use('/api/outfits', outfitsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/stats', statsRouter);

// ----------------------------------------------------
// 404 Not Found Handler
// ----------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
});

// ----------------------------------------------------
// Global Centralized Error Handling Middleware
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// ----------------------------------------------------
// Server Listener
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`✨ AI Wardrobe Management System Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🤖 Google Gemini AI: ${isGeminiEnabled() ? '✅ Enabled' : '⚡ Fallback Mode (Rule-Based Engine Active)'}`);
    console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
    console.log(`====================================================`);
  });
}

export default app;
