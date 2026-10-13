import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const LoadingSpinner = ({
  size = 'md',
  label = 'Styling your wardrobe...',
  fullScreen = false,
  sublabel,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center mb-4">
        {/* Animated glowing pulsing backdrop */}
        <div className="absolute inset-0 rounded-full bg-brand-purple/20 blur-xl animate-pulse" />
        
        {/* Spinning gradient ring */}
        <div
          className={`
            ${sizeMap[size] || sizeMap.md}
            rounded-full border-transparent border-t-brand-purple border-r-pink-500
            animate-spin
          `}
        />

        {/* Center sparkling icon */}
        <div className="absolute">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
        </div>
      </div>

      {label && (
        <p className="text-sm font-medium text-slate-200 tracking-wide">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {sublabel}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
