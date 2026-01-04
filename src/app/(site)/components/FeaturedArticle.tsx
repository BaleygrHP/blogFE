import { Article } from "@/lib/types";
import Image from "next/image";

interface FeaturedArticleProps {
  article: Article;
  onReadArticle: (slug: string) => void;
}

export function FeaturedArticle({ article, onReadArticle }: FeaturedArticleProps) {
  return (
    <article className="border-b border-border pb-12 mb-12">
      <div className="max-w-3xl">
        {/* Section Label */}
        <div className="section-label text-muted-foreground mb-3">
          {article.section}
        </div>

        {/* Title */}
        <h2 
          onClick={() => onReadArticle(article.slug)}
          className="text-4xl md:text-5xl leading-tight mb-4 cursor-pointer hover:opacity-70 transition-opacity"
        >
          {article.title}
        </h2>

        {/* Meta */}
        <div className="meta mb-6">
          By {article.author} · {article.date}
        </div>

        {/* Excerpt */}
        <p className="text-lg leading-relaxed text-muted-foreground mb-6">
          {article.subtitle}
        </p>

        {/* Read More */}
        <button
          onClick={() => onReadArticle(article.slug)}
          className="meta underline hover:text-foreground transition-colors"
        >
          Continue reading →
        </button>
      </div>

      {/* Optional Cover Image */}
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
