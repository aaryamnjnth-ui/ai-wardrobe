import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Sparkles, Tag } from 'lucide-react';
import Button from '../UI/Button';

const CATEGORIES = [
  { id: 'tops', label: 'Tops (Shirts, Sweaters)' },
  { id: 'bottoms', label: 'Bottoms (Trousers, Denim)' },
  { id: 'outerwear', label: 'Outerwear (Blazers, Coats)' },
  { id: 'shoes', label: 'Footwear (Boots, Sneakers)' },
  { id: 'accessories', label: 'Accessories & Bags' },
];

export const ClothingForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'tops',
    color: initialData?.color || '',
    brand: initialData?.brand || '',
    size: initialData?.size || '',
    tags: initialData?.tags || ['casual', 'staple'],
    imageUrl: initialData?.image_path || '',
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.image_path || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);

      // Construct payload: if file selected, send FormData; else structured JSON
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('category', formData.category);
      submitData.append('color', formData.color.trim());
      submitData.append('brand', formData.brand.trim());
      submitData.append('size', formData.size.trim());
      submitData.append('tags', JSON.stringify(formData.tags));

      if (selectedFile) {
        submitData.append('image', selectedFile);
        submitData.append('previewUrl', previewUrl);
      } else if (previewUrl) {
        submitData.append('image_path', previewUrl);
        submitData.append('previewUrl', previewUrl);
      }

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Dropzone & Preview */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Garment Photo
        </label>
        
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-4 transition-all text-center cursor-pointer
            ${isDragActive ? 'border-brand-purple bg-purple-500/10' : 'border-white/10 hover:border-purple-500/40 bg-dark-900/50'}
          `}
        >
          <input {...getInputProps()} />

          {previewUrl ? (
            <div className="relative group w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-dark-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                <Upload className="w-6 h-6 mb-2 text-pink-400" />
                <p className="text-sm font-semibold">Drop a new image to replace</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 text-purple-400 border border-white/10">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {isDragActive ? 'Drop garment image here' : 'Drag & drop image or browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                High resolution fashion photos look best
              </p>
            </div>
          )}
        </div>

        {/* Or enter Image URL manually */}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="url"
            placeholder="Or paste an image web link (https://...)"
            value={formData.imageUrl}
            onChange={(e) => {
              setFormData({ ...formData, imageUrl: e.target.value });
              if (e.target.value) setPreviewUrl(e.target.value);
            }}
            className="w-full text-xs bg-dark-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-purple"
          />
        </div>
      </div>

      {/* Item Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Garment Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Tailored Pleated Wool Trousers"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Category & Brand row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-dark-800 text-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Brand / Designer
          </label>
          <input
            type="text"
            placeholder="e.g. Acne Studios, The Row"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Color & Size row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Color & Hue
          </label>
          <input
            type="text"
            placeholder="e.g. Charcoal Black, Oatmeal"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Size
          </label>
          <input
            type="text"
            placeholder="e.g. M, 32, 42 IT, One Size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Style Tags (Press Enter)
        </label>
        <div className="flex flex-wrap gap-1.5 p-2 bg-dark-900/80 border border-white/10 rounded-xl min-h-[46px] items-center">
          {formData.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={formData.tags.length === 0 ? "Type a tag and press Enter..." : "Add tag..."}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none min-w-[100px] px-2 py-1"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={Sparkles}
        >
          {initialData ? 'Update Piece' : 'Save Garment'}
        </Button>
      </div>
    </form>
  );
};

export default ClothingForm;
