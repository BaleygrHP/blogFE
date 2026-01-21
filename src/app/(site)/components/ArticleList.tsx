"use client";

import type { Article } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ArticleListProps {
  title: string;
  articles: Article[];
  showExcerpt?: boolean;
  showThumbnail?: boolean;
  columns?: 1 | 2 | 3;
  onReadArticle?: (slug: string) => void;
}

export function ArticleList({
  title,
  articles,
  showExcerpt = false,
  showThumbnail = false,
  columns = 1,
  onReadArticle,
}: ArticleListProps) {
  const router = useRouter();
  const handleRead = (slug: string) =>
    onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`);

  const gridClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    }[columns] ?? "grid-cols-1";

  return (
    <section className="mb-16">
      <h3 className="text-2xl mb-8 pb-3 border-b border-border">{title}</h3>

      <div className={`grid ${gridClass} gap-x-12 gap-y-8`}>
        {articles.map((article) => (
          <article key={article.id} className="group">
            {showThumbnail && article.coverImage && (
              <div className="mb-4 overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  width={600}
                  height={360}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
            )}

            <div className="section-label text-muted-foreground mb-2">
              {article.section}
            </div>

            <h4
              onClick={() => handleRead(article.slug)}
              className="text-xl md:text-2xl leading-tight mb-3 cursor-pointer group-hover:opacity-70 transition-opacity"
            >
              {article.title}
            </h4>

            <div className="meta mb-3">
              {article.author} · {article.date}
            </div>

            {showExcerpt && article.subtitle && (
              <p className="text-base leading-relaxed text-muted-foreground mb-3">
                {article.subtitle}
              </p>
            )}

            <button
              onClick={() => handleRead(article.slug)}
              className="meta underline hover:text-foreground transition-colors"
            >
              Read →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
