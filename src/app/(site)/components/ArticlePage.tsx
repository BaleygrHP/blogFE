"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { mapPostToArticle } from "@/lib/adapters";
import { getPostBySlug } from "@/lib/apiClient";
import { Article } from "@/lib/types";
import { UI_TEXT } from "@/lib/i18n";

interface ArticlePageProps {
  slug: string;
  onBack?: () => void;
}

export function ArticlePage({ slug, onBack }: ArticlePageProps) {
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
        <p className="text-muted-foreground">Đang tải bài viết...</p>
      </div>
    );
  }

  const rawContent = (article.content ?? "").trim();
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(rawContent);
  const escapedContent = rawContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const fullContent = rawContent
    ? looksLikeHtml
      ? rawContent
      : escapedContent
          .split(/\n{2,}/)
          .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
          .join("")
    : "<p>Chưa có nội dung.</p>";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 meta hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {UI_TEXT.common.back}
          </button>
        </div>
      </div>

      <article className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <header className="mb-12">
            <div className="section-label text-muted-foreground mb-4">{article.section}</div>
            <h1 className="mb-6">{article.title}</h1>
            <div className="meta pb-6 border-b border-border">
              Bởi {article.author} · Xuất bản {article.date}
            </div>
          </header>

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

          <div className="prose" dangerouslySetInnerHTML={{ __html: fullContent }} />

          <div className="mt-16 pt-8 border-t border-border text-center">
            <span className="text-2xl text-muted-foreground">◆</span>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="meta">
              <strong>{article.author}</strong> chia sẻ góc nhìn về thiết kế, công nghệ và cách làm việc
              có chiều sâu.
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
