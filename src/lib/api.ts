import categoriesFallback from "@/app/api/category.json";
import productsFallback from "@/app/api/product.json";

// Point all server and proxy requests at the backend base URL so avatar/image
// endpoints resolve correctly. Keep browser requests going through the same-origin
// proxy to avoid mixed-content issues.
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const UPSTREAM_API_BASE_URL = (configuredApiBaseUrl || "https://api.iqrainternationalislamicinstitute.com").replace(/\/$/, "");

export const API_BASE_URL = "/api/proxy";

export function normalizeApiUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const value = url.trim();
  if (!value) return undefined;

  if (!/^https?:\/\//i.test(value)) {
    if (value.startsWith("/")) {
      return `${UPSTREAM_API_BASE_URL}${value}`;
    }
    return value;
  }

  try {
    const parsed = new URL(value);
    const isLocalBackend = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.port === "4000";

    if (!isLocalBackend) {
      return value;
    }

    const upstreamOrigin = new URL(UPSTREAM_API_BASE_URL).origin;
    return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, upstreamOrigin).toString();
  } catch {
    return value;
  }
}

function getServerApiBaseUrl(): string {
  return UPSTREAM_API_BASE_URL;
}

export async function getApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.clone().json()) as { error?: string; message?: string };
    return new Error(body.message ?? body.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export type CategoryRecord = {
  id: string;
  name: string;
  title?: string;
  description: string;
  image_url?: string;
  slug?: string;
};

export type CourseRecord = {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  discount_price?: number;
  originalPrice?: number;
  currency?: string;
  duration?: string;
  level?: string;
  categoryId?: string;
  category_id?: string;
  category_ids?: string[];
  image?: string;
  image_url?: string;
  emoji?: string;
  thumbBg?: string;
  rating?: string;
  students?: string;
  lessons?: number;
  is_published?: boolean;
  created_by?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  json_ld?: string | Record<string, unknown> | null;
};

export type LessonRecord = {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  videoUrl?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  order_index?: number;
  is_free?: boolean;
  course_id?: string;
  courseId?: string;
};

export type ReviewRecord = {
  id: string;
  user_id: string;
  review_text: string;
  rating: number;
  course_id?: string;
};

export type BlogCategoryRecord = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
};

export type BlogPostRecord = {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  slug?: string;
  category_id?: string;
  created_by?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  json_ld?: string | Record<string, unknown> | null;
};

export type EnrollmentRecord = {
  id: string;
  user_id: string;
  course_id: string;
  full_name?: string;
  whatsapp?: string;
  notes?: string;
  progress?: number;
  payment_status?: string;
  payment_method?: string;
};

export type UserRecord = {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at?: string;
};

export type NotificationRecord = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read?: boolean;
};

export type SettingsRecord = {
  id?: string;
  site_name?: string;
  site_email?: string;
  site_phone?: string;
  site_address?: string;
  navbar_announcement?: string;
  footer_tagline?: string;
  footer_copyright?: string;
  whatsapp_number?: string;
  facebook_url?: string;
  instagram_url?: string;
  logo_url?: string;
  logoUrl?: string;
  favicon_url?: string;
  faviconUrl?: string;
  primary_color?: string;
  secondary_color?: string;
  default_meta_title?: string;
  default_meta_description?: string;
  default_meta_keywords?: string;
};

export const DEFAULT_SETTINGS: SettingsRecord = {
  site_name: "Iqra International",
  site_email: "hello@iqrainternational.com",
  site_phone: "+1 (000) 000-0000",
  site_address: "Islamabad, Pakistan",
  navbar_announcement: "Learn Quran with confidence and clarity.",
  footer_tagline: "Structured Quran and Islamic learning with qualified scholars and a welcoming community.",
  footer_copyright: "© 2025 Iqra International. All rights reserved.",
  whatsapp_number: "+923001234567",
  facebook_url: "https://facebook.com",
  instagram_url: "https://instagram.com",
  logo_url: "",
  primary_color: "#0f172a",
  secondary_color: "#2563eb",
  default_meta_title: "Iqra International | Quran and Islamic Learning",
  default_meta_description: "Learn Quranic recitation, Islamic studies, and purposeful guidance through structured online courses for all ages.",
  default_meta_keywords: "quran, islamic studies, online courses, deen, learning",
};

