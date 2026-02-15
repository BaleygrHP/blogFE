import { PostDto, Article } from "./types";

const SECTION_LABEL: Record<string, string> = {
  EDITORIAL: "Editorial",
  NOTES: "Notes",
  DIARY: "Diary",
};

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
    section: options?.sectionLabel ?? SECTION_LABEL[post.section] ?? post.section,
    title: post.title,
    subtitle: (post.subtitle ?? "").trim(),
    author: "Test",
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
      : "",
    coverImage: options?.showCover ? post.coverImageUrl ?? undefined : undefined,
    content: post.contentHtml || post.content || post.contentMd || "",
  };
}
