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
  toMarkdownPostPayload,
  toRichPostPayloadFromEditor,
  type EditorInitialContent,
  type RichEditorSnapshot,
} from "@/lib/editorContent";
import { htmlToMarkdownBestEffort, markdownToHtmlBestEffort } from "@/lib/markdownTransforms";
import { RichTextEditor } from "./RichTextEditor";

interface PostEditorProps {
  mode?: "create" | "edit";
  postId?: string | null;
}

type SectionOption = {
  key: "EDITORIAL" | "NOTES" | "DIARY";
  label: string;
};

type EditorInputMode = "rich" | "markdown";

const DEFAULT_SECTION_OPTIONS: SectionOption[] = [
  { key: "EDITORIAL", label: "Editorial" },
  { key: "NOTES", label: "Notes" },
  { key: "DIARY", label: "Diary" },
];

const EMPTY_EDITOR_SNAPSHOT: RichEditorSnapshot = {
  html: "<p></p>",
  json: JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph" }],
  }),
  text: "",
};

const parseSectionKey = (value: unknown): "EDITORIAL" | "NOTES" | "DIARY" | null => {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "NOTES" || normalized === "DIARY" || normalized === "EDITORIAL") {
    return normalized;
  }
  return null;
};

const normalizeSectionKey = (value: unknown): "EDITORIAL" | "NOTES" | "DIARY" =>
  parseSectionKey(value) ?? "EDITORIAL";

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
  const [sections, setSections] = useState<SectionOption[]>(DEFAULT_SECTION_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPost, setCurrentPost] = useState<AdminPostDto | null>(null);

  const [editorMode, setEditorMode] = useState<EditorInputMode>("rich");
  const [markdownDraft, setMarkdownDraft] = useState("");
  const [editorInitialContent, setEditorInitialContent] = useState<EditorInitialContent>("");
  const [editorSnapshot, setEditorSnapshot] = useState<RichEditorSnapshot>(EMPTY_EDITOR_SNAPSHOT);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFilePreviewUrl, setCoverFilePreviewUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    getAdminSections()
      .then((allSections) => {
        const next = new Map<SectionOption["key"], SectionOption>();

        for (const section of allSections) {
          const key = parseSectionKey(section.key);
          if (!key) continue;
          const label = String(section.name ?? section.label ?? key).trim() || key;
          next.set(key, { key, label });
        }

        setSections(next.size > 0 ? Array.from(next.values()) : DEFAULT_SECTION_OPTIONS);
      })
      .catch(() => setSections(DEFAULT_SECTION_OPTIONS));
  }, []);

  useEffect(() => {
    if (mode === "edit" && postId) {
      setLoading(true);
      getAdminPostById(postId)
        .then((post) => {
          setCurrentPost(post);

          const htmlContent = String(post.contentHtml || "").trim();
          const markdownContent = String(post.contentMd || "").trim();
          const richContent = htmlContent || post.content || post.contentJson || markdownContent || "";
          const fallbackMarkdown = markdownContent || htmlToMarkdownBestEffort(htmlContent || post.content || "");
          const shouldStartInMarkdownMode = !htmlContent && !!markdownContent;

          setEditorMode(shouldStartInMarkdownMode ? "markdown" : "rich");
          setMarkdownDraft(fallbackMarkdown);
          setEditorInitialContent(toEditorInitialContent(richContent));
          setEditorSnapshot(EMPTY_EDITOR_SNAPSHOT);

          setFormData({
            title: post.title,
            subtitle: post.subtitle || undefined,
            section: normalizeSectionKey(post.section),
            excerpt: post.excerpt || "",
            content: htmlContent || markdownContent || post.content || "",
            coverImageUrl: post.coverImageUrl || "",
            slug: post.slug,
          });
        })
        .catch((errorValue) => {
          console.error("Failed to load post:", errorValue);
          alert("Cannot load post.");
          router.push("/admin/posts");
        })
        .finally(() => setLoading(false));
    } else {
      setCurrentPost(null);
      setEditorMode("rich");
      setMarkdownDraft("");
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

  const handleSwitchToMarkdown = () => {
    if (editorMode === "markdown") return;
    const richHtml =
      editorSnapshot.html.trim() ||
      (typeof editorInitialContent === "string" ? String(editorInitialContent || "").trim() : "");
    setMarkdownDraft(htmlToMarkdownBestEffort(richHtml));
    setEditorMode("markdown");
  };

  const handleSwitchToRich = () => {
    if (editorMode === "rich") return;
    const renderedHtml = markdownToHtmlBestEffort(markdownDraft);
    setEditorInitialContent(toEditorInitialContent(renderedHtml || "<p></p>"));
    setEditorSnapshot(EMPTY_EDITOR_SNAPSHOT);
    setEditorMode("rich");
  };

  const handleSave = async (shouldPublish: boolean) => {
    if (!formData.title.trim()) {
      alert("Please enter title.");
      return;
    }

    const contentPayload =
      editorMode === "markdown"
        ? toMarkdownPostPayload(markdownDraft)
        : toRichPostPayloadFromEditor(editorSnapshot);

    if (!contentPayload.contentText.trim()) {
      alert("Please enter content.");
      return;
    }

    try {
      setSaving(true);
      const payload: PostCreateDto = {
        ...formData,
        ...contentPayload,
      };

      if (editorMode === "markdown") {
        delete payload.contentJson;
      }

      if (mode === "create") {
        const newPost = await createPost(payload);
        if (shouldPublish) {
          await publishPost(newPost.id);
        }

        alert(shouldPublish ? "Post published successfully." : "Draft saved successfully.");
        router.push("/admin/posts");
      } else if (mode === "edit" && postId) {
        await updatePost(postId, { ...payload, id: postId });

        if (shouldPublish && currentPost?.status !== "published") {
          await publishPost(postId);
        } else if (!shouldPublish && currentPost?.status === "published") {
          await unpublishPost(postId);
        }

        alert(shouldPublish ? "Post published successfully." : "Post updated successfully.");
        router.push("/admin/posts");
      }
    } catch (errorValue) {
      console.error("Failed to save post:", errorValue);
      alert("Cannot save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCoverFile = async () => {
    if (!coverFile) {
      alert("Please select a cover image.");
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
      alert("Cover image uploaded.");
    } catch (errorValue) {
      console.error("Failed to upload cover image:", errorValue);
      alert("Cannot upload cover image. Please try again.");
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
                {saving ? "Saving..." : "Save Draft"}
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
        <h1 className="text-2xl mb-6">{mode === "edit" ? "Edit Post" : "New Post"}</h1>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">Title</label>
            <input
              value={formData.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Post title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Section</label>
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
                <option value="">Select...</option>
                {sections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">Subtitle (optional)</label>
              <input
                value={formData.subtitle || ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
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
              onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
              className="w-full min-h-[100px] px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
              placeholder="Short excerpt"
            />
          </div>

          <div>
            <label className="block mb-2">Cover image (URL or upload)</label>
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
                  {uploadingCover ? "Uploading..." : "Upload"}
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
            <label className="block mb-2">Content</label>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={handleSwitchToRich}
                disabled={loading || saving || editorMode === "rich"}
                className={`px-3 py-1.5 border transition-colors ${
                  editorMode === "rich"
                    ? "border-foreground text-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                Rich Text
              </button>
              <button
                type="button"
                onClick={handleSwitchToMarkdown}
                disabled={loading || saving || editorMode === "markdown"}
                className={`px-3 py-1.5 border transition-colors ${
                  editorMode === "markdown"
                    ? "border-foreground text-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                Markdown
              </button>
            </div>
            <p className="meta text-muted-foreground mb-3">
              Rich Text and Markdown conversion is best-effort. Some formatting can change.
            </p>

            {editorMode === "rich" ? (
              <RichTextEditor
                initialContent={editorInitialContent}
                onChange={setEditorSnapshot}
                disabled={loading || saving}
                placeholder="Start writing..."
              />
            ) : (
              <textarea
                value={markdownDraft}
                onChange={(event) => setMarkdownDraft(event.target.value)}
                className="w-full min-h-[420px] px-4 py-3 font-mono text-sm bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="Write markdown here..."
                disabled={loading || saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
