"use client";

import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { GalleryImage, PublicMediaDto } from '@/lib/types';
import { getPublicGallery } from "@/lib/apiClient";

const IMAGES_PER_PAGE = 12;

function toGalleryImage(m: PublicMediaDto): GalleryImage {
  return {
    id: m.id,
    url: m.url,
    mimeType: (m.mimeType || '').toLowerCase(),
    downloadUrl: `/api/public/media/${m.id}/download`,
    caption: m.caption ?? m.title ?? m.alt ?? undefined,
    location: m.location ?? undefined,
    date: m.takenAt ?? m.createdDate ?? m.createdAt ?? "",
    category: m.category?.trim() || "Uncategorized",
  };
}

function isImageMedia(media: GalleryImage): boolean {
  return (media.mimeType || '').startsWith('image/');
}

function isVideoMedia(media: GalleryImage): boolean {
  return (media.mimeType || '').startsWith('video/');
}

function isPdfMedia(media: GalleryImage): boolean {
  return (media.mimeType || '') === 'application/pdf';
}

export function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1); // UI 1-based

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(images.map((i) => i.category).filter(Boolean)));
    return ['All', ...unique];
  }, [images]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getPublicGallery(currentPage - 1, IMAGES_PER_PAGE);
        if (cancelled) return;

        setImages(data.content.map(toGalleryImage));
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load gallery";
        setError(msg);
        setImages([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const filteredImages = useMemo(() => {
    return selectedCategory === 'All'
      ? images
      : images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex < 0) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Photographs and moments. A visual diary of places visited and scenes remembered.
        </p>
      </header>

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

      {loading && <div className="mb-6 meta text-muted-foreground">Loading...</div>}
      {error && <div className="mb-6 meta text-red-500">{error}</div>}

      <div className="mb-6 meta text-muted-foreground">
        {totalElements} {totalElements === 1 ? 'item' : 'items'}
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredImages.map((image) => (
          <div key={image.id} onClick={() => setSelectedImage(image)} className="group cursor-pointer">
            <div className="overflow-hidden mb-3 bg-secondary">
              {isImageMedia(image) ? (
                <Image
                  src={image.url}
                  alt={image.caption || 'Gallery image'}
                  width={1920}
                  height={1080}
                  className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              ) : isVideoMedia(image) ? (
                <video src={image.url} className="w-full h-64 object-cover" controls preload="metadata" />
              ) : isPdfMedia(image) ? (
                <iframe src={image.url} title={image.caption || 'PDF preview'} className="w-full h-64 bg-white" />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-sm text-muted-foreground">
                  File preview unavailable
                </div>
              )}
            </div>

            {image.caption && (
              <h3 className="text-lg mb-1 group-hover:opacity-70 transition-opacity">
                {image.caption}
              </h3>
            )}

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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border hover:border-foreground disabled:opacity-30 disabled:hover:border-border transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

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
            <div className="mb-6">
              {isImageMedia(selectedImage) ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Gallery image'}
                  width={1920}
                  height={1080}
                  className="w-full max-h-[70vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : isVideoMedia(selectedImage) ? (
                <video
                  src={selectedImage.url}
                  className="w-full max-h-[70vh]"
                  controls
                  autoPlay
                  onClick={(e) => e.stopPropagation()}
                />
              ) : isPdfMedia(selectedImage) ? (
                <iframe
                  src={selectedImage.url}
                  className="w-full h-[70vh] bg-white"
                  title={selectedImage.caption || 'PDF preview'}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="w-full h-[40vh] flex flex-col items-center justify-center gap-4 border border-border">
                  <div className="text-muted-foreground">Preview unavailable</div>
                  {selectedImage.downloadUrl && (
                    <a
                      href={selectedImage.downloadUrl}
                      className="px-4 py-2 border border-border hover:border-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Download file
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              {selectedImage.caption && <h2 className="text-2xl mb-2">{selectedImage.caption}</h2>}
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
