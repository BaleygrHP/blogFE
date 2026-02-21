"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, LogOut, Trash2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getAdminMedia,
  uploadMediaByUrl,
  uploadMediaFile,
  updateMedia,
  deleteMedia,
  getMediaCategories,
  type MediaUploadDto,
  type MediaUpdateDto,
} from "@/lib/adminApiClient";
import { trackedFetch } from "@/lib/trackedFetch";
import type { PublicMediaDto } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";

const IMAGES_PER_PAGE = 12;

interface GalleryManagerProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function GalleryManager({ onNavigate, onLogout }: GalleryManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);
  const logout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await trackedFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const [categories, setCategories] = useState<string[]>([]);
  const [images, setImages] = useState<PublicMediaDto[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newImage, setNewImage] = useState<Partial<MediaUploadDto>>({
    url: "",
    kind: "IMAGE",
    caption: "",
    location: "",
    title: "",
  });
  const [editData, setEditData] = useState<MediaUpdateDto>({});

  const loadCategories = useCallback(async () => {
    try {
      const items = await getMediaCategories();
      const normalized = Array.from(
        new Set(
          (items || [])
            .map((category) => (category || "").trim())
            .filter((category) => category.length > 0)
        )
      );
      setCategories(normalized);
    } catch (errorValue) {
      console.error("Failed to load categories", errorValue);
    }
  }, []);

  useEffect(() => {
    async function loadImages() {
      try {
        setLoading(true);
        const response = await getAdminMedia({
          kind: "IMAGE",
          active: true,
          page: currentPage,
          size: IMAGES_PER_PAGE,
        });
        setImages(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (errorValue) {
        console.error("Failed to load images:", errorValue);
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [currentPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  const handleAddImage = async () => {
    try {
      if (uploadMode === "file") {
        if (!selectedFile) {
          alert("Vui lòng chọn tệp.");
          return;
        }

        await uploadMediaFile({
          file: selectedFile,
          kind: "IMAGE",
          title: newImage.title,
          alt: newImage.title,
          caption: newImage.caption,
          location: newImage.location,
          category: newImage.category,
        });
      } else {
        if (!newImage.url) {
          alert("Vui lòng nhập URL ảnh.");
          return;
        }

        const mediaData: MediaUploadDto = {
          url: newImage.url,
          kind: "IMAGE",
          title: newImage.title,
          caption: newImage.caption,
          location: newImage.location,
          category: newImage.category,
        };

        await uploadMediaByUrl(mediaData);
      }

      const response = await getAdminMedia({
        kind: "IMAGE",
        active: true,
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);

      setIsAdding(false);
      setUploadMode("file");
      setSelectedFile(null);
      setNewImage({
        url: "",
        kind: "IMAGE",
        caption: "",
        location: "",
        title: "",
      });
      await loadCategories();

      alert("Đã thêm ảnh thành công.");
    } catch (errorValue) {
      console.error("Failed to add image:", errorValue);
      alert("Không thể thêm ảnh. Vui lòng thử lại.");
    }
  };

  const handleDeleteImage = async (id: string, caption?: string | null) => {
    if (!confirm(`Xóa "${caption || "ảnh này"}"?`)) {
      return;
    }

    try {
      await deleteMedia(id);

      const response = await getAdminMedia({
        kind: "IMAGE",
        active: true,
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);

      alert("Đã xóa ảnh thành công.");
    } catch (errorValue) {
      console.error("Failed to delete image:", errorValue);
      const message =
        errorValue instanceof Error ? errorValue.message : String(errorValue ?? "");
      if (message.includes("API error 403")) {
        alert("Bạn không có quyền xóa ảnh. Cần tài khoản ADMIN.");
      } else {
        alert("Không thể xóa ảnh. Vui lòng thử lại.");
      }
    }
  };

  const handleEditImage = (image: PublicMediaDto) => {
    setEditingId(image.id);
    setEditData({
      title: image.title || "",
      alt: image.alt || "",
      caption: image.caption || "",
      location: image.location || "",
      category: image.category || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateMedia(editingId, editData);

      const response = await getAdminMedia({
        kind: "IMAGE",
        active: true,
        page: currentPage,
        size: IMAGES_PER_PAGE,
      });
      setImages(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);

      setEditingId(null);
      setEditData({});
      await loadCategories();
      alert("Đã cập nhật ảnh thành công.");
    } catch (errorValue) {
      console.error("Failed to update image:", errorValue);
      alert("Không thể cập nhật ảnh. Vui lòng thử lại.");
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
            <span className="meta">Thư viện</span>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Quản lý thư viện</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Thêm ảnh
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Thêm ảnh mới</h2>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setUploadMode("file");
                  setSelectedFile(null);
                }}
                className="p-2 hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-4 py-2 border ${
                    uploadMode === "file"
                      ? "bg-foreground text-background border-foreground"
                      : "border-border"
                  }`}
                >
                  Tải tệp lên
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-4 py-2 border ${
                    uploadMode === "url"
                      ? "bg-foreground text-background border-foreground"
                      : "border-border"
                  }`}
                >
                  Nhập URL
                </button>
              </div>

              {uploadMode === "file" ? (
                <div key="file-upload-input">
                  <label className="block mb-2 text-sm font-medium">Tệp *</label>
                  <input
                    key="file-input"
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-input bg-background"
                  />
                </div>
              ) : (
                <div key="url-upload-input">
                  <label className="block mb-2 text-sm font-medium">URL ảnh *</label>
                  <input
                    key="url-input"
                    type="text"
                    value={newImage.url || ""}
                    onChange={(event) => setNewImage({ ...newImage, url: event.target.value })}
                    className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium">Chú thích</label>
                <input
                  type="text"
                  value={newImage.caption || ""}
                  onChange={(event) => setNewImage({ ...newImage, caption: event.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Bình minh trên núi"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Địa điểm</label>
                <input
                  type="text"
                  value={newImage.location || ""}
                  onChange={(event) => setNewImage({ ...newImage, location: event.target.value })}
                  className="w-full px-4 py-3 border border-input focus:border-foreground focus:outline-none transition-colors bg-background"
                  placeholder="Swiss Alps"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Danh mục</label>
                <input
                  type="text"
                  list="gallery-category-options"
                  className="w-full px-4 py-3 border border-input bg-background"
                  value={newImage.category || ""}
                  onChange={(event) => setNewImage({ ...newImage, category: event.target.value })}
                  placeholder="Nhập hoặc chọn danh mục"
                />
              </div>

              {uploadMode === "url" && newImage.url && (
                <div>
                  <label className="block mb-2 text-sm font-medium">Xem trước</label>
                  <Image
                    src={newImage.url}
                    alt="Xem trước"
                    width={800}
                    height={384}
                    className="w-full max-w-md h-48 object-cover border border-border"
                  />
                </div>
              )}

              {uploadMode === "file" && filePreviewUrl && selectedFile?.type.startsWith("image/") && (
                <div>
                  <label className="block mb-2 text-sm font-medium">Xem trước</label>
                  <Image
                    src={filePreviewUrl}
                    alt="Xem trước"
                    width={800}
                    height={384}
                    className="w-full max-w-md h-48 object-cover border border-border"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddImage}
                  className="px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Thêm ảnh
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setUploadMode("file");
                    setSelectedFile(null);
                  }}
                  className="px-6 py-3 border border-border hover:border-foreground transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 meta text-muted-foreground">
          {loading ? UI_TEXT.common.loading : `${totalElements} ${totalElements === 1 ? "ảnh" : "ảnh"}`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Đang tải ảnh...
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Chưa có ảnh nào.
            </div>
          ) : (
            images.map((image) => (
              <div key={image.id} className="bg-card border border-border overflow-hidden group">
                <div className="relative">
                  <Image
                    src={image.url}
                    alt={image.caption || "Ảnh thư viện"}
                    width={image.width ?? 800}
                    height={image.height ?? 600}
                    className="w-full h-48 object-cover"
                  />

                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditImage(image)}
                      className="w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="w-10 h-10 bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {editingId === image.id ? (
                  <div className="p-4 space-y-3 bg-muted">
                    <div>
                      <label className="block mb-1 text-xs font-medium">Chú thích</label>
                      <input
                        type="text"
                        value={editData.caption || ""}
                        onChange={(event) => setEditData({ ...editData, caption: event.target.value })}
                        className="w-full px-3 py-2 text-sm border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium">Địa điểm</label>
                      <input
                        type="text"
                        value={editData.location || ""}
                        onChange={(event) => setEditData({ ...editData, location: event.target.value })}
                        className="w-full px-3 py-2 text-sm border border-input bg-background"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium">Danh mục</label>
                      <input
                        type="text"
                        list="gallery-category-options"
                        value={editData.category || ""}
                        onChange={(event) => setEditData({ ...editData, category: event.target.value })}
                        className="w-full px-3 py-2 text-sm border border-input bg-background"
                        placeholder="Nhập hoặc chọn danh mục"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-4 py-2 text-sm bg-foreground text-background hover:opacity-90"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="flex-1 px-4 py-2 text-sm border border-border hover:border-foreground"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    {image.caption && <h3 className="font-medium mb-1">{image.caption}</h3>}
                    <div className="meta text-muted-foreground text-sm">
                      {image.location && <div>{image.location}</div>}
                      {image.category && <div className="text-xs">Danh mục: {image.category}</div>}
                      <div>{image.takenAt || image.createdDate || ""}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || loading}
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="mx-4 meta text-muted-foreground">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <datalist id="gallery-category-options">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
