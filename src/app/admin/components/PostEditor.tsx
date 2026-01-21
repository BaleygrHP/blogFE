"use client";

import { useEffect, useMemo, useState } from "react";
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
  type AdminPostDto,
  type PostCreateDto 
} from "@/lib/adminApiClient";

type PostStatus = "published" | "draft";

interface PostEditorProps {
  mode?: "create" | "edit";
  postId?: string | null;
}

export function PostEditor({ mode = "create", postId = null }: PostEditorProps) {
  const router = useRouter();

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

  // Load sections
  useEffect(() => {
    getAdminSections()
      .then(secs => setSections(secs.map(s => s.key)))
      .catch(() => setSections(["EDITORIAL", "NOTES", "DIARY"]));
  }, []);

  // Load existing post in edit mode
  useEffect(() => {
    if (mode === "edit" && postId) {
      setLoading(true);
      getAdminPostById(postId)
        .then(post => {
          setCurrentPost(post);
          setFormData({
            title: post.title,
            subtitle: post.subtitle || undefined,
            section: post.section,
            excerpt: post.excerpt || "",
            content: post.content || "",
            coverImageUrl: post.coverImageUrl || "",
            slug: post.slug,
          });
        })
        .catch(err => {
          console.error("Failed to load post:", err);
          alert("Failed to load post");
          router.push("/admin/posts");
        })
        .finally(() => setLoading(false));
    }
  }, [mode, postId, router]);

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
      alert("Please enter a title");
      return;
    }

    try {
      setSaving(true);

      if (mode === "create") {
        // Create new post
        const newPost = await createPost(formData);
        
        // Publish if requested
        if (shouldPublish) {
          await publishPost(newPost.id);
        }

        alert(`Post ${shouldPublish ? "published" : "saved as draft"} successfully!`);
        router.push("/admin/posts");
      } else if (mode === "edit" && postId) {
        // Update existing post
        await updatePost(postId, { ...formData, id: postId });

        // Handle publish/unpublish
        if (shouldPublish && currentPost?.status !== "published") {
          await publishPost(postId);
        } else if (!shouldPublish && currentPost?.status === "published") {
          await unpublishPost(postId);
        }

        alert(`Post ${shouldPublish ? "published" : "saved"} successfully!`);
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/admin/posts")}
              className="flex items-center gap-2 meta hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Preview (demo)")}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-foreground transition-colors"
                disabled={saving}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 border border-border hover:border-foreground transition-colors disabled:opacity-50"
                disabled={saving || loading}
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={saving || loading}
              >
                {saving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">{mode === "edit" ? "Edit post" : "New post"}</h1>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">Title</label>
            <input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Post title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData((p) => ({ ...p, section: e.target.value as any }))}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                disabled={loading}
              >
                <option value="">Select…</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">Subtitle (optional)</label>
              <input
                value={formData.subtitle || ""}
                onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="Subtitle"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
              className="w-full min-h-[100px] px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Short summary..."
            />
          </div>

          <div>
            <label className="block mb-2">Cover image URL</label>
            <input
              value={formData.coverImageUrl || ""}
              onChange={(e) => setFormData((p) => ({ ...p, coverImageUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="https://..."
              disabled={loading}
            />
            {formData.coverImageUrl ? (
              <div className="mt-4 border border-border p-2">
                <Image src={formData.coverImageUrl} alt="Cover" width={1200} height={630} />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              className="w-full min-h-[260px] px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Write here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
