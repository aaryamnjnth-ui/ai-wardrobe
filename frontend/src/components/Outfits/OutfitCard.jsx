import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import Badge from '../UI/Badge';
import { getImageUrl } from '../../api/clothes';

export const OutfitCard = ({
  outfit,
  wardrobe = [],
  onDelete,
  onUpdateRating,
  onLogWear,
}) => {
  // Resolve item objects from IDs or items array
  const resolvedItems = React.useMemo(() => {
    if (!outfit.items) return [];
    return outfit.items.map(itemOrId => {
      if (typeof itemOrId === 'object' && itemOrId !== null) return itemOrId;
      return wardrobe.find(w => w.id === itemOrId) || {
        id: itemOrId,
        name: 'Wardrobe Piece',
        category: 'tops',
        image_path: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
      };
    });
  }, [outfit.items, wardrobe]);

  const occasionColors = {
    work: 'purple',
    casual: 'emerald',
    formal: 'amber',
    date: 'pink',
    party: 'purple',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-fashion hover:shadow-glow-purple transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header: Title, Occasion, Rating, Actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant={occasionColors[outfit.occasion?.toLowerCase()] || 'purple'} size="xs">
                {outfit.occasion || 'Versatile'}
              </Badge>
              {outfit.season && (
                <span className="text-[11px] font-semibold text-slate-400 capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  {outfit.season}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {outfit.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={() => onDelete(outfit.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete outfit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Outfit Items Collage */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 my-4">
          {resolvedItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-900 border border-white/10"
              title={`${item.name} (${item.category})`}
            >
              <img
                src={getImageUrl(item.image_path)}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-dark-900/90 to-transparent">
                <p className="text-[10px] text-white font-medium truncate">
                  {item.name}
                </p>
                <span className="text-[9px] text-purple-300 capitalize">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stylist Notes / Explanation */}
        {outfit.explanation && (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Stylist Formula</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {outfit.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Rating stars & Log Wear button */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onUpdateRating && onUpdateRating(outfit.id, star)}
              className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= (outfit.rating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Wear Button */}
        {onLogWear && (
          <button
            onClick={() => onLogWear(outfit.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Wear Today</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default OutfitCard;
