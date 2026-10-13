import React from 'react';
import { motion } from 'framer-motion';

export const StatsCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  gradient = 'from-brand-purple to-purple-600',
  trend,
  trendType = 'positive', // 'positive' | 'neutral' | 'negative'
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`
        relative bg-dark-700/80 backdrop-blur-xl border border-white/[0.08]
        hover:border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-fashion
        transition-all duration-300 overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Top right subtle glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-glow-purple flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {trend && (
            <span className={`font-semibold ${
              trendType === 'positive' ? 'text-emerald-400' :
              trendType === 'negative' ? 'text-rose-400' : 'text-purple-300'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
