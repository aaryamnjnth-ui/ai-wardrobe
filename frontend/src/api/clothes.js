import apiClient, { API_BASE_URL } from './axios';
import { INITIAL_CLOTHES } from './mockData';

// Local storage key for offline or fallback persistence
const STORAGE_KEY = 'ai_wardrobe_items';

function getStoredClothes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading clothes from localStorage', e);
  }
  return INITIAL_CLOTHES;
}

function saveStoredClothes(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error writing clothes to localStorage', e);
  }
}

// Ensure initial mock is saved
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  saveStoredClothes(INITIAL_CLOTHES);
}

/**
 * Format image URL properly if it's a relative path from the backend
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // If backend returns /uploads/filename or uploads/filename
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export const clothesApi = {
  /**
   * Fetch all clothing items with optional filters
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/api/clothes', { params });
      // If backend returns { success: true, data: [...] } or direct array [...]
      const items = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.clothes || []);
      if (items.length > 0) {
        saveStoredClothes(items);
        return items;
      }
      return getStoredClothes();
    } catch (error) {
      console.warn('Backend unavailable, using client storage for clothes:', error.message);
      let items = getStoredClothes();
      // Apply client-side filters
      if (params.category && params.category !== 'all') {
        items = items.filter(i => i.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params.color && params.color !== 'all') {
        items = items.filter(i => i.color.toLowerCase().includes(params.color.toLowerCase()));
      }
      if (params.brand && params.brand !== 'all') {
        items = items.filter(i => i.brand.toLowerCase().includes(params.brand.toLowerCase()));
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.brand?.toLowerCase().includes(q) ||
          i.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
      if (params.favorite === true || params.favorite === 'true') {
        items = items.filter(i => i.favorite);
      }
      return items;
    }
  },

  /**
   * Fetch a single clothing item
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/clothes/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      const items = getStoredClothes();
      const found = items.find(i => i.id === id);
      if (found) return found;
      throw new Error(`Clothing item ${id} not found`);
    }
  },

  /**
   * Create new clothing item (handles FormData for file uploads or JSON)
   */
  async create(data) {
    try {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response = await apiClient.post('/api/clothes', data, { headers });
      const created = response.data?.data || response.data;
      
      const stored = getStoredClothes();
      saveStoredClothes([created, ...stored]);
      return created;
    } catch (error) {
      console.warn('Backend create failed, saving locally:', error.message);
      // Simulate creation locally
      let newItem;
      if (data instanceof FormData) {
        newItem = {
          id: 'item_' + Date.now(),
          name: data.get('name') || 'Untitled Piece',
          category: data.get('category') || 'tops',
          color: data.get('color') || 'Neutral',
          brand: data.get('brand') || 'Custom Brand',
          size: data.get('size') || 'M',
          tags: data.get('tags') ? (typeof data.get('tags') === 'string' ? JSON.parse(data.get('tags')) : data.get('tags')) : ['modern'],
          image_path: data.get('previewUrl') || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
          times_worn: 0,
          last_worn: null,
          favorite: false,
          created_at: new Date().toISOString(),
        };
      } else {
        newItem = {
          id: 'item_' + Date.now(),
          times_worn: 0,
          last_worn: null,
          favorite: false,
          created_at: new Date().toISOString(),
          ...data,
        };
      }
      const stored = getStoredClothes();
      saveStoredClothes([newItem, ...stored]);
      return newItem;
    }
  },

  /**
   * Update existing clothing item
   */
  async update(id, updates) {
    try {
      const isFormData = updates instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response = await apiClient.put(`/api/clothes/${id}`, updates, { headers });
      const updated = response.data?.data || response.data;

      const stored = getStoredClothes().map(item => item.id === id ? { ...item, ...updated } : item);
      saveStoredClothes(stored);
      return updated;
    } catch (error) {
      console.warn('Backend update failed, updating locally:', error.message);
      const updateObj = updates instanceof FormData ? Object.fromEntries(updates.entries()) : updates;
      if (typeof updateObj.tags === 'string' && updateObj.tags.startsWith('[')) {
        try { updateObj.tags = JSON.parse(updateObj.tags); } catch(e) {}
      }
      const stored = getStoredClothes().map(item => item.id === id ? { ...item, ...updateObj } : item);
      saveStoredClothes(stored);
      return stored.find(i => i.id === id);
    }
  },

  /**
   * Delete clothing item
   */
  async delete(id) {
    try {
      await apiClient.delete(`/api/clothes/${id}`);
    } catch (error) {
      console.warn('Backend delete failed, removing locally:', error.message);
    }
    const stored = getStoredClothes().filter(item => item.id !== id);
    saveStoredClothes(stored);
    return { success: true, id };
  },

  /**
   * Toggle favorite flag
   */
  async toggleFavorite(id) {
    try {
      const response = await apiClient.patch(`/api/clothes/${id}/favorite`);
      const updated = response.data?.data || response.data;
      const stored = getStoredClothes().map(item => item.id === id ? { ...item, favorite: !item.favorite } : item);
      saveStoredClothes(stored);
      return updated;
    } catch (error) {
      const stored = getStoredClothes().map(item => item.id === id ? { ...item, favorite: !item.favorite } : item);
      saveStoredClothes(stored);
      return stored.find(i => i.id === id);
    }
  },

  /**
   * Increment times worn and update last_worn timestamp
   */
  async logWear(id) {
    const nowIso = new Date().toISOString();
    try {
      const response = await apiClient.post(`/api/clothes/${id}/wear`);
      return response.data?.data || response.data;
    } catch (error) {
      const stored = getStoredClothes().map(item => {
        if (item.id === id) {
          return {
            ...item,
            times_worn: (item.times_worn || 0) + 1,
            last_worn: nowIso,
          };
        }
        return item;
      });
      saveStoredClothes(stored);
      return stored.find(i => i.id === id);
    }
  }
};

export default clothesApi;
