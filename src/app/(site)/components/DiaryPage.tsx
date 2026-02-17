"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { type PageResponse, type PostDto } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";

interface DiaryPageProps {
  onReadArticle?: (slug: string) => void;
}

export function DiaryPage({ onReadArticle }: DiaryPageProps) {
  const router = useRouter();
  const handleRead = (slug: string) =>
    onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`);

  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(targetPage: number, append: boolean) {
    if (append) setLoading(true);
    try {
      const res = (await getContentPosts("DIARY", targetPage, 30)) as PageResponse<PostDto>;
      setItems((prev) => (append ? [...prev, ...(res.content ?? [])] : res.content ?? []));
      setPage(res.number ?? targetPage);
      setTotalPages(res.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => load(0, false), 0);
  }, []);

  const entries = useMemo(
    () => items.map((post) => mapPostToArticle(post, { showCover: false })),
    [items]
  );
  const canLoadMore = page + 1 < totalPages;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <PageHeader
        title="Nhật ký"
        description="Những ghi chép ngắn, riêng tư và đang trong quá trình hình thành."
      />

      <div className="space-y-8">
        {entries.map((entry) => (
          <article key={entry.id} className="pb-8 border-b border-border last:border-0">
            <div className="meta text-muted-foreground mb-2">{entry.date}</div>

            <h3
              onClick={() => handleRead(entry.slug)}
              className="text-xl mb-3 cursor-pointer hover:opacity-70 transition-opacity"
            >
              {entry.title}
            </h3>

            {entry.subtitle && <p className="text-muted-foreground leading-relaxed mb-3">{entry.subtitle}</p>}

            <button
              onClick={() => handleRead(entry.slug)}
              className="meta underline hover:text-foreground transition-colors"
            >
              Đọc bài →
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
            {loading ? UI_TEXT.common.loading : UI_TEXT.common.loadMore}
          </button>
        ) : (
          <p className="meta text-muted-foreground">{UI_TEXT.common.end}</p>
        )}
      </div>
    </div>
  );
}