export function normalizeSettings(value: unknown): SettingsRecord {
  let current = value;

  for (let depth = 0; depth < 3; depth += 1) {
    if (!current || typeof current !== "object" || Array.isArray(current)) break;
    const record = current as Record<string, unknown>;
    const nested = record.settings ?? record.data ?? record.result;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      current = nested;
      continue;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...record,
      logo_url: typeof record.logo_url === "string" ? record.logo_url : typeof record.logoUrl === "string" ? record.logoUrl : DEFAULT_SETTINGS.logo_url,
      favicon_url: typeof record.favicon_url === "string" ? record.favicon_url : typeof record.faviconUrl === "string" ? record.faviconUrl : undefined,
      default_meta_title: typeof record.default_meta_title === "string" ? record.default_meta_title : DEFAULT_SETTINGS.default_meta_title,
      default_meta_description: typeof record.default_meta_description === "string" ? record.default_meta_description : DEFAULT_SETTINGS.default_meta_description,
      default_meta_keywords: typeof record.default_meta_keywords === "string" ? record.default_meta_keywords : DEFAULT_SETTINGS.default_meta_keywords,
    } as SettingsRecord;
  }

  return { ...DEFAULT_SETTINGS };
}

export type Product = CourseRecord;

function normalizeCategory(item: Partial<CategoryRecord> & Record<string, unknown>): CategoryRecord {
  const name = String(item.name ?? item.title ?? item.slug ?? "New category");

  return {
    id: String(item.id ?? crypto.randomUUID()),
    name,
    title: String(item.title ?? item.name ?? item.slug ?? name),
    description: String(item.description ?? ""),
    image_url: typeof item.image_url === "string" ? item.image_url : "",
    slug: typeof item.slug === "string" ? item.slug : undefined,
  };
}

export type SeoRecord = {
  id?: string;
  page_name?: string;
  page_path?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  json_ld?: string | Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export function normalizeCourse(item: Partial<CourseRecord> & Record<string, unknown>): CourseRecord {
  const name = String(item.title ?? item.name ?? "Course");
  const priceValue = Number(item.price ?? 0);
  const discountValue = typeof item.discount_price === "number" ? item.discount_price : Number(item.discount_price ?? 0);
  const categoryId =
    typeof item.categoryId === "string"
      ? item.categoryId
      : typeof item.category_id === "string"
        ? item.category_id
        : Array.isArray(item.category_ids) && typeof item.category_ids[0] === "string"
          ? item.category_ids[0]
          : "";

  const price = Number.isFinite(priceValue) ? priceValue : 0;
  const originalPrice =
    typeof item.originalPrice === "number"
      ? item.originalPrice
      : typeof item.price === "number" && typeof item.discount_price === "number"
        ? item.price
        : typeof item.price === "number"
          ? item.price
          : undefined;

  const imageUrl =
    typeof item.image_url === "string"
      ? item.image_url
      : typeof item.image === "string"
        ? item.image
        : "";

  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: name,
    name,
    description: String(item.description ?? ""),
    price,
    originalPrice,
    discount_price: Number.isFinite(discountValue) && discountValue > 0 ? discountValue : undefined,
    currency: typeof item.currency === "string" ? item.currency : "USD",
    duration: typeof item.duration === "string" ? item.duration : "4 weeks",
    level: typeof item.level === "string" ? item.level : "All levels",
    categoryId,
    category_id: categoryId || undefined,
    category_ids: Array.isArray(item.category_ids) ? item.category_ids.map(String) : categoryId ? [categoryId] : [],
    image: imageUrl,
    image_url: imageUrl,
    emoji: typeof item.emoji === "string" ? item.emoji : "📖",
    thumbBg:
      typeof item.thumbBg === "string"
        ? item.thumbBg
        : "linear-gradient(135deg,#E6F4F4,#C5E8E8)",
    rating: typeof item.rating === "string" ? item.rating : typeof item.average_rating === "number" ? String(item.average_rating) : "4.9",
    students:
      typeof item.students === "string"
        ? item.students
        : typeof item.total_students === "number"
          ? String(item.total_students)
          : "1,000+",
    lessons: typeof item.lessons === "number" ? item.lessons : 12,
    is_published: Boolean(item.is_published),
    created_by: typeof item.created_by === "string" ? item.created_by : undefined,
    meta_title: typeof item.meta_title === "string" ? item.meta_title : undefined,
    meta_description: typeof item.meta_description === "string" ? item.meta_description : undefined,
    meta_keywords: typeof item.meta_keywords === "string" ? item.meta_keywords : undefined,
    json_ld: typeof item.json_ld === "string" || (item.json_ld && typeof item.json_ld === "object") ? item.json_ld : undefined,
  };
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const relativePath = path.startsWith("/") ? path : `/${path}`;
  const url = typeof window === "undefined"
    ? new URL(relativePath, getServerApiBaseUrl()).toString()
    : `${API_BASE_URL}${relativePath}`;

  // Timeout so a hung or slow backend doesn't hang the page forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(timeout);
  }
}

