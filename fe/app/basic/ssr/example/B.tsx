"use client";

import { type ReactNode, useState } from "react";

/**
 * B - Client Component (CSR)
 * Không import C. Nhận output của C qua prop children từ A.
 * A render: <B><C data={data} /></B> → C chạy trên server, kết quả truyền xuống B.
 */
interface BProps {
  children: ReactNode;
}

export default function B({ children }: BProps) {
  const [count, setCount] = useState(0);
  console.log(2)

  return (
    <div className="rounded-lg border-2 border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20 p-4">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
        B (CSR) – client component
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Có state, event (counter bên dưới). Slot bên dưới là output của C (SSR).
      </p>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          +1
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Count: {count}
        </span>
      </div>
      <div className="mt-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
          Slot (children từ A – đây là C đã render trên server):
        </span>
        {children}
      </div>
    </div>
  );
}
