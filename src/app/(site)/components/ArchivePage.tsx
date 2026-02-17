"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getArchivePosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { type PageResponse, type PostDto, type SectionKey } from "@/lib/types";
import { ALL_FILTER_VALUE, UI_TEXT } from "@/lib/i18n";

interface ArchivePageProps {
  onReadArticle?: (slug: string) => void;
}

type ArchiveItem = ReturnType<typeof mapPostToArticle> & {
  sectionKey: string;
  dayLabel: string;
  monthYearLabel: string;
  year: string;
};

function toSectionKey(filterValue: string): SectionKey | undefined {
  if (filterValue === ALL_FILTER_VALUE) return undefined;
  if (filterValue === "EDITORIAL") return "EDITORIAL";
  if (filterValue === "NOTES") return "NOTES";
  if (filterValue === "DIARY") return "DIARY";
  return undefined;
}

function mapToArchiveItem(post: PostDto): ArchiveItem {
  const article = mapPostToArticle(post, { showCover: false });
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const dayLabel = date ? String(date.getDate()).padStart(2, "0") : "--";
  const monthYearLabel = date
    ? `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
    : "Không rõ thời gian";
  const year = date ? String(date.getFullYear()) : "";

  return {
    ...article,
    section: String(post.section ?? "").trim() || article.section,
    sectionKey: String(post.section ?? "").trim(),
    date: date ? date.toLocaleDateString("vi-VN") : "",
    dayLabel,
    monthYearLabel,
    year,
  };
}

export function ArchivePage({ onReadArticle }: ArchivePageProps) {
  const router = useRouter();
  const handleRead = (slug: string) =>
    onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`);

  const [filterSection, setFilterSection] = useState<string>(ALL_FILTER_VALUE);
  const [filterYear, setFilterYear] = useState<string>(ALL_FILTER_VALUE);
  const [yearOffset, setYearOffset] = useState(0);
  const [items, setItems] = useState<PostDto[]>([]);

  const currentYear = new Date().getFullYear();
  const sectionFilters = [ALL_FILTER_VALUE, "EDITORIAL", "NOTES", "DIARY"];
  const yearsNumbers = [currentYear - yearOffset, currentYear - yearOffset - 1, currentYear - yearOffset - 2];
  const canBack = yearOffset > 0;

  const selectedYear = filterYear === ALL_FILTER_VALUE ? currentYear : Number(filterYear);
  const selectedSectionKey = toSectionKey(filterSection);

  useEffect(() => {
    getArchivePosts(selectedYear, undefined, selectedSectionKey, 0, 500)
      .then((res: PageResponse<PostDto>) => setItems(res.content ?? []))
      .catch(() => setItems([]));
  }, [selectedYear, selectedSectionKey]);

  const allArticles = useMemo(() => items.map(mapToArchiveItem), [items]);

  const filteredArticles = useMemo(
    () =>
      allArticles.filter((article) => {
        const matchesSection =
          filterSection === ALL_FILTER_VALUE || article.sectionKey === filterSection;
        const matchesYear = filterYear === ALL_FILTER_VALUE || article.year === filterYear;
        return matchesSection && matchesYear;
      }),
    [allArticles, filterSection, filterYear]
  );

  const groupedByMonth: Record<string, ArchiveItem[]> = {};
  for (const article of filteredArticles) {
    if (!groupedByMonth[article.monthYearLabel]) {
      groupedByMonth[article.monthYearLabel] = [];
    }
    groupedByMonth[article.monthYearLabel].push(article);
  }

  useEffect(() => {
    if (filterYear !== ALL_FILTER_VALUE) {
      const yearAsNumber = Number(filterYear);
      if (!yearsNumbers.includes(yearAsNumber)) {
        setFilterYear(ALL_FILTER_VALUE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearOffset]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Lưu trữ</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Duyệt các bài đã xuất bản theo chuyên mục và thời gian.
        </p>
      </header>

      <div className="mb-12 flex flex-wrap gap-6">
        <div>
          <label className="section-label text-muted-foreground mb-3 block">Chuyên mục</label>
          <div className="flex gap-2">
            {sectionFilters.map((section) => (
              <button
                key={section}
                onClick={() => setFilterSection(section)}
                className={`px-4 py-2 border transition-colors ${
                  filterSection === section
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {section === ALL_FILTER_VALUE ? UI_TEXT.filter.all : section}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="section-label text-muted-foreground mb-3 block">Năm</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterYear(ALL_FILTER_VALUE)}
              className={`px-4 py-2 border transition-colors ${
                filterYear === ALL_FILTER_VALUE
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              {UI_TEXT.filter.all}
            </button>

            {canBack && (
              <button
                onClick={() => setYearOffset((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-border hover:border-foreground transition-colors"
              >
                Back
              </button>
            )}

            {yearsNumbers.map((year) => {
              const value = String(year);
              return (
                <button
                  key={value}
                  onClick={() => setFilterYear(value)}
                  className={`px-4 py-2 border transition-colors ${
                    filterYear === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {value}
                </button>
              );
            })}

            <button
              onClick={() => setYearOffset((prev) => prev + 1)}
              className="px-4 py-2 border border-border text-muted-foreground hover:border-foreground transition-colors"
            >
              More
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 text-muted-foreground">
        {filteredArticles.length} {filteredArticles.length === 1 ? "bài viết" : "bài viết"}
      </div>

      <div className="space-y-12">
        {Object.entries(groupedByMonth).map(([monthYear, articles]) => (
          <div key={monthYear}>
            <h2 className="text-xl mb-6 pb-2 border-b border-border">{monthYear}</h2>

            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article.id} className="flex gap-8 group">
                  <div className="meta text-muted-foreground w-24 flex-shrink-0">{article.dayLabel}</div>

                  <div className="flex-1">
                    <div className="section-label text-muted-foreground mb-1">{article.section}</div>

                    <h3
                      onClick={() => handleRead(article.slug)}
                      className="text-lg mb-1 cursor-pointer group-hover:opacity-70 transition-opacity"
                    >
                      {article.title}
                    </h3>

                    <div className="meta text-muted-foreground">{article.author}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Không có bài viết nào phù hợp với bộ lọc hiện tại.
        </div>
      )}
    </div>
  );
}
