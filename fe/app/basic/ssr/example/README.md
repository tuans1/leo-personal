# A (SSR) → B (CSR) → C (SSR) – Composition

Ví dụ truyền data từ Server Component A xuống Server Component C trong khi B là Client Component nằm giữa, **không làm mất SSR của C**.

## Cách hoạt động

1. **A** (page, SSR): fetch data trên server, render `<B><C data={data} /></B>`.
2. **B** (CSR): không import C, chỉ nhận `children` (là kết quả render của C) và render `{children}`.
3. **C** (SSR): nhận `data` từ A, chạy trên server.

`<C data={data} />` được tính trong context của A (server), nên C chạy trên server. Kết quả (React node) được serialize và truyền xuống B dưới dạng `children`. B chỉ hiển thị slot đó.

## Luồng data

```
A (SSR) --fetch data--> A render <B><C data={data} /></B>
                              |
                              v
                        C (SSR) chạy trên server, nhận data
                              |
                              v
                        Output của C → truyền vào B qua children
                              |
                              v
                        B (CSR) render {children}
```

## Lưu ý

- B **không** import C. Nếu B import C và render `<C />`, C sẽ thành client component.
- Data từ A xuống C phải qua **composition**: A là nơi render C với props, rồi truyền xuống B qua `children` (hoặc slot prop).

## Route

`/basic/ssr/example`
