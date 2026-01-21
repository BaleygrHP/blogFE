// src/lib/adminApiClient.ts
// Admin API client for backend operations

import type { PageResponse, PostDto, SectionKey, MediaKind, PublicMediaDto } from "./types";

const API_BASE = "/api/admin";

// ===== Helper function =====
async function fetchJson<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText}`);
    }

    return res.json() as Promise<T>;
}

// ===== POSTS API =====

export interface PostCreateDto {
    title: string;
    subtitle?: string;
    excerpt?: string;
    section: SectionKey;
    coverImageUrl?: string;
    content?: string;
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
    section?: SectionKey;
    status?: "published" | "draft";
    page?: number;
    size?: number;
}): Promise<PageResponse<AdminPostDto>> {
    const query = new URLSearchParams();
    if (params?.section) query.append("section", params.section);
    if (params?.status) query.append("status", params.status);
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    return fetchJson<PageResponse<AdminPostDto>>(
        `${API_BASE}/posts?${query.toString()}`
    );
}

export async function getAdminPostById(postId: string): Promise<AdminPostDto> {
    return fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}`);
}

export async function createPost(data: PostCreateDto): Promise<AdminPostDto> {
    return fetchJson<AdminPostDto>(`${API_BASE}/posts`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updatePost(
    postId: string,
    data: PostUpdateDto
): Promise<AdminPostDto> {
    return fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deletePost(postId: string): Promise<void> {
    await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        cache: "no-store",
    });
}

export async function publishPost(postId: string): Promise<AdminPostDto> {
    return fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}/publish`, {
        method: "POST",
    });
}

export async function unpublishPost(postId: string): Promise<AdminPostDto> {
    return fetchJson<AdminPostDto>(`${API_BASE}/posts/${postId}/unpublish`, {
        method: "POST",
    });
}

// ===== SECTIONS API =====

export interface SectionDto {
    id: string;
    key: SectionKey;
    label: string;
    enabled?: boolean;
}

export async function getAdminSections(): Promise<SectionDto[]> {
    return fetchJson<SectionDto[]>(`${API_BASE}/sections`);
}

export async function toggleSection(sectionId: string): Promise<SectionDto> {
    return fetchJson<SectionDto>(`${API_BASE}/sections/${sectionId}/toggle`, {
        method: "POST",
    });
}

// ===== MEDIA API =====

export interface MediaUploadDto {
    url: string;
    kind: MediaKind;
    title?: string;
    alt?: string;
    caption?: string;
    location?: string;
    takenAt?: string; // yyyy-MM-dd
    width?: number;
    height?: number;
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

    return fetchJson<PageResponse<PublicMediaDto>>(
        `${API_BASE}/media?${query.toString()}`
    );
}

export async function uploadMedia(
    data: MediaUploadDto
): Promise<PublicMediaDto> {
    return fetchJson<PublicMediaDto>(`${API_BASE}/media`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteMedia(mediaId: string): Promise<void> {
    await fetch(`${API_BASE}/media/${mediaId}`, {
        method: "DELETE",
        cache: "no-store",
    });
}

// ===== FRONT PAGE API =====

export interface FrontPageItemDto {
    id: string;
    postId: string;
    position: number;
    section: "featured" | "curated";
}

export async function getFrontPageItems(): Promise<FrontPageItemDto[]> {
    return fetchJson<FrontPageItemDto[]>(`${API_BASE}/front-page/items`);
}

export async function setFeaturedPost(postId: string): Promise<void> {
    await fetchJson(`${API_BASE}/front-page/featured`, {
        method: "POST",
        body: JSON.stringify({ postId }),
    });
}

export async function addCuratedPost(postId: string): Promise<void> {
    await fetchJson(`${API_BASE}/front-page/curated`, {
        method: "POST",
        body: JSON.stringify({ postId }),
    });
}
