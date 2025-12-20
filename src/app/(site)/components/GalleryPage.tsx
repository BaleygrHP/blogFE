import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllGalleryImages, GalleryImage } from '../../../lib/galleryData';
import { getGalleryCategoryNames } from '../../../lib/categoryData';

const IMAGES_PER_PAGE = 12;

export function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  const allImages = getAllGalleryImages();
  const categories = getGalleryCategoryNames();
  
  // Filter by category
  const filteredImages = selectedCategory === 'All' 
    ? allImages 
    : allImages.filter(img => img.category === selectedCategory);
  
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

  // Navigate images in lightbox
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Photographs and moments. A visual diary of places visited and scenes remembered.
        </p>
      </header>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2 transition-all ${
                selectedCategory === category
                  ? 'bg-foreground text-background'
                  : 'border border-border hover:border-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 meta text-muted-foreground">
        {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {currentImages.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="group cursor-pointer"
          >
            {/* Image */}
            <div className="overflow-hidden mb-3 bg-secondary">
              <img
                src={image.url}
                alt={image.caption || 'Gallery image'}
                className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Caption */}
            {image.caption && (
              <h3 className="text-lg mb-1 group-hover:opacity-70 transition-opacity">
                {image.caption}
              </h3>
            )}

            {/* Meta */}
            <div className="meta text-muted-foreground">
              <span className="inline-block px-2 py-0.5 border border-border mr-2 text-xs">
                {image.category}
              </span>
              {image.location && <span>{image.location} · </span>}
              {image.date}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border hover:border-foreground disabled:opacity-30 disabled:hover:border-border transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  currentPage === page
                    ? 'bg-foreground text-background'
                    : 'border border-border hover:border-foreground'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border hover:border-foreground disabled:opacity-30 disabled:hover:border-border transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full">
            {/* Image */}
            <div className="mb-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || 'Gallery image'}
                className="w-full max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Info */}
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              {selectedImage.caption && (
                <h2 className="text-2xl mb-2">{selectedImage.caption}</h2>
              )}
              <div className="meta text-muted-foreground">
                <span className="inline-block px-2 py-1 border border-border mr-2">
                  {selectedImage.category}
                </span>
                {selectedImage.location && <span>{selectedImage.location} · </span>}
                {selectedImage.date}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}