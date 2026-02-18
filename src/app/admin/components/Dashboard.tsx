"use client";

import { useEffect, useState } from "react";
import { FileText, FilePlus, LogOut, Edit3, Image as ImageIcon, Tag, Layout } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { getAdminPosts, getAdminMedia, type AdminPostDto } from "@/lib/adminApiClient";
import type { PublicMediaDto } from "@/lib/types";

interface DashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

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

        const publishedRes = await getAdminPosts({ status: "published", page: 0, size: 1 });
        setPublishedCount(publishedRes.totalElements);

        const draftsRes = await getAdminPosts({ status: "draft", page: 0, size: 5 });
        setDraftsCount(draftsRes.totalElements);
        setRecentDrafts(draftsRes.content.slice(0, 5));

        try {
          const galleryRes = await getAdminMedia({ kind: "IMAGE", page: 0, size: 6 });
          setGalleryCount(galleryRes.totalElements);
          setRecentImages(galleryRes.content.slice(0, 6));
        } catch (errorValue) {
          console.warn("Gallery API not available:", errorValue);
        }
      } catch (errorValue: unknown) {
        console.error("Failed to load dashboard data:", errorValue);
        if (errorValue instanceof Error && errorValue.message?.includes("401")) {
          router.push("/admin");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5" />
            <span className="font-medium">Quản trị</span>
          </div>
          <button
            onClick={() => void logout()}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-12">Bảng điều khiển</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label text-muted-foreground">Đã xuất bản</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-medium">{loading ? "..." : publishedCount}</div>
          </div>

          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label text-muted-foreground">Bản nháp</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-medium">{loading ? "..." : draftsCount}</div>
          </div>

          <button
            onClick={() => nav("posts/new")}
            className="bg-foreground text-background border border-foreground p-6 hover:opacity-90 transition-opacity text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">Bài viết mới</span>
              <FilePlus className="w-5 h-5" />
            </div>
            <div className="text-lg">Tạo bài viết mới</div>
          </button>
        </div>

        <div className="mb-12">
          <h2 className="text-xl mb-6 pb-3 border-b border-border">Tác vụ nhanh</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => nav("posts")}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              Xem tất cả bài viết
            </button>
            <button
              onClick={() => nav("posts/new")}
              className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Bài viết mới
            </button>
            <button
              onClick={() => nav("gallery")}
              className="px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              Quản lý thư viện
            </button>
            <button
              onClick={() => nav("categories")}
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              <Tag className="w-4 h-4" />
              Quản lý chuyên mục
            </button>
            <button
              onClick={() => nav("front-page")}
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-foreground transition-colors"
            >
              <Layout className="w-4 h-4" />
              Trang chủ
            </button>
          </div>
        </div>

        {recentDrafts.length > 0 && (
          <div>
            <h2 className="text-xl mb-6 pb-3 border-b border-border">Bản nháp gần đây</h2>
            <div className="space-y-4">
              {recentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-4 bg-card border border-border hover:border-foreground transition-colors cursor-pointer"
                  onClick={() => nav(`posts/${draft.id}`)}
                >
                  <div>
                    <div className="section-label text-muted-foreground text-xs mb-1">{draft.section}</div>
                    <div className="font-medium">{draft.title}</div>
                  </div>
                  <div className="meta text-muted-foreground">{draft.publishedAt || "Chưa có ngày"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentImages.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <h2 className="text-xl">Tổng quan thư viện</h2>
              <button
                onClick={() => nav("gallery")}
                className="meta text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Xem tất cả ({loading ? "..." : galleryCount})
              </button>
            </div>

            <div className="bg-card border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="section-label text-muted-foreground">Tổng số ảnh</span>
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-medium">{loading ? "..." : galleryCount}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentImages.map((image) => (
                <div key={image.id} className="group cursor-pointer" onClick={() => nav("gallery")}>
                  <div className="overflow-hidden mb-2 bg-secondary border border-border group-hover:border-foreground transition-colors">
                    <NextImage
                      src={image.url}
                      alt={image.caption || image.title || "Ảnh thư viện"}
                      width={image.width ?? 640}
                      height={image.height ?? 480}
                      className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  {(image.caption || image.title) && (
                    <div className="text-sm font-medium truncate">{image.caption || image.title}</div>
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
