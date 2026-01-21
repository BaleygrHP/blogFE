"use client";

import { useState } from 'react';
import { Edit3, LogOut, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategoryManagerProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function CategoryManager({ onNavigate, onLogout }: CategoryManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push('/'));
  const [activeTab, setActiveTab] = useState<'gallery' | 'blog'>('gallery');
  const [galleryCats, setGalleryCats] = useState(galleryCategories);
  const [blogCats, setBlogCats] = useState(blogCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const currentCategories = activeTab === 'gallery' ? galleryCats : blogCats;
  const setCurrentCategories = activeTab === 'gallery' ? setGalleryCats : setBlogCats;

  const handleAdd = () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const newCategory: Category = {
      id: Date.now(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      type: activeTab
    };

    setCurrentCategories([...currentCategories, newCategory]);
    setFormData({ name: '', description: '' });
    setIsAdding(false);
    alert('Category added! (Demo mode - changes are not persisted)');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleSaveEdit = () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setCurrentCategories(
      currentCategories.map(cat =>
        cat.id === editingId
          ? {
              ...cat,
              name: formData.name,
              slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
              description: formData.description
            }
          : cat
      )
    );

    setEditingId(null);
    setFormData({ name: '', description: '' });
    alert('Category updated! (Demo mode - changes are not persisted)');
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this category? This may affect existing items.')) {
      setCurrentCategories(currentCategories.filter(cat => cat.id !== id));
      alert('Category deleted! (Demo mode - changes are not persisted)');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

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
            <span className="meta">Categories</span>
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
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl mb-4">Category Manager</h1>
          <p className="text-muted-foreground">
            Organize your content with custom categories for gallery images and blog posts.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-border">
          <button
            onClick={() => {
              setActiveTab('gallery');
              handleCancel();
            }}
            className={`px-6 py-3 transition-all ${
              activeTab === 'gallery'
                ? 'border-b-2 border-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Gallery Categories ({galleryCats.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('blog');
              handleCancel();
            }}
            className={`px-6 py-3 transition-all ${
              activeTab === 'blog'
                ? 'border-b-2 border-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Blog Sections ({blogCats.length})
          </button>
        </div>

        {/* Add Button */}
        {!isAdding && !editingId && (
          <div className="mb-8">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add {activeTab === 'gallery' ? 'Category' : 'Section'}
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="mb-8 bg-card border border-border p-6">
            <h2 className="text-xl mb-6">
              {isAdding ? 'Add New' : 'Edit'} {activeTab === 'gallery' ? 'Category' : 'Section'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder={activeTab === 'gallery' ? 'e.g. Architecture' : 'e.g. Reviews'}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>

              {/* Slug Preview */}
              <div>
                <label className="block mb-2 text-sm font-medium">Slug (auto-generated)</label>
                <div className="px-4 py-3 bg-secondary border border-border meta text-muted-foreground">
                  {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'category-slug'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={isAdding ? handleAdd : handleSaveEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  <Save className="w-5 h-5" />
                  {isAdding ? 'Add' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-border hover:border-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {currentCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card border border-border p-6 hover:border-muted-foreground transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{category.name}</h3>
                    <span className="meta text-muted-foreground text-xs px-2 py-1 border border-border">
                      {category.slug}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-muted-foreground">{category.description}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-secondary transition-colors"
                    disabled={isAdding || editingId !== null}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    disabled={isAdding || editingId !== null}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {currentCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No categories yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add First Category
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-secondary border border-border p-6">
          <h3 className="font-medium mb-2">About Categories</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {activeTab === 'gallery' 
              ? 'Gallery categories help organize your photos by theme. Each image can belong to one category.'
              : 'Blog sections organize your articles into different types of content. Each post belongs to one section.'}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Deleting a category may affect existing {activeTab === 'gallery' ? 'images' : 'posts'}. 
            Make sure to reassign items before deletion.
          </p>
        </div>
      </div>
    </div>
  );
}
