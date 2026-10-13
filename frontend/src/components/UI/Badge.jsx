import React from 'react';

const categoryStyles = {
  tops: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  bottoms: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  shoes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  accessories: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  outerwear: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const variantStyles = {
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  neutral: 'bg-white/10 text-slate-300 border-white/10',
  gradient: 'bg-gradient-to-r from-brand-purple to-brand-pink text-white border-transparent font-semibold shadow-sm',
  outline: 'bg-transparent text-slate-300 border-slate-700',
};

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
};

export const Badge = ({
  children,
  variant,
  category,
  size = 'sm',
  className = '',
  icon: Icon,
  onClick,
}) => {
  let style = variantStyles[variant] || variantStyles.neutral;
  if (category && categoryStyles[category.toLowerCase()]) {
    style = categoryStyles[category.toLowerCase()];
  }

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        tracking-wide capitalize transition-all select-none
        ${sizes[size] || sizes.sm}
        ${style}
        ${onClick ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3 text-current" />}
      <span>{children || category}</span>
    </Component>
  );
};

export default Badge;
