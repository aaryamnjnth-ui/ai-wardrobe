import React from 'react';
import { Menu, Bell, CloudSun, Sparkles, User, RefreshCw } from 'lucide-react';

export const Header = ({ onOpenSidebar, pageTitle, onRefresh, isRefreshing = false }) => {
  return (
    <header className="sticky top-0 z-30 h-20 bg-dark-900/60 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            {pageTitle || 'Dashboard'}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400">
            Intelligent wardrobe orchestration & style analytics
          </p>
        </div>
      </div>

      {/* Right: Weather pill, Refresh, Status, and Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Weather Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-300">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span>68°F • Autumn Mild</span>
        </div>

        {/* AI Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Stylist Engine Ready</span>
        </div>

        {/* Refresh button if page provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all border border-white/[0.06] disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        )}

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-pink-500 p-[1px] shadow-glow-purple">
            <div className="w-full h-full rounded-xl bg-dark-800 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <User className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
