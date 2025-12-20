import { ArticleList } from './ArticleList';
import { getArticlesBySection } from '../../../lib/mockData';

interface NotesPageProps {
  onReadArticle: (id: number) => void;
}

export function NotesPage({ onReadArticle }: NotesPageProps) {
  const articles = getArticlesBySection('Notes');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Notes</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Longer-form pieces on tools, techniques, and practices. 
          More exploratory than editorial, more structured than diary.
        </p>
      </header>

      {/* Articles List - with excerpts and optional thumbnails */}
      <ArticleList
        title=""
        articles={articles}
        showExcerpt={true}
        showThumbnail={true}
        columns={2}
        onReadArticle={onReadArticle}
      />
    </div>
  );
}
