import { useState } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  section: string;
  status: 'published' | 'draft';
  author: string;
  date: string;
  featured: boolean;
  showOnFrontPage: boolean;
  excerpt: string;
  content: string;
  coverImage?: string;
  slug?: string;
}

interface PostEditorProps {
  post?: Post | null;
  onSave: (post: Post) => void;
  onCancel: () => void;
}

export function PostEditor({ post, onSave, onCancel }: PostEditorProps) {
  const [formData, setFormData] = useState<Post>(
    post || {
      id: Date.now(),
      title: '',
      section: 'Editorial',
      status: 'draft',
      author: 'Editorial Board',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      featured: false,
      showOnFrontPage: true,
      excerpt: '',
      content: '',
      coverImage: '',
      slug: ''
    }
  );

  const handleSave = (status: 'published' | 'draft') => {
    onSave({ ...formData, status });
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 meta hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                className="px-6 py-2 border border-border hover:border-foreground transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                className="flex items-center gap-2 px-6 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                <Eye className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-medium">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 text-2xl border border-input focus:border-foreground focus:outline-none transition-colors bg-card"
                placeholder="Article title..."
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block mb-2 text-sm font-medium">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-card resize-none"
                rows={3}
                placeholder="Brief summary of the article..."
              />
            </div>

            {/* Content - Markdown */}
            <div>
              <label className="block mb-2 text-sm font-medium">Content (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-card font-mono text-sm resize-none"
                rows={20}
                placeholder="Write your article in Markdown...

## Heading 2
### Heading 3

Regular paragraph text.

> Blockquote

- List item
- List item"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supports Markdown formatting. Use ## for headings, &gt; for quotes, - for lists.
              </p>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Section */}
            <div className="bg-card border border-border p-6">
              <label className="block mb-3 font-medium">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
              >
                <option value="Editorial">Editorial</option>
                <option value="Notes">Notes</option>
                <option value="Diary">Diary</option>
              </select>
            </div>

            {/* Author */}
            <div className="bg-card border border-border p-6">
              <label className="block mb-3 font-medium">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                placeholder="Author name"
              />
            </div>

            {/* Toggles */}
            <div className="bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Featured</label>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium">Show on Front Page</label>
                <input
                  type="checkbox"
                  checked={formData.showOnFrontPage}
                  onChange={(e) => setFormData({ ...formData, showOnFrontPage: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-card border border-border p-6">
              <label className="block mb-3 font-medium">Cover Image URL</label>
              <input
                type="text"
                value={formData.coverImage || ''}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                placeholder="https://..."
              />
              {formData.coverImage && (
                <div className="mt-3">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover preview" 
                    className="w-full border border-border"
                  />
                </div>
              )}
            </div>

            {/* Slug */}
            <div className="bg-card border border-border p-6">
              <label className="block mb-3 font-medium">Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background font-mono text-sm"
                placeholder="article-slug"
              />
              <p className="text-sm text-muted-foreground mt-2">
                URL: /article/{formData.slug || 'slug'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}