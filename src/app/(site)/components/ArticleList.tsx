import Image from "next/image";

interface Article {
  id: number;
  section: string;
  title: string;
  excerpt?: string;
  author: string;
  date: string;
  thumbnail?: string;
}

interface ArticleListProps {
  title: string;
  articles: Article[];
  showExcerpt?: boolean;
  showThumbnail?: boolean;
  columns?: 1 | 2 | 3;
  onReadArticle: (id: number) => void;
}

export function ArticleList({ 
  title, 
  articles, 
  showExcerpt = false,
  showThumbnail = false,
  columns = 1,
  onReadArticle 
}: ArticleListProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }[columns];

  return (
    <section className="mb-16">
      {/* Section Title */}
      <h3 className="text-2xl mb-8 pb-3 border-b border-border">
        {title}
      </h3>

      {/* Articles Grid/List */}
      <div className={`grid ${gridClass} gap-x-12 gap-y-8`}>
        {articles.map((article) => (
          <article key={article.id} className="group">
            {/* Thumbnail (optional) */}
            {showThumbnail && article.thumbnail && (
              <div className="mb-4 overflow-hidden">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
            )}

            {/* Section Label */}
            <div className="section-label text-muted-foreground mb-2">
              {article.section}
            </div>

            {/* Title */}
            <h4
              onClick={() => onReadArticle(article.id)}
              className="text-xl md:text-2xl leading-tight mb-3 cursor-pointer group-hover:opacity-70 transition-opacity"
            >
              {article.title}
            </h4>

            {/* Meta */}
            <div className="meta mb-3">
              {article.author} · {article.date}
            </div>

            {/* Excerpt (optional) */}
            {showExcerpt && article.excerpt && (
              <p className="text-base leading-relaxed text-muted-foreground mb-3">
                {article.excerpt}
              </p>
            )}

            {/* Read More */}
            <button
              onClick={() => onReadArticle(article.id)}
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
