"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "./PageHeader";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { PageResponse, PostDto } from "@/lib/types";


interface DiaryPageProps {
  onReadArticle: (slug: string) => void; // ✅ đổi sang string
}

export function DiaryPage({ onReadArticle }: DiaryPageProps) {
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function load(p: number, append: boolean) {
    setLoading(true);
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
    load(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              onClick={() => onReadArticle(entry.slug)}
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
              onClick={() => onReadArticle(entry.slug)}
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
