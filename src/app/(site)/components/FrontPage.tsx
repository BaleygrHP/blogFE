// src/app/(site)/components/FrontPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getFrontPage } from "@/lib/apiClient";
import type { FrontPageResponse } from "@/lib/types";
import { mapPostToArticle } from "@/lib/adapters";
// ✅ giữ nguyên các component UI của bạn
import { FeaturedArticle } from "./FeaturedArticle";
import { ArticleList } from "./ArticleList";
import { DiaryList } from "./DiaryList";

const EMPTY: FrontPageResponse = {
  featured: null,
  latest: [],
  editorial: [],
  notes: [],
  diary: [],
};
const noopRead = (_id: number) => {};

export default function FrontPage() {
  const [data, setData] = useState<FrontPageResponse>(EMPTY);

  useEffect(() => {
    getFrontPage()
      .then((res) =>
        setData({
          featured: res.featured,
          latest: res.latest ?? [],
          editorial: res.editorial ?? [],
          notes: res.notes ?? [],
          diary: res.diary ?? [],
        })
      )
      .catch(() => setData(EMPTY));
  }, []);

  const noopRead = (_id: number) => {};

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Featured Article */}
      {data.featured && (
      <FeaturedArticle
        article={mapPostToArticle(data.featured)}
        onReadArticle={noopRead}
      />
      )}


      <ArticleList
        title="Latest"
        articles={data.latest.map(mapPostToArticle)}
        onReadArticle={noopRead}
      />

      <ArticleList
        title="Editorial Picks"
        articles={data.editorial.map(mapPostToArticle)}
        onReadArticle={noopRead}
      />

      <ArticleList
        title="Notes"
        articles={data.notes.map(mapPostToArticle)}
        onReadArticle={noopRead}
      />
      {data.diary.length > 0 && (
        <DiaryList
          entries={data.diary.map(mapPostToArticle)}
          onReadEntry={noopRead}
        />
      )}

      <DiaryList
        entries={data.diary.map(mapPostToArticle)}
        onReadEntry={noopRead}
      />
    </div>
  );
}
