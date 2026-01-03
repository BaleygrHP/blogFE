// src/lib/adapters.ts
import { PostListItem } from "./types";
import { Article } from "./types";


function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mapPostToArticle(post: PostListItem): Article {
  return {
    id: hashStringToNumber(post.slug),
    section: post.section,
    title: post.title,
    subtitle: post.subtitle ?? "",
    author: "Test",
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
      : "",
    coverImage: post.coverImageUrl,
  };
}
