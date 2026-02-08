"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Review, ReviewFilters, PaginatedReviewsResult } from "./types";
import { getPaginatedReviews } from "./mock-data";
import { createReviewAction } from "./actions";

const ITEMS_PER_PAGE = 10;

interface ReviewListClientProps {
  initialData: PaginatedReviewsResult;
}

export default function ReviewListClient({ initialData }: ReviewListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [reviews, setReviews] = useState<Review[]>(initialData.reviews);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [totalReviews, setTotalReviews] = useState(initialData.totalReviews);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    description: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync với initialData khi nó thay đổi (sau router.refresh)
  // Chỉ sync khi không có filters và đang ở page 1 (giống initialData)
  useEffect(() => {
    const hasNoFilters = !filters.rating && !filters.searchTerm;
    const isPage1 = currentPage === 1;
    
    if (hasNoFilters && isPage1) {
      setReviews(initialData.reviews);
      setTotalPages(initialData.totalPages);
      setTotalReviews(initialData.totalReviews);
      setCurrentPage(initialData.currentPage);
    }
  }, [initialData, filters, currentPage]);

  // Load reviews when page or filters change (client-side)
  // Chỉ fetch khi có filters hoặc pagination khác với initial
  useEffect(() => {
    const hasFilters = filters.rating || filters.searchTerm;
    const isNotPage1 = currentPage !== 1;
    
    // Chỉ fetch client-side khi có filters hoặc pagination
    if (hasFilters || isNotPage1) {
      setIsLoading(true);
      const result = getPaginatedReviews(currentPage, ITEMS_PER_PAGE, filters);
      setReviews(result.reviews);
      setTotalPages(result.totalPages);
      setTotalReviews(result.totalReviews);
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.rating, filters.searchTerm]);

  const handleFilterChange = (key: keyof ReviewFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" || value === 0 ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!formData.description.trim() || !formData.image.trim()) {
      setSubmitError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Gọi Server Action
      const result = await createReviewAction({
        rating: formData.rating,
        description: formData.description.trim(),
        image: formData.image.trim(),
      });

      if (!result.success) {
        setSubmitError(result.error || "Có lỗi xảy ra khi tạo review");
        return;
      }

      // Reset form
      setFormData({
        rating: 5,
        description: "",
        image: "",
      });

      // Reset về page 1 và clear filters để sync với initialData
      setCurrentPage(1);
      setFilters({});

      // Refresh page để Server Component fetch lại data mới
      // revalidatePath đã được gọi trong Server Action
      // initialData sẽ được update và sync qua useEffect
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error creating review:", error);
      setSubmitError("Có lỗi xảy ra khi tạo review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({rating}/5)
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Add Review Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Thêm Review Mới
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating (1-5 sao)
            </label>
            <select
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} sao
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả review của bạn..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Hình ảnh
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isSubmitting || isPending ? "Đang tạo..." : "Tạo Review"}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Bộ lọc
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lọc theo Rating
            </label>
            <select
              value={filters.rating || 0}
              onChange={(e) =>
                handleFilterChange("rating", Number(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Tất cả</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} sao
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm trong mô tả
            </label>
            <input
              type="text"
              value={filters.searchTerm || ""}
              onChange={(e) =>
                handleFilterChange("searchTerm", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập từ khóa..."
            />
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Hiển thị {reviews.length} / {totalReviews} reviews
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Không tìm thấy review nào
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/seo/review/${review.id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={review.image}
                  alt={review.description.substring(0, 50)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="mb-2">{renderStars(review.rating)}</div>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
                  {review.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
}
