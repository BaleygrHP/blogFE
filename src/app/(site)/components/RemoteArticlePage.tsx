"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { PostDto } from '@/lib/api/types';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toSectionLabel(post: PostDto): string {
  const s: any = post.section;
  if (!s) return 'General';
  if (typeof s === 'string') return s;
  return s.name || s.key || 'General';
}

function toDateLabel(post: PostDto): string {
  const raw = post.publishedAt || post.updatedDate || post.createdDate;
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' });
}

export function RemoteArticlePage({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPostBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load article');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const bodyHtml = useMemo(() => {
    if (!post) return '';
    const html: any = (post as any).contentHtml;
    if (typeof html === 'string' && html.trim()) return html;

    const md = post.contentMd || '';
    if (!md.trim()) return '<p class="text-muted-foreground">(No content)</p>';

    // Simple fallback renderer: paragraphs separated by blank lines.
    const escaped = escapeHtml(md);
    const paras = escaped
      .split(/\n\s*\n/g)
      .map((p) => p.replace(/\n/g, '<br />'))
      .map((p) => `<p>${p}</p>`)
      .join('');
    return paras;
  }, [post]);

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <article className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {loading && <div className="meta text-muted-foreground">Loading…</div>}
          {error && (
            <div className="p-4 border border-border bg-secondary text-sm">
              <div className="font-medium mb-1">Couldn’t load article</div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          )}

          {!loading && !error && post && (
            <>
              <header className="mb-12">
                <div className="section-label text-muted-foreground mb-4">{toSectionLabel(post)}</div>
                <h1 className="mb-6">{post.title}</h1>
                <div className="meta pb-6 border-b border-border">
                  By The Daily Chronicle · Published {toDateLabel(post)}
                </div>
              </header>

              {post.coverImageUrl && (
                <div className="mb-12 -mx-6 md:mx-0">
                  <img src={post.coverImageUrl} alt={post.title} className="w-full" />
                </div>
              )}

              <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

              <div className="mt-16 pt-8 border-t border-border text-center">
                <span className="text-2xl text-muted-foreground">◆</span>
              </div>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
