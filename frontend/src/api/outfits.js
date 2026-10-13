import apiClient from './axios';
import { INITIAL_OUTFITS } from './mockData';

const STORAGE_KEY = 'ai_wardrobe_outfits';

function getStoredOutfits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading outfits from localStorage', e);
  }
  return INITIAL_OUTFITS;
}

function saveStoredOutfits(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error writing outfits to localStorage', e);
  }
}

if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  saveStoredOutfits(INITIAL_OUTFITS);
}

export const outfitsApi = {
  /**
   * Fetch all saved outfits
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/api/outfits', { params });
      const outfits = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.outfits || []);
      if (outfits.length > 0) {
        saveStoredOutfits(outfits);
        return outfits;
      }
      return getStoredOutfits();
    } catch (error) {
      console.warn('Backend outfits unavailable, using client storage:', error.message);
      let outfits = getStoredOutfits();
      if (params.occasion && params.occasion !== 'all') {
        outfits = outfits.filter(o => o.occasion?.toLowerCase() === params.occasion.toLowerCase());
      }
      if (params.season && params.season !== 'all') {
        outfits = outfits.filter(o => o.season?.toLowerCase() === params.season.toLowerCase());
      }
      return outfits;
    }
  },

  /**
   * Fetch single outfit by id
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/outfits/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      const found = getStoredOutfits().find(o => o.id === id);
      if (found) return found;
      throw new Error(`Outfit ${id} not found`);
    }
  },

  /**
   * Save a newly created or AI generated outfit
   */
  async create(data) {
    try {
      const response = await apiClient.post('/api/outfits', data);
      const created = response.data?.data || response.data;
      const stored = getStoredOutfits();
      saveStoredOutfits([created, ...stored]);
      return created;
    } catch (error) {
      console.warn('Backend outfit create failed, saving locally:', error.message);
      const newOutfit = {
        id: 'outfit_' + Date.now(),
        name: data.name || 'Curated Ensemble',
        items: data.items || [],
        occasion: data.occasion || 'casual',
        season: data.season || 'all',
        rating: data.rating || 5,
        explanation: data.explanation || 'Personalized AI curated combination.',
        created_at: new Date().toISOString(),
      };
      const stored = getStoredOutfits();
      saveStoredOutfits([newOutfit, ...stored]);
      return newOutfit;
    }
  },

  /**
   * Update an outfit (e.g. rating or name)
   */
  async update(id, updates) {
    try {
      const response = await apiClient.put(`/api/outfits/${id}`, updates);
      const updated = response.data?.data || response.data;
      const stored = getStoredOutfits().map(o => o.id === id ? { ...o, ...updated } : o);
      saveStoredOutfits(stored);
      return updated;
    } catch (error) {
      const stored = getStoredOutfits().map(o => o.id === id ? { ...o, ...updates } : o);
      saveStoredOutfits(stored);
      return stored.find(o => o.id === id);
    }
  },

  /**
   * Delete an outfit
   */
  async delete(id) {
    try {
      await apiClient.delete(`/api/outfits/${id}`);
    } catch (error) {
      console.warn('Backend outfit delete failed, removing locally:', error.message);
    }
    const stored = getStoredOutfits().filter(o => o.id !== id);
    saveStoredOutfits(stored);
    return { success: true, id };
  },

  /**
   * Record wearing an outfit in style logs
   */
  async logWear(id, details = {}) {
    try {
      const response = await apiClient.post(`/api/outfits/${id}/wear`, details);
      return response.data?.data || response.data;
    } catch (error) {
      return { success: true, loggedAt: new Date().toISOString(), details };
    }
  }
};

export default outfitsApi;
