"use client";
import { useState } from 'react';
import { Header } from './components/Header';
import { FrontPage } from './components/FrontPage';
import { EditorialPage } from './components/EditorialPage';
import { NotesPage } from './components/NotesPage';
import { DiaryPage } from './components/DiaryPage';
import { ArchivePage } from './components/ArchivePage';
import { AboutPage } from './components/AboutPage';
import { ArticlePage } from './components/ArticlePage';
import { Login } from './components/admin/Login';
import { Dashboard } from './components/admin/Dashboard';
import { PostsList } from './components/admin/PostsList';
import { PostEditor } from './components/admin/PostEditor';
import { getArticleById } from './lib/mockData';

type Page = 
  | 'home' 
  | 'editorial' 
  | 'notes' 
  | 'diary' 
  | 'archive' 
  | 'about' 
  | 'article'
  | 'login'
  | 'dashboard'
  | 'posts'
  | 'new-post'
  | 'edit-post';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigate = (page: string) => {
    // Handle admin routes
    if (page === 'admin') {
      if (isAuthenticated) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
      return;
    }

    // Handle article navigation
    if (page.startsWith('edit-post-')) {
      const id = parseInt(page.replace('edit-post-', ''));
      setCurrentArticleId(id);
      setCurrentPage('edit-post');
      return;
    }

    // Handle public pages
    const pageMap: { [key: string]: Page } = {
      home: 'home',
      editorial: 'editorial',
      notes: 'notes',
      diary: 'diary',
      archive: 'archive',
      about: 'about',
      dashboard: 'dashboard',
      posts: 'posts',
      'new-post': 'new-post'
    };

    setCurrentPage(pageMap[page] || 'home');
  };

  const handleReadArticle = (id: number) => {
    setCurrentArticleId(id);
    setCurrentPage('article');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCurrentArticleId(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleSavePost = (post: any) => {
    console.log('Saving post:', post);
    // In a real app, this would save to a backend
    alert('Post saved! (Demo mode - changes are not persisted)');
    setCurrentPage('posts');
  };

  // Admin Routes
  if (currentPage === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === 'dashboard') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
    return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'posts') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
    return <PostsList onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  if (currentPage === 'new-post') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
    return (
      <PostEditor
        post={null}
        onSave={handleSavePost}
        onCancel={() => setCurrentPage('posts')}
      />
    );
  }

  if (currentPage === 'edit-post') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
    const article = currentArticleId ? getArticleById(currentArticleId) : null;
    return (
      <PostEditor
        post={article as any}
        onSave={handleSavePost}
        onCancel={() => setCurrentPage('posts')}
      />
    );
  }

  // Public Routes
  return (
    <div className="min-h-screen bg-background">
      {/* Show header on public pages */}
      {currentPage !== 'article' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      {/* Page Content */}
      {currentPage === 'home' && <FrontPage onReadArticle={handleReadArticle} />}
      {currentPage === 'editorial' && <EditorialPage onReadArticle={handleReadArticle} />}
      {currentPage === 'notes' && <NotesPage onReadArticle={handleReadArticle} />}
      {currentPage === 'diary' && <DiaryPage onReadArticle={handleReadArticle} />}
      {currentPage === 'archive' && <ArchivePage onReadArticle={handleReadArticle} />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'article' && currentArticleId && (
        <ArticlePage
          article={getArticleById(currentArticleId) as any}
          onBack={handleBackToHome}
        />
      )}

      {/* Footer */}
      {currentPage !== 'article' && (
        <footer className="border-t border-border mt-24">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center">
              <p className="text-2xl mb-2">The Daily Chronicle</p>
              <p className="meta text-muted-foreground mb-6">
                A Personal Newsroom
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => handleNavigate('admin')}
                  className="meta text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Admin Login
                </button>
                <span className="text-muted-foreground">·</span>
                <a 
                  href="mailto:editor@dailychronicle.com"
                  className="meta text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Contact
                </a>
              </div>
              <p className="meta text-muted-foreground">
                © 2025 · Built with quiet UI principles
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}