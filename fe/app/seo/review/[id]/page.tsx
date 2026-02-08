"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Review } from "../types";
import { getReviewById } from "../mock-data";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundReview = getReviewById(id);
      if (foundReview) {
        setReview(foundReview);
      }
      setIsLoading(false);
    }
  }, [id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-3xl ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
          {rating}/5
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-gray-100 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Đang tải...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-gray-100 dark:from-black dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Review không tồn tại
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Review bạn đang tìm kiếm không được tìm thấy.
            </p>
            <Link
              href="/seo/review"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-gray-100 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/seo/review"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Quay lại danh sách</span>
        </Link>

        {/* Review Detail Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Image */}
          <div className="relative w-full h-96 overflow-hidden">
            <img
              src={review.image}
              alt={review.description.substring(0, 100)}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/800x600?text=No+Image";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Rating */}
            <div className="mb-6">{renderStars(review.rating)}</div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Mô tả
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {review.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Ngày tạo:{" "}
                  {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>ID: {review.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
