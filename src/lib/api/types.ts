export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SectionVisibility = 'PUBLIC' | 'PRIVATE';

export interface AbstractDto {
  id: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface UserDto extends AbstractDto {
  email: string;
  fullName?: string;
  role?: string;
  active: boolean;
}

export interface LoginResponse {
  user: UserDto;
}

export interface SectionDto extends AbstractDto {
  key: string;
  name: string;
  description?: string;
  sortOrder?: number;
  active: boolean;
  visibility: SectionVisibility;
  icon?: string;
}

export interface PostDto extends AbstractDto {
  title: string;
  subtitle?: string;
  excerpt?: string;
  contentMd?: string;
  slug: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  section: any; // backend sends enum or object depending on mapping; keep flexible
  status: PostStatus;
  featured: boolean;
  showOnFront: boolean;
  frontRank?: number;
  publishedAt?: string;
}

export interface FrontPageDto {
  featured?: PostDto;
  latest: PostDto[];
  curated: PostDto[];
  editorialBlock: PostDto[];
  diaryBlock: PostDto[];
  notesBlock: PostDto[];
}

export interface PostPreviewDto {
  id: string;
  title: string;
  slug: string;
  section?: SectionDto;
}

export interface FrontPageItemDto extends AbstractDto {
  postId: string;
  position?: number;
  active: boolean;
  pinned: boolean;
  startAt?: string;
  endAt?: string;
  note?: string;
  post?: PostPreviewDto;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreatePostRequest {
  title: string;
  sectionId: string;
  contentJson: string;
  subtitle?: string;
  slug?: string;
  contentMd?: string;
  contentHtml?: string;
  contentText?: string;
}

export interface UpdatePostRequest {
  title?: string;
  subtitle?: string;
  sectionId?: string;
  slug?: string;
  contentJson?: string;
  contentMd?: string;
  contentHtml?: string;
  contentText?: string;
}
