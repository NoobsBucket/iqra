"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/app/components/auth-user-provider";
import { API_BASE_URL, getApiError } from "@/lib/api";

export type ReviewRecord = {
  id: string;
  user_id: string;
  review_text: string;
  rating: number;
  course_id?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  created_at?: string;
  updated_at?: string;
};

type CourseReviewsProps = {
  courseId: string;
  averageRating?: number;
  totalStudents?: number;
};

export function CourseReviews({
  courseId,
  averageRating = 4.9,
  totalStudents = 1000,
}: CourseReviewsProps) {
  const user = useAuthUser();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ rating: 5, review_text: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  async function fetchReviews() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/courses/${courseId}/reviews`);
      if (response.ok) {
        const data = (await response.json()) as Record<string, unknown> | ReviewRecord[] | null;
        const reviewsList = Array.isArray(data) 
          ? data 
          : data && typeof data === "object" && (Array.isArray((data as Record<string, unknown>).reviews) || Array.isArray((data as Record<string, unknown>).data))
          ? Array.isArray((data as Record<string, unknown>).reviews) 
            ? (data as Record<string, unknown>).reviews as ReviewRecord[]
            : (data as Record<string, unknown>).data as ReviewRecord[]
          : [];
        setReviews(reviewsList as ReviewRecord[]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Please log in to add a review");
      return;
    }

    if (!formData.review_text.trim() || formData.rating < 1 || formData.rating > 5) {
      setError("Please provide valid rating and review text");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const url = editingId
        ? `${API_BASE_URL}/v1/reviews/${editingId}`
        : `${API_BASE_URL}/v1/courses/${courseId}/reviews`;

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          review_text: formData.review_text,
          rating: formData.rating,
          course_id: courseId,
        }),
      });

      if (!response.ok) {
        throw await getApiError(response, "Failed to save review");
      }

      const data = (await response.json()) as Record<string, unknown>;
      const newReview = data as ReviewRecord;

      if (editingId) {
        setReviews((prev) =>
          prev.map((r) => (r.id === editingId ? newReview : r))
        );
        setSuccess("Review updated successfully");
        setEditingId(null);
      } else {
        setReviews((prev) => [newReview, ...prev]);
        setSuccess("Review added successfully");
      }

      setFormData({ rating: 5, review_text: "" });
      setIsAddingReview(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save review";
      setError(message);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/v1/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw await getApiError(response, "Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSuccess("Review deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete review";
      setError(message);
    }
  }

  function startEdit(review: ReviewRecord) {
    setEditingId(review.id);
    setFormData({ rating: review.rating, review_text: review.review_text });
    setIsAddingReview(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ rating: 5, review_text: "" });
    setIsAddingReview(false);
  }

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;
  const otherReviews = reviews.filter((r) => r.id !== userReview?.id);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-black text-slate-900">Reviews</h2>

        <div className="flex flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-amber-500">★ {averageRating}</span>
              <span className="text-sm text-slate-600">out of 5</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {user ? (
        <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
          {!isAddingReview ? (
            <button
              onClick={() => setIsAddingReview(true)}
              className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {userReview ? "Edit your review" : "Add a review"}
            </button>
          ) : (
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: num })}
                      className={`text-3xl transition ${
                        formData.rating >= num ? "text-amber-500" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Your Review
                </label>
                <textarea
                  value={formData.review_text}
                  onChange={(e) =>
                    setFormData({ ...formData, review_text: e.target.value })
                  }
                  placeholder="Share your experience with this course..."
                  maxLength={500}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                  rows={4}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.review_text.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  {editingId ? "Update Review" : "Post Review"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <p className="mb-4 text-sm text-blue-900">
            Log in to share your experience with this course.
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Log in to review
          </a>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-200 p-4"
            >
              <div className="mb-2 h-4 w-24 bg-slate-200" />
              <div className="h-3 w-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          <p className="mb-2">No reviews yet for this course.</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userReview && (
            <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {user?.name || "Your Review"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-amber-500">
                      {"★".repeat(userReview.rating)}
                      {"☆".repeat(5 - userReview.rating)}
                    </span>
                    <span className="text-xs text-slate-600">
                      {userReview.created_at || userReview.updated_at
                        ? new Date(
                            userReview.updated_at || userReview.created_at || ""
                          ).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-slate-700">{userReview.review_text}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(userReview)}
                  className="text-xs font-semibold text-teal-700 transition hover:text-teal-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="text-xs font-semibold text-red-700 transition hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {otherReviews.length > 0 && (
            <div>
              {otherReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-slate-200 py-4 first:pt-0 last:border-b-0"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <span className="text-lg text-amber-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {review.created_at || review.updated_at
                        ? new Date(
                            review.updated_at || review.created_at || ""
                          ).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                  <p className="text-slate-700">{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
