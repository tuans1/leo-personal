"use client";

import { useState } from "react";
import { submitFeedbackAction } from "./actions";
import { INITIAL_FORM_STATE } from "./types";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/**
 * Form xử lý bằng state thủ công:
 * - isSubmitting, error, success/message phải tự quản lý
 * - handleSubmit phải gọi action, set state, reset form khi success
 */
export default function FormTraditional() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("message", message);

    const result = await submitFeedbackAction(INITIAL_FORM_STATE, formData);

    if (result.success) {
      setSuccessMessage(result.message ?? "Đã gửi thành công.");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      setError(result.error ?? "Có lỗi xảy ra.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-3 py-2 text-sm">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="t-name" className={labelClass}>
          Tên
        </label>
        <input
          id="t-name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="t-email" className={labelClass}>
          Email
        </label>
        <input
          id="t-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label htmlFor="t-message" className={labelClass}>
          Nội dung
        </label>
        <textarea
          id="t-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
      </button>
    </form>
  );
}
