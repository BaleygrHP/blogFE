import { FileText, FilePlus, LogOut, Edit3 } from 'lucide-react';
import { getAllPublishedArticles, getAllDrafts } from '../../lib/mockData';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const published = getAllPublishedArticles();
  const drafts = getAllDrafts();
  const recentDrafts = drafts.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5" />
            <span className="font-medium">Admin</span>
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
        {/* Page Title */}
        <h1 className="text-3xl mb-12">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Published Count */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label text-muted-foreground">Published</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-medium">{published.length}</div>
          </div>

          {/* Drafts Count */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label text-muted-foreground">Drafts</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-medium">{drafts.length}</div>
          </div>

          {/* Quick Action */}
          <button
            onClick={() => onNavigate('new-post')}
            className="bg-foreground text-background border border-foreground p-6 hover:opacity-90 transition-opacity text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">New Post</span>
              <FilePlus className="w-5 h-5" />
            </div>
            <div className="text-lg">Create new article</div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl mb-6 pb-3 border-b border-border">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('posts')}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              View All Posts
            </button>
            <button
              onClick={() => onNavigate('new-post')}
              className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              New Post
            </button>
          </div>
        </div>

        {/* Recent Drafts */}
        {recentDrafts.length > 0 && (
          <div>
            <h2 className="text-xl mb-6 pb-3 border-b border-border">Recent Drafts</h2>
            <div className="space-y-4">
              {recentDrafts.map(draft => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-4 bg-card border border-border hover:border-foreground transition-colors cursor-pointer"
                  onClick={() => onNavigate(`edit-post-${draft.id}`)}
                >
                  <div>
                    <div className="section-label text-muted-foreground text-xs mb-1">
                      {draft.section}
                    </div>
                    <div className="font-medium">{draft.title}</div>
                  </div>
                  <div className="meta text-muted-foreground">
                    {draft.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
