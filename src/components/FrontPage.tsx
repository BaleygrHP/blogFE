import { FeaturedArticle } from './FeaturedArticle';
import { ArticleList } from './ArticleList';
import { DiaryList } from './DiaryList';
import {
  getFeaturedArticle,
  getLatestArticles,
  getEditorialPicks,
  getNotesArticles,
  getDiaryEntries
} from '../lib/mockData';

interface FrontPageProps {
  onReadArticle: (id: number) => void;
}

export function FrontPage({ onReadArticle }: FrontPageProps) {
  const featured = getFeaturedArticle();
  const latest = getLatestArticles(4);
  const editorialPicks = getEditorialPicks(3);
  const notes = getNotesArticles(3);
  const diary = getDiaryEntries(5);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Featured Article */}
      {featured && (
        <FeaturedArticle article={featured} onReadArticle={onReadArticle} />
      )}

      {/* Latest Stories */}
      <ArticleList
        title="Latest"
        articles={latest}
        showExcerpt={true}
        columns={2}
        onReadArticle={onReadArticle}
      />

      {/* Editorial Picks */}
      <ArticleList
        title="Editorial"
        articles={editorialPicks}
        showExcerpt={false}
        columns={1}
        onReadArticle={onReadArticle}
      />

      {/* Notes */}
      <ArticleList
        title="Notes"
        articles={notes}
        showExcerpt={true}
        showThumbnail={true}
        columns={3}
        onReadArticle={onReadArticle}
      />

      {/* Diary */}
      {diary.length > 0 && (
        <DiaryList entries={diary} onReadEntry={onReadArticle} />
      )}
    </div>
  );
}
