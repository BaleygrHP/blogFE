import { useState } from 'react';
import { getAllPublishedArticles } from '../lib/mockData';

interface ArchivePageProps {
  onReadArticle: (id: number) => void;
}

export function ArchivePage({ onReadArticle }: ArchivePageProps) {
  const [filterSection, setFilterSection] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');

  const allArticles = getAllPublishedArticles();
  const sections = ['All', 'Editorial', 'Notes', 'Diary'];
  const years = ['All', '2025', '2024', '2023'];

  // Filter articles
  const filteredArticles = allArticles.filter(article => {
    const matchesSection = filterSection === 'All' || article.section === filterSection;
    const matchesYear = filterYear === 'All' || article.date.includes(filterYear);
    return matchesSection && matchesYear;
  });

  // Group by month
  const groupedByMonth: { [key: string]: typeof allArticles } = {};
  filteredArticles.forEach(article => {
    const monthYear = article.date.split(' ').slice(0, 2).join(' '); // e.g., "December 2025"
    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
    }
    groupedByMonth[monthYear].push(article);
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Archive</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse all published articles by section and date.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-12 flex flex-wrap gap-6">
        {/* Section Filter */}
        <div>
          <label className="section-label text-muted-foreground mb-3 block">
            Section
          </label>
          <div className="flex gap-2">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setFilterSection(section)}
                className={`px-4 py-2 border transition-colors ${
                  filterSection === section
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <label className="section-label text-muted-foreground mb-3 block">
            Year
          </label>
          <div className="flex gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                className={`px-4 py-2 border transition-colors ${
                  filterYear === year
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 text-muted-foreground">
        {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
      </div>

      {/* Grouped Articles */}
      <div className="space-y-12">
        {Object.entries(groupedByMonth).map(([monthYear, articles]) => (
          <div key={monthYear}>
            {/* Month Header */}
            <h2 className="text-xl mb-6 pb-2 border-b border-border">
              {monthYear}
            </h2>

            {/* Articles in this month */}
            <div className="space-y-6">
              {articles.map(article => (
                <article key={article.id} className="flex gap-8 group">
                  {/* Date */}
                  <div className="meta text-muted-foreground w-24 flex-shrink-0">
                    {article.date.split(' ')[1]}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Section */}
                    <div className="section-label text-muted-foreground mb-1">
                      {article.section}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onReadArticle(article.id)}
                      className="text-lg mb-1 cursor-pointer group-hover:opacity-70 transition-opacity"
                    >
                      {article.title}
                    </h3>

                    {/* Author */}
                    <div className="meta text-muted-foreground">
                      {article.author}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No articles found matching these filters.
        </div>
      )}
    </div>
  );
}
