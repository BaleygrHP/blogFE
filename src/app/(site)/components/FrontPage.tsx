"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFrontPage } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import type { FrontPageResponse, PostListItem } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";
import { FeaturedArticle } from "./FeaturedArticle";
import { ArticleList } from "./ArticleList";
import { DiaryList } from "./DiaryList";

const EMPTY: FrontPageResponse = {
  featured: null,
  latest: [],
  curated: [],
  editorialBlock: [],
  notesBlock: [],
  diaryBlock: [],
};

type FrontPageProps = {
  onReadArticle?: (slug: string) => void;
};

function dedupeSupportingItems(items: PostListItem[], featuredId?: string | null): PostListItem[] {
  const unique: PostListItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (!item?.id) continue;
    if (featuredId && item.id === featuredId) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }

  return unique;
}

export function FrontPage({ onReadArticle }: FrontPageProps) {
  const router = useRouter();
  const [data, setData] = useState<FrontPageResponse>(EMPTY);

  useEffect(() => {
    getFrontPage()
      .then((res) =>
        setData({
          featured: res.featured ?? null,
          latest: res.latest ?? [],
          curated: res.curated ?? [],
          editorialBlock: res.editorialBlock ?? [],
          notesBlock: res.notesBlock ?? [],
          diaryBlock: res.diaryBlock ?? [],
        })
      )
      .catch(() => setData(EMPTY));
  }, []);

  const featuredArticle = data.featured
    ? mapPostToArticle(data.featured, { showCover: true })
    : null;

  const latestArticles = data.latest.map((post) => mapPostToArticle(post, { showCover: false }));

  const supportingPosts = useMemo(
    () => dedupeSupportingItems(data.curated, data.featured?.id ?? null),
    [data.curated, data.featured?.id]
  );
  const supportingArticles = supportingPosts.map((post) => mapPostToArticle(post, { showCover: false }));

  const editorialArticles = data.editorialBlock.map((post) =>
    mapPostToArticle(post, { showCover: true })
  );

  const notesArticles = data.notesBlock.map((post) => mapPostToArticle(post, { showCover: true }));

  const diaryArticles = data.diaryBlock.map((post) => mapPostToArticle(post, { showCover: false }));

  const handleRead = (slug: string) => {
    if (onReadArticle) return onReadArticle(slug);
    router.push(`/${slug}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {featuredArticle && <FeaturedArticle article={featuredArticle} onReadArticle={handleRead} />}

      <ArticleList
        title={UI_TEXT.frontPage.latest}
        articles={latestArticles}
        showExcerpt
        columns={2}
        onReadArticle={handleRead}
      />

      <ArticleList
        title={UI_TEXT.frontPage.shouldRead}
        articles={supportingArticles}
        showExcerpt={false}
        columns={1}
        onReadArticle={handleRead}
      />

      {editorialArticles.length > 0 && (
        <ArticleList
          title={UI_TEXT.frontPage.editorial}
          articles={editorialArticles}
          showExcerpt
          columns={2}
          onReadArticle={handleRead}
        />
      )}

      <ArticleList
        title={UI_TEXT.frontPage.notes}
        articles={notesArticles}
        showExcerpt
        showThumbnail
        columns={3}
        onReadArticle={handleRead}
      />

      {data.diaryBlock.length > 0 && <DiaryList entries={diaryArticles} onReadEntry={handleRead} />}
    </div>
  );
}
