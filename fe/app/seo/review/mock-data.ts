import { Review, ReviewFilters, PaginatedReviewsResult } from "./types";

// Mock reviews data - stored in memory (simulating file-based storage)
let mockReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    description: "Sản phẩm tuyệt vời! Chất lượng vượt ngoài mong đợi. Tôi rất hài lòng với trải nghiệm này.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    rating: 4,
    description: "Khá tốt, nhưng vẫn còn một số điểm cần cải thiện. Nhìn chung là hài lòng.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    createdAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    rating: 3,
    description: "Ở mức trung bình, không có gì đặc biệt. Có thể thử nhưng không quá kỳ vọng.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    createdAt: "2024-01-13T14:00:00Z",
  },
  {
    id: "4",
    rating: 5,
    description: "Xuất sắc! Tôi đã mua lại lần thứ 3 rồi. Chất lượng ổn định và dịch vụ tốt.",
    image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800",
    createdAt: "2024-01-12T11:00:00Z",
  },
  {
    id: "5",
    rating: 2,
    description: "Không như mong đợi. Chất lượng kém và không đúng với mô tả. Không khuyên dùng.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
    createdAt: "2024-01-11T16:00:00Z",
  },
  {
    id: "6",
    rating: 4,
    description: "Tốt, giá cả hợp lý. Phù hợp với nhu cầu của tôi. Sẽ cân nhắc mua lại.",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=800",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "7",
    rating: 5,
    description: "Tuyệt vời! Từ thiết kế đến chất lượng đều hoàn hảo. Đáng giá từng đồng.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    createdAt: "2024-01-09T13:00:00Z",
  },
  {
    id: "8",
    rating: 1,
    description: "Rất thất vọng. Sản phẩm hỏng ngay sau khi nhận. Dịch vụ chăm sóc khách hàng kém.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
    createdAt: "2024-01-08T15:00:00Z",
  },
  {
    id: "9",
    rating: 3,
    description: "Ổn, không có gì nổi bật. Phù hợp với giá tiền nhưng không có gì đặc biệt.",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800",
    createdAt: "2024-01-07T10:00:00Z",
  },
  {
    id: "10",
    rating: 4,
    description: "Khá hài lòng với sản phẩm này. Chất lượng tốt và giao hàng nhanh chóng.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    createdAt: "2024-01-06T12:00:00Z",
  },
  {
    id: "11",
    rating: 5,
    description: "Hoàn hảo! Đây là sản phẩm tốt nhất tôi từng mua. Rất đáng để đầu tư.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    createdAt: "2024-01-05T09:00:00Z",
  },
  {
    id: "12",
    rating: 2,
    description: "Không đạt kỳ vọng. Chất lượng kém và không bền. Không nên mua.",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800",
    createdAt: "2024-01-04T14:00:00Z",
  },
];

/**
 * Get all reviews
 */
export function getReviews(): Review[] {
  return [...mockReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get review by ID
 */
export function getReviewById(id: string): Review | undefined {
  return mockReviews.find((review) => review.id === id);
}

/**
 * Create a new review
 */
export function createReview(
  review: Omit<Review, "id" | "createdAt">
): Review {
  const newReview: Review = {
    ...review,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  mockReviews = [newReview, ...mockReviews];
  return newReview;
}

/**
 * Filter reviews by rating and/or search term
 */
export function filterReviews(
  reviews: Review[],
  filters?: ReviewFilters
): Review[] {
  let filtered = [...reviews];

  if (filters?.rating !== undefined && filters.rating > 0) {
    filtered = filtered.filter((review) => review.rating === filters.rating);
  }

  if (filters?.searchTerm && filters.searchTerm.trim() !== "") {
    const searchLower = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter((review) =>
      review.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Get paginated reviews with filters
 */
export function getPaginatedReviews(
  page: number,
  pageSize: number,
  filters?: ReviewFilters
): PaginatedReviewsResult {
  const allReviews = getReviews();
  const filteredReviews = filterReviews(allReviews, filters);
  const totalReviews = filteredReviews.length;
  const totalPages = Math.ceil(totalReviews / pageSize);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  return {
    reviews: paginatedReviews,
    totalPages,
    currentPage: page,
    totalReviews,
  };
}
