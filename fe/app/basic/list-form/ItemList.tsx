import type { ListItem } from "./types";

interface ItemListProps {
  items: ListItem[];
}

export default function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-gray-600 dark:text-gray-400">
        Chưa có item nào. Thêm item bằng form phía trên.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex justify-between items-center"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            {item.title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(item.createdAt).toLocaleString("vi-VN")}
          </span>
        </li>
      ))}
    </ul>
  );
}
