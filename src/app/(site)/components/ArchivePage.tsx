import { useEffect, useMemo, useState } from "react";
import { getArchivePosts } from "@/lib/apiClient";
import { mapPostToArticle } from "@/lib/adapters";
import { PageResponse, PostDto, SectionKey } from "@/lib/types";

interface ArchivePageProps {
  onReadArticle: (id: string) => void;
}

// map label UI -> sectionKey backend
function toSectionKey(sectionLabel: string): SectionKey | undefined {
  if (sectionLabel === "Editorial") return "EDITORIAL";
  if (sectionLabel === "Notes") return "NOTES";
  if (sectionLabel === "Diary") return "DIARY";
  return undefined;
}

// format giống kiểu string date để logic split/includes hoạt động ổn
// Ví dụ: "December 12 2025"  (cố tình không dùng dấu phẩy để split()[1] ra "12")
function formatArchiveDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);

  const month = d.toLocaleString("en-US", { month: "long" }); // December
  const day = String(d.getDate()); // 12
  const year = String(d.getFullYear()); // 2025

  return `${month} ${day} ${year}`;
}

export function ArchivePage({ onReadArticle }: ArchivePageProps) {
  const [filterSection, setFilterSection] = useState<string>("All");
  const [filterYear, setFilterYear] = useState<string>("All");
  const [yearOffset, setYearOffset] = useState(0);

  const currentYear = new Date().getFullYear();
  const sections = ["All", "Editorial", "Notes", "Diary"];
  const yearsNumbers = [
    currentYear - yearOffset,
    currentYear - yearOffset - 1,
    currentYear - yearOffset - 2,
  ];

  const canBack = yearOffset > 0;

  // ====== DATA from API ======
  const [items, setItems] = useState<PostDto[]>([]);

  const selectedYear =
    filterYear === "All" ? new Date().getFullYear() : Number(filterYear);
  const selectedSectionKey =
    filterSection === "All" ? undefined : toSectionKey(filterSection);

  useEffect(() => {
    getArchivePosts(selectedYear, undefined, selectedSectionKey, 0, 500)
      .then((res: PageResponse<PostDto>) => setItems(res.content ?? []))
      .catch(() => setItems([]));
  }, [selectedYear, selectedSectionKey]);

  const allArticles = useMemo(() => {
    return items.map((p) => {
      const a = mapPostToArticle(p, { showCover: false });
      return {
        ...a,
        date: formatArchiveDate(p.publishedAt),
        section:
          p.section === "EDITORIAL"
            ? "Editorial"
            : p.section === "NOTES"
            ? "Notes"
            : p.section === "DIARY"
            ? "Diary"
            : a.section,
      };
    });
  }, [items]);

  // ====== GIỮ NGUYÊN LOGIC FILTER ======
  const filteredArticles = allArticles.filter((article) => {
    const matchesSection =
      filterSection === "All" || article.section === filterSection;
    const matchesYear =
      filterYear === "All" || article.date.includes(filterYear);
    return matchesSection && matchesYear;
  });

  // ====== GIỮ NGUYÊN LOGIC GROUP ======
  const groupedByMonth: { [key: string]: typeof allArticles } = {};
  filteredArticles.forEach((article) => {
    const monthYear = article.date.split(" ").slice(0, 2).join(" ");
    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
    }
    groupedByMonth[monthYear].push(article);
  });
  useEffect(() => {
    if (filterYear !== "All") {
      const y = Number(filterYear);
      if (!yearsNumbers.includes(y)) {
        setFilterYear("All");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearOffset]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Archive</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse all published articles by section and date.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-12 flex flex-wrap gap-6">
        {/* Section Filter */}
        <div>
          <label className="section-label text-muted-foreground mb-3 block">
            Section
          </label>
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setFilterSection(section)}
                className={`px-4 py-2 border transition-colors ${
                  filterSection === section
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <label className="section-label text-muted-foreground mb-3 block">
            Year
          </label>

          <div className="flex gap-2">
            {/* All */}
            <button
              onClick={() => setFilterYear("All")}
              className={`px-4 py-2 border transition-colors ${
                filterYear === "All"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              All
            </button>

            {/* Back */}
            {canBack && (
              <button
                onClick={() => setYearOffset((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-border hover:border-foreground transition-colors"
              >
                Back
              </button>
            )}

            {/* 3 years */}
            {yearsNumbers.map((y) => {
              const year = String(y);
              return (
                <button
                  key={year}
                  onClick={() => setFilterYear(year)}
                  className={`px-4 py-2 border transition-colors ${
                    filterYear === year
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {year}
                </button>
              );
            })}

            {/* More */}
            <button
              onClick={() => setYearOffset((prev) => prev + 1)}
              className="px-4 py-2 border border-border text-muted-foreground hover:border-foreground transition-colors"
            >
              More
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 text-muted-foreground">
        {filteredArticles.length}{" "}
        {filteredArticles.length === 1 ? "article" : "articles"} found
      </div>

      {/* Grouped Articles */}
      <div className="space-y-12">
        {Object.entries(groupedByMonth).map(([monthYear, articles]) => (
          <div key={monthYear}>
            {/* Month Header */}
            <h2 className="text-xl mb-6 pb-2 border-b border-border">
              {monthYear}
            </h2>

            {/* Articles in this month */}
            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article.id} className="flex gap-8 group">
                  {/* Date */}
                  <div className="meta text-muted-foreground w-24 flex-shrink-0">
                    {article.date.split(" ")[1]}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Section */}
                    <div className="section-label text-muted-foreground mb-1">
                      {article.section}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onReadArticle(article.id)}
                      className="text-lg mb-1 cursor-pointer group-hover:opacity-70 transition-opacity"
                    >
                      {article.title}
                    </h3>

                    {/* Author */}
                    <div className="meta text-muted-foreground">
                      {article.author}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No articles found matching these filters.
        </div>
      )}
    </div>
  );
}
