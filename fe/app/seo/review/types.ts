export interface Review {
  id: string;
  rating: number; // 1-5
  description: string;
  image: string; // URL
  createdAt: string; // ISO date string
}

export interface ReviewFilters {
  rating?: number;
  searchTerm?: string;
}

export interface PaginatedReviewsResult {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  totalReviews: number;
}
