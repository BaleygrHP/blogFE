import { ArticleList } from './ArticleList';
import { getArticlesBySection } from '../../../lib/mockData';

interface EditorialPageProps {
  onReadArticle: (id: number) => void;
}

export function EditorialPage({ onReadArticle }: EditorialPageProps) {
  const articles = getArticlesBySection('Editorial');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Editorial</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Opinion pieces and commentary on technology, design, and modern work. 
          These are perspectives, not instructions—take what resonates, leave what doesn't.
        </p>
      </header>

      {/* Articles List - 100% text, no thumbnails */}
      <ArticleList
        title=""
        articles={articles}
        showExcerpt={true}
        showThumbnail={false}
        columns={2}
        onReadArticle={onReadArticle}
      />
    </div>
  );
}
