// src/lib/adminApiClient.ts
// Admin API client for backend operations

import type { PageResponse, PostDto, SectionKey, MediaKind, PublicMediaDto } from "./types";
import { resolvePublicUrl } from "./apiClient";

const API_BASE = "/api/admin";

function normalizeAdminPost(post: AdminPostDto): AdminPostDto {
    if (!post?.coverImageUrl) return post;
    return {
        ...post,
        coverImageUrl: resolvePublicUrl(post.coverImageUrl),
    };
}

function normalizeAdminPostPage(page: PageResponse<AdminPostDto>): PageResponse<AdminPostDto> {
    return {
        ...page,
        content: (page.content || []).map(normalizeAdminPost),
    };
}

function normalizePublicMedia(media: PublicMediaDto): PublicMediaDto {
    if (!media?.url) return media;
    return {
        ...media,
        url: resolvePublicUrl(media.url),
    };
}

function normalizePublicMediaPage(page: PageResponse<PublicMediaDto>): PageResponse<PublicMediaDto> {
    return {
        ...page,
        content: (page.content || []).map(normalizePublicMedia),
    };
}

function getCsrfToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|;\s*)admin_csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
}

function withCsrfHeader(headers?: HeadersInit): Headers {
    const nextHeaders = new Headers(headers || {});
    const csrf = getCsrfToken();
    if (csrf) {
        nextHeaders.set("X-CSRF-Token", csrf);
    }
    return nextHeaders;
}

function isMutatingMethod(method?: string): boolean {
    const normalized = (method || "GET").toUpperCase();
    return normalized === "POST" || normalized === "PUT" || normalized === "PATCH" || normalized === "DELETE";
}

function handleUnauthorized(status: number) {
    if (status !== 401) return;
    if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
    }
}

// ===== Helper function =====
async function fetchJson<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const method = (options?.method || "GET").toUpperCase();
    const baseHeaders = new Headers(options?.headers || {});
    const headers = isMutatingMethod(method)
        ? withCsrfHeader(baseHeaders)
        : baseHeaders;
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(path, {
        ...options,
        headers,
        cache: "no-store",
    });

    if (!res.ok) {
        handleUnauthorized(res.status);
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText}`);
    }

    // Some admin endpoints return 204 No Content (e.g. reorder/delete).
    if (res.status === 204 || res.status === 205) {
        return undefined as T;
    }

    const raw = await res.text();
    if (!raw || !raw.trim()) {
        return undefined as T;
    }

    return JSON.parse(raw) as T;
}

// ===== POSTS API =====

export interface PostCreateDto {
    title: string;
    subtitle?: string;
    excerpt?: string;
    section: SectionKey;
    coverImageUrl?: string;
    content?: string;
    contentJson?: string;
    contentHtml?: string;
    contentText?: string;
    contentMd?: string;
    slug?: string;
}

export interface PostUpdateDto extends PostCreateDto {
    id: string;
}

export interface AdminPostDto extends PostDto {
    status?: "published" | "draft";
    featured?: boolean;
    content?: string;
}

export async function getAdminPosts(params?: {
    sectionId?: string;
    status?: "published" | "draft";
    q?: string;
    page?: number;
    size?: number;
}): Promise<PageResponse<AdminPostDto>> {
    const query = new URLSearchParams();
    if (params?.sectionId) query.append("sectionId", params.sectionId);
    if (params?.status) query.append("status", params.status.toUpperCase());
    if (params?.q) query.append("q", params.q);
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const page = await fetchJson<PageResponse<AdminPostDto>>(
        `${API_BASE}/posts?${query.toString()}`
    );
    return normalizeAdminPostPage(page);
}

export async function getAdminPostById(postId: string): Promise<AdminPostDto> {
    const post = await fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}`);
    return normalizeAdminPost(post);
}

export async function createPost(data: PostCreateDto): Promise<AdminPostDto> {
    const post = await fetchJson<AdminPostDto>(`${API_BASE}/posts`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return normalizeAdminPost(post);
}

export async function updatePost(
    postId: string,
    data: PostUpdateDto
): Promise<AdminPostDto> {
    const post = await fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return normalizeAdminPost(post);
}

export async function deletePost(postId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        headers: withCsrfHeader(),
        cache: "no-store",
    });
    if (!res.ok) {
        handleUnauthorized(res.status);
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    }
}

