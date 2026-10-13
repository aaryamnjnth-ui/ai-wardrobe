import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-brand-purple via-purple-600 to-brand-pink text-white shadow-glow-purple hover:shadow-glow-pink hover:opacity-95 border border-purple-400/20',
  secondary: 'bg-dark-600/80 hover:bg-dark-500/90 text-slate-200 border border-white/10 hover:border-purple-500/30 shadow-sm',
  outline: 'bg-transparent border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 hover:border-red-400',
  accent: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-glow-pink hover:opacity-95',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base font-semibold rounded-2xl gap-2.5',
  icon: 'p-2.5 rounded-xl',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.02, translateY: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      className={`
        inline-flex items-center justify-center font-sans tracking-wide
        transition-all duration-200 select-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed filter grayscale-[30%]' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 text-current" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 text-current" />}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
