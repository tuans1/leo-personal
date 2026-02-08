# useActionState vs state thủ công

Ví dụ so sánh form gửi phản hồi (feedback) dùng **useActionState** với cách tự quản lý state (isSubmitting, error, success).

## useActionState (React 19)

```ts
const [state, formAction, isPending] = useActionState(action, initialState);
```

- **state**: Kết quả trả về của action (lần gọi gần nhất). Ban đầu = `initialState`.
- **formAction**: Hàm gắn vào `<form action={formAction}>` hoặc `<button formAction={formAction}>`.
- **isPending**: `true` khi action đang chạy (transition pending).

Action phải có dạng: `(prevState, formData) => Promise<newState>` (hoặc trả về newState đồng bộ). Server Action trong Next.js tương thích: nhận `(prevState, formData)` và return state mới.

## Lợi ích useActionState

1. **Ít state hơn**: Không cần `useState` cho loading, error, success — đã có `state` và `isPending`.
2. **Ít logic trong component**: Không cần `handleSubmit` gọi action rồi `setIsSubmitting` / `setError` / `setSuccess` / reset form.
3. **Form native**: Dùng `action={formAction}` giúp form vẫn submit được khi JS chưa load (progressive enhancement).
4. **Một nguồn sự thật**: Kết quả action là state duy nhất, tránh lệch giữa nhiều state thủ công.

## Route

`/basic/action-state`
