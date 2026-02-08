"use server";

import type { FormActionResult } from "./types";
import { INITIAL_FORM_STATE } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server Action tương thích useActionState:
 * (prevState, formData) => Promise<FormActionResult>
 * - prevState: state trước đó (do useActionState truyền vào)
 * - formData: FormData từ form submit
 */
export async function submitFeedbackAction(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name) {
    return { ...INITIAL_FORM_STATE, success: false, error: "Vui lòng nhập tên." };
  }
  if (!email) {
    return { ...INITIAL_FORM_STATE, success: false, error: "Vui lòng nhập email." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ...INITIAL_FORM_STATE, success: false, error: "Email không hợp lệ." };
  }
  if (!message) {
    return { ...INITIAL_FORM_STATE, success: false, error: "Vui lòng nhập nội dung." };
  }

  // Giả lập xử lý (DB, API...)
  await new Promise((r) => setTimeout(r, 800));

  return {
    success: true,
    error: null,
    message: `Cảm ơn ${name}, phản hồi của bạn đã được gửi.`,
  };
}