export async function publishPost(postId: string): Promise<AdminPostDto> {
    const post = await fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}/publish`, {
        method: "POST",
    });
    return normalizeAdminPost(post);
}

export async function unpublishPost(postId: string): Promise<AdminPostDto> {
    const post = await fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}/unpublish`, {
        method: "POST",
    });
    return normalizeAdminPost(post);
}

// ===== SECTIONS API =====

export interface SectionDto {
    id: string;
    key: string;
    name?: string;
    description?: string | null;
    // legacy FE compatibility
    label?: string;
    active?: boolean;
    enabled?: boolean;
    sortOrder?: number;
    visibility?: "PUBLIC" | "PRIVATE";
}

export async function getAdminSections(): Promise<SectionDto[]> {
    return fetchJson<SectionDto[]>(`${API_BASE}/sections`);
}

export interface CreateSectionDto {
    key: string;
    name: string;
    description?: string;
    sortOrder?: number;
    active?: boolean;
    visibility: "PUBLIC" | "PRIVATE";
}

export async function createSection(data: CreateSectionDto): Promise<SectionDto> {
    return fetchJson<SectionDto>(`${API_BASE}/sections`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export interface UpdateSectionDto {
    name?: string;
    description?: string;
    sortOrder?: number;
    active?: boolean;
    visibility?: "PUBLIC" | "PRIVATE";
}

export async function updateSection(id: string, data: UpdateSectionDto): Promise<SectionDto> {
    return fetchJson<SectionDto>(`${API_BASE}/sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function toggleSection(sectionId: string): Promise<SectionDto> {
    return fetchJson<SectionDto>(`${API_BASE}/sections/${sectionId}/toggle`, {
        method: "PATCH", // Controller uses PatchMapping
    });
}

// ===== MEDIA API =====

export interface MediaUploadDto {
    url: string;
    kind?: MediaKind;
    title?: string;
    alt?: string;
    caption?: string;
    location?: string;
    takenAt?: string; // yyyy-MM-dd
    category?: string;
}

export interface MediaUploadFileDto {
    file: File;
    kind?: MediaKind;
    title?: string;
    alt?: string;
    caption?: string;
    location?: string;
    takenAt?: string;
    category?: string;
}

export async function getAdminMedia(params?: {
    kind?: MediaKind;
    page?: number;
    size?: number;
}): Promise<PageResponse<PublicMediaDto>> {
    const query = new URLSearchParams();
    if (params?.kind) query.append("kind", params.kind);
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const page = await fetchJson<PageResponse<PublicMediaDto>>(
        `${API_BASE}/media?${query.toString()}`
    );
    return normalizePublicMediaPage(page);
}

export async function getMediaCategories(): Promise<string[]> {
    return fetchJson<string[]>(`${API_BASE}/media/categories`);
}

export async function uploadMediaByUrl(
    data: MediaUploadDto
): Promise<PublicMediaDto> {
    const media = await fetchJson<PublicMediaDto>(`${API_BASE}/media/url`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return normalizePublicMedia(media);
}

// Backward-compatible alias
export const uploadMedia = uploadMediaByUrl;

export async function uploadMediaFile(data: MediaUploadFileDto): Promise<PublicMediaDto> {
    const form = new FormData();
    form.append("file", data.file);
    if (data.kind) form.append("kind", data.kind);
    if (data.title) form.append("title", data.title);
    if (data.alt) form.append("alt", data.alt);
    if (data.caption) form.append("caption", data.caption);
    if (data.location) form.append("location", data.location);
    if (data.takenAt) form.append("takenAt", data.takenAt);
    if (data.category) form.append("category", data.category);

    const res = await fetch(`${API_BASE}/media/upload`, {
        method: "POST",
        headers: withCsrfHeader(),
        body: form,
        cache: "no-store",
    });

    if (!res.ok) {
        handleUnauthorized(res.status);
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText}`);
    }

    const media = (await res.json()) as PublicMediaDto;
    return normalizePublicMedia(media);
}

export interface MediaUpdateDto {
    title?: string;
    alt?: string;
    caption?: string;
    location?: string;
    takenAt?: string; // yyyy-MM-dd
    category?: string;
}

export async function updateMedia(
    mediaId: string,
    data: MediaUpdateDto
): Promise<PublicMediaDto> {
    const media = await fetchJson<PublicMediaDto>(`${API_BASE}/media/${mediaId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return normalizePublicMedia(media);
}

export async function deleteMedia(mediaId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/media/${mediaId}`, {
        method: "DELETE",
        headers: withCsrfHeader(),
        cache: "no-store",
    });
    if (!res.ok) {
        handleUnauthorized(res.status);
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    }
}

// ===== FRONT PAGE API =====

export interface FrontPageItemDto {
    id: number | string;
    postId: string;
    position: number;
    active: boolean;
    pinned: boolean;
    startAt?: string | null;
    endAt?: string | null;
    note?: string | null;
    post?: {
        id: string;
        title: string;
        slug: string;
        section?: {
            id: string;
            key: string;
            name?: string;
        };
    } | null;
}

export interface FrontPageSupportingItemDto {
    id: number;
    postId: string;
    position: number;
    active: boolean;
    pinned: boolean;
    startAt?: string | null;
    endAt?: string | null;
    note?: string | null;
    post?: {
        id: string;
        title: string;
        slug: string;
        section?: {
            id: string;
            key: string;
            name?: string;
        };
    } | null;
}

export interface FrontPageCompositionDto {
    status: "SAVED";
    version: number;
    updatedAt?: string | null;
    featured: {
        id: string;
        title: string;
        slug: string;
        section?: {
            id: string;
            key: string;
            name?: string;
        };
    } | null;
    items: FrontPageSupportingItemDto[];
}

export interface UpsertCuratedRequest {
    postId: string;
    position: number;
    active: boolean;
    startAt?: string; // ISO
    endAt?: string;   // ISO
    note?: string;
}

export async function getFrontPageItems(): Promise<FrontPageItemDto[]> {
    return fetchJson<FrontPageItemDto[]>(`${API_BASE}/front-page/items`);
}

export async function getFrontPageComposition(): Promise<FrontPageCompositionDto> {
    return fetchJson<FrontPageCompositionDto>(`${API_BASE}/front-page/composition`);
}

function frontPageMutationHeaders(version: number): Record<string, string> {
    return {
        "If-Match": `"${version}"`,
        "X-FrontPage-Version": String(version),
    };
}

// Changed to use query param as per AdminPostController
export async function setFeaturedPost(postId: string, version: number): Promise<FrontPageItemDto> {
    return fetchJson<FrontPageItemDto>(`${API_BASE}/front-page/featured?postId=${encodeURIComponent(postId)}`, {
        method: "POST",
        headers: frontPageMutationHeaders(version),
    });
}

export async function removeFeaturedPost(version: number): Promise<FrontPageCompositionDto> {
    return fetchJson<FrontPageCompositionDto>(`${API_BASE}/front-page/featured`, {
        method: "DELETE",
        headers: frontPageMutationHeaders(version),
    });
}

// Changed to send full object
export async function addCuratedPost(request: UpsertCuratedRequest, version: number): Promise<FrontPageItemDto> {
    return fetchJson<FrontPageItemDto>(`${API_BASE}/front-page/curated`, {
        method: "POST",
        headers: frontPageMutationHeaders(version),
        body: JSON.stringify(request),
    });
}

export async function reorderFrontPageItems(orderedIds: number[], version: number): Promise<void> {
    await fetchJson<void>(`${API_BASE}/front-page/reorder`, {
        method: "POST",
        headers: frontPageMutationHeaders(version),
        body: JSON.stringify({ orderedIds }),
    });
}

export async function deleteFrontPageItem(itemId: number, version: number): Promise<void> {
    await fetchJson<void>(`${API_BASE}/front-page/items/${itemId}`, {
        method: "DELETE",
        headers: frontPageMutationHeaders(version),
    });
}
