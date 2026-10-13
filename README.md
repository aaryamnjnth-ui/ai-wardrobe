# 🧥 AuraStyle AI — Wardrobe Management System

> An AI-powered wardrobe manager built with React, Node.js, and Google Gemini AI.

![AuraStyle AI](https://img.shields.io/badge/AI-Gemini%20Powered-purple?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue?style=for-the-badge&logo=sqlite)

## ✨ Features

- 👗 **Wardrobe Management** — Add, edit, delete clothing items with image upload
- 🤖 **AI Outfit Generator** — Generate outfits by occasion, weather & mood using Gemini AI
- 💬 **Style Advisor** — Chat with an AI stylist for personalized fashion advice
- 📊 **Statistics** — Track wear frequency, color palettes, and wardrobe gaps
- 🌟 **Outfit of the Day** — Daily curated look based on your wardrobe

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** 🎨

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| AI | Google Gemini 1.5 Flash + Rule-based engine |
| Styling | Glassmorphism dark theme (purple/pink) |

## 📁 Project Structure

```
ai-wardrobe/
├── backend/          # Express API + SQLite + Gemini AI
│   ├── src/
│   │   ├── routes/   # API routes (clothes, outfits, ai, stats)
│   │   ├── services/ # AI service + outfit engine
│   │   ├── database/ # SQLite setup
│   │   └── middleware/
│   ├── seed.js       # Sample wardrobe data
│   └── server.js
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Dashboard, Wardrobe, Outfits, Advisor, Stats
        ├── components/
        ├── api/
        └── hooks/
```

## 🔑 Environment Variables

```env
# backend/.env
PORT=5000
GEMINI_API_KEY=your_key_here
DATABASE_PATH=./wardrobe.db
```

## 📄 License

MIT © [aaryamnjnth-ui](https://github.com/aaryamnjnth-ui)
