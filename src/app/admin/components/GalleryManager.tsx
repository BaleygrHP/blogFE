"use client";

import { useEffect, useState } from 'react';
import { Edit3, LogOut, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAdminMedia, uploadMedia, updateMedia, deleteMedia, getMediaCategories, type MediaUploadDto, type MediaUpdateDto } from '@/lib/adminApiClient';
import type { PublicMediaDto } from '@/lib/types';

const IMAGES_PER_PAGE = 12;

interface GalleryManagerProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function GalleryManager({ onNavigate, onLogout }: GalleryManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push('/'));
  const [categories, setCategories] = useState<string[]>([]); // Add state for categories
  const [images, setImages] = useState<PublicMediaDto[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for API
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [newImage, setNewImage] = useState<Partial<MediaUploadDto>>({
    url: '',
    kind: 'IMAGE',
    caption: '',
    location: '',
    title: '',
  });

  const [editData, setEditData] = useState<MediaUpdateDto>({});

  // Fetch images when page changes
  useEffect(() => {
    async function loadImages() {
      try {
        setLoading(true);
        const res = await getAdminMedia({
          kind: "IMAGE",
          page: currentPage,
          size: IMAGES_PER_PAGE,
        });
        
        setImages(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch (error) {
        console.error("Failed to load images:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [currentPage]);

  const handleAddImage = async () => {
    if (!newImage.url) {
      alert('Please enter an image URL');
      return;
    }

    try {
      const mediaData: MediaUploadDto = {
        url: newImage.url,
        kind: 'IMAGE',
        title: newImage.title,
        caption: newImage.caption,
        location: newImage.location,
      };

      await uploadMedia(mediaData);
      
      // Refresh images list
      const res = await getAdminMedia({
        kind: "IMAGE",
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);

      setIsAdding(false);
      setNewImage({
        url: '',
        kind: 'IMAGE',
        caption: '',
        location: '',
        title: '',
      });

      alert('Image added successfully!');
    } catch (error) {
      console.error("Failed to add image:", error);
      alert('Failed to add image. Please try again.');
    }
  };

  const handleDeleteImage = async (id: string, caption?: string | null) => {
    if (!confirm(`Delete "${caption || 'this image'}"?`)) {
      return;
    }

    try {
      await deleteMedia(id);
      
      // Refresh images list
      const res = await getAdminMedia({
        kind: "IMAGE",
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);

      alert('Image deleted successfully!');
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleEditImage = (image: PublicMediaDto) => {
    setEditingId(image.id);
    setEditData({
      title: image.title || '',
      alt: image.alt || '',
      caption: image.caption || '',
      location: image.location || '',
      category: image.category || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateMedia(editingId, editData);
      
      // Refresh images list
      const res = await getAdminMedia({
        kind: "IMAGE",
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);

      setEditingId(null);
      setEditData({});
      alert('Image updated successfully!');
    } catch (error) {
      console.error("Failed to update image:", error);
      alert('Failed to update image. Please try again.');
    }
  };

  useEffect(() => {
    getMediaCategories().then(setCategories).catch(err => console.error("Failed to load categories", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => nav('dashboard')}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Admin</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="meta">Gallery</span>
          </div>
          <button
            onClick={logout}
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
                  value={newImage.location || ''}
                  onChange={(e) => setNewImage({ ...newImage, location: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Swiss Alps"
                />
              </div>

              {/* Category */}
              <div>
                 <label className="block mb-2 text-sm font-medium">Category</label>
                 <div className="flex gap-2">
                   <select 
                     className="w-full px-4 py-3 border border-input bg-background"
                     value={newImage.category || ''}
                     onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                   >
                     <option value="">Select category...</option>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select> 
                 </div>
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

        {/* Images Count */}
        <div className="mb-6 meta text-muted-foreground">
          {loading ? "Loading..." : `${totalElements} ${totalElements === 1 ? 'image' : 'images'}`}
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              No images found.
            </div>
          ) : (
            images.map((image) => (
            <div key={image.id} className="bg-card border border-border overflow-hidden group">
              {/* Image */}
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-48 object-cover"
                />
                
                {/* Action Buttons (hover) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditImage(image)}
                    className="w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info / Edit Form */}
              {editingId === image.id ? (
                <div className="p-4 space-y-3 bg-muted">
                  <div>
                    <label className="block mb-1 text-xs font-medium">Caption</label>
                    <input
                      type="text"
                      value={editData.caption || ''}
                      onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium">Location</label>
                    <input
                      type="text"
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium">Category</label>
                    <select
                      value={editData.category || ''}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background"
                    >
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 text-sm bg-foreground text-background hover:opacity-90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditData({}); }}
                      className="flex-1 px-4 py-2 text-sm border border-border hover:border-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {image.caption && (
                    <h3 className="font-medium mb-1">{image.caption}</h3>
                  )}
                  <div className="meta text-muted-foreground text-sm">
                    {image.location && <div>{image.location}</div>}
                    {image.category && <div className="text-xs">Category: {image.category}</div>}
                    <div>{image.takenAt || image.createdDate || ""}</div>
                  </div>
                </div>
              )}
            </div>
              ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || loading}
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="mx-4 meta text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
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