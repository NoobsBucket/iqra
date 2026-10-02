"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/app/components/auth-user-provider";
import { MediaUpload } from "@/app/components/admin/media-upload";
import { AdminToastViewport } from "@/app/components/admin/admin-toast";
import { API_BASE_URL, DEFAULT_SETTINGS, getSettings, type BlogCategoryRecord, type BlogPostRecord, type CategoryRecord, type ContactMessageRecord, type CourseRecord, type EnrollmentRecord, type LessonRecord, type SettingsRecord, type UserRecord } from "@/lib/api";

const defaultCourseForm = {
  title: "",
  description: "",
  price: "49.99",
  discount_price: "29.99",
  currency: "USD",
  category_id: "",
  image_url: "",
};

const defaultLessonForm = {
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  order_index: "1",
  is_free: "true",
};

const defaultCategoryForm = {
  name: "",
  description: "",
  image_url: "",
};

const defaultSettingsForm: SettingsRecord = {
  site_name: DEFAULT_SETTINGS.site_name,
  site_email: DEFAULT_SETTINGS.site_email,
  site_phone: DEFAULT_SETTINGS.site_phone,
  site_address: DEFAULT_SETTINGS.site_address,
  navbar_announcement: DEFAULT_SETTINGS.navbar_announcement,
  footer_tagline: DEFAULT_SETTINGS.footer_tagline,
  footer_copyright: DEFAULT_SETTINGS.footer_copyright,
  whatsapp_number: DEFAULT_SETTINGS.whatsapp_number,
  facebook_url: DEFAULT_SETTINGS.facebook_url,
  instagram_url: DEFAULT_SETTINGS.instagram_url,
  logo_url: DEFAULT_SETTINGS.logo_url,
  primary_color: DEFAULT_SETTINGS.primary_color,
  secondary_color: DEFAULT_SETTINGS.secondary_color,
};

const defaultBlogForm = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

async function apiRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function asArray<T>(value: T[] | Record<string, unknown> | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of ["data", "users", "messages", "enrollments", "categories", "posts"]) {
    const collection = value[key];
    if (Array.isArray(collection)) return collection as T[];
  }

  return [];
}

function isStaffUser(user: UserRecord) {
  const role = user.role?.toLowerCase();
  return role === "admin" || role === "instructor";
}

