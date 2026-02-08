import Link from "next/link";
import { getList } from "./mock-data";
import AddItemForm from "./AddItemForm";
import ItemList from "./ItemList";

export default function ListFormPage() {
  const items = getList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex text-sky-600 dark:text-sky-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Server list + Client form
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            List do Server Component fetch và render; form thêm item là Client
            Component. Sau khi thêm, list cập nhật ngay nhờ revalidatePath +
            router.refresh().
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Thêm item
            </h2>
            <AddItemForm />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Danh sách (Server)
            </h2>
            <ItemList items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}
