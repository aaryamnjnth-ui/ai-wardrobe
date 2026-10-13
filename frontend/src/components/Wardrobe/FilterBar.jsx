import React from 'react';
import { Search, Heart, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
];

export const FilterBar = ({
  filters,
  onChange,
  metadata = {},
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const brands = metadata.brands || ['all'];
  const colors = metadata.colors || ['all'];

  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.brand !== 'all' || 
    filters.color !== 'all' || 
    filters.favorite || 
    Boolean(filters.search);

  const clearAllFilters = () => {
    onChange({
      category: 'all',
      brand: 'all',
      color: 'all',
      favorite: false,
      search: '',
      sortBy: 'newest',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Category Tabs Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = (filters.category || 'all') === tab.id;
            const count = tab.id === 'all' 
              ? metadata.totalCount 
              : metadata.categoryCounts?.[tab.id] || 0;

            return (
              <button
                key={tab.id}
                onClick={() => onChange({ ...filters, category: tab.id })}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold
                  whitespace-nowrap transition-all duration-200 select-none
                  ${isActive
                    ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-glow-purple'
                    : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border border-white/[0.05]'
                  }
                `}
              >
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        {onViewModeChange && (
          <div className="hidden sm:flex items-center gap-1 bg-dark-800 p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Second Row: Search, Dropdowns, Favorite Toggle, Sorting */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, brand, tag or color..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full bg-dark-800/90 border border-white/10 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Brand Dropdown */}
        {brands.length > 1 && (
          <select
            value={filters.brand || 'all'}
            onChange={(e) => onChange({ ...filters, brand: e.target.value })}
            className="bg-dark-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Brands</option>
            {brands.filter(b => b !== 'all').map((brand) => (
              <option key={brand} value={brand} className="bg-dark-800">
                {brand}
              </option>
            ))}
          </select>
        )}

        {/* Color Dropdown */}
        {colors.length > 1 && (
          <select
            value={filters.color || 'all'}
            onChange={(e) => onChange({ ...filters, color: e.target.value })}
            className="bg-dark-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Colors</option>
            {colors.filter(c => c !== 'all').map((color) => (
              <option key={color} value={color} className="bg-dark-800">
                {color}
              </option>
            ))}
          </select>
        )}

        {/* Sort By Dropdown */}
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="bg-dark-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="newest" className="bg-dark-800">Newest Added</option>
          <option value="most_worn" className="bg-dark-800">Most Worn</option>
          <option value="least_worn" className="bg-dark-800">Least Worn</option>
          <option value="name" className="bg-dark-800">Name (A-Z)</option>
        </select>

        {/* Favorite Toggle Button */}
        <button
          onClick={() => onChange({ ...filters, favorite: !filters.favorite })}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
            ${filters.favorite
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-glow-pink'
              : 'bg-dark-800/90 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
            }
          `}
        >
          <Heart className={`w-3.5 h-3.5 ${filters.favorite ? 'fill-current text-pink-400' : ''}`} />
          <span>Favorites</span>
        </button>

        {/* Clear Filters if active */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-purple-400 hover:text-purple-300 underline font-medium px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
