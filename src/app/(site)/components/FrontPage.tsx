"use client";

import { useEffect, useState } from "react";
import { getFrontPage } from "@/lib/apiClient";
import type { FrontPageResponse } from "@/lib/types";
import { mapPostToArticle } from "@/lib/adapters";
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
  onReadArticle: (slug: string) => void;
};

export function FrontPage({ onReadArticle }: FrontPageProps) {
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

  // Latest: list chung, thường không cần thumbnail (tuỳ UI bạn)
  const latestArticles = data.latest.map((p) =>
    mapPostToArticle(p, { showCover: false })
  );

  // Editorial block: text-first
  const editorialArticles = data.editorialBlock.map((p) =>
    mapPostToArticle(p, { showCover: false })
  );

  // Notes picks
  const notesArticles = data.notesBlock.map((p) =>
    mapPostToArticle(p, { showCover: true })
  );

  // Diary picks: gọn, không cover
  const diaryArticles = data.diaryBlock.map((p) =>
    mapPostToArticle(p, { showCover: false })
  );
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Featured Article */}
      {featuredArticle && (
        <FeaturedArticle article={featuredArticle} onReadArticle={onReadArticle} />
      )}

      {/* Latest */}
      <ArticleList
        title="Mới nhất"
        articles={latestArticles}
        showExcerpt={true}
        columns={2}
        onReadArticle={onReadArticle}
      />

      <ArticleList
        title="Nên đọc"
        articles={editorialArticles} // curate
        showExcerpt={false}
        columns={1}
        onReadArticle={onReadArticle}
      />

      {data.editorialBlock.length > 0 && (
        <ArticleList
          title="Editorial"
          articles={notesArticles}
          showExcerpt={true}
          columns={2}
          onReadArticle={onReadArticle}
        />
      )}

      {/* Notes */}
      <ArticleList
        title="Notes"
        articles={data.notesBlock.map((p) =>
          mapPostToArticle(p, { showCover: true })
        )}
        showExcerpt={true}
        showThumbnail={true}
        columns={3}
        onReadArticle={onReadArticle}
      />

      {/* Diary */}
      {data.diaryBlock.length > 0 && (
        <DiaryList entries={diaryArticles} onReadEntry={onReadArticle} />
      )}
    </div>
  );
}
