/**
 * State trả về từ Server Action, dùng cho cả useActionState và form thường.
 */
export interface FormActionResult {
  success: boolean;
  error: string | null;
  message: string | null;
}

export const INITIAL_FORM_STATE: FormActionResult = {
  success: false,
  error: null,
  message: null,
};
