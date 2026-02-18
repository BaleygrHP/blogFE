"use client";

import { useEffect, useState } from "react";
import {
  Edit3,
  LogOut,
  Plus,
  Edit2,
  Save,
  CheckCircle2,
  CircleOff,
  Power,
  PowerOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getAdminSections,
  createSection,
  updateSection,
  toggleSection,
  type SectionDto,
} from "@/lib/adminApiClient";

interface CategoryManagerProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function CategoryManager({ onNavigate, onLogout }: CategoryManagerProps) {
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

  const [sections, setSections] = useState<SectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadSections();
  }, []);

  const toSectionKey = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  async function loadSections() {
    try {
      setLoading(true);
      const data = await getAdminSections();
      setSections(data);
    } catch (errorValue) {
      console.error("Failed to load sections:", errorValue);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên chuyên mục.");
      return;
    }

    const sectionKey = toSectionKey(formData.name);
    if (!sectionKey) {
      alert("Không thể tạo khóa chuyên mục từ tên này.");
      return;
    }

    try {
      await createSection({
        key: sectionKey,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        visibility: "PUBLIC",
        active: true,
      });
      await loadSections();
      setFormData({ name: "", description: "" });
      setIsAdding(false);
      alert("Đã thêm chuyên mục thành công.");
    } catch (errorValue) {
      console.error("Failed to add section:", errorValue);
      alert("Không thể thêm chuyên mục.");
    }
  };

  const handleEdit = (section: SectionDto) => {
    setEditingId(section.id);
    setFormData({
      name: section.name ?? section.label ?? section.key,
      description: section.description ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return;

    try {
      await updateSection(editingId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      await loadSections();
      setEditingId(null);
      setFormData({ name: "", description: "" });
      alert("Đã cập nhật chuyên mục thành công.");
    } catch (errorValue) {
      console.error("Failed to update section:", errorValue);
      alert("Không thể cập nhật chuyên mục.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSection(id);
      await loadSections();
    } catch (errorValue) {
      console.error("Failed to toggle section:", errorValue);
      alert("Không thể đổi trạng thái chuyên mục.");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
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
            <span className="meta">Chuyên mục</span>
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
        <div className="mb-12">
          <h1 className="text-3xl mb-4">Quản lý chuyên mục</h1>
          <p className="text-muted-foreground">
            Quản lý các chuyên mục blog. Phân loại thư viện hiện được xử lý trực tiếp trong màn hình
            quản lý thư viện.
          </p>
        </div>

        {!isAdding && !editingId && (
          <div className="mb-8">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Thêm chuyên mục
            </button>
          </div>
        )}

        {(isAdding || editingId) && (
          <div className="mb-8 bg-card border border-border p-6">
            <h2 className="text-xl mb-6">{isAdding ? "Thêm mới" : "Chỉnh sửa"} chuyên mục</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Ví dụ: Reviews"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Mô tả ngắn..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={isAdding ? handleAdd : handleSaveEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  <Save className="w-5 h-5" />
                  {isAdding ? "Thêm" : "Lưu"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-border hover:border-foreground transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Đang tải danh sách chuyên mục...</div>
          ) : (
            sections.map((section) => {
              const isActive = section.active ?? section.enabled ?? true;
              const displayName = section.name ?? section.label ?? section.key;
              return (
                <div
                  key={section.id}
                  className={`bg-card border border-border p-6 transition-colors ${!isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{displayName}</h3>
                        {!isActive ? (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded inline-flex items-center gap-1">
                            <CircleOff className="w-3 h-3" />
                            Ngưng hoạt động
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đang hoạt động
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 hover:bg-secondary transition-colors"
                        disabled={isAdding || editingId !== null}
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggle(section.id)}
                        className={`p-2 transition-colors ${
                          !isActive
                            ? "hover:bg-green-100 text-green-700"
                            : "hover:bg-destructive hover:text-destructive-foreground"
                        }`}
                        disabled={isAdding || editingId !== null}
                        title={!isActive ? "Kích hoạt" : "Vô hiệu hóa"}
                      >
                        {!isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && sections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">Chưa có chuyên mục nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
