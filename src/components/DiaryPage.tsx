import { getArticlesBySection } from '../lib/mockData';

interface DiaryPageProps {
  onReadArticle: (id: number) => void;
}

export function DiaryPage({ onReadArticle }: DiaryPageProps) {
  const entries = getArticlesBySection('Diary');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Diary</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Brief, personal entries. Thoughts in progress, half-formed ideas, and quiet observations.
        </p>
      </header>

      {/* Minimal List */}
      <div className="space-y-8">
        {entries.map((entry) => (
          <article key={entry.id} className="pb-8 border-b border-border last:border-0">
            {/* Date */}
            <div className="meta text-muted-foreground mb-2">
              {entry.date}
            </div>

            {/* Title */}
            <h3
              onClick={() => onReadArticle(entry.id)}
              className="text-xl mb-3 cursor-pointer hover:opacity-70 transition-opacity"
            >
              {entry.title}
            </h3>

            {/* Brief excerpt */}
            {entry.excerpt && (
              <p className="text-muted-foreground leading-relaxed mb-3">
                {entry.excerpt}
              </p>
            )}

            {/* Read link */}
            <button
              onClick={() => onReadArticle(entry.id)}
              className="meta underline hover:text-foreground transition-colors"
            >
              Read entry →
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
