import { useState } from 'react';
import { Edit3, LogOut, Eye, EyeOff, Trash2 } from 'lucide-react';
import { allArticles } from '../../lib/mockData';

interface PostsListProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function PostsList({ onNavigate, onLogout }: PostsListProps) {
  const [filterSection, setFilterSection] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const sections = ['All', 'Editorial', 'Notes', 'Diary'];
  const statuses = ['All', 'published', 'draft'];

  // Filter posts
  const filteredPosts = allArticles.filter(post => {
    const matchesSection = filterSection === 'All' || post.section === filterSection;
    const matchesStatus = filterStatus === 'All' || post.status === filterStatus;
    return matchesSection && matchesStatus;
  });

  // Sort by date (most recent first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
            <span className="meta">Posts</span>
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
          <h1 className="text-3xl">All Posts</h1>
          <button
            onClick={() => onNavigate('new-post')}
            className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            New Post
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-6">
          {/* Section Filter */}
          <div>
            <label className="section-label text-muted-foreground mb-3 block text-xs">
              Section
            </label>
            <div className="flex gap-2">
              {sections.map(section => (
                <button
                  key={section}
                  onClick={() => setFilterSection(section)}
                  className={`px-4 py-2 border text-sm transition-colors ${
                    filterSection === section
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="section-label text-muted-foreground mb-3 block text-xs">
              Status
            </label>
            <div className="flex gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 border text-sm transition-colors capitalize ${
                    filterStatus === status
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 meta text-muted-foreground">
          {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'}
        </div>

        {/* Posts Table */}
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 section-label text-xs">Title</th>
                <th className="text-left px-6 py-4 section-label text-xs">Section</th>
                <th className="text-left px-6 py-4 section-label text-xs">Status</th>
                <th className="text-left px-6 py-4 section-label text-xs">Date</th>
                <th className="text-right px-6 py-4 section-label text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map(post => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium mb-1">{post.title}</div>
                    {post.featured && (
                      <span className="section-label text-xs text-muted-foreground">
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 meta">{post.section}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      post.status === 'published' ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {post.status === 'published' ? (
                        <><Eye className="w-3 h-3" /> Published</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Draft</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 meta text-muted-foreground">{post.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate(`edit-post-${post.id}`)}
                        className="p-2 hover:bg-accent transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedPosts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No posts found matching these filters.
          </div>
        )}
      </div>
    </div>
  );
}
