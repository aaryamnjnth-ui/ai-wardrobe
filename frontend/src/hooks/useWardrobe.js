import { useState, useEffect, useCallback, useMemo } from 'react';
import clothesApi from '../api/clothes';
import toast from 'react-hot-toast';

export function useWardrobe(initialFilters = {}) {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    color: 'all',
    brand: 'all',
    search: '',
    favorite: false,
    sortBy: 'newest', // 'newest', 'most_worn', 'least_worn', 'name'
    ...initialFilters,
  });

  const loadClothes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clothesApi.getAll();
      setClothes(data);
    } catch (err) {
      console.error('Failed to load wardrobe clothes', err);
      setError(err.friendlyMessage || 'Failed to fetch clothing items');
      toast.error('Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClothes();
  }, [loadClothes]);

  // Add Item
  const addItem = async (clothingData) => {
    try {
      const created = await clothesApi.create(clothingData);
      setClothes(prev => [created, ...prev]);
      toast.success('Piece added to your wardrobe ✨');
      return created;
    } catch (err) {
      toast.error(err.friendlyMessage || 'Error adding clothing item');
      throw err;
    }
  };

  // Update Item
  const updateItem = async (id, updateData) => {
    try {
      const updated = await clothesApi.update(id, updateData);
      setClothes(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
      toast.success('Piece details updated');
      return updated;
    } catch (err) {
      toast.error(err.friendlyMessage || 'Error updating piece');
      throw err;
    }
  };

  // Delete Item
  const deleteItem = async (id) => {
    try {
      await clothesApi.delete(id);
      setClothes(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from wardrobe');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Error deleting item');
      throw err;
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (id) => {
    try {
      // Optimistic update
      setClothes(prev => prev.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
      await clothesApi.toggleFavorite(id);
    } catch (err) {
      // Revert on error
      setClothes(prev => prev.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
      toast.error('Could not update favorite status');
    }
  };

  // Log Wear
  const logWear = async (id) => {
    try {
      const nowIso = new Date().toISOString();
      setClothes(prev => prev.map(item => item.id === id ? {
        ...item,
        times_worn: (item.times_worn || 0) + 1,
        last_worn: nowIso,
      } : item));
      await clothesApi.logWear(id);
      toast.success('Logged as worn today! 🌟');
    } catch (err) {
      toast.error('Failed to log wear');
    }
  };

  // Filtered & Sorted items
  const filteredClothes = useMemo(() => {
    let result = [...clothes];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category?.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.color && filters.color !== 'all') {
      result = result.filter(item => item.color?.toLowerCase().includes(filters.color.toLowerCase()));
    }

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(item => item.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (filters.favorite) {
      result = result.filter(item => item.favorite);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'most_worn':
        result.sort((a, b) => (b.times_worn || 0) - (a.times_worn || 0));
        break;
      case 'least_worn':
        result.sort((a, b) => (a.times_worn || 0) - (b.times_worn || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return result;
  }, [clothes, filters]);

  // Metadata: Categories, Brands, Colors for filters
  const metadata = useMemo(() => {
    const categories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
    const brands = ['all', ...Array.from(new Set(clothes.map(c => c.brand).filter(Boolean)))];
    const colors = ['all', ...Array.from(new Set(clothes.map(c => c.color).filter(Boolean)))];
    
    // Category Breakdown counts
    const categoryCounts = {
      tops: 0,
      bottoms: 0,
      shoes: 0,
      accessories: 0,
      outerwear: 0,
    };

    clothes.forEach(item => {
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category]++;
      }
    });

    const mostWorn = [...clothes].sort((a, b) => (b.times_worn || 0) - (a.times_worn || 0)).slice(0, 5);
    const recentlyWorn = [...clothes].filter(c => c.last_worn).sort((a, b) => new Date(b.last_worn) - new Date(a.last_worn)).slice(0, 4);

    return {
      categories,
      brands,
      colors,
      categoryCounts,
      totalCount: clothes.length,
      favoriteCount: clothes.filter(c => c.favorite).length,
      mostWorn,
      recentlyWorn,
    };
  }, [clothes]);

  return {
    clothes,
    filteredClothes,
    loading,
    error,
    filters,
    setFilters,
    reload: loadClothes,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    logWear,
    metadata,
  };
}

export default useWardrobe;
