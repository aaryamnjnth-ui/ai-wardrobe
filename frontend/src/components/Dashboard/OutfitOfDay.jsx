import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, CheckCircle2, RefreshCw, Shirt, ArrowRight } from 'lucide-react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import aiApi from '../../api/ai';
import { getImageUrl } from '../../api/clothes';
import toast from 'react-hot-toast';

export const OutfitOfDay = ({ wardrobe = [], onWearAll }) => {
  const [ootd, setOotd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wornToday, setWornToday] = useState(false);

  const fetchOOTD = async () => {
    try {
      setLoading(true);
      const data = await aiApi.getOutfitOfTheDay(wardrobe);
      setOotd(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wardrobe.length > 0) {
      fetchOOTD();
    }
  }, [wardrobe]);

  const handleWear = () => {
    if (wornToday || !ootd) return;
    if (onWearAll && ootd.items) {
      ootd.items.forEach(item => onWearAll(item.id));
    }
    setWornToday(true);
    toast.success("Look of the Day logged to your style diary! ✨");
  };

  if (loading) {
    return (
      <div className="bg-dark-700/80 rounded-3xl p-8 border border-white/[0.08] flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-purple" />
          <p className="text-xs text-slate-400">Synthesizing today's signature look...</p>
        </div>
      </div>
    );
  }

  if (!ootd || !ootd.items || ootd.items.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-br from-dark-700/90 via-dark-800 to-dark-700/90 backdrop-blur-2xl border border-purple-500/25 rounded-3xl p-6 sm:p-8 shadow-fashion overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-b from-brand-purple/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-purple to-pink-500 text-white shadow-glow-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                  Daily Style Curation
                </span>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {ootd.matchConfidence || 96}% Cohesion
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
                {ootd.title || "Today's Outfit of the Day"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOOTD}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Generate alternate OOTD"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button
              variant={wornToday ? 'outline' : 'primary'}
              size="md"
              onClick={handleWear}
              disabled={wornToday}
              leftIcon={wornToday ? CheckCircle2 : Sparkles}
            >
              {wornToday ? 'Worn Today ✓' : 'Wear This Today'}
            </Button>
          </div>
        </div>

        {/* Forecast and Theme Note */}
        <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/[0.06]">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{ootd.weatherNotice || '68°F • Clear Autumn Skies'}</span>
          </div>

          <div className="text-xs font-medium text-purple-300 italic">
            "{ootd.quote}"
          </div>
        </div>

        {/* Garments Collage */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
          {ootd.items.slice(0, 4).map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="group relative bg-dark-900/80 rounded-2xl overflow-hidden border border-white/10 p-2"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-dark-900 mb-2">
                <img
                  src={getImageUrl(item.image_path)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <Badge category={item.category} size="xs" />
              <p className="text-xs font-bold text-white mt-1.5 truncate">
                {item.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {item.brand || item.color}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutfitOfDay;