function logApiFailure(context: string, err: unknown) {
  console.error(`[api] ${context} failed, using fallback:`, err);
}

export async function getCategories(): Promise<CategoryRecord[]> {
  try {
    const response = await fetchJson<CategoryRecord[]>("/v1/categories");
    return Array.isArray(response) ? response.map((item) => normalizeCategory(item)) : [];
  } catch (err) {
    logApiFailure("getCategories", err);
    return (categoriesFallback as Array<Partial<CategoryRecord>>).map((item) => normalizeCategory(item));
  }
}

export async function getCourses(): Promise<CourseRecord[]> {
  try {
    const response = await fetchJson<CourseRecord[]>("/v1/courses");
    return Array.isArray(response) ? response.map((item) => normalizeCourse(item)) : [];
  } catch (err) {
    logApiFailure("getCourses", err);
    return (productsFallback as Array<Partial<CategoryRecord>>).map((item) => normalizeCourse(item));
  }
}

export async function getCourseById(courseId: string): Promise<CourseRecord | null> {
  try {
    const course = await fetchJson<CourseRecord>(`/v1/courses/${courseId}`);
    return normalizeCourse(course);
  } catch (err) {
    logApiFailure(`getCourseById(${courseId})`, err);
    const fallback = (productsFallback as Array<Partial<CourseRecord>>).find((item) => item.id === courseId);
    return fallback ? normalizeCourse(fallback) : null;
  }
}

export async function getCourseLessons(courseId: string): Promise<LessonRecord[]> {
  if (!isUuid(courseId)) {
    return [];
  }

  try {
    const response = await fetchJson<LessonRecord[]>(`/v1/courses/${courseId}/lessons`);
    return Array.isArray(response) ? response.map(normalizeLesson) : [];
  } catch (err) {
    logApiFailure(`getCourseLessons(${courseId})`, err);
    return [];
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeLesson(item: Partial<LessonRecord> & Record<string, unknown>): LessonRecord {
  const videoValue = typeof item.video_url === "string" ? item.video_url : typeof item.videoUrl === "string" ? item.videoUrl : undefined;
  const thumbnailValue = typeof item.thumbnail_url === "string"
    ? item.thumbnail_url
    : typeof item.thumbnailUrl === "string"
      ? item.thumbnailUrl
      : typeof item.image_url === "string"
        ? item.image_url
        : typeof item.cover_image === "string"
          ? item.cover_image
          : undefined;

  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? item.name ?? "Lesson"),
    description: String(item.description ?? ""),
    video_url: videoValue,
    videoUrl: typeof item.videoUrl === "string" ? item.videoUrl : videoValue,
    thumbnail_url: thumbnailValue,
    thumbnailUrl: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : thumbnailValue,
    order_index: Number.isFinite(Number(item.order_index)) ? Number(item.order_index) : undefined,
    is_free: Boolean(item.is_free ?? item.isFree),
    course_id: typeof item.course_id === "string" ? item.course_id : typeof item.courseId === "string" ? item.courseId : undefined,
    courseId: typeof item.courseId === "string" ? item.courseId : undefined,
  };
}

export async function getLessons(): Promise<LessonRecord[]> {
  try {
    const response = await fetchJson<LessonRecord[] | { data?: LessonRecord[]; lessons?: LessonRecord[] }>("/v1/lessons");
    const lessons = Array.isArray(response) ? response : response.data ?? response.lessons ?? [];
    return lessons.map((item) => normalizeLesson(item as Partial<LessonRecord> & Record<string, unknown>));
  } catch (err) {
    logApiFailure("getLessons", err);
    return [];
  }
}

