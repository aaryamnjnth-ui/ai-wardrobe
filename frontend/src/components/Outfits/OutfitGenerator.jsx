import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, RefreshCw, BookmarkCheck, Check, ArrowRight, Sun, CloudRain, Flame, Heart } from 'lucide-react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import aiApi from '../../api/ai';
import { getImageUrl } from '../../api/clothes';
import toast from 'react-hot-toast';

const OCCASIONS = [
  { id: 'work', label: 'Work & Office' },
  { id: 'casual', label: 'Everyday Casual' },
  { id: 'date', label: 'Date Night' },
  { id: 'formal', label: 'Formal / Gala' },
  { id: 'party', label: 'Party & Evening' },
];

const WEATHERS = [
  { id: 'mild', label: 'Mild (60°-72°F)' },
  { id: 'cold', label: 'Chilly / Cold (<55°F)' },
  { id: 'warm', label: 'Warm & Sunny (75°F+)' },
  { id: 'rainy', label: 'Rainy & Overcast' },
];

const MOODS = [
  { id: 'confident', label: 'Confident & Sharp' },
  { id: 'relaxed', label: 'Effortless & Cozy' },
  { id: 'minimalist', label: 'Minimalist & Sleek' },
  { id: 'bold', label: 'Bold Statement' },
];

export const OutfitGenerator = ({ wardrobe = [], onSaveOutfit }) => {
  const [occasion, setOccasion] = useState('work');
  const [weather, setWeather] = useState('mild');
  const [mood, setMood] = useState('confident');
  const [season, setSeason] = useState('fall');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setIsSaved(false);
      const result = await aiApi.generateOutfit({
        occasion,
        weather,
        mood,
        season,
        wardrobe,
      });
      setGeneratedOutfit(result);
      toast.success('New AI ensemble synthesized! ✨');
    } catch (err) {
      toast.error('Could not generate outfit');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedOutfit || isSaved) return;
    try {
      await onSaveOutfit({
        name: generatedOutfit.name,
        occasion: generatedOutfit.occasion,
        season: generatedOutfit.season,
        rating: 5,
        items: generatedOutfit.items.map(i => i.id),
        explanation: generatedOutfit.explanation,
      });
      setIsSaved(true);
    } catch (err) {
      // Toast already shown in parent
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Panel */}
      <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-fashion">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-pink-500 flex items-center justify-center text-white shadow-glow-purple">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Outfit Synthesizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure parameters to orchestrate harmonious capsule looks from your existing pieces
            </p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Occasion */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Occasion
            </label>
            <div className="space-y-1.5">
              {OCCASIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOccasion(o.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    occasion === o.id
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'bg-dark-800/80 text-slate-300 hover:bg-dark-800 border border-white/5'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather & Climate */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Forecast & Climate
            </label>
            <div className="space-y-1.5">
              {WEATHERS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeather(w.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    weather === w.id
                      ? 'bg-pink-600/25 text-pink-200 border border-pink-500/50 shadow-sm'
                      : 'bg-dark-800/80 text-slate-300 hover:bg-dark-800 border border-white/5'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood & Aesthetic */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Mood & Energy
            </label>
            <div className="space-y-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    mood === m.id
                      ? 'bg-gradient-to-r from-brand-purple/30 to-pink-500/20 text-white border border-purple-500/50 shadow-sm'
                      : 'bg-dark-800/80 text-slate-300 hover:bg-dark-800 border border-white/5'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Analyzing {wardrobe.length} items for chromatic balance & drape</span>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            leftIcon={Wand2}
          >
            Generate AI Outfit
          </Button>
        </div>
      </div>

      {/* Generated Result Container */}
      <AnimatePresence>
        {generatedOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative bg-dark-700/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-glow-purple overflow-hidden"
          >
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-pink-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-sm">
                      Generated Look
                    </span>
                    <span className="text-xs text-purple-300 font-semibold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                      ★ {generatedOutfit.styleScore || 96}% Stylist Match
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    {generatedOutfit.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    leftIcon={RefreshCw}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant={isSaved ? 'outline' : 'primary'}
                    size="md"
                    onClick={handleSave}
                    disabled={isSaved}
                    leftIcon={isSaved ? Check : BookmarkCheck}
                  >
                    {isSaved ? 'Saved in Lookbook' : 'Save Outfit'}
                  </Button>
                </div>
              </div>

              {/* Items in this ensemble */}
              <div className="my-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Garments in this Composition ({generatedOutfit.items?.length || 0})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {generatedOutfit.items?.map((piece, idx) => (
                    <div
                      key={idx}
                      className="bg-dark-800/90 border border-white/10 rounded-2xl p-2.5 group hover:border-purple-500/40 transition-colors"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-dark-900 mb-2">
                        <img
                          src={getImageUrl(piece.image_path)}
                          alt={piece.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <Badge category={piece.category} size="xs" />
                      <p className="text-xs font-bold text-white mt-1.5 truncate">
                        {piece.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {piece.brand || piece.color}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale and styling advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/[0.08]">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Styling Rationale
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {generatedOutfit.explanation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <h5 className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">
                    Pro Styling Tips
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(generatedOutfit.stylingTips || [
                      'Ensure seam lines align effortlessly on the shoulders.',
                      'Harmonize jewelry tones with footwear accents.',
                      'Opt for high-contrast textures (matte wool with smooth leather).'
                    ]).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-pink-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutfitGenerator;
