import React, { useState } from 'react';
import { Wand2, BookmarkCheck, Sparkles, Filter, Plus } from 'lucide-react';
import OutfitGenerator from '../components/Outfits/OutfitGenerator';
import OutfitCard from '../components/Outfits/OutfitCard';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useWardrobe } from '../hooks/useWardrobe';
import { useOutfits } from '../hooks/useOutfits';

const OCCASION_FILTERS = ['all', 'work', 'casual', 'formal', 'date', 'party'];
const SEASON_FILTERS = ['all', 'spring', 'summer', 'fall', 'winter'];

export const Outfits = () => {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'saved'
  const { clothes, loading: wardrobeLoading } = useWardrobe();
  const {
    outfits,
    filteredOutfits,
    loading: outfitsLoading,
    filters,
    setFilters,
    saveOutfit,
    updateOutfit,
    deleteOutfit,
    logWear,
  } = useOutfits();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <span>AI Outfit Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Synthesize weather & mood calibrated looks or browse your curated lookbook
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center p-1.5 rounded-2xl bg-dark-800 border border-white/10">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Lookbook ({outfits.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'generator' ? (
        <OutfitGenerator
          wardrobe={clothes}
          onSaveOutfit={async (newLook) => {
            await saveOutfit(newLook);
          }}
        />
      ) : (
        /* Saved Lookbook View */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Occasion:
              </span>
              {OCCASION_FILTERS.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setFilters({ ...filters, occasion: occ })}
                  className={`text-xs capitalize px-3 py-1.5 rounded-xl font-medium transition-all ${
                    filters.occasion === occ
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Season:
              </span>
              <select
                value={filters.season}
                onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                className="bg-dark-800 text-xs text-white border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
              >
                {SEASON_FILTERS.map(s => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of Saved Outfits */}
          {outfitsLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" label="Loading saved outfits..." />
            </div>
          ) : filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  wardrobe={clothes}
                  onDelete={deleteOutfit}
                  onUpdateRating={(id, rating) => updateOutfit(id, { rating })}
                  onLogWear={logWear}
                />
              ))}
            </div>
          ) : (
            /* Empty Lookbook */
            <div className="bg-dark-700/50 border border-white/[0.08] rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <BookmarkCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                No saved outfits in this collection
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Use the AI Outfit Synthesizer to discover new pairings and save your favorite combinations.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('generator')}
                leftIcon={Wand2}
              >
                Launch Outfit Generator
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Outfits;
