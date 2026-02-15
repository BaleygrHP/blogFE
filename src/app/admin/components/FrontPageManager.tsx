"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GripVertical,
  Layout,
  Plus,
  Search,
  Star,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addCuratedPost,
  deleteFrontPageItem,
  getAdminPosts,
  getFrontPageComposition,
  removeFeaturedPost,
  reorderFrontPageItems,
  setFeaturedPost,
  type AdminPostDto,
  type FrontPageCompositionDto,
  type FrontPageSupportingItemDto,
} from "@/lib/adminApiClient";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SUPPORTING_MAX_ITEMS = 6;
const PICKER_PAGE_SIZE = 12;

interface FrontPageManagerProps {
  onNavigate?: (page: string) => void;
}

type BannerState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

function normalizeKey(value?: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function sectionLabelFromPost(post: AdminPostDto): string {
  return String(post.section ?? "").trim();
}

function toPreviewFromPost(post: AdminPostDto) {
  const section = sectionLabelFromPost(post);
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    section: {
      id: "",
      key: normalizeKey(section),
      name: section || "Unknown",
    },
  };
}

function normalizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown error";
  const raw = error.message || "Unknown error";
  const marker = ": {";
  const idx = raw.indexOf(marker);
  if (idx > -1) {
    const jsonPart = raw.substring(idx + 2);
    try {
      const parsed = JSON.parse(jsonPart) as { message?: string };
      if (parsed?.message) return parsed.message;
    } catch {
      // ignore parse errors
    }
  }
  return raw;
}

function isConflictError(error: unknown): boolean {
  const msg = normalizeErrorMessage(error).toLowerCase();
  return msg.includes("409") || msg.includes("conflict") || msg.includes("stale");
}

function cloneComposition(data: FrontPageCompositionDto): FrontPageCompositionDto {
  return JSON.parse(JSON.stringify(data)) as FrontPageCompositionDto;
}

type SortableSupportingRowProps = {
  item: FrontPageSupportingItemDto;
  index: number;
  disabled: boolean;
  onRemove: (item: FrontPageSupportingItemDto) => void;
};

function SortableSupportingRow({ item, index, disabled, onRemove }: SortableSupportingRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const sectionName = item.post?.section?.name || item.post?.section?.key || "-";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[48px_1fr_160px_90px] items-center gap-3 p-3 border border-border bg-card"
    >
      <button
        type="button"
        className="flex items-center justify-center p-2 border border-border hover:border-foreground disabled:opacity-40"
        disabled={disabled}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div>
        <div className="font-medium">{item.post?.title || "Untitled"}</div>
        <div className="meta text-muted-foreground text-xs">{item.post?.slug || "-"}</div>
      </div>
      <div className="meta text-muted-foreground">{sectionName}</div>
      <button
        type="button"
        onClick={() => onRemove(item)}
        className="inline-flex items-center justify-center gap-1 px-2 py-1 border border-border hover:border-destructive hover:text-destructive"
        disabled={disabled}
      >
        <X className="w-4 h-4" />
        Remove
      </button>
      <div className="meta text-muted-foreground text-xs col-span-4">#{index + 1}</div>
    </div>
  );
}

