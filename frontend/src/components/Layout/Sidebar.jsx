import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shirt, 
  Wand2, 
  MessageSquareHeart, 
  BarChart3, 
  Sparkles,
  X,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Wardrobe', path: '/wardrobe', icon: Shirt, badge: 'Collection' },
  { name: 'Outfit Generator', path: '/outfits', icon: Wand2, badge: 'AI' },
  { name: 'Style Advisor', path: '/advisor', icon: MessageSquareHeart },
  { name: 'Wardrobe Analytics', path: '/stats', icon: BarChart3 },
];

export const Sidebar = ({ isOpen, onClose, onQuickAdd }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 bg-dark-700/95 backdrop-blur-2xl
          border-r border-white/[0.08] flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/[0.06]">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white block">
                  Aura<span className="text-gradient">Style</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  AI Wardrobe Studio
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-4 px-5">
            <button
              onClick={() => {
                if (onQuickAdd) onQuickAdd();
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-pink-600 text-white font-medium text-sm shadow-glow-purple hover:shadow-glow-pink transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clothing Piece</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    relative flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm
                    transition-all duration-200 group
                    ${isActive
                      ? 'text-white bg-white/[0.08] shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-brand-purple to-brand-pink"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-pink' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          item.badge === 'AI' 
                            ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white' 
                            : 'bg-white/10 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer capsule & Pro widget */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-pink-500/10 border border-purple-500/20 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-purple/30 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Capsule Health</p>
              <p className="text-[11px] text-slate-400">84% Versatility Score</p>
            </div>
          </div>
          <div className="w-full bg-dark-900/60 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-purple to-brand-pink h-full rounded-full w-[84%]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by Gemini 2.0</span>
            <span className="text-pink-400 font-semibold">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
