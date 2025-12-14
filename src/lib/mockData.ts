// Mock data for the personal newsroom

export const allArticles = [
  // Featured
  {
    id: 1,
    section: 'Editorial',
    title: 'The Quiet Revolution in Modern Publishing',
    excerpt: 'As traditional media transforms, independent voices are finding new ways to reach audiences. The shift isn\'t just technological—it\'s philosophical. Text-first design principles are bringing clarity back to digital reading.',
    author: 'Editorial Board',
    date: 'December 14, 2025',
    status: 'published',
    featured: true,
    showOnFrontPage: true,
    content: '...',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&q=80'
  },
  
  // Editorial (opinion pieces)
  {
    id: 2,
    section: 'Editorial',
    title: 'Why We Need Fewer Features, Not More',
    excerpt: 'The tech industry\'s obsession with features has created bloated products nobody wants. It\'s time to embrace constraint as a design principle.',
    author: 'Sarah Chen',
    date: 'December 13, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 3,
    section: 'Editorial',
    title: 'The Case Against Infinite Scroll',
    excerpt: 'Pagination isn\'t outdated—it\'s intentional. When we remove boundaries, we remove the ability to finish.',
    author: 'Michael Torres',
    date: 'December 12, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 4,
    section: 'Editorial',
    title: 'Attention is Not a Commodity',
    excerpt: 'Digital platforms treat user attention as a resource to extract. But what if we designed for focus instead?',
    author: 'Editorial Board',
    date: 'December 10, 2025',
    status: 'published',
    showOnFrontPage: false,
    content: '...'
  },
  
  // Notes (longer pieces with optional thumbnails)
  {
    id: 5,
    section: 'Notes',
    title: 'Building a Personal Knowledge System',
    excerpt: 'How I organize thoughts, research, and ideas using plain text files and a simple folder structure. No fancy tools required—just consistent practice.',
    author: 'James Green',
    date: 'December 11, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&q=80'
  },
  {
    id: 6,
    section: 'Notes',
    title: 'Reading in the Age of Distraction',
    excerpt: 'Strategies for deep reading when everything is designed to interrupt. From physical books to focused digital environments.',
    author: 'Elena Rodriguez',
    date: 'December 9, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'
  },
  {
    id: 7,
    section: 'Notes',
    title: 'The Art of the Daily Review',
    excerpt: 'Reflecting on the day\'s work helps clarify thinking and maintain momentum. Here\'s how I structure mine.',
    author: 'David Kim',
    date: 'December 8, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 8,
    section: 'Notes',
    title: 'Why I Switched to Markdown',
    excerpt: 'After years with various note-taking apps, I found that plain Markdown files offer the best balance of simplicity and longevity.',
    author: 'Alex Martinez',
    date: 'December 6, 2025',
    status: 'published',
    showOnFrontPage: false,
    content: '...'
  },
  
  // Diary (minimal, personal)
  {
    id: 9,
    section: 'Diary',
    title: 'Morning Pages: Week of December 8',
    excerpt: 'Brief thoughts from the week. On writing routines, coffee rituals, and finding time for reflection.',
    author: 'Personal',
    date: 'December 14, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 10,
    section: 'Diary',
    title: 'On Slow Productivity',
    excerpt: 'Reflections on doing less, but better.',
    author: 'Personal',
    date: 'December 12, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 11,
    section: 'Diary',
    title: 'Winter Reading List',
    excerpt: 'Books I\'m looking forward to this season.',
    author: 'Personal',
    date: 'December 7, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 12,
    section: 'Diary',
    title: 'Changes to the Site',
    excerpt: 'Small updates and refinements.',
    author: 'Personal',
    date: 'December 5, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  {
    id: 13,
    section: 'Diary',
    title: 'First Snow',
    excerpt: 'Brief note on the season changing.',
    author: 'Personal',
    date: 'December 3, 2025',
    status: 'published',
    showOnFrontPage: true,
    content: '...'
  },
  
  // More articles for different sections
  {
    id: 14,
    section: 'Editorial',
    title: 'Design as Editing',
    excerpt: 'Good design is often about what you remove, not what you add.',
    author: 'Sarah Chen',
    date: 'December 5, 2025',
    status: 'published',
    showOnFrontPage: false,
    content: '...'
  },
  {
    id: 15,
    section: 'Notes',
    title: 'Learning in Public',
    excerpt: 'Why sharing your learning process helps both you and others grow.',
    author: 'Michael Torres',
    date: 'December 4, 2025',
    status: 'published',
    showOnFrontPage: false,
    content: '...',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'
  },
  {
    id: 16,
    section: 'Notes',
    title: 'The Value of Constraints',
    excerpt: 'Working within limitations often produces better results than unlimited options.',
    author: 'Elena Rodriguez',
    date: 'December 2, 2025',
    status: 'published',
    showOnFrontPage: false,
    content: '...'
  }
];

// Helper functions
export function getFeaturedArticle() {
  return allArticles.find(a => a.featured && a.showOnFrontPage);
}

export function getLatestArticles(limit = 4) {
  return allArticles
    .filter(a => !a.featured && a.showOnFrontPage && a.status === 'published')
    .slice(0, limit);
}

export function getEditorialPicks(limit = 3) {
  return allArticles
    .filter(a => a.section === 'Editorial' && a.showOnFrontPage && !a.featured)
    .slice(0, limit);
}

export function getNotesArticles(limit = 3) {
  return allArticles
    .filter(a => a.section === 'Notes' && a.showOnFrontPage)
    .slice(0, limit);
}

export function getDiaryEntries(limit = 5) {
  return allArticles
    .filter(a => a.section === 'Diary' && a.showOnFrontPage)
    .slice(0, limit);
}

export function getArticlesBySection(section: string) {
  return allArticles.filter(a => a.section === section && a.status === 'published');
}

export function getArticleById(id: number) {
  return allArticles.find(a => a.id === id);
}

export function getAllPublishedArticles() {
  return allArticles.filter(a => a.status === 'published');
}

export function getAllDrafts() {
  return allArticles.filter(a => a.status === 'draft');
}
