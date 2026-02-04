// src/lib/types.ts

export const SECTION = {
  EDITORIAL: { key: "EDITORIAL", label: "Editorial" },
  NOTES: { key: "NOTES", label: "Notes" },
  DIARY: { key: "DIARY", label: "Diary" },
} as const;

export type SectionKey = typeof SECTION[keyof typeof SECTION]["key"];
// ===== BACKEND MODELS =====
export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  section: SectionKey;
  publishedAt?: string | null;
  coverImageUrl?: string | null;
};

export type FrontPageResponse = {
  featured: PostListItem | null;
  latest: PostListItem[];
  curated: PostListItem[];
  editorialBlock: PostListItem[];
  notesBlock: PostListItem[];
  diaryBlock: PostListItem[];
};

export type PostDto = {
  id: string,
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string;
  content?: string;
  contentHtml?: string;
  section: "EDITORIAL" | "NOTES" | "DIARY";
  publishedAt?: string | null;
  coverImageUrl?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};


export type MediaKind = 'IMAGE' | 'VIDEO' | 'FILE';

export type PublicMediaDto = {
  id: string;
  kind: MediaKind;
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  title?: string | null;
  caption?: string | null;
  location?: string | null;
  takenAt?: string | null; // yyyy-MM-dd
  category?: string | null;
  createdDate?: string;
  createdAt?: string;
};




export type DiaryEntry = Article

// ===== UI MODELS =====
export type Article = {
  id: string;
  section: string;
  title: string;
  subtitle: string | null;
  author: string;
  date: string | null;
  slug: string;
  coverImage?: string | undefined;
  content?: string;
}

export type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  section: string;
  date?: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
  category: string; // not supported by public API yet -> "All"
  location?: string; // not supported -> empty
  date: string; // map from createdDate/createdAt if available
};