export function AdminDashboard() {
  const authUser = useAuthUser();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [editingCourseId, setEditingCourseId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [lessonForm, setLessonForm] = useState(defaultLessonForm);
  const [settingsForm, setSettingsForm] = useState<SettingsRecord>(defaultSettingsForm);
  const [blogCategories, setBlogCategories] = useState<BlogCategoryRecord[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);
  const [blogForm, setBlogForm] = useState(defaultBlogForm);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchApplied, setUserSearchApplied] = useState(false);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentRecord[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [settingsSnapshot, setSettingsSnapshot] = useState<SettingsRecord>(defaultSettingsForm);
  const displayedUsers = userSearchApplied ? users : users.filter(isStaffUser);

  const loadData = async () => {
    try {
      const [categoryData, courseData, settingsData, blogCategoryData, blogPostData, userData, messageData, enrollmentData] = await Promise.all([
        apiRequest<CategoryRecord[]>("/v1/categories"),
        apiRequest<CourseRecord[]>("/v1/courses"),
        getSettings(),
        apiRequest<BlogCategoryRecord[]>("/v1/blog/categories").catch(() => []),
        apiRequest<BlogPostRecord[]>("/v1/blog").catch(() => []),
        apiRequest<UserRecord[]>("/v1/users").catch(() => []),
        apiRequest<ContactMessageRecord[]>("/v1/contact").catch(() => []),
        apiRequest<EnrollmentRecord[]>("/v1/enrollments").catch(() => []),
      ]);

      const safeCategories = asArray(categoryData);
      const safeCourses = asArray(courseData);
      const safeSettings = { ...DEFAULT_SETTINGS, ...settingsData };

      setCategories(safeCategories);
      setCourses(safeCourses);
      setSettingsForm(safeSettings);
      setSettingsSnapshot(safeSettings);
      setBlogCategories(asArray<BlogCategoryRecord>(blogCategoryData));
      setBlogPosts(asArray<BlogPostRecord>(blogPostData));
      const safeUsers = asArray<UserRecord>(userData);
      setUsers(safeUsers);
      setStaffCount(safeUsers.filter(isStaffUser).length);
      setMessages(asArray<ContactMessageRecord>(messageData));
      setAllEnrollments(asArray<EnrollmentRecord>(enrollmentData));
      setSelectedCourseId((current) => current || safeCourses[0]?.id || "");

      if (safeCourses[0]?.id) {
        const lessonData = await apiRequest<LessonRecord[]>(`/v1/courses/${safeCourses[0].id}/lessons`);
        setLessons(asArray(lessonData));
        const enrollmentData = await apiRequest<EnrollmentRecord[]>(`/v1/courses/${safeCourses[0].id}/enrollments`);
        setEnrollments(asArray(enrollmentData));
      }
    } catch {
      setMessage("The live API is unavailable right now. The dashboard is ready for local use once the backend responds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      setEnrollments([]);
      setSelectedLessonId("");
      setLessonForm(defaultLessonForm);
      return;
    }

    const loadLessons = async () => {
      try {
        const lessonData = await apiRequest<LessonRecord[]>(`/v1/courses/${selectedCourseId}/lessons`);
        setLessons(asArray(lessonData));
        const enrollmentData = await apiRequest<EnrollmentRecord[]>(`/v1/courses/${selectedCourseId}/enrollments`);
        setEnrollments(asArray(enrollmentData));
      } catch {
        setLessons([]);
        setEnrollments([]);
      }
    };

    setSelectedLessonId("");
    setLessonForm(defaultLessonForm);
    loadLessons();
  }, [selectedCourseId]);

  const handleCreateCategory = async () => {
    try {
      const created = await apiRequest<CategoryRecord>("/v1/categories", "POST", categoryForm);
      setCategories((current) => [created, ...current]);
      setCategoryForm(defaultCategoryForm);
      setMessage("Category created successfully.");
    } catch {
      setMessage("Category creation failed. Check that the API is running and the payload is valid.");
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category || selectedCategoryId !== id) {
      setMessage("Choose Edit for the category before saving changes.");
      return;
    }

    const changes: Record<string, unknown> = {};
    if (categoryForm.name.trim() !== category.name) changes.name = categoryForm.name.trim();
    if (categoryForm.description.trim() !== category.description) changes.description = categoryForm.description.trim();
    if (categoryForm.image_url !== (category.image_url ?? "")) changes.image_url = categoryForm.image_url || null;
    if (Object.keys(changes).length === 0) {
      setMessage("No category changes to save.");
      return;
    }

    try {
      const updated = await apiRequest<CategoryRecord>(`/v1/categories/${id}`, "PATCH", changes);
      setCategories((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setMessage("Category updated successfully.");
    } catch {
      setMessage("Category update failed.");
    }
  };

  const editCategory = (category: CategoryRecord) => {
    setSelectedCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      image_url: category.image_url ?? "",
    });
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/categories/${id}`, "DELETE");
      setCategories((current) => current.filter((category) => category.id !== id));
      setMessage("Category deleted successfully.");
    } catch {
      setMessage("Category delete failed.");
    }
  };

  const handleCreateCourse = async () => {
    try {
      const selectedCategoryId = courseForm.category_id;
      const price = Number(courseForm.price);
      const discountPrice = Number(courseForm.discount_price || 0);

      if (!authUser?.id) {
        setMessage("You must be signed in to create a course.");
        return;
      }

      if (!courseForm.title.trim() || !courseForm.description.trim() || !selectedCategoryId || !Number.isFinite(price) || !Number.isFinite(discountPrice)) {
        setMessage("Enter a title, description, valid prices, and select a category.");
        return;
      }

      const payload = {
        created_by: authUser.id,
        title: courseForm.title,
        description: courseForm.description,
        image_url: courseForm.image_url,
        price,
        discount_price: discountPrice,
        currency: courseForm.currency,
        category_ids: [selectedCategoryId],
      };

      const created = await apiRequest<CourseRecord>("/v1/courses", "POST", payload);
      setCourses((current) => [created, ...current]);
      setCourseForm(defaultCourseForm);
      setEditingCourseId("");
      setSelectedCourseId(created.id);
      setMessage("Course created successfully.");
    } catch {
      setMessage("Course creation failed. Ensure the API is reachable and a category is selected.");
    }
  };

  const handleUpdateCourse = async (id: string) => {
    const course = courses.find((item) => item.id === id);
    if (!course || editingCourseId !== id) {
      setMessage("Choose Edit for the course before saving changes.");
      return;
    }

    const changes: Record<string, unknown> = {};
    if (courseForm.title.trim() !== course.title) changes.title = courseForm.title.trim();
    if (courseForm.description.trim() !== course.description) changes.description = courseForm.description.trim();
    if (courseForm.price !== String(course.price ?? "")) {
      const price = Number(courseForm.price);
      if (!courseForm.price.trim() || !Number.isFinite(price)) {
        setMessage("Enter a valid course price.");
        return;
      }
      changes.price = price;
    }
    if (courseForm.discount_price !== String(course.discount_price ?? "")) {
      const discountPrice = courseForm.discount_price.trim() ? Number(courseForm.discount_price) : null;
      if (discountPrice !== null && !Number.isFinite(discountPrice)) {
        setMessage("Enter a valid discount price.");
        return;
      }
      changes.discount_price = discountPrice;
    }
    if (courseForm.currency !== (course.currency ?? "USD")) changes.currency = courseForm.currency;
    if (courseForm.image_url !== (course.image_url ?? course.image ?? "")) changes.image_url = courseForm.image_url || null;
    const originalCategory = course.category_ids?.[0] ?? course.categoryId ?? course.category_id ?? "";
    if (courseForm.category_id !== originalCategory) {
      changes.category_ids = courseForm.category_id ? [courseForm.category_id] : [];
    }
    if (Object.keys(changes).length === 0) {
      setMessage("No course changes to save.");
      return;
    }

    try {
      const updated = await apiRequest<CourseRecord>(`/v1/courses/${id}`, "PATCH", changes);

      setCourses((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setCourseForm(defaultCourseForm);
      setEditingCourseId("");
      setMessage("Course updated successfully.");
    } catch {
      setMessage("Course update failed.");
    }
  };

  const editCourse = (course: CourseRecord) => {
    setEditingCourseId(course.id);
    setSelectedCourseId(course.id);
    const selectedCategory = course.category_ids?.[0] ?? course.categoryId ?? course.category_id ?? "";

    setCourseForm({
      title: course.title,
      description: course.description,
      price: String(course.price ?? ""),
      discount_price: String(course.discount_price ?? ""),
      currency: course.currency ?? "USD",
      category_id: selectedCategory,
      image_url: course.image_url ?? "",
    });
  };

  const handlePublishCourse = async (id: string) => {
    try {
      const updated = await apiRequest<CourseRecord>(`/v1/courses/${id}/publish`, "PATCH");
      setCourses((current) => current.map((course) => (course.id === id ? updated : course)));
      setMessage("Course publish status updated.");
    } catch {
      setMessage("Course publish failed.");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/courses/${id}`, "DELETE");
      setCourses((current) => current.filter((course) => course.id !== id));
      setMessage("Course deleted successfully.");
    } catch {
      setMessage("Course delete failed.");
    }
  };

  const handleCreateLesson = async () => {
    try {
      const orderIndex = Number(lessonForm.order_index);

      if (!selectedCourseId) {
        setMessage("Select a course before creating a lesson.");
        return;
      }

      if (!lessonForm.title.trim() || !lessonForm.description.trim() || !Number.isInteger(orderIndex) || orderIndex < 1) {
        setMessage("Enter a lesson title, description, and a valid order number.");
        return;
      }

      const payload = {
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        video_url: lessonForm.video_url.trim() || null,
        thumbnail_url: lessonForm.thumbnail_url.trim() || null,
        order_index: orderIndex,
        is_free: lessonForm.is_free === "true",
      };

      const created = await apiRequest<LessonRecord>(`/v1/courses/${selectedCourseId}/lessons`, "POST", payload);
      setLessons((current) => [created, ...current]);
      setLessonForm(defaultLessonForm);
      setMessage("Lesson created successfully.");
    } catch {
      setMessage("Lesson creation failed.");
    }
  };

  const handleUpdateLesson = async (id: string) => {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson || selectedLessonId !== id) {
      setMessage("Choose Edit for the lesson before saving changes.");
      return;
    }

    const changes: Record<string, unknown> = {};
    const title = lessonForm.title.trim();
    const description = lessonForm.description.trim();
    const originalVideo = lesson.video_url ?? lesson.videoUrl ?? "";
    const originalThumbnail = lesson.thumbnail_url ?? lesson.thumbnailUrl ?? "";
    const orderIndex = Number(lessonForm.order_index);

    if (title !== lesson.title) {
      if (!title) {
        setMessage("Lesson title cannot be empty.");
        return;
      }
      changes.title = title;
    }
    if (description !== lesson.description) {
      if (!description) {
        setMessage("Lesson description cannot be empty.");
        return;
      }
      changes.description = description;
    }
    if (lessonForm.video_url.trim() !== originalVideo) changes.video_url = lessonForm.video_url.trim() || null;
    if (lessonForm.thumbnail_url !== originalThumbnail) changes.thumbnail_url = lessonForm.thumbnail_url || null;
    if (lessonForm.order_index !== String(lesson.order_index ?? 1)) {
      if (!Number.isInteger(orderIndex) || orderIndex < 1) {
        setMessage("Enter a valid lesson order number.");
        return;
      }
      changes.order_index = orderIndex;
    }
    if ((lessonForm.is_free === "true") !== (lesson.is_free ?? true)) changes.is_free = lessonForm.is_free === "true";
    if (Object.keys(changes).length === 0) {
      setMessage("No lesson changes to save.");
      return;
    }

    try {
      const updated = await apiRequest<LessonRecord>(`/v1/lessons/${id}`, "PATCH", changes);
      setLessons((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setSelectedLessonId("");
      setLessonForm(defaultLessonForm);
      setMessage("Lesson updated successfully.");
    } catch {
      setMessage("Lesson update failed.");
    }
  };

  const editLesson = (lesson: LessonRecord) => {
    setSelectedLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url ?? "",
      thumbnail_url: lesson.thumbnail_url ?? lesson.thumbnailUrl ?? "",
      order_index: String(lesson.order_index ?? 1),
      is_free: String(lesson.is_free ?? true),
    });
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/lessons/${id}`, "DELETE");
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
      if (selectedLessonId === id) {
        setSelectedLessonId("");
        setLessonForm(defaultLessonForm);
      }
      setMessage("Lesson deleted successfully.");
    } catch {
      setMessage("Lesson delete failed.");
    }
  };

  const handleUpdateSettings = async () => {
    const payload = { ...DEFAULT_SETTINGS, ...settingsForm };
    const hasChanges = Object.entries(payload).some(([key, value]) => {
      const currentValue = settingsSnapshot[key as keyof SettingsRecord];
      return String(value ?? "") !== String(currentValue ?? "");
    });

    if (!hasChanges) {
      setMessage("No settings changes to save.");
      return;
    }

    try {
      await apiRequest<unknown>("/v1/settings", "PATCH", payload);
      setSettingsForm(payload);
      setSettingsSnapshot(payload);
      window.dispatchEvent(new Event("iqra-settings-updated"));
      setMessage("Site settings updated successfully.");
    } catch {
      setMessage("Site settings update failed. The PATCH endpoint may be unavailable right now.");
    }
  };

  const handleCreateBlogCategory = async () => {
    const name = window.prompt("Blog category name");
    if (!name?.trim()) return;
    try {
      const category = await apiRequest<BlogCategoryRecord>("/v1/blog/categories", "POST", { name: name.trim(), description: "" });
      setBlogCategories((current) => [category, ...current]);
      setMessage("Blog category created successfully.");
    } catch {
      setMessage("Blog category creation failed.");
    }
  };

  const handleCreateBlogPost = async () => {
    try {
      if (!authUser?.id) {
        setMessage("You must be signed in to create a blog post.");
        return;
      }

      if (!blogForm.title.trim() || !blogForm.content.trim() || !blogForm.category_id) {
        setMessage("Enter a title and content, then select a blog category.");
        return;
      }

      const created = await apiRequest<BlogPostRecord>("/v1/blog", "POST", {
        created_by: authUser.id,
        title: blogForm.title,
        excerpt: blogForm.excerpt || null,
        content: blogForm.content,
        cover_image: blogForm.cover_image || null,
        category_id: blogForm.category_id,
        meta_title: blogForm.meta_title || null,
        meta_description: blogForm.meta_description || null,
      });
      setBlogPosts((current) => [created, ...current]);
      setBlogForm(defaultBlogForm);
      setMessage("Blog post created as a draft. Verify its content, then publish it below.");
    } catch {
      setMessage("Blog post creation failed. Check the category and required fields.");
    }
  };

  const handlePublishBlogPost = async (id: string) => {
    try {
      const published = await apiRequest<BlogPostRecord>(`/v1/blog/${id}/publish`, "PATCH");
      setBlogPosts((current) => current.map((post) => (post.id === id ? { ...post, ...published, is_published: true } : post)));
      setMessage("Blog post published successfully.");
    } catch {
      setMessage("Blog post publish failed.");
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/blog/${id}`, "DELETE");
      setBlogPosts((current) => current.filter((post) => post.id !== id));
      setMessage("Blog post deleted successfully.");
    } catch {
      setMessage("Blog post deletion failed.");
    }
  };

  const searchUsers = async () => {
    setUserSearchLoading(true);
    try {
      const query = userSearch.trim() ? `?search=${encodeURIComponent(userSearch.trim())}` : "";
      const result = await apiRequest<UserRecord[] | Record<string, unknown>>(`/v1/users${query}`);
      setUsers(asArray<UserRecord>(result));
      setUserSearchApplied(Boolean(query));
    } catch {
      setMessage("User search failed.");
    } finally {
      setUserSearchLoading(false);
    }
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      const updated = await apiRequest<UserRecord>(`/v1/users/${id}/role`, "PATCH", { role });
      setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...updated, role } : user)));
      setMessage("User role updated successfully.");
    } catch {
      setMessage("User role update failed.");
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-700">Loading admin dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-[96rem] space-y-6 px-4 py-8 font-medium text-slate-900 [font-family:var(--font-jost),sans-serif] md:px-8 [&_button]:font-bold [&_h2]:font-bold [&_input]:font-medium [&_select]:font-medium [&_textarea]:font-medium">
      <AdminToastViewport message={message} />
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Iqra / Admin</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Control room</h1>
          <p className="mt-1 text-sm text-slate-600">Courses, team, publishing, and student activity.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div><span className="block text-xs text-slate-500">Courses</span><strong className="text-slate-900">{courses.length}</strong></div>
          <div><span className="block text-xs text-slate-500">Lessons</span><strong className="text-slate-900">{lessons.length}</strong></div>
          <div><span className="block text-xs text-slate-500">Staff</span><strong className="text-slate-900">{staffCount}</strong></div>
          <div><span className="block text-xs text-slate-500">Messages</span><strong className="text-slate-900">{messages.length}</strong></div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">People</p><h2 className="mt-1 text-xl font-black">Users</h2></div><span className="text-sm font-semibold text-slate-600">{displayedUsers.length} {userSearchApplied ? "results" : "staff"}</span></div>
          <div className="mt-4 flex gap-2"><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchUsers()} placeholder="Search all users" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-teal-700" /><button onClick={searchUsers} disabled={userSearchLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{userSearchLoading ? "Searching..." : "Search"}</button></div>
          <div className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">{displayedUsers.length ? displayedUsers.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"><div className="min-w-0"><p className="truncate font-semibold">{user.name ?? user.full_name ?? "Unnamed user"}</p><p className="truncate text-sm text-slate-500">{user.email ?? user.id}</p></div><select value={user.role ?? "user"} onChange={(event) => updateUserRole(user.id, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="user">User</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div>) : <p className="py-8 text-center text-sm text-slate-500">{userSearchApplied ? "No users match this search." : "No admins or instructors found."}</p>}</div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7d2c]">Inbox</p><h2 className="mt-2 text-2xl font-black">Contact messages</h2></div><span className="rounded-full bg-[#e8f3ed] px-3 py-1 text-sm font-bold text-[#197052]">{messages.length}</span></div>
          <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">{messages.length ? messages.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{item.subject ?? "Contact request"}</p><span className="text-xs text-slate-500">{item.name}</span></div><p className="mt-2 text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-500">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p></article>) : <p className="py-8 text-center text-sm text-slate-500">No contact messages found.</p>}</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Website settings</h2>
            <button onClick={handleUpdateSettings} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save settings</button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={settingsForm.site_name ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, site_name: event.target.value }))} placeholder="Site name" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.site_email ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, site_email: event.target.value }))} placeholder="Site email" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.site_phone ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, site_phone: event.target.value }))} placeholder="Site phone" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.whatsapp_number ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, whatsapp_number: event.target.value }))} placeholder="WhatsApp number" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.facebook_url ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, facebook_url: event.target.value }))} placeholder="Facebook URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.instagram_url ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, instagram_url: event.target.value }))} placeholder="Instagram URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.site_address ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, site_address: event.target.value }))} placeholder="Site address" className="md:col-span-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.navbar_announcement ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, navbar_announcement: event.target.value }))} placeholder="Navbar announcement" className="md:col-span-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.footer_tagline ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, footer_tagline: event.target.value }))} placeholder="Footer tagline" className="md:col-span-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.footer_copyright ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, footer_copyright: event.target.value }))} placeholder="Footer copyright" className="md:col-span-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <div className="md:col-span-2"><MediaUpload label="Site logo" mediaType="image" value={settingsForm.logo_url ?? ""} onChange={(logo_url) => setSettingsForm((current) => ({ ...current, logo_url }))} /></div>
            <input value={settingsForm.primary_color ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, primary_color: event.target.value }))} placeholder="Primary color" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={settingsForm.secondary_color ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, secondary_color: event.target.value }))} placeholder="Secondary color" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Blog publishing</h2>
            <button onClick={handleCreateBlogCategory} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Add category</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input value={blogForm.title} onChange={(event) => setBlogForm((current) => ({ ...current, title: event.target.value }))} placeholder="Post title" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <select value={blogForm.category_id} onChange={(event) => setBlogForm((current) => ({ ...current, category_id: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none"><option value="">Select blog category</option>{blogCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <input value={blogForm.excerpt} onChange={(event) => setBlogForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short summary" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none md:col-span-2" />
            <textarea value={blogForm.content} onChange={(event) => setBlogForm((current) => ({ ...current, content: event.target.value }))} placeholder="Full content" className="min-h-40 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none md:col-span-2" />
            <MediaUpload label="Blog cover image" mediaType="image" value={blogForm.cover_image} onChange={(cover_image) => setBlogForm((current) => ({ ...current, cover_image }))} />
            <input value={blogForm.meta_title} onChange={(event) => setBlogForm((current) => ({ ...current, meta_title: event.target.value }))} placeholder="SEO meta title" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={blogForm.meta_description} onChange={(event) => setBlogForm((current) => ({ ...current, meta_description: event.target.value }))} placeholder="SEO meta description" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={blogForm.meta_keywords} onChange={(event) => setBlogForm((current) => ({ ...current, meta_keywords: event.target.value }))} placeholder="SEO keywords, comma separated" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          </div>
          <button onClick={handleCreateBlogPost} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Create blog draft</button>
          <div className="mt-6 space-y-3">{blogPosts.map((post) => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"><div><p className="font-semibold">{post.title}</p><p className="text-sm text-slate-500">{post.is_published ? "Published" : "Draft"}</p></div><div className="flex gap-2">{!post.is_published && <button onClick={() => handlePublishBlogPost(post.id)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white">Verify & publish</button>}<button onClick={() => handleDeleteBlogPost(post.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button></div></div>)}</div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-xl font-bold">Categories</h2>
          <div className="space-y-3">
            <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0" />
            <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <MediaUpload label="Category image" mediaType="image" value={categoryForm.image_url} onChange={(image_url) => setCategoryForm((current) => ({ ...current, image_url }))} />
            <button onClick={handleCreateCategory} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Create category</button>
          </div>

          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{category.name}</p>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editCategory(category)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                    <button onClick={() => handleUpdateCategory(selectedCategoryId === category.id ? category.id : "")} disabled={selectedCategoryId !== category.id} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Update</button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-xl font-bold">Courses</h2>
          <div className="space-y-3">
            <input value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} placeholder="Course title" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <textarea value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} placeholder="Course description" className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={courseForm.price} onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
              <input value={courseForm.discount_price} onChange={(event) => setCourseForm((current) => ({ ...current, discount_price: event.target.value }))} placeholder="Discount price" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={courseForm.currency} onChange={(event) => setCourseForm((current) => ({ ...current, currency: event.target.value }))} placeholder="Currency" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
              <select value={courseForm.category_id} onChange={(event) => setCourseForm((current) => ({ ...current, category_id: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none">
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <MediaUpload label="Course image" mediaType="image" value={courseForm.image_url} onChange={(image_url) => setCourseForm((current) => ({ ...current, image_url }))} />
            <div className="flex flex-wrap gap-3">
              <button onClick={() => editingCourseId ? handleUpdateCourse(editingCourseId) : handleCreateCourse()} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">{editingCourseId ? "Update course" : "Create course"}</button>
              {editingCourseId ? <button onClick={() => { setEditingCourseId(""); setCourseForm(defaultCourseForm); }} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700">New course</button> : null}
              <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 outline-none">
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-sm text-slate-600">${course.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editCourse(course)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                    <button onClick={() => handlePublishCourse(course.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">Publish</button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Lessons</h2>
            <p className="text-sm text-slate-600">Manage lessons for the selected course.</p>
          </div>
          <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 outline-none sm:min-w-64">
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={lessonForm.title} onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))} placeholder="Lesson title" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          <input value={lessonForm.order_index} onChange={(event) => setLessonForm((current) => ({ ...current, order_index: event.target.value }))} placeholder="Order index" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
        </div>
        <div className="mt-3 space-y-3">
          <textarea value={lessonForm.description} onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))} placeholder="Lesson description" className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          <div className="grid gap-4 md:grid-cols-2">
            <MediaUpload label="Lesson video" mediaType="video" value={lessonForm.video_url} onChange={(video_url) => setLessonForm((current) => ({ ...current, video_url }))} />
            <MediaUpload label="Lesson thumbnail" mediaType="image" value={lessonForm.thumbnail_url} cropAspect={16 / 9} onChange={(thumbnail_url) => setLessonForm((current) => ({ ...current, thumbnail_url }))} />
          </div>
          <select value={lessonForm.is_free} onChange={(event) => setLessonForm((current) => ({ ...current, is_free: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none md:max-w-xs">
            <option value="true">Free lesson</option>
            <option value="false">Premium lesson</option>
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleCreateLesson} disabled={!selectedCourseId} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Create lesson</button>
          <button onClick={() => selectedLessonId && handleUpdateLesson(selectedLessonId)} disabled={!selectedLessonId} className="rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Update selected lesson</button>
          <button onClick={() => { setSelectedLessonId(""); setLessonForm(defaultLessonForm); }} disabled={!selectedLessonId} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">New lesson</button>
        </div>

        <div className="mt-6 space-y-3">
          {selectedCourseId && lessons.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No lessons found for this course yet.</p> : null}
          {!selectedCourseId ? <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Select a course to view its lessons.</p> : null}
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                {lesson.thumbnail_url || lesson.thumbnailUrl ? <img src={lesson.thumbnail_url ?? lesson.thumbnailUrl} alt="" className="aspect-video w-28 shrink-0 rounded-md bg-slate-100 object-cover" /> : <div className="flex aspect-video w-28 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">No image</div>}
                <div className="min-w-0">
                <p className="font-semibold text-slate-900">{lesson.title}</p>
                <p className="line-clamp-2 text-sm text-slate-600">{lesson.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => editLesson(lesson)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                <button onClick={() => handleDeleteLesson(lesson.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Enrollments</h2>
            <p className="text-sm text-slate-600">All live course registrations.</p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">{allEnrollments.length} total</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          {allEnrollments.length > 0 ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-3">Student</th><th className="px-3 py-3">WhatsApp</th><th className="px-3 py-3">Progress</th><th className="px-3 py-3">Payment</th></tr>
              </thead>
              <tbody>
                {allEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold">{enrollment.full_name ?? enrollment.user_id}</td>
                    <td className="px-3 py-3">{enrollment.whatsapp ?? "-"}</td>
                    <td className="px-3 py-3">{enrollment.progress ?? 0}%</td>
                    <td className="px-3 py-3">{enrollment.payment_status ?? "pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="py-8 text-center text-sm text-slate-500">No enrollments found for this course.</p>}
        </div>
      </section>
    </div>
  );
}