export function FrontPageManager({ onNavigate }: FrontPageManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);

  const [composition, setComposition] = useState<FrontPageCompositionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerPage, setPickerPage] = useState(0);
  const [pickerTotalPages, setPickerTotalPages] = useState(1);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerPosts, setPickerPosts] = useState<AdminPostDto[]>([]);
  const [pendingAddPostIds, setPendingAddPostIds] = useState<string[]>([]);
  const [pickerBanner, setPickerBanner] = useState<BannerState>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const featuredPostId = composition?.featured?.id ?? null;
  const supportingItems = composition?.items ?? [];
  const supportingIds = useMemo(
    () => new Set((composition?.items ?? []).map((item) => item.postId)),
    [composition]
  );
  const pendingAddSet = useMemo(() => new Set(pendingAddPostIds), [pendingAddPostIds]);

  const loadComposition = async () => {
    const data = await getFrontPageComposition();
    setComposition({
      ...data,
      status: "SAVED",
      items: (data.items || []).sort((a, b) => a.position - b.position),
    });
  };

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        setLoading(true);
        const data = await getFrontPageComposition();
        if (!cancelled) {
          setComposition({
            ...data,
            status: "SAVED",
            items: (data.items || []).sort((a, b) => a.position - b.position),
          });
        }
      } catch (error) {
        console.error("Failed to load front-page composition:", error);
        if (!cancelled) {
          setBanner({ type: "error", message: normalizeErrorMessage(error) });
          alert("Could not load front page composition.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isPickerOpen) return;

    const handle = setTimeout(async () => {
      try {
        setPickerLoading(true);
        const res = await getAdminPosts({
          status: "published",
          q: pickerQuery.trim() || undefined,
          page: pickerPage,
          size: PICKER_PAGE_SIZE,
        });

        setPickerTotalPages(Math.max(1, res.totalPages));
        setPickerPosts((prev) => (pickerPage === 0 ? res.content : [...prev, ...res.content]));
      } catch (error) {
        console.error("Failed to load story picker posts:", error);
        const msg = normalizeErrorMessage(error);
        setBanner({ type: "error", message: msg });
      } finally {
        setPickerLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [isPickerOpen, pickerQuery, pickerPage]);

  const runMutation = async (
    optimisticUpdater: (current: FrontPageCompositionDto) => FrontPageCompositionDto,
    apiCall: (version: number) => Promise<unknown>,
    successMessage: string
  ) => {
    if (!composition) return;
    const before = cloneComposition(composition);
    const optimistic = optimisticUpdater(cloneComposition(composition));
    const expectedVersion = composition.version;

    setComposition(optimistic);
    setSaving(true);
    setBanner(null);

    try {
      await apiCall(expectedVersion);
      await loadComposition();
      setBanner({ type: "success", message: successMessage });
    } catch (error) {
      console.error("Front-page mutation failed:", error);
      setComposition(before);
      if (isConflictError(error)) {
        try {
          await loadComposition();
        } catch {
          // ignore refresh failures
        }
        setBanner({ type: "error", message: "Layout changed elsewhere. Data has been refreshed." });
      } else {
        const msg = normalizeErrorMessage(error);
        setBanner({ type: "error", message: msg });
        if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
          alert(msg);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSetLead = async (post: AdminPostDto) => {
    if (!composition) return;
    await runMutation(
      (current) => ({
        ...current,
        featured: toPreviewFromPost(post),
        items: current.items
          .filter((item) => item.postId !== post.id)
          .map((item, idx) => ({ ...item, position: idx + 1 })),
      }),
      (version) => setFeaturedPost(post.id, version),
      "Lead updated"
    );
  };

  const handleRemoveLead = async () => {
    if (!composition) return;
    await runMutation(
      (current) => ({
        ...current,
        featured: null,
      }),
      (version) => removeFeaturedPost(version),
      "Lead removed"
    );
  };

  const handleAddSupporting = async (post: AdminPostDto) => {
    if (!composition) return;
    if (composition.items.length >= SUPPORTING_MAX_ITEMS) {
      setPickerBanner({ type: "error", message: `Supporting stories max is ${SUPPORTING_MAX_ITEMS}` });
      return;
    }
    if (featuredPostId === post.id) {
      setPickerBanner({ type: "info", message: "Current lead cannot be added to supporting." });
      return;
    }
    if (supportingIds.has(post.id)) return;
    if (pendingAddSet.has(post.id)) return;
    setPickerBanner(null);

    setPendingAddPostIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));

    const optimisticItem: FrontPageSupportingItemDto = {
      id: -Date.now(),
      postId: post.id,
      position: composition.items.length + 1,
      active: true,
      pinned: false,
      startAt: null,
      endAt: null,
      note: null,
      post: toPreviewFromPost(post),
    };

    try {
      await runMutation(
        (current) => ({
          ...current,
          items: [...current.items, optimisticItem].map((item, idx) => ({ ...item, position: idx + 1 })),
        }),
        (version) =>
          addCuratedPost(
            {
              postId: post.id,
              position: composition.items.length + 1,
              active: true,
            },
            version
          ),
        "Added to supporting"
      );
    } finally {
      setPendingAddPostIds((prev) => prev.filter((id) => id !== post.id));
    }
  };

  const handleRemoveSupporting = async (item: FrontPageSupportingItemDto) => {
    if (!composition) return;
    await runMutation(
      (current) => ({
        ...current,
        items: current.items
          .filter((x) => x.id !== item.id)
          .map((x, idx) => ({ ...x, position: idx + 1 })),
      }),
      (version) => deleteFrontPageItem(item.id, version),
      "Supporting story removed"
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!composition) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = composition.items.findIndex((item) => item.id === Number(active.id));
    const newIndex = composition.items.findIndex((item) => item.id === Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(composition.items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));
    const orderedIds = reordered.map((item) => item.id);

    await runMutation(
      (current) => ({ ...current, items: reordered }),
      (version) => reorderFrontPageItems(orderedIds, version),
      "Order updated"
    );
  };

  const openPicker = () => {
    setPickerQuery("");
    setPickerPage(0);
    setPickerTotalPages(1);
    setPickerPosts([]);
    setPendingAddPostIds([]);
    setPickerBanner(null);
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    setPickerQuery("");
    setPickerPage(0);
    setPickerTotalPages(1);
    setPickerPosts([]);
    setPendingAddPostIds([]);
    setPickerBanner(null);
  };

  const lastUpdated = composition?.updatedAt || "-";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => nav("dashboard")}
              className="flex items-center gap-2 meta hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-medium">Front Page Composition</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="meta text-muted-foreground">Status: {composition?.status || "..."}</span>
            <span className="meta text-muted-foreground">Last updated: {lastUpdated}</span>
            <button
              type="button"
              onClick={() => window.open("/", "_blank")}
              className="px-3 py-2 border border-border hover:border-foreground transition-colors text-sm"
            >
              Preview Front Page
            </button>
            <button
              type="button"
              onClick={() => setBanner({ type: "info", message: "Publish Layout is not enabled yet." })}
              className="px-3 py-2 bg-foreground text-background hover:opacity-90 transition-opacity text-sm"
            >
              Publish Layout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {banner && (
          <div
            className={`p-3 border ${
              banner.type === "success"
                ? "border-green-600 text-green-700 bg-green-50"
                : banner.type === "info"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-destructive text-destructive bg-destructive/10"
            }`}
          >
            {banner.message}
          </div>
        )}

        <section className="border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Lead Story
            </h2>
            {composition?.featured && (
              <button
                type="button"
                onClick={openPicker}
                disabled={loading || saving}
                className="px-3 py-1 border border-border hover:border-foreground transition-colors text-sm disabled:opacity-40"
              >
                Replace
              </button>
            )}
          </div>

          {!composition?.featured ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No lead story selected.</p>
              <button
                type="button"
                onClick={openPicker}
                disabled={loading || saving}
                className="px-4 py-2 border border-border hover:border-foreground transition-colors disabled:opacity-40"
              >
                Select Lead Story
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              <div className="meta text-muted-foreground">Current Lead</div>
              <div className="text-xl font-medium">{composition.featured.title}</div>
              <div className="meta text-muted-foreground">{composition.featured.section?.name || "-"}</div>
              <div className="meta text-muted-foreground">Slug: {composition.featured.slug}</div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.open(`/${composition.featured?.slug || ""}`, "_blank")}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-border hover:border-foreground transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLead}
                  disabled={loading || saving}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-border hover:border-destructive hover:text-destructive transition-colors text-sm disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-medium flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Supporting Stories
            </h2>
            <button
              type="button"
              onClick={openPicker}
              disabled={loading || saving || supportingItems.length >= SUPPORTING_MAX_ITEMS}
              className="inline-flex items-center gap-2 px-3 py-1 border border-border hover:border-foreground transition-colors text-sm disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Add Story
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-muted-foreground">Loading...</div>
          ) : supportingItems.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No supporting stories yet.</div>
          ) : (
            <div className="p-4 space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={supportingItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {supportingItems.map((item, index) => (
                    <SortableSupportingRow
                      key={item.id}
                      item={item}
                      index={index}
                      disabled={saving}
                      onRemove={handleRemoveSupporting}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="meta text-muted-foreground">
                Drag handle to reorder. {supportingItems.length}/{SUPPORTING_MAX_ITEMS}
              </div>
            </div>
          )}
        </section>
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 bg-background/70 z-40 flex items-start justify-center p-6">
          <div
            className="w-full max-w-3xl h-[90vh] bg-card border border-border flex flex-col overflow-hidden"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "90vh",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border" style={{ flexShrink: 0 }}>
              <h3 className="font-medium">Add Story</h3>
              <button onClick={closePicker} className="p-2 hover:bg-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border" style={{ flexShrink: 0 }}>
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="text"
                  value={pickerQuery}
                  onChange={(e) => {
                    setPickerQuery(e.target.value);
                    setPickerPage(0);
                  }}
                  placeholder="Search published posts..."
                  className="w-full h-11 pl-12 pr-3 border border-border bg-background leading-5"
                  style={{ paddingLeft: 44, paddingRight: 12 }}
                />
              </div>
            </div>

            {pickerBanner && (
              <div
                className={`px-4 py-2 border-b ${
                  pickerBanner.type === "success"
                    ? "border-green-600 text-green-700 bg-green-50"
                    : pickerBanner.type === "info"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-destructive text-destructive bg-destructive/10"
                }`}
                style={{ flexShrink: 0 }}
              >
                {pickerBanner.message}
              </div>
            )}

            <div
              className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
              style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
            >
              {pickerPosts.map((post) => {
                const isLead = featuredPostId === post.id;
                const isAdded = supportingIds.has(post.id);
                const isPendingAdd = pendingAddSet.has(post.id);
                return (
                  <div key={post.id} className="border border-border p-3">
                    <div className="font-medium mb-1">{post.title}</div>
                    <div className="meta text-muted-foreground mb-3">
                      {sectionLabelFromPost(post)} • {post.publishedAt || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetLead(post)}
                        disabled={saving || isLead}
                        className="px-3 py-1 bg-foreground text-background text-sm disabled:opacity-40"
                      >
                        {isLead ? "Current Lead ✓" : "Make Lead"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSupporting(post)}
                        disabled={saving || isAdded || isPendingAdd || supportingItems.length >= SUPPORTING_MAX_ITEMS}
                        className="px-3 py-1 border border-border hover:border-foreground text-sm disabled:opacity-40"
                      >
                        {isPendingAdd ? "Adding..." : isAdded ? "Added ✓" : "Add to Supporting"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {pickerLoading && <div className="meta text-muted-foreground">Loading...</div>}
              {!pickerLoading && pickerPosts.length === 0 && (
                <div className="meta text-muted-foreground">No published posts found.</div>
              )}
            </div>

            <div
              className="p-4 border-t border-border flex items-center justify-between shrink-0"
              style={{ flexShrink: 0 }}
            >
              <button
                type="button"
                onClick={() => setPickerPage((p) => p + 1)}
                disabled={pickerLoading || pickerPage + 1 >= pickerTotalPages}
                className="px-3 py-1 border border-border hover:border-foreground text-sm disabled:opacity-40"
              >
                Load more
              </button>
              <div className="meta text-muted-foreground">
                Page {pickerPage + 1}/{pickerTotalPages}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
