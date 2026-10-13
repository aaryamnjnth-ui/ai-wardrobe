import { useState, useEffect, useCallback, useMemo } from 'react';
import outfitsApi from '../api/outfits';
import toast from 'react-hot-toast';

export function useOutfits(initialFilters = {}) {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    occasion: 'all',
    season: 'all',
    search: '',
    ...initialFilters,
  });

  const loadOutfits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await outfitsApi.getAll();
      setOutfits(data);
    } catch (err) {
      console.error('Failed to load outfits', err);
      setError(err.friendlyMessage || 'Failed to fetch saved outfits');
      toast.error('Failed to load outfits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOutfits();
  }, [loadOutfits]);

  const saveOutfit = async (outfitData) => {
    try {
      const created = await outfitsApi.create(outfitData);
      setOutfits(prev => [created, ...prev]);
      toast.success('Outfit saved to your Lookbook! 💖');
      return created;
    } catch (err) {
      toast.error(err.friendlyMessage || 'Error saving outfit');
      throw err;
    }
  };

  const updateOutfit = async (id, updateData) => {
    try {
      const updated = await outfitsApi.update(id, updateData);
      setOutfits(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      toast.success('Outfit updated');
      return updated;
    } catch (err) {
      toast.error('Failed to update outfit');
      throw err;
    }
  };

  const deleteOutfit = async (id) => {
    try {
      await outfitsApi.delete(id);
      setOutfits(prev => prev.filter(o => o.id !== id));
      toast.success('Outfit removed from saved collection');
    } catch (err) {
      toast.error('Failed to remove outfit');
      throw err;
    }
  };

  const logWear = async (id, details = {}) => {
    try {
      await outfitsApi.logWear(id, details);
      toast.success('Wore this outfit today! Logged in your style diary.');
    } catch (err) {
      toast.error('Could not log wear');
    }
  };

  const filteredOutfits = useMemo(() => {
    let result = [...outfits];
    if (filters.occasion && filters.occasion !== 'all') {
      result = result.filter(o => o.occasion?.toLowerCase() === filters.occasion.toLowerCase());
    }
    if (filters.season && filters.season !== 'all') {
      result = result.filter(o => o.season?.toLowerCase() === filters.season.toLowerCase());
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      result = result.filter(o => o.name?.toLowerCase().includes(q) || o.explanation?.toLowerCase().includes(q));
    }
    return result;
  }, [outfits, filters]);

  return {
    outfits,
    filteredOutfits,
    loading,
    error,
    filters,
    setFilters,
    reload: loadOutfits,
    saveOutfit,
    updateOutfit,
    deleteOutfit,
    logWear,
  };
}

export default useOutfits;
