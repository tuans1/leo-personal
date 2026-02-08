import Link from "next/link";

/**
 * SSR (Server-Side Rendering) Example
 *
 * Đây là một ví dụ về Server-Side Rendering trong Next.js
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Server fetch data trước khi render
 * 2. Server render HTML đầy đủ với data
 * 3. Browser nhận HTML đã có content sẵn
 * 4. React hydrates để thêm interactivity
 *
 * KHÁC BIỆT VỚI CSR:
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

/**
 * Simulate server-side data fetching
 * Trong SSR, data được fetch trên server, không phải client
 */
async function fetchUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data - trong thực tế sẽ gọi API thật
  return [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com", avatar: "👤" },
    { id: 2, name: "Trần Thị B", email: "b@example.com", avatar: "👩" },
    { id: 3, name: "Lê Văn C", email: "c@example.com", avatar: "👨" },
    { id: 4, name: "Phạm Thị D", email: "d@example.com", avatar: "👧" },
  ];
}

async function fetchPosts(userId: number): Promise<Post[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));

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
}

/**
 * Server Component - KHÔNG có "use client"
 * Component này là async function, chạy trên server
 * Data được fetch TRƯỚC KHI render HTML
 */
export default async function SSRPage() {
  // Fetch data trên server - chạy TRƯỚC KHI render
  const startTime = new Date().getTime();
  const users = await fetchUsers();
  const loadTime = new Date().getTime() - startTime;

  // Render HTML với data đã có sẵn
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 dark:text-green-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <Link
            href="/basic/ssr/example"
            className="ml-4 inline-flex items-center text-green-600 dark:text-green-400 hover:underline mb-4"
          >
            Ví dụ A→B→C (composition)
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Server-Side Rendering (SSR) Example
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ví dụ về cách SSR hoạt động trong Next.js
          </p>
        </div>

        {/* Info Panel - Giải thích cách SSR hoạt động */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            📚 Giải thích SSR
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Quá trình tải trang (Page Load):
              </h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Browser gửi request đến server</li>
                <li>Server fetch data từ API/database</li>
                <li>Server render HTML đầy đủ với data</li>
                <li>Browser nhận HTML đã có content sẵn</li>
                <li>React hydrates để thêm interactivity</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. Render Process:
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Server render: Component render với data đã fetch sẵn</li>
                <li>HTML response: HTML đầy đủ được gửi về browser</li>
                <li>
                  Client hydration: React thêm event handlers và interactivity
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                3. File Loading:
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>HTML: Đầy đủ content, có data sẵn (SEO friendly)</li>
                <li>JavaScript: Bundle nhỏ hơn (không cần fetch logic)</li>
                <li>CSS: Load cùng với HTML</li>
                <li>Data: Đã có trong HTML, không cần fetch thêm</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Thời gian fetch data (server)
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loadTime}ms
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Data đã có sẵn trong HTML
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Số lượng users
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Đã load trên server
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Render Location
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              Server
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              HTML có data sẵn
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            👥 Danh sách Users (SSR)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Data này đã được fetch trên server và có sẵn trong HTML
          </p>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="w-full text-left p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
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
              </div>
            ))}
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
              <span className="text-blue-600 dark:text-blue-400">SSRPage</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Directive:
              </span>{" "}
              <span className="text-red-600 dark:text-red-400">
                KHÔNG có &quot;use client&quot;
              </span>{" "}
              (Server Component)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Function Type:
              </span>{" "}
              <span className="text-green-600 dark:text-green-400">async</span>{" "}
              (chạy trên server)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Data Fetching:
              </span>{" "}
              <span className="text-purple-600 dark:text-purple-400">
                await trong component
              </span>{" "}
              (chạy trên server)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">
                Initial HTML:
              </span>{" "}
              <span className="text-green-600 dark:text-green-400">Full</span>{" "}
              (có data sẵn)
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">SEO:</span>{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Excellent
              </span>{" "}
              (content có trong HTML)
            </div>
          </div>
        </div>

        {/* Comparison Note */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-lg p-6 border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            💡 Lưu ý quan trọng
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Trong ví dụ này, component là Server Component nên không thể sử dụng
            hooks như{" "}
            <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
              useState
            </code>
            ,{" "}
            <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
              useEffect
            </code>
            . Để có interactivity (như click, input), cần tách phần interactive
            thành Client Component riêng.
          </p>
        </div>
      </div>
    </div>
  );
}






