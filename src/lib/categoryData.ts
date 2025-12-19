// Category management for both Gallery and Blog

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'gallery' | 'blog';
}

// Gallery Categories
export const galleryCategories: Category[] = [
  { id: 1, name: 'Travel', slug: 'travel', description: 'Travel and destinations', type: 'gallery' },
  { id: 2, name: 'Nature', slug: 'nature', description: 'Natural landscapes and wildlife', type: 'gallery' },
  { id: 3, name: 'Urban', slug: 'urban', description: 'City life and architecture', type: 'gallery' },
  { id: 4, name: 'People', slug: 'people', description: 'Portraits and people', type: 'gallery' },
  { id: 5, name: 'Events', slug: 'events', description: 'Special occasions and gatherings', type: 'gallery' },
  { id: 6, name: 'Miscellaneous', slug: 'miscellaneous', description: 'Everything else', type: 'gallery' }
];

// Blog Categories (Sections)
export const blogCategories: Category[] = [
  { id: 101, name: 'Editorial', slug: 'editorial', description: 'Long-form analysis and commentary', type: 'blog' },
  { id: 102, name: 'Notes', slug: 'notes', description: 'Quick thoughts and observations', type: 'blog' },
  { id: 103, name: 'Diary', slug: 'diary', description: 'Personal reflections and daily entries', type: 'blog' }
];

// Get all categories by type
export function getCategoriesByType(type: 'gallery' | 'blog') {
  if (type === 'gallery') {
    return galleryCategories;
  }
  return blogCategories;
}

// Get category by id
export function getCategoryById(id: number) {
  return [...galleryCategories, ...blogCategories].find(cat => cat.id === id);
}

// Get category by slug
export function getCategoryBySlug(slug: string, type: 'gallery' | 'blog') {
  const categories = type === 'gallery' ? galleryCategories : blogCategories;
  return categories.find(cat => cat.slug === slug);
}

// Get all gallery category names (for filters)
export function getGalleryCategoryNames() {
  return ['All', ...galleryCategories.map(cat => cat.name)];
}

// Get all blog category names
export function getBlogCategoryNames() {
  return blogCategories.map(cat => cat.name);
}
