import Link from "next/link";
import FormTraditional from "./FormTraditional";
import FormUseActionState from "./FormUseActionState";

export default function ActionStatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex text-sky-600 dark:text-sky-400 hover:underline mb-4"
          >
            ← Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            useActionState vs state thủ công
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            So sánh form dùng <code className="rounded bg-sky-100 dark:bg-sky-900/50 px-1">useActionState</code> với form tự quản lý loading / error / success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cách thường */}
          <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Cách thường (manual state)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tự quản lý: <code className="text-amber-700 dark:text-amber-300">useState</code> cho isSubmitting, error, successMessage; <code className="text-amber-700 dark:text-amber-300">handleSubmit</code> gọi action rồi set state.
            </p>
            <FormTraditional />
          </div>

          {/* useActionState */}
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
              useActionState
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <code className="text-emerald-700 dark:text-emerald-300">[state, formAction, isPending]</code> — không cần useState cho kết quả action hay pending; form <code className="text-emerald-700 dark:text-emerald-300">action=&#123;formAction&#125;</code>.
            </p>
            <FormUseActionState />
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            So sánh nhanh
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>Manual:</strong> 3–4 useState (isSubmitting, error, success/message, có thể thêm form fields), 1 handler dài (gọi action, set state, reset form).
            </li>
            <li>
              <strong>useActionState:</strong> 1 hook trả về state + formAction + isPending; form dùng native <code>action</code>, ít state và ít code hơn, dễ bảo trì.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
