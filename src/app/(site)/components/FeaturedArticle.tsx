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
          className="text-4xl md:text-5xl leading-tight mb-4 cursor-pointer hover:opacity-70 transition-opacity"
        >
          {article.title}
        </h2>

        <div className="meta mb-6">By {article.author} · {article.date}</div>

        {article.subtitle ? (
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">{article.subtitle}</p>
        ) : null}

        <button
          onClick={() => handleRead(article.slug)}
          className="meta underline hover:text-foreground transition-colors"
        >
          Continue reading →
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
