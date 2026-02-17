"use client";

import { useEffect, useState } from "react";
import { Edit3, LogOut, Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAdminPosts, deletePost, getAdminSections, type AdminPostDto } from "@/lib/adminApiClient";
import { ALL_FILTER_VALUE, UI_TEXT } from "@/lib/i18n";

interface PostsListProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: ALL_FILTER_VALUE, label: UI_TEXT.filter.all },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
];

export function PostsList({ onNavigate, onLogout }: PostsListProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = () => (onLogout ? onLogout() : router.push("/"));

  const [filterSection, setFilterSection] = useState<string>(ALL_FILTER_VALUE);
  const [filterStatus, setFilterStatus] = useState<string>(ALL_FILTER_VALUE);
  const [filterYear, setFilterYear] = useState<string>(ALL_FILTER_VALUE);
  const [posts, setPosts] = useState<AdminPostDto[]>([]);
  const [allPosts, setAllPosts] = useState<AdminPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [sections, setSections] = useState<string[]>(["EDITORIAL", "NOTES", "DIARY"]);
  const [sectionIdByKey, setSectionIdByKey] = useState<Record<string, string>>({});

  const availableYears = Array.from(
    new Set(
      allPosts
        .map((post) =>
          post.publishedAt ? new Date(post.publishedAt).getFullYear().toString() : null
        )
        .filter((year): year is string => year !== null)
    )
  ).sort((a, b) => Number(b) - Number(a));

  useEffect(() => {
    getAdminSections()
      .then((allSections) => {
        const map: Record<string, string> = {};
        const nextSections: string[] = [];

        for (const section of allSections) {
          if (!section.key || !section.id) continue;
          map[section.key] = section.id;
          map[section.key.toUpperCase()] = section.id;
          nextSections.push(section.key);
        }

        setSectionIdByKey(map);
        setSections(nextSections.length > 0 ? nextSections : ["EDITORIAL", "NOTES", "DIARY"]);
      })
      .catch((errorValue) => {
        console.error("Failed to load sections:", errorValue);
        setSectionIdByKey({});
        setSections(["EDITORIAL", "NOTES", "DIARY"]);
      });
  }, []);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);

        const sectionKey = filterSection === ALL_FILTER_VALUE ? undefined : filterSection;
        const sectionId = sectionKey ? sectionIdByKey[sectionKey] : undefined;
        const statusParam =
          filterStatus === ALL_FILTER_VALUE ? undefined : (filterStatus as "published" | "draft");

        const response = await getAdminPosts({
          sectionId,
          status: statusParam,
          page: 0,
          size: 100,
        });

        let fetchedPosts = response.content ?? [];
        setAllPosts(fetchedPosts);

        if (filterYear !== ALL_FILTER_VALUE) {
          fetchedPosts = fetchedPosts.filter(
            (post) =>
              post.publishedAt && new Date(post.publishedAt).getFullYear().toString() === filterYear
          );
        }

        setPosts(fetchedPosts);
        setTotalElements(fetchedPosts.length);
      } catch (errorValue) {
        console.error("Failed to load posts:", errorValue);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [filterSection, filterStatus, filterYear, sectionIdByKey]);

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Xóa bài "${title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (errorValue) {
      console.error("Failed to delete post:", errorValue);
      alert("Không thể xóa bài viết. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => nav("dashboard")}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Quản trị</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="meta">Bài viết</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Tất cả bài viết</h1>
          <button
            onClick={() => nav("posts/new")}
            className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Bài viết mới
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-6">
          <div>
            <label className="section-label text-muted-foreground mb-3 block text-xs">Chuyên mục</label>
            <div className="flex gap-2">
              {[ALL_FILTER_VALUE, ...sections].map((section) => (
                <button
                  key={section}
                  onClick={() => setFilterSection(section)}
                  className={`px-4 py-2 border text-sm transition-colors ${
                    filterSection === section
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {section === ALL_FILTER_VALUE ? UI_TEXT.filter.all : section}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="section-label text-muted-foreground mb-3 block text-xs">Trạng thái</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className={`px-4 py-2 border text-sm transition-colors ${
                    filterStatus === status.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {availableYears.length > 0 && (
            <div>
              <label className="section-label text-muted-foreground mb-3 block text-xs">Năm</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterYear(ALL_FILTER_VALUE)}
                  className={`px-4 py-2 border text-sm transition-colors ${
                    filterYear === ALL_FILTER_VALUE
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {UI_TEXT.filter.all}
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setFilterYear(year)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      filterYear === year
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 meta text-muted-foreground">
          {loading ? UI_TEXT.common.loading : `${totalElements} ${totalElements === 1 ? "bài viết" : "bài viết"}`}
        </div>

        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 section-label text-xs">Tiêu đề</th>
                <th className="text-left px-6 py-4 section-label text-xs">Chuyên mục</th>
                <th className="text-left px-6 py-4 section-label text-xs">Trạng thái</th>
                <th className="text-left px-6 py-4 section-label text-xs">Ngày</th>
                <th className="text-right px-6 py-4 section-label text-xs">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Đang tải danh sách bài viết...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Không có bài viết phù hợp bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-0 hover:bg-secondary transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium mb-1">{post.title}</div>
                      {post.featured && (
                        <span className="section-label text-xs text-muted-foreground">NỔI BẬT</span>
                      )}
                    </td>
                    <td className="px-6 py-4 meta">{post.section}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          post.status === "published" ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {post.status === "published" ? (
                          <>
                            <Eye className="w-3 h-3" /> Đã xuất bản
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Bản nháp
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 meta text-muted-foreground">{post.publishedAt || "Chưa có ngày"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => nav(`posts/${post.id}`)}
                          className="p-2 hover:bg-accent transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Xóa"
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
