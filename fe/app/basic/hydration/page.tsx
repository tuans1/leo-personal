"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Ví dụ đơn giản về Hydration Error
 *
 * Hydration Error xảy ra khi HTML render trên SERVER khác với HTML render trên CLIENT
 *
 * LỖI TRONG VÍ DỤ NÀY:
 * - Sử dụng Math.random() trực tiếp trong render
 * - Server render một số ngẫu nhiên, Client render một số ngẫu nhiên KHÁC
 * → Next.js phát hiện HTML khác nhau → Báo lỗi hydration mismatch
 */

// ❌ LỖI: Sử dụng Math.random() trực tiếp trong render
function ComponentWithError() {
  // Lỗi ở đây: Math.random() tạo số khác nhau mỗi lần render
  // Server render: randomNumber = 0.123456
  // Client render:  randomNumber = 0.789012
  // → HTML khác nhau → Hydration Error!
  //
  // ⚠️ LƯU Ý: Đây là CỐ Ý tạo lỗi để minh họa hydration error.
  // Trong thực tế, KHÔNG BAO GIỜ sử dụng impure functions như Math.random()
  // trực tiếp trong render function!
  const randomNumber = Math.random();

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">
        ❌ Component Có Lỗi Hydration
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Số ngẫu nhiên (sẽ khác nhau giữa server và client):
        </p>
        <div className="font-mono text-2xl font-bold text-red-600 dark:text-red-400">
          {randomNumber.toFixed(6)}
        </div>
      </div>
      <div className="bg-red-100 dark:bg-red-900/40 rounded p-3">
        <p className="text-xs text-red-800 dark:text-red-200">
          <strong>Vấn đề:</strong> Mỗi lần render, Math.random() tạo số mới.
          Server render tạo số A, Client render tạo số B → HTML khác nhau → Lỗi
          hydration!
        </p>
      </div>
    </div>
  );
}

// ❌ LỖI 2: Conditional rendering với useState TRƯỚC KHI mount
// Đây là lỗi RẤT PHỔ BIẾN và KHÓ PHÁT HIỆN vì code trông rất "bình thường"!
function ConditionalRenderError() {
  // ❌ LỖI: useState(false) trên server và client đều là false
  // Nhưng sau khi component mount, useEffect sẽ set thành true
  // → Server render: false → Render JSX A
  // → Client render lần đầu: false → Render JSX A (OK)
  // → Client sau useEffect: true → Render JSX B (❌ KHÁC với server!)
  const [showContent, setShowContent] = useState(false);

  // Lỗi ở đây: useEffect chạy sau khi render
  // Server không chạy useEffect → showContent = false
  // Client sau useEffect → showContent = true
  // → JSX khác nhau sau lần render đầu tiên!
  useEffect(() => {
    // Giả sử đây là logic để kiểm tra user đã đăng nhập, theme, hoặc điều kiện nào đó
    // Điều này sẽ chạy TRƯỚC KHI server render, nhưng KHÁC với server
    // eslint-disable-next-line react-compiler/react-compiler
    setShowContent(true);
  }, []);

  // ❌ Đây là vấn đề: Conditional rendering dựa trên state
  // Server: showContent = false → Render phần "not shown"
  // Client sau mount: showContent = true → Render phần "shown"
  // → HTML structure khác nhau → Hydration Error!
  if (!showContent) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 dark:border-orange-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 mb-3">
          ❌ Lỗi 2: Conditional Render với useState
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nội dung đang ẩn... (sẽ thay đổi sau khi mount)
          </p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-3">
          <p className="text-xs text-orange-800 dark:text-orange-200">
            <strong>Vấn đề:</strong> Server render với showContent = false,
            Client sau useEffect set showContent = true → JSX khác nhau → Lỗi
            hydration!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 dark:border-orange-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 mb-3">
        ❌ Lỗi 2: Conditional Render với useState
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
          ✅ Nội dung đã hiển thị!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Nhưng đây là lỗi vì server không render phần này!
        </p>
      </div>
      <div className="bg-orange-100 dark:bg-orange-900/40 rounded p-3">
        <p className="text-xs text-orange-800 dark:text-orange-200">
          <strong>Vấn đề:</strong> JSX return khác nhau giữa server và client →
          Hydration Error!
        </p>
      </div>
    </div>
  );
}

