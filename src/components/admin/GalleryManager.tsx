import { useState } from 'react';
import { Edit3, LogOut, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryImages, GalleryImage } from '../../lib/galleryData';
import { getGalleryCategoryNames } from '../../lib/categoryData';

const IMAGES_PER_PAGE = 12;

interface GalleryManagerProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function GalleryManager({ onNavigate, onLogout }: GalleryManagerProps) {
  const [images, setImages] = useState(galleryImages);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [newImage, setNewImage] = useState<Partial<GalleryImage>>({
    url: '',
    caption: '',
    location: '',
    category: 'Miscellaneous',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  });

  // Filter by category
  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);
  
  // Pagination
  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = filteredImages.slice(startIndex, endIndex);
  
  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleAddImage = () => {
    if (!newImage.url) {
      alert('Please enter an image URL');
      return;
    }

    const image: GalleryImage = {
      id: Date.now(),
      url: newImage.url!,
      caption: newImage.caption,
      location: newImage.location,
      category: newImage.category!,
      date: newImage.date!
    };

    setImages([image, ...images]);
    setIsAdding(false);
    setNewImage({
      url: '',
      caption: '',
      location: '',
      category: 'Miscellaneous',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });

    alert('Image added! (Demo mode - changes are not persisted)');
  };

  const handleDeleteImage = (id: number) => {
    if (confirm('Delete this image?')) {
      setImages(images.filter(img => img.id !== id));
      alert('Image deleted! (Demo mode - changes are not persisted)');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Admin</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="meta">Gallery</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Gallery Manager</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Image
          </button>
        </div>

        {/* Add Image Form */}
        {isAdding && (
          <div className="mb-8 bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Add New Image</h2>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image URL */}
              <div>
                <label className="block mb-2 text-sm font-medium">Image URL *</label>
                <input
                  type="text"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block mb-2 text-sm font-medium">Caption</label>
                <input
                  type="text"
                  value={newImage.caption}
                  onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Mountain Morning"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block mb-2 text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={newImage.location}
                  onChange={(e) => setNewImage({ ...newImage, location: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Swiss Alps"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium">Category</label>
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                >
                  {getGalleryCategoryNames().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {newImage.url && (
                <div>
                  <label className="block mb-2 text-sm font-medium">Preview</label>
                  <img
                    src={newImage.url}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover border border-border"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddImage}
                  className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Add Image
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 border border-border hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
          >
            <option value="All">All</option>
            {getGalleryCategoryNames().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Images Count */}
        <div className="mb-6 meta text-muted-foreground">
          {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentImages.map((image) => (
            <div key={image.id} className="bg-card border border-border overflow-hidden group">
              {/* Image */}
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-48 object-cover"
                />
                
                {/* Delete Button (hover) */}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                {image.caption && (
                  <h3 className="font-medium mb-1">{image.caption}</h3>
                )}
                <div className="meta text-muted-foreground text-sm">
                  {image.location && <div>{image.location}</div>}
                  <div>{image.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="mx-4 meta text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}