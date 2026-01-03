// src/lib/types.ts

export type SectionKey = "EDITORIAL" | "NOTES" | "DIARY";

export type PostListItem = {
  // giữ field tối thiểu để UI không đổi
  id?: string;         // optional nếu UI đang dùng id; backend có thể không cần
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  section: SectionKey;
  publishedAt?: string | null; // ISO string
  coverImageUrl?: string | undefined;
};

export type FrontPageResponse = {
  featured: PostListItem | null;
  latest: PostListItem[];
  editorial: PostListItem[]; // hoặc editorialPicks
  notes: PostListItem[];
  diary: PostListItem[];
};

export type Article = {
  id: number;
  section: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  coverImage?: string | undefined;
}