// ✅ FIX: Sử dụng isMounted pattern
function ConditionalRenderFixed() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    setIsMounted(true);
  }, []);

  // ✅ FIX: Render cùng một structure trên server và client lần đầu
  if (!isMounted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">
          ✅ Fix: Conditional Render với useState
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Đang tải... (placeholder giống nhau trên server và client)
          </p>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded p-3">
          <p className="text-xs text-emerald-800 dark:text-emerald-200">
            <strong>Giải pháp:</strong> Sử dụng isMounted để đảm bảo server và
            client render cùng một JSX ban đầu!
          </p>
        </div>
      </div>
    );
  }

  // Sau khi mount, mới hiển thị nội dung động
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">
        ✅ Fix: Conditional Render với useState
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          ✅ Nội dung đã hiển thị!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Sau khi component mount, mới hiển thị nội dung động.
        </p>
      </div>
      <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded p-3">
        <p className="text-xs text-emerald-800 dark:text-emerald-200">
          <strong>Giải pháp:</strong> Không có lỗi hydration vì server và client
          đều render placeholder giống nhau trước!
        </p>
      </div>
    </div>
  );
}

// ❌ LỖI 3: Sử dụng localStorage/sessionStorage trong render
// Lỗi này rất phổ biến khi làm theme switcher, user preferences, etc.
function LocalStorageError() {
  // ❌ LỖI: localStorage không tồn tại trên server
  // Server: theme = undefined hoặc throw error
  // Client: theme = giá trị từ localStorage
  // → HTML khác nhau → Hydration Error!
  const getTheme = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light"; // Fallback cho server
  };

  const theme = getTheme();

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
        ❌ Lỗi 3: Sử dụng localStorage trong render
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Theme hiện tại:
        </p>
        <div className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
          {theme}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          (Giả sử localStorage có theme = &quot;dark&quot;)
        </p>
      </div>
      <div className="bg-purple-100 dark:bg-purple-900/40 rounded p-3">
        <p className="text-xs text-purple-800 dark:text-purple-200">
          <strong>Vấn đề:</strong> Server render với theme = &quot;light&quot;
          (fallback), Client render với theme = &quot;dark&quot; (từ
          localStorage) → HTML khác nhau → Lỗi hydration!
        </p>
      </div>
    </div>
  );
}

// ✅ FIX: Sử dụng useEffect để đọc localStorage sau khi mount
function LocalStorageFixed() {
  const [theme, setTheme] = useState<string>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    setIsMounted(true);
    // ✅ Chỉ đọc localStorage sau khi mount
    const savedTheme = localStorage.getItem("theme") || "light";
    // eslint-disable-next-line react-compiler/react-compiler
    setTheme(savedTheme);
  }, []);

  // Render placeholder giống nhau trên server và client
  if (!isMounted) {
    return (
      <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500 dark:border-teal-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-teal-800 dark:text-teal-300 mb-3">
          ✅ Fix: localStorage với useEffect
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Đang tải theme...
          </p>
        </div>
        <div className="bg-teal-100 dark:bg-teal-900/40 rounded p-3">
          <p className="text-xs text-teal-800 dark:text-teal-200">
            <strong>Giải pháp:</strong> Server và client đều render placeholder
            giống nhau!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500 dark:border-teal-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-teal-800 dark:text-teal-300 mb-3">
        ✅ Fix: localStorage với useEffect
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Theme hiện tại:
        </p>
        <div className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
          {theme}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          (Đã đọc từ localStorage sau khi mount)
        </p>
      </div>
      <div className="bg-teal-100 dark:bg-teal-900/40 rounded p-3">
        <p className="text-xs text-teal-800 dark:text-teal-200">
          <strong>Giải pháp:</strong> Không có lỗi hydration vì chỉ đọc
          localStorage sau khi mount!
        </p>
      </div>
    </div>
  );
}

// ✅ FIX: Sử dụng useEffect để chỉ tạo random sau khi component mount trên client
function ComponentFixed() {
  // Bước 1: Khởi tạo state với giá trị null (giống nhau trên server và client)
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Bước 2: Chỉ chạy sau khi component đã mount trên client
  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    setIsMounted(true);
    // eslint-disable-next-line react-compiler/react-compiler
    setRandomNumber(Math.random()); // Chỉ tạo random khi đã ở trên client
  }, []);

  // Bước 3: Render placeholder giống nhau trên server và client lần đầu
  if (!isMounted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
          ✅ Component Đã Fix
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Số ngẫu nhiên:
          </p>
          <div className="font-mono text-2xl font-bold text-gray-400 dark:text-gray-500">
            Đang tải...
          </div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/40 rounded p-3">
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>Giải pháp:</strong> Server và Client đều render &quot;Đang
            tải...&quot; ban đầu → HTML giống nhau → Không có lỗi hydration!
          </p>
        </div>
      </div>
    );
  }

  // Bước 4: Sau khi mount, mới hiển thị số random
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">
        ✅ Component Đã Fix
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded p-4 mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Số ngẫu nhiên:
        </p>
        <div className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">
          {randomNumber?.toFixed(6)}
        </div>
      </div>
      <div className="bg-green-100 dark:bg-green-900/40 rounded p-3">
        <p className="text-xs text-green-800 dark:text-green-200">
          <strong>Giải pháp:</strong> Số random chỉ được tạo sau khi component
          mount trên client, không ảnh hưởng đến HTML ban đầu → Không có lỗi
          hydration!
        </p>
      </div>
    </div>
  );
}

