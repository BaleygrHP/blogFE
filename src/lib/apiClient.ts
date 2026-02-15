// src/lib/apiClient.ts
import type {
  FrontPageResponse,
  MediaKind,
  PageResponse,
  PostDto,
  PublicMediaDto,
  SectionKey,
} from "./types";

/**
 * API_BASE:
 *  - Server-side (SSR): call the backend directly
 *  - Client-side: call through Next.js route handlers (/api/*)
 */
const BE_BASE_URL =
  process.env.BE_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:7055/newspaper-project";

function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server side — call BE directly
    return BE_BASE_URL;
  }
  // Client side — use route handlers
  return "";
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
) {
  const base = getApiBase();
  const url = new URL(`${base}${path}`, base || window.location.origin);

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
    const errorBody = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

// ===== PUBLIC APIs =====

export async function getFrontPage(): Promise<FrontPageResponse> {
  return fetchJson<FrontPageResponse>("/api/public/posts/front-page");
}

export function getContentPosts(sectionKey: SectionKey, page = 0, size = 20) {
  return fetchJson<PageResponse<PostDto>>("/api/public/posts", {
    sectionKey: sectionKey,
    page,
    size,
  });
}

export function getArchivePosts(
  year: number,
  month?: number,
  sectionKey?: SectionKey,
  page = 0,
  size = 20
) {
  return fetchJson<PageResponse<PostDto>>("/api/public/posts/archive", {
    year,
    month,
    sectionKey,
    page,
    size,
  });
}

export function getPostBySlug(slug: string) {
  return fetchJson<PostDto>(`/api/public/posts/${slug}`);
}

export function getRelatedPosts(slug: string, limit = 4) {
  return fetchJson<PostDto[]>(`/api/public/posts/${slug}/related`, { limit });
}

export async function getPublicGallery(
  page = 0,
  size = 24,
  kind: MediaKind = "IMAGE"
): Promise<PageResponse<PublicMediaDto>> {
  return fetchJson<PageResponse<PublicMediaDto>>("/api/public/media", {
    kind,
    page: String(page),
    size: String(size),
  });
}

export function getPublicMenu() {
  return fetchJson<{ label: string; href: string }[]>(
    "/api/public/sections/menu"
  );
}

// ===== ADMIN APIs =====

export function adminGetPosts(params?: {
  status?: string;
  sectionId?: string;
  q?: string;
  page?: number;
  size?: number;
}) {
  return fetchJson<PageResponse<PostDto>>("/api/admin/posts", params as Record<string, string>);
}

export function adminGetPost(postId: string) {
  return fetchJson<PostDto>(`/api/admin/posts/${postId}`);
}

export function adminCreatePost(body: Record<string, unknown>) {
  return fetchJson<PostDto>("/api/admin/posts", undefined, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function adminUpdatePost(postId: string, body: Record<string, unknown>) {
  return fetchJson<PostDto>(`/api/admin/posts/${postId}`, undefined, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function adminPublishPost(postId: string) {
  return fetchJson<PostDto>(`/api/admin/posts/${postId}/publish`, undefined, {
    method: "PATCH",
  });
}

export function adminUnpublishPost(postId: string) {
  return fetchJson<PostDto>(`/api/admin/posts/${postId}/unpublish`, undefined, {
    method: "PATCH",
  });
}

export function adminDeletePost(postId: string) {
  return fetchJson<void>(`/api/admin/posts/${postId}`, undefined, {
    method: "DELETE",
  });
}

// ===== ADMIN SECTIONS =====

export function adminGetSections() {
  return fetchJson<unknown[]>("/api/admin/sections");
}

// ===== ADMIN FRONT PAGE =====

export function adminGetFrontPageItems() {
  return fetchJson<unknown[]>("/api/admin/front-page/items");
}

export function adminSetFeatured(postId: string) {
  return fetchJson<unknown>("/api/admin/front-page/featured", undefined, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export function adminUpsertCurated(body: Record<string, unknown>) {
  return fetchJson<unknown>("/api/admin/front-page/curated", undefined, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function adminReorderFrontPage(orderedIds: number[]) {
  return fetchJson<void>("/api/admin/front-page/reorder", undefined, {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  });
}

export function adminDeleteFrontPageItem(id: number) {
  return fetchJson<void>(`/api/admin/front-page/items/${id}`, undefined, {
    method: "DELETE",
  });
}

// ===== AUTH =====

export function login(email: string, password: string) {
  return fetchJson<{ user: { id: string; email: string; displayName: string } }>(
    "/api/auth/login",
    undefined,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export function logout() {
  return fetchJson<{ ok: boolean }>("/api/auth/logout", undefined, {
    method: "POST",
  });
}

export function getMe() {
  return fetchJson<{ id: string; email: string; displayName: string }>(
    "/api/auth/me"
  );
}
