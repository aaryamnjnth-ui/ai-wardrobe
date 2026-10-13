import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Clock, Edit2, Trash2, Tag, CalendarCheck } from 'lucide-react';
import Badge from '../UI/Badge';
import { getImageUrl } from '../../api/clothes';

export const ClothingCard = ({
  item,
  viewMode = 'grid', // 'grid' | 'list'
  onEdit,
  onDelete,
  onToggleFavorite,
  onLogWear,
}) => {
  const imageUrl = getImageUrl(item.image_path);

  const formattedDate = item.last_worn 
    ? new Date(item.last_worn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Never';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group bg-dark-700/60 hover:bg-dark-700/90 border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Thumbnail */}
          <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-dark-900 flex-shrink-0 border border-white/10">
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge category={item.category} size="xs" />
              {item.size && (
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                  Size: {item.size}
                </span>
              )}
              {item.color && (
                <span className="text-xs text-slate-400 hidden md:inline">
                  • {item.color}
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-purple-300 transition-colors">
              {item.name}
            </h4>

            <p className="text-xs text-slate-400 mt-0.5">
              {item.brand || 'Unspecified Brand'}
            </p>

            {/* Tags preview */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">Worn</span>
              <span className="font-semibold text-white">{item.times_worn || 0} times</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">Last Worn</span>
              <span className="font-medium text-slate-300">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onLogWear && onLogWear(item.id)}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors"
              title="Log as worn today"
            >
              <CalendarCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(item.id)}
              className={`p-2 rounded-xl transition-colors ${
                item.favorite 
                  ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' 
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={item.favorite ? 'Favorited' : 'Favorite'}
            >
              <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onEdit && onEdit(item)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Edit piece"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(item.id)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors"
              title="Delete piece"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid Card View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 rounded-2xl overflow-hidden shadow-fashion flex flex-col justify-between transition-all duration-300"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] w-full bg-dark-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Ambient Dark Gradient on bottom of photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Category & Favorite Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <Badge category={item.category} size="xs" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(item.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              item.favorite
                ? 'bg-pink-500/80 text-white shadow-glow-pink scale-110'
                : 'bg-dark-900/60 hover:bg-dark-900 text-slate-300 hover:text-white'
            }`}
            title={item.favorite ? 'Favorited' : 'Favorite'}
          >
            <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Floating Bottom Quick Overlay */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white z-10">
          <span className="font-semibold text-xs tracking-wider uppercase bg-dark-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-200 border border-white/10">
            {item.brand || 'Designer'}
          </span>
          {item.size && (
            <span className="bg-dark-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-mono text-purple-300 border border-white/10">
              {item.size}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
            {item.name}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{item.color || 'Neutral color'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {item.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer with actions and wear counter */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 text-[11px]">Worn </span>
            <span className="font-bold text-white">{item.times_worn || 0}x</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onLogWear && onLogWear(item.id)}
              className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors"
              title="Log wear today (+1)"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit && onEdit(item)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Edit piece"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete && onDelete(item.id)}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors"
              title="Delete piece"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClothingCard;
