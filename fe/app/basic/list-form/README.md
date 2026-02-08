# Server list + Client form

Ví dụ: Server Component hiển thị list data, Client Component là form thêm item. Sau khi submit form, list cập nhật ngay (không reload trang).

## Cách hoạt động

1. **Page (Server)**: Gọi `getList()` để lấy danh sách, render `<AddItemForm />` (client) và `<ItemList items={items} />` (server).
2. **AddItemForm (Client)**: Form submit gọi Server Action `addItemAction(title)`.
3. **Server Action**: Validate → gọi `addItem()` → `revalidatePath("/basic/list-form")` → return success.
4. **AddItemForm**: Sau khi action thành công, gọi `router.refresh()`.
5. Next.js re-render Server Components của trang → Page chạy lại → `getList()` trả về data mới → ItemList nhận `items` mới và hiển thị list cập nhật.

## Luồng cập nhật

Form submit → Server Action (add + revalidatePath) → client `router.refresh()` → page re-fetch → list cập nhật.

## Route

`/basic/list-form`
