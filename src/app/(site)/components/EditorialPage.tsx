"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { ArticleList } from "./ArticleList";
import { SECTION, type PageResponse, type PostDto } from "@/lib/types";
import { getContentPosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { useRouter } from "next/navigation";



interface EditorialPageProps {
  onReadArticle?: (slug: string) => void;
}

export function EditorialPage({ onReadArticle }: EditorialPageProps) {
  const router = useRouter();
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(p: number, append: boolean) {
    setLoading(true);
    setErr(null);
    try {
      const res = (await getContentPosts(SECTION.EDITORIAL.key, p, 20)) as PageResponse<PostDto>;
      setTotalPages(res.totalPages ?? 1);
      setPage(res.number ?? p);
      setItems(prev => (append ? [...prev, ...(res.content || [])] : (res.content || [])));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e : any) {
      setErr(e?.message || "Failed to load Editorial");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0, false);
  }, []);

  // const articles = useMemo(() => items.map(mapPostToArticle()), [items]);
  const canLoadMore = page + 1 < totalPages;
  const editorialArticles = items.map((p) =>
    mapPostToArticle(p, { showCover: false })
  );

  const handleRead = (slug: string) => {
    if (onReadArticle) return onReadArticle(slug);
    router.push(`/${slug}`);
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <PageHeader
        title="Editorial"
        description="Opinion pieces and commentary on technology, design, and modern work. These are perspectives, not instructions—take what resonates, leave what doesn't."
      />

      <ArticleList
        title=""
        articles={editorialArticles}
        showExcerpt={true}
        showThumbnail={false}
        columns={1}
        onReadArticle={handleRead}
      />

      {err ? <p className="text-sm text-muted-foreground mt-6">{err}</p> : null}

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
