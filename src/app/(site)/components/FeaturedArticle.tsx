"use client";

import type { Article } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FeaturedArticleProps {
  article: Article;
  onReadArticle?: (slug: string) => void;
}

export function FeaturedArticle({ article, onReadArticle }: FeaturedArticleProps) {
  const router = useRouter();
  const handleRead = (slug: string) =>
    onReadArticle ? onReadArticle(slug) : router.push(`/${slug}`);

  return (
    <article className="border-b border-border pb-12 mb-12">
      <div className="max-w-3xl">
        <div className="section-label text-muted-foreground mb-3">{article.section}</div>

        <h2
          onClick={() => handleRead(article.slug)}
          className="mb-4 cursor-pointer hover:opacity-70 transition-opacity font-[var(--font-ui)] text-[clamp(2.125rem,1.8rem+1.25vw,2.5rem)] leading-[1.15] font-bold tracking-[-0.01em]"
        >
          {article.title}
        </h2>

        <div className="meta mb-6">
          Bởi {article.author} · {article.date}
        </div>

        {article.subtitle ? (
          <p className="mb-6 font-[var(--font-body)] text-[clamp(1rem,0.96rem+0.25vw,1.0625rem)] leading-[1.75] tracking-[0.01em] text-muted-foreground">{article.subtitle}</p>
        ) : null}

        <button
          onClick={() => handleRead(article.slug)}
          className="meta underline hover:text-foreground transition-colors"
        >
          Tiếp tục đọc →
        </button>
      </div>

      {article.coverImage && (
        <div className="mt-8">
          <Image
            src={article.coverImage}
            alt={article.title}
            width={1920}
            height={1080}
            className="w-full max-w-4xl"
          />
        </div>
      )}
    </article>
  );
}
