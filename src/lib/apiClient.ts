// src/lib/api.ts
import type { FrontPageResponse, MediaKind, PageResponse, PostDto, PublicMediaDto, SectionKey } from "./types";

// nếu backend bạn để prefix khác (ví dụ /api/public), đổi chỗ này:
const PAGE_PATH = "/api/public/posts";

const API_BASE =
  process.env.BE_BASE_URL?.replace(/\/$/, "") || "http://localhost:7055/newspaper-project";

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
) {
  const url = new URL(`${API_BASE}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function fetchJson<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
  init?: RequestInit
): Promise<T> {
  const url = buildUrl(path, query);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}


export async function getFrontPage(): Promise<FrontPageResponse> {
  return fetchJson<FrontPageResponse>(PAGE_PATH + '/front-page');
}

export function getContentPosts(sectionKey: SectionKey, page = 0, size = 20) {
  return fetchJson<PageResponse<PostDto>>(
    "/api/public/posts",
    {
      sectionKey: sectionKey,
      page,
      size,
    }
  );
}

export function getArchivePosts(
  year: number,
  month?: number,
  sectionKey?: SectionKey,
  page = 0,
  size = 20
) {
  return fetchJson<PageResponse<PostDto>>(
    "/api/public/posts/archive",
    {
      year,
      month,
      sectionKey,
      page,
      size,
    }
  );
}

export function getPostBySlug(slug: string) {
  return fetchJson<PostDto>(`/api/public/posts/${slug}`);
}

// ===== API =====
export async function getPublicGallery(
  page = 0,
  size = 24,
  kind: MediaKind = "IMAGE"
): Promise<PageResponse<PublicMediaDto>> {
  const qs = new URLSearchParams({
    kind,
    page: String(page),
    size: String(size),
  });

  return fetchJson<PageResponse<PublicMediaDto>>(
    `/api/public/media?${qs.toString()}`
  );
}

export function getPublicMenu() {
  return fetchJson<{ label: string; href: string }[]>("/api/public/sections/menu");
}