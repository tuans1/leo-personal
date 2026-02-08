import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Cho phép Next.js Image load và tối ưu ảnh từ các domain ngoài.
   *
   * Tại sao cần:
   * - Next.js mặc định CHỈ cho phép ảnh từ cùng origin (same domain). URL ngoài
   *   (Unsplash, placeholder...) sẽ báo lỗi "hostname is not configured" nếu không khai báo.
   * - Khi đã khai báo, Next.js Image Optimization sẽ:
   *   + Resize ảnh theo width/height/sizes → file nhỏ hơn, tải nhanh hơn.
   *   + Chuyển sang WebP/AVIF khi browser hỗ trợ → giảm dung lượng.
   *   + Cache và phục vụ qua server của bạn → ổn định, có thể dùng CDN.
   * - Không config = ảnh ngoài phải dùng unoptimized (tải nguyên bản từ nguồn) hoặc lỗi.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

