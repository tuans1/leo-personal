import Link from "next/link";

export default function Home() {
  const exercises = [
    {
      id: "counter",
      title: "Real-time Counter",
      description: "Hiển thị số người đang online với WebSocket",
      href: "/exercises/counter",
      status: "completed",
    },
    {
      id: "chat",
      title: "Live Chat (Basic)",
      description:
        "Chat room đơn giản với nhập tên, gửi/nhận messages realtime",
      href: "/exercises/chat",
      status: "completed",
    },
    {
      id: "multi-room-chat",
      title: "Multi-Room Chat",
      description:
        "Slack-style với nhiều channels, switch rooms, hiển thị users",
      href: "/exercises/multi-room-chat",
      status: "completed",
    },
    {
      id: "apollo",
      title: "Apollo Client Cache Demo",
      description:
        "Demo Apollo Client cache với mock data, kiểm tra cache trong DevTools",
      href: "/exercises/apollo",
      status: "completed",
    },
    {
      id: "apollo-error",
      title: "Apollo ErrorLink Demo",
      description:
        "Demo ErrorLink xử lý GraphQL errors, Network errors, và Timeout errors",
      href: "/exercises/apollo/error-demo",
      status: "completed",
    },
    {
      id: "apollo-ssr",
      title: "Apollo SSR Demo",
      description:
        "Demo Server-Side Rendering với Apollo Client, cache hydration, và SSR vs CSR",
      href: "/exercises/apollo/ssr-demo",
      status: "completed",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-gray-100 dark:from-black dark:to-gray-900 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-start py-16 px-8">
        <div className="w-full mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            WebSocket Exercises
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Học về Socket.IO với các bài tập thực hành
          </p>
        </div>

        {/* Basic Examples Section */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            📚 Basic Examples
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/basic/csr"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Client-Side Rendering (CSR)
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  Basic
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ví dụ về CSR: cách render, tải file, và fetch data trên client
              </p>
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                Xem ví dụ →
              </div>
            </Link>
            <Link
              href="/basic/ssr"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Server-Side Rendering (SSR)
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  Basic
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ví dụ về SSR: cách render trên server, fetch data trước khi gửi
                HTML
              </p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium group-hover:underline">
                Xem ví dụ →
              </div>
            </Link>
            <Link
              href="/basic/action-state"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-400"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  useActionState vs state thủ công
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 rounded-full">
                  Basic
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                So sánh form dùng useActionState với form tự quản lý loading /
                error / success
              </p>
              <div className="flex items-center text-sm text-sky-600 dark:text-sky-400 font-medium group-hover:underline">
                Xem ví dụ →
              </div>
            </Link>
            <Link
              href="/basic/list-form"
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-400"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Server list + Client form
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full">
                  Basic
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                List do Server Component, form thêm item là Client; list cập
                nhật ngay sau khi thêm
              </p>
              <div className="flex items-center text-sm text-violet-600 dark:text-violet-400 font-medium group-hover:underline">
                Xem ví dụ →
              </div>
            </Link>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Exercises
          </h2>
        </div>

        <div className="w-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={exercise.href}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {exercise.title}
                </h2>
                {exercise.status === "completed" && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    Hoàn thành
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {exercise.description}
              </p>
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                Xem bài tập →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Mở nhiều tab để test real-time updates</p>
        </div>
      </main>
    </div>
  );
}

