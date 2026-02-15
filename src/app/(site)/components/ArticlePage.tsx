"use client";

import { mapPostToArticle } from '@/lib/adapters';
import { getPostBySlug } from '@/lib/apiClient';
import { Article } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


interface ArticlePageProps {
  slug: string;
  onBack?: () => void;
}

export function ArticlePage({ slug , onBack }: ArticlePageProps) {
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.back());
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    getPostBySlug(slug)
      .then((post) => setArticle(mapPostToArticle(post)))
      .catch(() => setArticle(null));
  }, [slug]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-muted-foreground">Loading article…</p>
      </div>
    );
  }
  // Mock full content for demo
  const fullContent = `
    <p>This is the beginning of the article. In a full implementation, this would contain the complete Markdown-rendered content.</p>
    
    <p>The quiet UI philosophy emphasizes clarity and focus. Every element serves the reading experience. Nothing competes with the text for attention.</p>
    
    <h2>The Text-First Approach</h2>
    
    <p>When you design text-first, you start with the assumption that people are here to read. Not to be entertained by animations, not to marvel at your design skills—just to read.</p>
    
    <p>This might seem limiting, but it's actually liberating. With fewer variables to consider, you can focus on the fundamentals: typography, spacing, hierarchy, and rhythm.</p>
    
    <blockquote>
      "Good design is as little design as possible."
      <br />— Dieter Rams
    </blockquote>
    
    <h2>What This Means in Practice</h2>
    
    <p>In practice, quiet UI means making deliberate choices about what <em>not</em> to include. Every element should justify its existence. If it doesn't serve the reader's understanding or navigation, it probably shouldn't be there.</p>
    
    <p>This applies to everything from color choices (neutral, unobtrusive) to interaction patterns (simple, predictable) to content structure (clear, hierarchical).</p>
    
    <h3>Key Principles</h3>
    
    <ul>
      <li>Prioritize readability over aesthetics</li>
      <li>Use whitespace generously</li>
      <li>Keep interactions minimal and predictable</li>
      <li>Let content define the rhythm</li>
    </ul>
    
    <h2>The Result</h2>
    
    <p>What you get is a reading experience that feels calm, focused, and respectful of the reader's time and attention. The design doesn't shout. It whispers—or better yet, it steps aside entirely and lets the words speak.</p>
    
    <p>This is what modern editorial design should be: not invisible, but transparent. Present enough to guide, absent enough not to distract.</p>
  `;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            {/* Section */}
            <div className="section-label text-muted-foreground mb-4">
              {article.section}
            </div>

            {/* Title */}
            <h1 className="mb-6">{article.title}</h1>

            {/* Meta */}
            <div className="meta pb-6 border-b border-border">
              By {article.author} · Published {article.date}
            </div>
          </header>

          {/* Cover Image (optional) */}
          {article.coverImage && (
            <div className="mb-12 -mx-6 md:mx-0">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={1200}
                height={630}
                className="w-full"
              />
            </div>
          )}

          {/* Body */}
          <div 
            className="prose"
            dangerouslySetInnerHTML={{ __html: fullContent }}
          />

          {/* Ending Marker */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <span className="text-2xl text-muted-foreground">◆</span>
          </div>

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="meta">
              <strong>{article.author}</strong> writes about design, technology, and thoughtful work.
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
