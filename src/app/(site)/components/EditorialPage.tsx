"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ArticleList } from "./ArticleList";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { SECTION, type PageResponse, type PostDto } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";

interface EditorialPageProps {
  onReadArticle?: (slug: string) => void;
}

export function EditorialPage({ onReadArticle }: EditorialPageProps) {
  const router = useRouter();
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function load(targetPage: number, append: boolean) {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = (await getContentPosts(SECTION.EDITORIAL.key, targetPage, 20)) as PageResponse<PostDto>;
      setTotalPages(res.totalPages ?? 1);
      setPage(res.number ?? targetPage);
      setItems((prev) => (append ? [...prev, ...(res.content ?? [])] : res.content ?? []));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể tải chuyên mục biên tập.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0, false);
  }, []);

  const editorialArticles = items.map((post) => mapPostToArticle(post, { showCover: false }));
  const canLoadMore = page + 1 < totalPages;

  const handleRead = (slug: string) => {
    if (onReadArticle) return onReadArticle(slug);
    router.push(`/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <PageHeader
        title="Biên tập"
        description="Những bài viết góc nhìn về công nghệ, thiết kế và cách làm việc hiện đại."
      />

      <ArticleList
        title=""
        articles={editorialArticles}
        showExcerpt
        showThumbnail={false}
        columns={1}
        onReadArticle={handleRead}
      />

      {errorMessage ? <p className="text-sm text-muted-foreground mt-6">{errorMessage}</p> : null}

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
