"use client";

import { useEffect, useState } from "react";
import { Eye, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getAdminPostById,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  getAdminSections,
  uploadMediaFile,
  type AdminPostDto,
  type PostCreateDto,
} from "@/lib/adminApiClient";
import {
  toEditorInitialContent,
  toPostPayloadFromEditor,
  type EditorInitialContent,
  type RichEditorSnapshot,
} from "@/lib/editorContent";
import { RichTextEditor } from "./RichTextEditor";

interface PostEditorProps {
  mode?: "create" | "edit";
  postId?: string | null;
}

const EMPTY_EDITOR_SNAPSHOT: RichEditorSnapshot = {
  html: "<p></p>",
  json: JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph" }],
  }),
  text: "",
};

export function PostEditor({ mode = "create", postId = null }: PostEditorProps) {
  const router = useRouter();

  const normalizeSectionKey = (value: unknown): "EDITORIAL" | "NOTES" | "DIARY" => {
    const normalized = String(value ?? "").trim().toUpperCase();
    if (normalized === "NOTES" || normalized === "DIARY" || normalized === "EDITORIAL") {
      return normalized;
    }
    return "EDITORIAL";
  };

  const [formData, setFormData] = useState<PostCreateDto>({
    title: "",
    section: "EDITORIAL",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    slug: "",
  });
  const [sections, setSections] = useState<string[]>(["EDITORIAL", "NOTES", "DIARY"]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPost, setCurrentPost] = useState<AdminPostDto | null>(null);

  const [editorInitialContent, setEditorInitialContent] = useState<EditorInitialContent>("");
  const [editorSnapshot, setEditorSnapshot] = useState<RichEditorSnapshot>(EMPTY_EDITOR_SNAPSHOT);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFilePreviewUrl, setCoverFilePreviewUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    getAdminSections()
      .then((allSections) => {
        const normalized = allSections.map((section) => normalizeSectionKey(section.key));
        setSections(Array.from(new Set(normalized)));
      })
      .catch(() => setSections(["EDITORIAL", "NOTES", "DIARY"]));
  }, []);

  useEffect(() => {
    if (mode === "edit" && postId) {
      setLoading(true);
      getAdminPostById(postId)
        .then((post) => {
          setCurrentPost(post);

          const contentRaw =
            post.contentJson || post.contentHtml || post.contentMd || post.content || "";
          setEditorInitialContent(toEditorInitialContent(contentRaw));
          setEditorSnapshot(EMPTY_EDITOR_SNAPSHOT);

          setFormData({
            title: post.title,
            subtitle: post.subtitle || undefined,
            section: normalizeSectionKey(post.section),
            excerpt: post.excerpt || "",
            content: post.contentHtml || post.contentMd || post.content || "",
            coverImageUrl: post.coverImageUrl || "",
            slug: post.slug,
          });
        })
        .catch((errorValue) => {
          console.error("Failed to load post:", errorValue);
          alert("Khong the tai bai viet.");
          router.push("/admin/posts");
        })
        .finally(() => setLoading(false));
    } else {
      setCurrentPost(null);
      setEditorInitialContent("");
      setEditorSnapshot(EMPTY_EDITOR_SNAPSHOT);
    }
  }, [mode, postId, router]);

  useEffect(() => {
    if (!coverFile) {
      setCoverFilePreviewUrl(null);
      return;
    }

    const preview = URL.createObjectURL(coverFile);
    setCoverFilePreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [coverFile]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSave = async (shouldPublish: boolean) => {
    if (!formData.title.trim()) {
      alert("Vui long nhap tieu de.");
      return;
    }

    const contentPayload = toPostPayloadFromEditor(editorSnapshot);
    if (!contentPayload.contentText.trim()) {
      alert("Vui long nhap noi dung bai viet.");
      return;
    }

    try {
      setSaving(true);
      const payload: PostCreateDto = {
        ...formData,
        ...contentPayload,
      };

      if (mode === "create") {
        const newPost = await createPost(payload);
        if (shouldPublish) {
          await publishPost(newPost.id);
        }

        alert(
          shouldPublish
            ? "Da xuat ban bai viet thanh cong."
            : "Da luu bai viet dang nhap."
        );
        router.push("/admin/posts");
      } else if (mode === "edit" && postId) {
        await updatePost(postId, { ...payload, id: postId });

        if (shouldPublish && currentPost?.status !== "published") {
          await publishPost(postId);
        } else if (!shouldPublish && currentPost?.status === "published") {
          await unpublishPost(postId);
        }

        alert(
          shouldPublish
            ? "Da xuat ban bai viet thanh cong."
            : "Da cap nhat bai viet."
        );
        router.push("/admin/posts");
      }
    } catch (errorValue) {
      console.error("Failed to save post:", errorValue);
      alert("Khong the luu bai viet. Vui long thu lai.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCoverFile = async () => {
    if (!coverFile) {
      alert("Vui long chon anh bia.");
      return;
    }

    try {
      setUploadingCover(true);
      const uploaded = await uploadMediaFile({
        file: coverFile,
        kind: "IMAGE",
        title: formData.title || coverFile.name,
        alt: formData.title || coverFile.name,
      });

      setFormData((prev) => ({ ...prev, coverImageUrl: uploaded.url }));
      setCoverFile(null);
      alert("Da tai anh bia len thanh cong.");
    } catch (errorValue) {
      console.error("Failed to upload cover image:", errorValue);
      alert("Khong the tai anh bia len. Vui long thu lai.");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/admin/posts")}
              className="flex items-center gap-2 meta hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lai
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Xem truoc (demo)")}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-foreground transition-colors"
                disabled={saving}
              >
                <Eye className="w-4 h-4" />
                Xem truoc
              </button>
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 border border-border hover:border-foreground transition-colors disabled:opacity-50"
                disabled={saving || loading}
              >
                {saving ? "Dang luu..." : "Luu nhap"}
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={saving || loading}
              >
                {saving ? "Dang xuat ban..." : "Xuat ban"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">{mode === "edit" ? "Chinh sua bai viet" : "Bai viet moi"}</h1>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">Tieu de</label>
            <input
              value={formData.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Tieu de bai viet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Chuyen muc</label>
              <select
                value={formData.section}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    section: normalizeSectionKey(event.target.value),
                  }))
                }
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                disabled={loading}
              >
                <option value="">Chon...</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">Tieu de phu (tuy chon)</label>
              <input
                value={formData.subtitle || ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="Tieu de phu"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Tom tat</label>
            <textarea
              value={formData.excerpt}
              onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
              className="w-full min-h-[100px] px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Tom tat ngan..."
            />
          </div>

          <div>
            <label className="block mb-2">Anh bia (URL hoac tai file)</label>
            <div className="space-y-3">
              <input
                value={formData.coverImageUrl || ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="https://..."
                disabled={loading || uploadingCover}
              />

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                  className="w-full md:flex-1 px-4 py-3 bg-background border border-input"
                  disabled={loading || saving || uploadingCover}
                />
                <button
                  type="button"
                  onClick={handleUploadCoverFile}
                  disabled={!coverFile || loading || saving || uploadingCover}
                  className="px-4 py-3 border border-border hover:border-foreground transition-colors disabled:opacity-50"
                >
                  {uploadingCover ? "Dang tai..." : "Tai anh len"}
                </button>
              </div>
            </div>

            {coverFilePreviewUrl && (
              <div className="mt-4 border border-border p-2">
                <Image src={coverFilePreviewUrl} alt="Cover preview" width={1200} height={630} />
              </div>
            )}

            {formData.coverImageUrl ? (
              <div className="mt-4 border border-border p-2">
                <Image src={formData.coverImageUrl} alt="Cover" width={1200} height={630} />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block mb-2">Noi dung</label>
            <RichTextEditor
              initialContent={editorInitialContent}
              onChange={setEditorSnapshot}
              disabled={loading || saving}
              placeholder="Bat dau viet bai..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
