"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { PageResponse, PostDto } from "@/lib/types";


interface DiaryPageProps {
  onReadArticle?: (slug: string) => void; // ✅ optional (URL routing)
}

export function DiaryPage({ onReadArticle }: DiaryPageProps) {
  const router = useRouter();
  const handleRead = (slug: string) =>
    onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`);
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p: number, append: boolean) {
    if (append) setLoading(true);
    try {
      const res = (await getContentPosts("DIARY", p, 30)) as PageResponse<PostDto>;
      setItems((prev) => (append ? [...prev, ...(res.content ?? [])] : (res.content ?? [])));
      setPage(res.number ?? p);
      setTotalPages(res.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => load(0, false), 0);
  }, []);

  const entries = useMemo(
    () => items.map((p) => mapPostToArticle(p, { showCover: false })),
    [items]
  );

  const canLoadMore = page + 1 < totalPages;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <PageHeader
        title="Diary"
        description="Brief, personal entries. Thoughts in progress, half-formed ideas, and quiet observations."
      />

      {/* Minimal List */}
      <div className="space-y-8">
        {entries.map((entry) => (
          <article key={entry.id} className="pb-8 border-b border-border last:border-0">
            {/* Date */}
            <div className="meta text-muted-foreground mb-2">
              {entry.date}
            </div>

            {/* Title */}
            <h3
              onClick={() => handleRead(entry.slug)}
              className="text-xl mb-3 cursor-pointer hover:opacity-70 transition-opacity"
            >
              {entry.title}
            </h3>

            {/* Brief excerpt */}
            {entry.subtitle && (
              <p className="text-muted-foreground leading-relaxed mb-3">
                {entry.subtitle}
              </p>
            )}

            {/* Read link */}
            <button
              onClick={() => handleRead(entry.slug)}
              className="meta underline hover:text-foreground transition-colors"
            >
              Read entry →
            </button>
          </article>
        ))}
      </div>
      <div className="mt-8">
        {canLoadMore ? (
          <button
            disabled={loading}
            onClick={() => load(page + 1, true)}
            className="meta underline disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more →"}
          </button>
        ) : (
          <p className="meta text-muted-foreground">End.</p>
        )}
      </div>
    </div>
  );
}
