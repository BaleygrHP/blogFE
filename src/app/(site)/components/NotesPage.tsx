"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ArticleList } from "./ArticleList";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { type PageResponse, type PostDto } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";

interface NotesPageProps {
  onReadArticle?: (slug: string) => void;
}

export function NotesPage({ onReadArticle }: NotesPageProps) {
  const router = useRouter();
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(targetPage: number, append: boolean) {
    if (append) setLoading(true);
    const res = (await getContentPosts("NOTES", targetPage, 20)) as PageResponse<PostDto>;
    setItems((prev) => (append ? [...prev, ...(res.content ?? [])] : res.content ?? []));
    setPage(res.number ?? targetPage);
    setTotalPages(res.totalPages ?? 1);
    setLoading(false);
  }

  useEffect(() => {
    setTimeout(() => load(0, false), 0);
  }, []);

  const articles = useMemo(
    () => items.map((post) => mapPostToArticle(post, { showCover: true })),
    [items]
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <PageHeader
        title="Ghi chú"
        description="Các bài viết dài hơn về công cụ, kỹ thuật và thực hành."
      />

      <ArticleList
        title=""
        articles={articles}
        showExcerpt
        showThumbnail
        columns={2}
        onReadArticle={(slug) => (onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`))}
      />

      <div className="mt-8">
        {page + 1 < totalPages ? (
          <button disabled={loading} onClick={() => load(page + 1, true)} className="meta underline">
            {loading ? UI_TEXT.common.loading : UI_TEXT.common.loadMore}
          </button>
        ) : (
          <p className="meta text-muted-foreground">{UI_TEXT.common.end}</p>
        )}
      </div>
    </div>
  );
}
