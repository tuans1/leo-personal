"use client";

import { useActionState } from "react";
import { submitFeedbackAction } from "./actions";
import { INITIAL_FORM_STATE } from "./types";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/**
 * Form dùng useActionState:
 * - Không cần useState cho isSubmitting, error, success
 * - state = kết quả action, isPending = đang gửi
 * - Chỉ cần action={formAction} và hiển thị state / isPending
 */
export default function FormUseActionState() {
  const [state, formAction, isPending] = useActionState(
    submitFeedbackAction,
    INITIAL_FORM_STATE
  );

  return (
    <form key={state.message ?? "form"} action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
          {state.error}
        </div>
      )}
      {state.success && state.message && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-3 py-2 text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="u-name" className={labelClass}>
          Tên
        </label>
        <input
          id="u-name"
          type="text"
          name="name"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="u-email" className={labelClass}>
          Email
        </label>
        <input
          id="u-email"
          type="email"
          name="email"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="u-message" className={labelClass}>
          Nội dung
        </label>
        <textarea
          id="u-message"
          name="message"
          rows={3}
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isPending ? "Đang gửi..." : "Gửi phản hồi"}
      </button>
    </form>
  );
}
