"use client";

import { useEffect, useState } from 'react';
import { FileText, FilePlus, LogOut, Edit3, Image as ImageIcon, Tag, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAdminPosts, getAdminMedia, type AdminPostDto } from '@/lib/adminApiClient';
import type { PublicMediaDto } from '@/lib/types';
import NextImage from 'next/image';

interface DashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push("/"));

  const [publishedCount, setPublishedCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [recentDrafts, setRecentDrafts] = useState<AdminPostDto[]>([]);
  const [galleryCount, setGalleryCount] = useState(0);
  const [recentImages, setRecentImages] = useState<PublicMediaDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Fetch published count
        const publishedRes = await getAdminPosts({ status: "published", page: 0, size: 1 });
        setPublishedCount(publishedRes.totalElements);

        // Fetch drafts count and recent drafts
        const draftsRes = await getAdminPosts({ status: "draft", page: 0, size: 5 });
        setDraftsCount(draftsRes.totalElements);
        setRecentDrafts(draftsRes.content.slice(0, 5));

        // Fetch gallery count and recent images
        try {
          const galleryRes = await getAdminMedia({ kind: "IMAGE", page: 0, size: 6 });
          setGalleryCount(galleryRes.totalElements);
          setRecentImages(galleryRes.content.slice(0, 6));
        } catch (err) {
          // Gallery API might not be available yet
          console.warn("Gallery API not available:", err);
        }
      } catch (error: unknown) {
        console.error("Failed to load dashboard data:", error);
        if (error instanceof Error && error.message?.includes("401")) {
          router.push("/admin"); // Redirect to login
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

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
            onClick={logout}
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
            <div className="text-3xl font-medium">
              {loading ? "..." : publishedCount}
            </div>
          </div>

          {/* Drafts Count */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label text-muted-foreground">Drafts</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-medium">
              {loading ? "..." : draftsCount}
            </div>
          </div>

          {/* Quick Action */}
          <button
            onClick={() => nav('posts/new')}
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
              onClick={() => nav('posts')}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              View All Posts
            </button>
            <button
            onClick={() => nav('posts/new')}
              className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              New Post
            </button>
            <button
              onClick={() => nav('gallery')}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              Manage Gallery
            </button>
            <button
              onClick={() => nav('categories')}
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              <Tag className="w-4 h-4" />
              Manage Categories
            </button>
            <button
              onClick={() => nav('front-page')}
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              <Layout className="w-4 h-4" />
              Front Page
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
                  onClick={() => nav(`posts/${draft.id}`)}
                >
                  <div>
                    <div className="section-label text-muted-foreground text-xs mb-1">
                      {draft.section}
                    </div>
                    <div className="font-medium">{draft.title}</div>
                  </div>
                  <div className="meta text-muted-foreground">
                    {draft.publishedAt || "No date"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Gallery Images */}
        {recentImages.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <h2 className="text-xl">Gallery Overview</h2>
              <button
                onClick={() => nav('gallery')}
                className="meta text-muted-foreground hover:text-foreground transition-colors underline"
              >
                View All ({loading ? "..." : galleryCount})
              </button>
            </div>
            
            {/* Gallery Stats */}
            <div className="bg-card border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="section-label text-muted-foreground">Total Images</span>
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-medium">
                {loading ? "..." : galleryCount}
              </div>
            </div>

            {/* Recent Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentImages.map(image => (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  onClick={() => nav('gallery')}
                >
                  <div className="overflow-hidden mb-2 bg-secondary border border-border group-hover:border-foreground transition-colors">
                    <NextImage
                      src={image.url}
                      alt={image.caption || image.title || 'Gallery image'}
                      width={image.width ?? 640}
                      height={image.height ?? 480}
                      className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  {(image.caption || image.title) && (
                    <div className="text-sm font-medium truncate">
                      {image.caption || image.title}
                    </div>
                  )}
                  <div className="meta text-muted-foreground text-xs">
                    {image.takenAt || image.createdDate || ""}
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
