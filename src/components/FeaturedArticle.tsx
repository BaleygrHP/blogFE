interface Article {
  id: number;
  section: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  coverImage?: string;
}

interface FeaturedArticleProps {
  article: Article;
  onReadArticle: (id: number) => void;
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
          onClick={() => onReadArticle(article.id)}
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
          {article.excerpt}
        </p>

        {/* Read More */}
        <button
          onClick={() => onReadArticle(article.id)}
          className="meta underline hover:text-foreground transition-colors"
        >
          Continue reading →
        </button>
      </div>

      {/* Optional Cover Image */}
      {article.coverImage && (
        <div className="mt-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-w-4xl"
          />
        </div>
      )}
    </article>
  );
}
