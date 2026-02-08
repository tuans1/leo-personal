import type { Metadata } from "next";
import { getPaginatedReviews } from "./mock-data";
import ReviewListClient from "./review-list-client";

const ITEMS_PER_PAGE = 10;

// Metadata cho SEO
export const metadata: Metadata = {
  title: "Review Website - Xem và tạo reviews về sản phẩm, dịch vụ",
  description: "Trang web review nơi bạn có thể xem và tạo reviews về các sản phẩm, dịch vụ. Tìm kiếm reviews theo rating, từ khóa và nhiều hơn nữa.",
  keywords: ["review", "đánh giá", "sản phẩm", "dịch vụ", "rating"],
  openGraph: {
    title: "Review Website - Xem và tạo reviews",
    description: "Trang web review nơi bạn có thể xem và tạo reviews về các sản phẩm, dịch vụ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review Website",
    description: "Xem và tạo reviews về sản phẩm, dịch vụ",
  },
};

/**
 * Server Component - Fetch initial data và render với SEO metadata
 * Khi thêm review mới, Server Action sẽ revalidatePath và component này sẽ tự động re-render
 */
export default async function ReviewListPage() {
  // Fetch initial data trên server (page 1, no filters)
  const initialData = getPaginatedReviews(1, ITEMS_PER_PAGE, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-gray-100 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Review Website
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Xem và tạo reviews về sản phẩm, dịch vụ
          </p>
        </div>

        {/* Client Component cho interactivity */}
        <ReviewListClient initialData={initialData} />
      </div>
    </div>
  );
}
