# Data Fetching – Ví dụ (App Router)

Ba loại data fetching trong Next.js App Router, tương ứng với các API cũ của Pages Router.

## Trong App Router dùng gì thay cho gì?

| Pages Router (cũ)     | App Router (mới) |
|-----------------------|------------------|
| `getStaticProps`      | Server Component + fetch mặc định (cache), không set `dynamic` |
| `getServerSideProps`  | Server Component + `export const dynamic = 'force-dynamic'` hoặc `fetch(..., { cache: 'no-store' })` |
| `getStaticPaths`      | `generateStaticParams()` trong dynamic route `[id]` |

## Ba ví dụ trong thư mục này

1. **Static** – `/basic/data-fetching/static`  
   Data lấy lúc build, cache. Refresh trang (sau khi `next build` + `next start`) sẽ thấy "Generated at" không đổi.

2. **Dynamic** – `/basic/data-fetching/dynamic`  
   Data lấy mỗi request. Mỗi lần refresh sẽ thấy "Fetched at" đổi.

3. **Static Paths** – `/basic/data-fetching/products/[id]`  
   Các path `/products/1`, `/products/2`, `/products/3` được build sẵn nhờ `generateStaticParams()`. Thử `/products/99` để xem trang "Sản phẩm không tồn tại".

## Nên thử

- Mở Static → refresh nhiều lần (sau build+start: timestamp giữ nguyên).
- Mở Dynamic → refresh nhiều lần: timestamp đổi mỗi lần.
- Mở `/basic/data-fetching/products/1`, `/2`, `/3` (có nội dung), rồi `/products/99` (không tồn tại).

## So sánh nhanh

```
Static:     Build time → Cache HTML → Request: serve cache
Dynamic:    Request → Fetch data → Render HTML
Paths:      generateStaticParams → Build /1 /2 /3 → Request: serve prebuilt or 404
```
