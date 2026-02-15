"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ArticleList } from "./ArticleList";
import { getContentPosts } from "@/lib/apiClient";

import { PageResponse, PostDto, SECTION } from "@/lib/types";
import { mapPostToArticle } from "@/lib/adapters";


interface NotesPageProps {
  onReadArticle?: (slug: string) => void;
}

export function NotesPage({ onReadArticle }: NotesPageProps) {
  const router = useRouter();
  const [items, setItems] = useState<PostDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p: number, append: boolean) {
    if (append) setLoading(true);
    const res = (await getContentPosts("NOTES", p, 20)) as PageResponse<PostDto>;

    setItems(prev =>
      append ? [...prev, ...res.content] : res.content
    );
    setPage(res.number);
    setTotalPages(res.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    setTimeout(() => load(0, false), 0);
  }, []);

  const articles = useMemo(
    () =>
      items.map(post =>
        mapPostToArticle(post, {
          sectionLabel: SECTION.NOTES.key,
          showCover: true, // ✅ Notes có thumbnail optional
        })
      ),
    [items]
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <PageHeader
        title={SECTION.NOTES.key}
        description="Longer-form pieces on tools, techniques, and practices. 
          More exploratory than editorial, more structured than diary."
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
          <button
            disabled={loading}
            onClick={() => load(page + 1, true)}
            className="meta underline"
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
