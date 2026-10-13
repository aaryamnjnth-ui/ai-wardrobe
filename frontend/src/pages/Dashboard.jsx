import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Shirt, 
  Layers, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  Clock, 
  Plus, 
  Wand2, 
  MessageSquareHeart, 
  BarChart3,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import OutfitOfDay from '../components/Dashboard/OutfitOfDay';
import ClothingCard from '../components/Wardrobe/ClothingCard';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useWardrobe } from '../hooks/useWardrobe';
import { useOutfits } from '../hooks/useOutfits';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { onOpenAddModal } = useOutletContext() || {};
  const { 
    clothes, 
    loading: wardrobeLoading, 
    metadata, 
    logWear, 
    toggleFavorite, 
    deleteItem 
  } = useWardrobe();
  const { outfits, loading: outfitsLoading } = useOutfits();

  if (wardrobeLoading && clothes.length === 0) {
    return <LoadingSpinner size="lg" label="Curating your personal style dashboard..." />;
  }

  const totalWears = clothes.reduce((acc, c) => acc + (c.times_worn || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-fashion">
        {/* Glow orb */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Autumn Capsule Wardrobe Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Welcome back to your <span className="text-gradient">Style Studio</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5 leading-relaxed">
              You have {clothes.length} items cataloged across {Object.keys(metadata.categoryCounts || {}).length} categories with an 84% versatility index.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onOpenAddModal && onOpenAddModal()}
              leftIcon={Plus}
            >
              Add Item
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/outfits')}
              leftIcon={Wand2}
            >
              Generate Outfit
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Pieces"
          value={clothes.length}
          subtext="Cataloged garments"
          icon={Shirt}
          gradient="from-brand-purple to-purple-600"
          trend="+3 this month"
          onClick={() => navigate('/wardrobe')}
        />
        <StatsCard
          title="Curated Looks"
          value={outfits.length}
          subtext="Saved outfit formulas"
          icon={Layers}
          gradient="from-purple-600 to-pink-500"
          trend="5 star average"
          onClick={() => navigate('/outfits')}
        />
        <StatsCard
          title="Total Wears"
          value={totalWears}
          subtext="Logged wear events"
          icon={CalendarCheck}
          gradient="from-pink-500 to-rose-500"
          trend="Active rotation"
          onClick={() => navigate('/stats')}
        />
        <StatsCard
          title="Favorites"
          value={metadata.favoriteCount}
          subtext="Capsule anchors"
          icon={Heart}
          gradient="from-rose-500 to-amber-500"
          trend={`${Math.round((metadata.favoriteCount / (clothes.length || 1)) * 100)}% of wardrobe`}
          onClick={() => navigate('/wardrobe?favorite=true')}
        />
      </div>

      {/* Outfit of the Day Section */}
      <div>
        <OutfitOfDay
          wardrobe={clothes}
          onWearAll={(id) => logWear(id)}
        />
      </div>

      {/* Quick Access Shortcuts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/advisor')}
          className="group p-5 rounded-2xl bg-dark-700/60 hover:bg-dark-700/90 border border-white/[0.08] hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Style Advisor Chat
              </h4>
              <p className="text-xs text-slate-400">Ask for styling advice & gap analysis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/outfits')}
          className="group p-5 rounded-2xl bg-dark-700/60 hover:bg-dark-700/90 border border-white/[0.08] hover:border-pink-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-pink-500/20 text-pink-300 group-hover:scale-110 transition-transform">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                AI Outfit Synthesizer
              </h4>
              <p className="text-xs text-slate-400">Occasion & weather curated looks</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/stats')}
          className="group p-5 rounded-2xl bg-dark-700/60 hover:bg-dark-700/90 border border-white/[0.08] hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Wardrobe Analytics
              </h4>
              <p className="text-xs text-slate-400">Cost per wear & color distribution</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Two Column Layout: Recently Worn & Most Worn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Worn */}
        <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-fashion">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Recently Worn Items</h3>
            </div>
            <button
              onClick={() => navigate('/wardrobe')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              View All ({clothes.length})
            </button>
          </div>

          {metadata.recentlyWorn.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {metadata.recentlyWorn.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onLogWear={logWear}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>No recently worn items logged yet.</p>
              <p className="text-xs mt-1">Click the calendar icon on any piece to log it!</p>
            </div>
          )}
        </div>

        {/* Most Worn Foundation Pieces */}
        <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-fashion">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <h3 className="text-lg font-bold text-white">Most Worn Staples</h3>
            </div>
            <button
              onClick={() => navigate('/stats')}
              className="text-xs font-semibold text-pink-400 hover:text-pink-300"
            >
              Analytics Breakdown
            </button>
          </div>

          <div className="space-y-3">
            {metadata.mostWorn.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-dark-800/80 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-purple-400">
                    #{index + 1}
                  </span>
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-dark-900 border border-white/10 flex-shrink-0">
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                      {item.name}
                    </h5>
                    <p className="text-xs text-slate-400 capitalize">
                      {item.brand || item.category} • {item.color}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white block">
                    {item.times_worn || 0}x
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    worn
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
