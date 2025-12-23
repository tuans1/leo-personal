"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/**
 * CSR (Client-Side Rendering) Example
 *
 * Đây là một ví dụ về Client-Side Rendering trong Next.js
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Server chỉ gửi HTML skeleton (minimal HTML)
 * 2. Browser tải JavaScript bundle
 * 3. React hydrates và render toàn bộ UI trên client
 * 4. Data fetching xảy ra trên client (không phải server)
 *
 * KHÁC BIỆT VỚI SSR:
 * - SSR: Server render HTML đầy đủ → gửi về → browser hiển thị ngay
 * - CSR: Server gửi HTML rỗng → browser tải JS → client render
 */

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function CSRPage() {
  // State để quản lý dữ liệu và UI
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadTime, setLoadTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);
  const [timeSinceMount, setTimeSinceMount] = useState<number>(0);

  // Refs để track rendering
  const mountTimeRef = useRef<number>(new Date().getTime());
  const renderCountRef = useRef<number>(0);

  /**
   * Simulate client-side data fetching
   * Trong CSR, data được fetch trên client, không phải server
   */
  const fetchUsers = async (): Promise<User[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data - trong thực tế sẽ gọi API thật
    return [
      { id: 1, name: "Nguyễn Văn A", email: "a@example.com", avatar: "👤" },
      { id: 2, name: "Trần Thị B", email: "b@example.com", avatar: "👩" },
      { id: 3, name: "Lê Văn C", email: "c@example.com", avatar: "👨" },
      { id: 4, name: "Phạm Thị D", email: "d@example.com", avatar: "👧" },
    ];
  };

  const fetchPosts = async (userId: number): Promise<Post[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return [
      {
        id: 1,
        title: "Bài viết 1 của user " + userId,
        body: "Nội dung bài viết đầu tiên...",
        userId,
      },
      {
        id: 2,
        title: "Bài viết 2 của user " + userId,
        body: "Nội dung bài viết thứ hai...",
        userId,
      },
    ];
  };

  /**
   * Effect chạy sau khi component mount trên client
   * Đây là điểm khác biệt chính với SSR - data fetch ở đây, không phải server
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      // Fetch users
      const usersData = await fetchUsers();
      setUsers(usersData);

      const endTime = Date.now();
      setLoadTime(endTime - startTime);
      setIsLoading(false);
    };

    loadData();
  }, []);

  /**
   * Effect để fetch posts khi user được chọn
   * Đây là client-side data fetching động
   */
  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    let isCancelled = false;

    const loadPosts = async () => {
      setIsLoading(true);
      const postsData = await fetchPosts(selectedUserId);

      // Only update state if component is still mounted and userId hasn't changed
      if (!isCancelled) {
        setPosts(postsData);
        setIsLoading(false);
      }
    };

    loadPosts();

    // Cleanup function to prevent state updates if component unmounts or userId changes
    return () => {
      isCancelled = true;
    };
  }, [selectedUserId]);

  /**
   * Update time since mount periodically
   * Không thể access ref trong render, nên dùng useEffect
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceMount(Date.now() - mountTimeRef.current);
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleReset = () => {
    setSelectedUserId(null);
    setPosts([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Client-Side Rendering (CSR) Example
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ví dụ về cách CSR hoạt động trong Next.js
          </p>
        </div>

        {/* Info Panel - Giải thích cách CSR hoạt động */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            📚 Giải thích CSR
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Quá trình tải trang (Page Load):
              </h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>
                  Browser nhận HTML skeleton từ server (rất nhẹ, không có data)
                </li>
                <li>Browser tải JavaScript bundle (React, component code)</li>
                <li>React hydrates và bắt đầu render trên client</li>
                <li>useEffect chạy → fetch data từ API</li>
                <li>State update → Component re-render với data</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. Render Process:
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Initial render: Component render với state mặc định (empty
                  data)
                </li>
                <li>
                  After data fetch: State update trigger re-render với data mới
                </li>
                <li>User interaction: State change → re-render → UI update</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                3. File Loading:
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>HTML: Minimal, chỉ có structure cơ bản</li>
                <li>JavaScript: Bundle chứa toàn bộ component logic</li>
                <li>CSS: Được load cùng với JS hoặc inline</li>
                <li>Data: Fetch từ API sau khi JS đã load xong</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Thời gian load data
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {loadTime}ms
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Số lần render
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {renderCount}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Thời gian từ mount
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(timeSinceMount / 1000)}s
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Trạng thái
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isLoading ? "⏳ Loading" : "✅ Ready"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              👥 Danh sách Users
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click vào user để xem posts (client-side fetch)
            </p>

            {isLoading && users.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Đang tải users từ API...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  (Simulated 800ms delay)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedUserId === user.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                📝 Posts
              </h2>
              {selectedUserId && (
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {!selectedUserId ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                👈 Chọn một user để xem posts
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Đang tải posts từ API...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  (Simulated 600ms delay)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🔍 Chi tiết kỹ thuật
          </h2>
          <div className="space-y-3 text-sm font-mono text-gray-700 dark:text-gray-300">
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Component:
              </span>{" "}
              <span className="text-blue-600 dark:text-blue-400">CSRPage</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Directive:
              </span>{" "}
              <span className="text-green-600 dark:text-green-400">
                &quot;use client&quot;
              </span>{" "}
              (bắt buộc cho CSR)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Data Fetching:
              </span>{" "}
              <span className="text-purple-600 dark:text-purple-400">
                useEffect
              </span>{" "}
              (chạy trên client)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                State Management:
              </span>{" "}
              <span className="text-orange-600 dark:text-orange-400">
                useState
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Initial HTML:
              </span>{" "}
              <span className="text-red-600 dark:text-red-400">Minimal</span>{" "}
              (không có data)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Hydration:
              </span>{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Client-side
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
