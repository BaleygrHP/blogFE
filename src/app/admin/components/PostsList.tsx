"use client";

import { useEffect, useState } from 'react';
import { Edit3, LogOut, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAdminPosts, deletePost, getAdminSections, type AdminPostDto } from '@/lib/adminApiClient';
import type { SectionKey } from '@/lib/types';

interface PostsListProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function PostsList({ onNavigate, onLogout }: PostsListProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push('/'));
  
  const [filterSection, setFilterSection] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [posts, setPosts] = useState<AdminPostDto[]>([]);
  const [allPosts, setAllPosts] = useState<AdminPostDto[]>([]); // Store all fetched posts for Client-side filtering if needed
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [sections, setSections] = useState<string[]>(['All', 'EDITORIAL', 'NOTES', 'DIARY']);

  const statuses = ['All', 'published', 'draft'];
  
  // Extract available years from posts
  const availableYears = Array.from(new Set(
    allPosts
      .map(p => p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : null)
      .filter(y => y !== null)
  )).sort().reverse() as string[];

  // Load sections
  useEffect(() => {
    getAdminSections()
      .then(secs => setSections(['All', ...secs.map(s => s.key)]))
      .catch((err) => {
        console.error("Failed to load sections:", err);
        // Fallback
        setSections(['All', 'EDITORIAL', 'NOTES', 'DIARY']);
      });
  }, []);

  // Fetch posts when filters change
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const sectionParam = filterSection === 'All' ? undefined : filterSection.toUpperCase() as SectionKey;
        const statusParam = filterStatus === 'All' ? undefined : filterStatus as "published" | "draft";
        
        const res = await getAdminPosts({
          section: sectionParam,
          status: statusParam,
          page: 0,
          size: 100, // Get all for now, can add pagination later
        });
        
        let fetchedPosts = res.content;
        setAllPosts(fetchedPosts);

        // Apply Year filter client-side
        if (filterYear !== 'All') {
          fetchedPosts = fetchedPosts.filter(p => 
            p.publishedAt && new Date(p.publishedAt).getFullYear().toString() === filterYear
          );
        }
        
        setPosts(fetchedPosts);
        setTotalElements(fetchedPosts.length);
      } catch (error) {
        console.error("Failed to load posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [filterSection, filterStatus, filterYear]);

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePost(postId);
      // Refresh posts list
      setPosts(posts.filter(p => p.id !== postId));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
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
            <span className="meta">Posts</span>
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
          <h1 className="text-3xl">All Posts</h1>
          <button
            onClick={() => nav('posts/new')}
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

          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div>
              <label className="section-label text-muted-foreground mb-3 block text-xs">
                Year
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterYear('All')}
                  className={`px-4 py-2 border text-sm transition-colors ${
                    filterYear === 'All'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  All
                </button>
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setFilterYear(year)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      filterYear === year
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 meta text-muted-foreground">
          {loading ? "Loading..." : `${totalElements} ${totalElements === 1 ? 'post' : 'posts'}`}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No posts found matching these filters.
                  </td>
                </tr>
              ) : (
                posts.map(post => (
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
                    <td className="px-6 py-4 meta text-muted-foreground">
                      {post.publishedAt || "No date"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => nav(`posts/${post.id}`)}
                          className="p-2 hover:bg-accent transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
