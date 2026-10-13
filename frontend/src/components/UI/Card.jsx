import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  gradientBorder = false,
  onClick,
  ...props
}) => {
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -3, transition: { duration: 0.2 } },
    whileTap: { scale: 0.99 },
    onClick,
  } : {};

  return (
    <Component
      className={`
        relative rounded-2xl bg-dark-700/80 backdrop-blur-xl
        border border-white/[0.08] text-slate-100 overflow-hidden
        ${glow ? 'shadow-glow-purple' : 'shadow-fashion'}
        ${hoverEffect ? 'hover:border-purple-500/30 hover:shadow-glow-purple transition-all duration-300' : ''}
        ${gradientBorder ? 'before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-brand-purple before:to-brand-pink before:rounded-2xl before:-z-10' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action }) => (
  <div className={`p-5 md:p-6 border-b border-white/[0.06] flex items-center justify-between ${className}`}>
    <div>
      {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
      {subtitle && <p className="text-xs md:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 md:p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-4 md:p-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
