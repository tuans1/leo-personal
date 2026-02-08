
import type { ExampleItem } from "./types";

/**
 * C - Server Component (SSR)
 * Nhận data từ A qua composition: A render <B><C data={data} /></B>
 * C chạy trên server, không import bởi B.
 */
interface CProps {
  data: ExampleItem[];
}

export default function C({ data }: CProps) {
  console.log(3)
  return (
    <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20 p-4">
      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
        C (SSR) – nhận data từ A
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Component này chạy trên server, data được truyền từ A qua children.
      </p>
      <ul className="space-y-2">
        {data.map((item) => (
          <li
            key={item.id}
            className="rounded bg-white dark:bg-gray-800 p-2 text-sm border border-gray-200 dark:border-gray-700"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {item.title}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {" — "}
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