export async function getBlogCategories(): Promise<BlogCategoryRecord[]> {
  try {
    const response = await fetchJson<BlogCategoryRecord[] | { data?: BlogCategoryRecord[]; categories?: BlogCategoryRecord[] }>("/v1/blog/categories");
    return Array.isArray(response) ? response : response.data ?? response.categories ?? [];
  } catch (err) {
    logApiFailure("getBlogCategories", err);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPostRecord[]> {
  try {
    const response = await fetchJson<BlogPostRecord[] | { data?: BlogPostRecord[]; posts?: BlogPostRecord[] }>("/v1/blog");
    const posts = Array.isArray(response) ? response : response.data ?? response.posts ?? [];
    return posts.map(normalizeBlogPost);
  } catch (err) {
    logApiFailure("getBlogPosts", err);
    return [];
  }
}

function normalizeBlogPost(item: BlogPostRecord & Record<string, unknown>): BlogPostRecord {
  return {
    ...item,
    id: String(item.id),
    title: String(item.title ?? "Untitled article"),
    content: String(item.content ?? ""),
    category_id: typeof item.category_id === "string" ? item.category_id : undefined,
    slug: typeof item.slug === "string" ? item.slug : undefined,
    is_published: Boolean(item.is_published ?? item.published_at),
  };
}

export async function getBlogPost(identifier: string): Promise<BlogPostRecord | null> {
  try {
    const post = identifier.includes("-") && !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(identifier)
      ? await fetchJson<BlogPostRecord>(`/v1/blog/slug/${encodeURIComponent(identifier)}`)
      : await fetchJson<BlogPostRecord>(`/v1/blog/${encodeURIComponent(identifier)}`);
    return normalizeBlogPost(post as BlogPostRecord & Record<string, unknown>);
  } catch (err) {
    logApiFailure(`getBlogPost(${identifier})`, err);
    const posts = await getBlogPosts();
    return posts.find((post) => post.id === identifier || post.slug === identifier) ?? null;
  }
}

export async function getEnrollmentsByUser(userId: string): Promise<EnrollmentRecord[]> {
  try {
    const response = await fetchJson<EnrollmentRecord[]>(`/v1/enrollments/user/${userId}`);
    return Array.isArray(response) ? response : [];
  } catch (err) {
    logApiFailure(`getEnrollmentsByUser(${userId})`, err);
    return [];
  }
}

export async function getNotifications(userId: string): Promise<NotificationRecord[]> {
  try {
    const response = await fetchJson<NotificationRecord[]>(`/v1/notifications/user/${userId}`);
    return Array.isArray(response) ? response : [];
  } catch (err) {
    logApiFailure(`getNotifications(${userId})`, err);
    return [];
  }
}

export function normalizeSeoRecord(value: unknown): SeoRecord | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const item = record.data && typeof record.data === "object" && !Array.isArray(record.data) ? (record.data as Record<string, unknown>) : record;

  return {
    id: typeof item.id === "string" ? item.id : undefined,
    page_name: typeof item.page_name === "string" ? item.page_name : undefined,
    page_path: typeof item.page_path === "string" ? item.page_path : undefined,
    meta_title: typeof item.meta_title === "string" ? item.meta_title : undefined,
    meta_description: typeof item.meta_description === "string" ? item.meta_description : undefined,
    meta_keywords: typeof item.meta_keywords === "string" ? item.meta_keywords : undefined,
    og_title: typeof item.og_title === "string" ? item.og_title : undefined,
    og_description: typeof item.og_description === "string" ? item.og_description : undefined,
    og_image: typeof item.og_image === "string" ? item.og_image : undefined,
    canonical_url: typeof item.canonical_url === "string" ? item.canonical_url : undefined,
    robots: typeof item.robots === "string" ? item.robots : undefined,
    json_ld: typeof item.json_ld === "string"
      ? item.json_ld
      : item.json_ld && typeof item.json_ld === "object" && !Array.isArray(item.json_ld)
        ? (item.json_ld as Record<string, unknown>)
        : undefined,
    created_at: typeof item.created_at === "string" ? item.created_at : undefined,
    updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
  };
}

export async function getSeoPage(path: string): Promise<SeoRecord | null> {
  try {
    const target = new URL("/api/seo", process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    target.searchParams.set("path", path);

    const response = await fetch(target.toString(), {
      next: { tags: ["seo"], revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return normalizeSeoRecord(payload);
  } catch (err) {
    logApiFailure(`getSeoPage(${path})`, err);
    return null;
  }
}

export async function getSettings(): Promise<SettingsRecord> {
  try {
    const settings = await fetchJson<unknown>("/v1/settings");
    return normalizeSettings(settings);
  } catch (err) {
    logApiFailure("getSettings", err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function apiRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return fetchJson<T>(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
