import { PostDto, Article } from "./types";
import { resolvePublicUrl } from "./apiClient";

export function mapPostToArticle(
  post: PostDto,
  options?: {
    sectionLabel?: string;
    showCover?: boolean;
  }
): Article {
  const coverImageUrl = (post.coverImageUrl || "").trim();

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
    coverImage:
      options?.showCover && coverImageUrl
        ? resolvePublicUrl(coverImageUrl)
        : undefined,
    content: post.contentHtml || post.content || post.contentMd || "",
  };
}
