"use server";

import { revalidatePath } from "next/cache";
import { createReview as createReviewData } from "./mock-data";
import { Review } from "./types";

/**
 * Server Action để tạo review mới
 * Sau khi tạo, sẽ revalidate path để Server Component tự động update
 */
export async function createReviewAction(
  review: Omit<Review, "id" | "createdAt">
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!review.description?.trim() || !review.image?.trim()) {
      return {
        success: false,
        error: "Vui lòng điền đầy đủ thông tin",
      };
    }

    if (review.rating < 1 || review.rating > 5) {
      return {
        success: false,
        error: "Rating phải từ 1 đến 5",
      };
    }

    // Create review
    createReviewData({
      rating: review.rating,
      description: review.description.trim(),
      image: review.image.trim(),
    });

    // Revalidate path để Server Component tự động fetch lại data
    revalidatePath("/seo/review");

    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra khi tạo review",
    };
  }
}
