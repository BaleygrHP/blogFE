import { PostDto, Article } from "./types";

export function mapPostToArticle(
  post: PostDto,
  options?: {
    sectionLabel?: string;
    showCover?: boolean;
  }
): Article {
  return {
    id: post.id,
    slug: post.slug,
    section: options?.sectionLabel ?? String(post.section ?? "").trim(),
    title: post.title,
    subtitle: (post.subtitle ?? "").trim(),
    author: "Báleygr",
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
      : "",
    coverImage: options?.showCover ? post.coverImageUrl ?? undefined : undefined,
    content: post.contentHtml || post.content || post.contentMd || "",
  };
}
