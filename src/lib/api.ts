import categoriesFallback from "@/app/api/category.json";
import productsFallback from "@/app/api/product.json";

// The upstream is HTTP with a self-signed HTTPS certificate. Keep it server-side
// and use the same-origin proxy from browser components to avoid mixed content.
export const UPSTREAM_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://ndpziuqvqvw5vvxpgw1l9ukr.169.58.214.134.sslip.io";

export const API_BASE_URL = "/api/proxy";

function getServerApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? UPSTREAM_API_BASE_URL).replace(/\/$/, "");
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
};

export type LessonRecord = {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  order_index?: number;
  is_free?: boolean;
  course_id?: string;
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
};

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
  try {
    const response = await fetchJson<LessonRecord[]>(`/v1/courses/${courseId}/lessons`);
    return Array.isArray(response) ? response : [];
  } catch (err) {
    logApiFailure(`getCourseLessons(${courseId})`, err);
    return [];
  }
}

export async function getBlogCategories(): Promise<BlogCategoryRecord[]> {
  try {
    const response = await fetchJson<BlogCategoryRecord[]>("/v1/blog/categories");
    return Array.isArray(response) ? response : [];
  } catch (err) {
    logApiFailure("getBlogCategories", err);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPostRecord[]> {
  try {
    const response = await fetchJson<BlogPostRecord[]>("/v1/blog");
    return Array.isArray(response) ? response : [];
  } catch (err) {
    logApiFailure("getBlogPosts", err);
    return [];
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

export async function getSettings(): Promise<SettingsRecord> {
  try {
    return await fetchJson<SettingsRecord>("/v1/settings");
  } catch (err) {
    logApiFailure("getSettings", err);
    return { site_name: "Iqra Platform", site_email: "info@iqra.com", site_phone: "+923001234567" };
  }
}

export async function apiRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  return fetchJson<T>(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
