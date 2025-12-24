import type {
  LoginResponse,
  UserDto,
  FrontPageDto,
  PageResponse,
  PostDto,
  SectionDto,
  CreatePostRequest,
  UpdatePostRequest,
  FrontPageItemDto,
} from './types';

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error || data.title)) || `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data as T;
}

export const api = {
  // ===== Auth =====
  login: (email: string, password: string) =>
    http<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => http<UserDto>('/api/auth/me'),
  logout: () => http<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  // ===== Public =====
  getFrontPage: () => http<FrontPageDto>('/api/public/posts/front-page'),
  getPostBySlug: (slug: string) => http<PostDto>(`/api/public/posts/${encodeURIComponent(slug)}`),
  getRelated: (slug: string, sectionKey: string, limit = 6) =>
    http<PostDto[]>(
      `/api/public/posts/${encodeURIComponent(slug)}/related?sectionKey=${encodeURIComponent(sectionKey)}&limit=${limit}`
    ),
  getSectionPosts: (sectionKey: string, page = 0, size = 10) =>
    http<PageResponse<PostDto>>(`/api/public/posts?sectionKey=${encodeURIComponent(sectionKey)}&page=${page}&size=${size}`),
  getArchive: (year: number, month?: number, sectionKey?: string, page = 0, size = 10) => {
    const qs = new URLSearchParams({ year: String(year), page: String(page), size: String(size) });
    if (month != null) qs.set('month', String(month));
    if (sectionKey) qs.set('sectionKey', sectionKey);
    return http<PageResponse<PostDto>>(`/api/public/posts/archive?${qs.toString()}`);
  },
  getMenuSections: () => http<SectionDto[]>('/api/public/sections/menu'),

  // ===== Admin Posts =====
  adminSearchPosts: (params?: { status?: string; sectionId?: string; q?: string; page?: number; size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.sectionId) qs.set('sectionId', params.sectionId);
    if (params?.q) qs.set('q', params.q);
    qs.set('page', String(params?.page ?? 0));
    qs.set('size', String(params?.size ?? 10));
    return http<PageResponse<PostDto>>(`/api/admin/posts?${qs.toString()}`);
  },
  adminCreateDraft: (req: CreatePostRequest) =>
    http<PostDto>('/api/admin/posts', { method: 'POST', body: JSON.stringify(req) }),
  adminGetPost: (postId: string) => http<PostDto>(`/api/admin/posts/${encodeURIComponent(postId)}`),
  adminUpdatePost: (postId: string, req: UpdatePostRequest) =>
    http<PostDto>(`/api/admin/posts/${encodeURIComponent(postId)}`, { method: 'PUT', body: JSON.stringify(req) }),
  adminDeletePost: (postId: string) => http<void>(`/api/admin/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' }),
  adminPublishPost: (postId: string) =>
    http<PostDto>(`/api/admin/posts/${encodeURIComponent(postId)}/publish`, { method: 'POST' }),
  adminUnpublishPost: (postId: string) =>
    http<PostDto>(`/api/admin/posts/${encodeURIComponent(postId)}/unpublish`, { method: 'POST' }),

  // ===== Admin Sections =====
  adminListSections: (q?: string) => http<SectionDto[]>(`/api/admin/sections${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  // ===== Admin Front Page =====
  adminListFrontPageItems: () => http<FrontPageItemDto[]>('/api/admin/front-page/items'),
  adminSetFeatured: (postId: string) =>
    http<FrontPageItemDto>(`/api/admin/front-page/featured?postId=${encodeURIComponent(postId)}`, { method: 'POST' }),
  adminUpsertCurated: (req: { postId: string; position: number; active: boolean; startAt?: string; endAt?: string; note?: string }) =>
    http<FrontPageItemDto>('/api/admin/front-page/curated', { method: 'POST', body: JSON.stringify(req) }),
  adminUpdateFrontPageItem: (
    id: number | string,
    req: Partial<{ active: boolean; pinned: boolean; position: number; startAt?: string; endAt?: string; note?: string }>
  ) => http<FrontPageItemDto>(`/api/admin/front-page/items/${id}`, { method: 'PATCH', body: JSON.stringify(req) }),
  adminReorderFrontPageItems: (orderedIds: number[]) =>
    http<void>('/api/admin/front-page/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) }),
  adminDeleteFrontPageItem: (id: number | string) =>
    http<void>(`/api/admin/front-page/items/${id}`, { method: 'DELETE' }),
};