export default function HydrationErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hydration Error - Các Loại Lỗi Phổ Biến
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Hiểu rõ hydration error qua các ví dụ thực tế: Math.random(),
            useState, localStorage
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Hãy mở DevTools Console</strong> để xem lỗi hydration
              chi tiết khi component có lỗi render.
            </p>
          </div>
        </div>

        {/* Giải thích quy trình */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
            🔄 Quy Trình Hydration trong Next.js
          </h2>
          <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">
                1.
              </span>
              <span>
                <strong>Server render:</strong> Next.js render HTML trên server
                với dữ liệu ban đầu
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">
                2.
              </span>
              <span>
                <strong>Gửi HTML:</strong> Server gửi HTML đã render về trình
                duyệt
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">
                3.
              </span>
              <span>
                <strong>Client hydration:</strong> React trên client
                &quot;nhận&quot; HTML và kết nối với JavaScript
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400">
                4.
              </span>
              <span>
                <strong>❌ Lỗi xảy ra:</strong> Nếu HTML của client render khác
                với HTML từ server → Hydration Error!
              </span>
            </li>
          </ol>
        </div>

        {/* Ví dụ 1: Math.random() */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Ví dụ 1: Math.random() trong render
          </h2>
          <ComponentWithError />
          <ComponentFixed />
        </div>

        {/* Ví dụ 2: Conditional rendering với useState */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Ví dụ 2: Conditional rendering với useState (Lỗi khó phát hiện!)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Đây là lỗi RẤT PHỔ BIẾN vì code trông rất &quot;bình thường&quot;.
            Nhiều developer mắc phải khi làm conditional rendering dựa trên
            state.
          </p>
          <ConditionalRenderError />
          <ConditionalRenderFixed />
        </div>

        {/* Ví dụ 3: localStorage */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Ví dụ 3: Sử dụng localStorage trong render
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Lỗi này thường xảy ra khi làm theme switcher, user preferences, hoặc
            bất kỳ feature nào cần đọc từ localStorage.
          </p>
          <LocalStorageError />
          <LocalStorageFixed />
        </div>

        {/* Tóm tắt */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📝 Tóm Tắt - Các Loại Lỗi Hydration
          </h2>
          <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
            {/* Ví dụ 1 */}
            <div>
              <strong className="text-red-600 dark:text-red-400">
                1. ❌ Math.random() / Date.now():
              </strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Server và client tạo giá trị khác nhau → HTML khác nhau</li>
                <li>
                  <strong>Fix:</strong> Dùng useEffect để tạo giá trị sau khi
                  mount
                </li>
              </ul>
            </div>

            {/* Ví dụ 2 */}
            <div>
              <strong className="text-red-600 dark:text-red-400">
                2. ❌ Conditional rendering với useState (KHÓ PHÁT HIỆN!):
              </strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  useEffect set state → JSX return khác nhau giữa server và
                  client
                </li>
                <li>
                  <strong>Fix:</strong> Dùng isMounted pattern để đảm bảo server
                  và client render cùng JSX ban đầu
                </li>
                <li className="text-red-600 dark:text-red-400 font-semibold">
                  ⚠️ Đây là lỗi RẤT PHỔ BIẾN và khó debug!
                </li>
              </ul>
            </div>

            {/* Ví dụ 3 */}
            <div>
              <strong className="text-red-600 dark:text-red-400">
                3. ❌ localStorage / sessionStorage trong render:
              </strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  Server không có localStorage → fallback value, Client có giá
                  trị từ storage → HTML khác nhau
                </li>
                <li>
                  <strong>Fix:</strong> Đọc localStorage trong useEffect sau khi
                  mount
                </li>
              </ul>
            </div>

            {/* Giải pháp chung */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <strong className="text-green-600 dark:text-green-400">
                💡 Nguyên tắc chung để tránh lỗi hydration:
              </strong>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>
                  Server và Client phải render cùng một cấu trúc HTML ban đầu
                </li>
                <li>
                  Chỉ thay đổi UI sau khi component đã mount trên client (dùng
                  useEffect)
                </li>
                <li>
                  Sử dụng{" "}
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                    isMounted
                  </code>{" "}
                  pattern cho conditional rendering
                </li>
                <li>
                  Không đọc browser APIs (window, localStorage, etc.) trực tiếp
                  trong render
                </li>
                <li>
                  Kiểm tra console warnings để phát hiện hydration errors sớm
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
