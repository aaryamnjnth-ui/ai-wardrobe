import React, { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, Shirt, AlertCircle } from 'lucide-react';
import FilterBar from '../components/Wardrobe/FilterBar';
import ClothingCard from '../components/Wardrobe/ClothingCard';
import ClothingForm from '../components/Wardrobe/ClothingForm';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useWardrobe } from '../hooks/useWardrobe';

export const Wardrobe = () => {
  const [searchParams] = useSearchParams();
  const initialFavorite = searchParams.get('favorite') === 'true';

  const {
    filteredClothes,
    loading,
    filters,
    setFilters,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    logWear,
    metadata,
  } = useWardrobe({ favorite: initialFavorite });

  const [viewMode, setViewMode] = useState('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEditSubmit = async (formData) => {
    if (!editingItem) return;
    await updateItem(editingItem.id, formData);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <span>Wardrobe Collection</span>
            <span className="text-sm font-normal text-slate-400">
              ({filteredClothes.length} {filteredClothes.length === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore, organize, and curate your digital clothing archive
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={Plus}
        >
          Add New Piece
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-fashion">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          metadata={metadata}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Garments List / Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading your garments..." />
        </div>
      ) : filteredClothes.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6'
              : 'space-y-3'
          }
        >
          {filteredClothes.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onEdit={(itemToEdit) => setEditingItem(itemToEdit)}
              onDelete={deleteItem}
              onToggleFavorite={toggleFavorite}
              onLogWear={logWear}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-dark-700/50 border border-white/[0.08] rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No clothing items match your criteria
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Try adjusting your search query, clear active filters, or catalog a new piece into your collection.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ category: 'all', brand: 'all', color: 'all', favorite: false, search: '', sortBy: 'newest' })}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={Plus}
            >
              Add New Piece
            </Button>
          </div>
        </div>
      )}

      {/* Add Garment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Clothing Piece"
        subtitle="Catalog garment specifications, category, brand, and imagery"
      >
        <ClothingForm
          onSubmit={async (formData) => {
            await addItem(formData);
            setIsAddModalOpen(false);
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Garment Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Garment Details"
        subtitle={`Updating information for ${editingItem?.name || 'garment'}`}
      >
        {editingItem && (
          <ClothingForm
            initialData={editingItem}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Wardrobe;
