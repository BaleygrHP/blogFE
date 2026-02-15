"use client";

import { useEffect, useState } from 'react';
import { Edit3, LogOut, Plus, Edit2, Save, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getAdminSections, 
  createSection, 
  updateSection, 
  toggleSection,
  type SectionDto
} from '@/lib/adminApiClient';

interface CategoryManagerProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function CategoryManager({ onNavigate, onLogout }: CategoryManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push('/'));

  const [sections, setSections] = useState<SectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    try {
      setLoading(true);
      const data = await getAdminSections();
      setSections(data);
    } catch (error) {
      console.error("Failed to load sections:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a section name');
      return;
    }

    try {
      await createSection({
        name: formData.name,
        description: formData.description
      });
      await loadSections();
      setFormData({ name: '', description: '' });
      setIsAdding(false);
      alert('Section added successfully!');
    } catch (error) {
      console.error("Failed to add section:", error);
      alert('Failed to add section');
    }
  };

  const handleEdit = (section: SectionDto) => {
    setEditingId(section.id);
    setFormData({
      name: section.label, // mapped to name in our update
      description: '' // Description not currently in SectionDto list view, might be missing
    });
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return;

    try {
      await updateSection(editingId, {
        name: formData.name,
        description: formData.description
      });
      await loadSections();
      setEditingId(null);
      setFormData({ name: '', description: '' });
      alert('Section updated successfully!');
    } catch (error) {
      console.error("Failed to update section:", error);
      alert('Failed to update section');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSection(id);
      await loadSections(); // Reload to get fresh state
    } catch (error) {
      console.error("Failed to toggle section:", error);
      alert('Failed to toggle section status');
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
            <span className="meta">Sections</span>
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
          <h1 className="text-3xl mb-4">Section Manager</h1>
          <p className="text-muted-foreground">
            Manage blog sections. (Gallery Category management is currently simplified to tags in the Gallery Manager).
          </p>
        </div>

        {/* Add Button */}
        {!isAdding && !editingId && (
          <div className="mb-8">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="mb-8 bg-card border border-border p-6">
            <h2 className="text-xl mb-6">
              {isAdding ? 'Add New' : 'Edit'} Section
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
                  placeholder="e.g. Reviews"
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
                  placeholder="Brief description..."
                  rows={3}
                />
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

        {/* Sections List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-8">Loading sections...</div>
          ) : sections.map((section) => (
            <div
              key={section.id}
              className={`bg-card border border-border p-6 transition-colors ${!section.enabled && section.enabled !== undefined ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{section.label}</h3>
                    <span className="meta text-muted-foreground text-xs px-2 py-1 border border-border">
                      {section.key}
                    </span>
                    {section.enabled === false && (
                       <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 hover:bg-secondary transition-colors"
                    disabled={isAdding || editingId !== null}
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggle(section.id)}
                    className={`p-2 transition-colors ${section.enabled === false ? 'hover:bg-green-100 text-green-700' : 'hover:bg-destructive hover:text-destructive-foreground'}`}
                    disabled={isAdding || editingId !== null}
                    title={section.enabled === false ? "Activate" : "Deactivate (Soft Delete)"}
                  >
                    {section.enabled === false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && sections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No sections found</p>
          </div>
        )}
      </div>
    </div>
  );
}
