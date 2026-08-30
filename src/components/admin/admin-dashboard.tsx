"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, type CategoryRecord, type CourseRecord, type EnrollmentRecord, type LessonRecord } from "@/lib/api";

const defaultCourseForm = {
  title: "",
  description: "",
  price: "49.99",
  discount_price: "29.99",
  currency: "USD",
  category_ids: "",
  image_url: "",
};

const defaultLessonForm = {
  title: "",
  description: "",
  video_url: "",
  order_index: "1",
  is_free: "true",
};

const defaultCategoryForm = {
  name: "",
  description: "",
  image_url: "",
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

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function AdminDashboard() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [lessonForm, setLessonForm] = useState(defaultLessonForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const loadData = async () => {
    try {
      const [categoryData, courseData] = await Promise.all([
        apiRequest<CategoryRecord[]>("/v1/categories"),
        apiRequest<CourseRecord[]>("/v1/courses"),
      ]);

      const safeCategories = asArray(categoryData);
      const safeCourses = asArray(courseData);
      setCategories(safeCategories);
      setCourses(safeCourses);
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
    if (!selectedCourseId) return;

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
    try {
      const updated = await apiRequest<CategoryRecord>(`/v1/categories/${id}`, "PATCH", categoryForm);
      setCategories((current) => current.map((category) => (category.id === id ? updated : category)));
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
      const payload = {
        created_by: "eb5f5b0c-83e7-4f38-a119-8ce5826711cb",
        title: courseForm.title,
        description: courseForm.description,
        image_url: courseForm.image_url,
        price: Number(courseForm.price),
        discount_price: Number(courseForm.discount_price || 0),
        currency: courseForm.currency,
        category_ids: courseForm.category_ids
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      };

      const created = await apiRequest<CourseRecord>("/v1/courses", "POST", payload);
      setCourses((current) => [created, ...current]);
      setCourseForm(defaultCourseForm);
      setSelectedCourseId(created.id);
      setMessage("Course created successfully.");
    } catch {
      setMessage("Course creation failed. Ensure the API is reachable and the category IDs are valid.");
    }
  };

  const handleUpdateCourse = async (id: string) => {
    try {
      const updated = await apiRequest<CourseRecord>(`/v1/courses/${id}`, "PATCH", {
        title: courseForm.title,
        description: courseForm.description,
        price: Number(courseForm.price),
        discount_price: Number(courseForm.discount_price || 0),
        currency: courseForm.currency,
        image_url: courseForm.image_url,
        category_ids: courseForm.category_ids.split(",").map((entry) => entry.trim()).filter(Boolean),
      });

      setCourses((current) => current.map((course) => (course.id === id ? updated : course)));
      setMessage("Course updated successfully.");
    } catch {
      setMessage("Course update failed.");
    }
  };

  const editCourse = (course: CourseRecord) => {
    setSelectedCourseId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: String(course.price ?? ""),
      discount_price: String(course.discount_price ?? ""),
      currency: course.currency ?? "USD",
      category_ids: course.category_ids?.join(", ") ?? course.categoryId ?? course.category_id ?? "",
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
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description,
        video_url: lessonForm.video_url,
        order_index: Number(lessonForm.order_index),
        is_free: lessonForm.is_free === "true",
      };

      if (!selectedCourseId) {
        setMessage("Select a course before creating a lesson.");
        return;
      }

      const created = await apiRequest<LessonRecord>(`/v1/courses/${selectedCourseId}/lessons`, "POST", payload);
      setLessons((current) => [created, ...current]);
      setLessonForm(defaultLessonForm);
      setMessage("Lesson created successfully.");
    } catch {
      setMessage("Lesson creation failed.");
    }
  };

  const handleUpdateLesson = async (id: string) => {
    try {
      const updated = await apiRequest<LessonRecord>(`/v1/lessons/${id}`, "PATCH", {
        title: lessonForm.title,
        description: lessonForm.description,
        video_url: lessonForm.video_url,
      });
      setLessons((current) => current.map((lesson) => (lesson.id === id ? updated : lesson)));
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
      order_index: String(lesson.order_index ?? 1),
      is_free: String(lesson.is_free ?? true),
    });
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await apiRequest<void>(`/v1/lessons/${id}`, "DELETE");
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
      setMessage("Lesson deleted successfully.");
    } catch {
      setMessage("Lesson delete failed.");
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-700">Loading admin dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 text-slate-900">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Manage your learning platform</h1>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          API base: {API_BASE_URL}
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Categories</h2>
          <div className="space-y-3">
            <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0" />
            <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <input value={categoryForm.image_url} onChange={(event) => setCategoryForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="Image URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <button onClick={handleCreateCategory} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Create category</button>
          </div>

          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <input value={courseForm.category_ids} onChange={(event) => setCourseForm((current) => ({ ...current, category_ids: event.target.value }))} placeholder="Category IDs (comma separated)" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            </div>
            <input value={courseForm.image_url} onChange={(event) => setCourseForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="Course image URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <div className="flex flex-wrap gap-3">
              <button onClick={handleCreateCourse} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Create course</button>
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
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-sm text-slate-600">${course.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editCourse(course)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                    <button onClick={() => handleUpdateCourse(course.id)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white">Update</button>
                    <button onClick={() => handlePublishCourse(course.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">Publish</button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Lessons</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={lessonForm.title} onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))} placeholder="Lesson title" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          <input value={lessonForm.order_index} onChange={(event) => setLessonForm((current) => ({ ...current, order_index: event.target.value }))} placeholder="Order index" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
        </div>
        <div className="mt-3 space-y-3">
          <textarea value={lessonForm.description} onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))} placeholder="Lesson description" className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={lessonForm.video_url} onChange={(event) => setLessonForm((current) => ({ ...current, video_url: event.target.value }))} placeholder="Video URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none" />
            <select value={lessonForm.is_free} onChange={(event) => setLessonForm((current) => ({ ...current, is_free: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none">
              <option value="true">Free lesson</option>
              <option value="false">Premium lesson</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleCreateLesson} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Create lesson</button>
          <button onClick={() => selectedLessonId && handleUpdateLesson(selectedLessonId)} disabled={!selectedLessonId} className="rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Update selected lesson</button>
        </div>

        <div className="mt-6 space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="font-semibold text-slate-900">{lesson.title}</p>
                <p className="text-sm text-slate-600">{lesson.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editLesson(lesson)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Edit</button>
                <button onClick={() => handleUpdateLesson(lesson.id)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white">Update</button>
                <button onClick={() => handleDeleteLesson(lesson.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Enrollments</h2>
            <p className="text-sm text-slate-600">Live registrations for the selected course.</p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">{enrollments.length} total</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          {enrollments.length > 0 ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-3">Student</th><th className="px-3 py-3">WhatsApp</th><th className="px-3 py-3">Progress</th><th className="px-3 py-3">Payment</th></tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
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
