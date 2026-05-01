# Module `upload_memory` (Nest) — import CSV qua buffer RAM

## Vai trò

- Nhận `POST` multipart, field `file` (cùng tên với [FE `CsvUploadFormField.File`](../../../fe/app/file/csv.constants.ts)), file `.csv`.
- Parse bằng [csv-parse](https://csv.js.org/parse/api/sync/), chèn batch vào bảng `products` (TypeORM → Postgres, ví dụ Supabase qua `DATABASE_URL`).

## Endpoint

- `POST /file/products/csv`
- Giới hạn kích thước: `MAX_CSV_FILE_BYTES` trong `file.constants.ts`.

## Định dạng CSV

- Dòng đầu: `name,price,quantity` (thứ tự cột tùy, nhưng cần đủ 3 tên cột; không cần cột `id` — tự tăng trong DB).
- Các dòng sau: từng sản phẩm. `name` bắt buộc nếu dòng có dữ liệu. `price` / `quantity` để trống → `null` (theo entity).
- Số: số nguyên; `price` trong phạm vi PostgreSQL `integer`, `quantity` trong phạm vi `smallint`.

## Tại sao insert theo lô (chunk)

- Tránh một câu `INSERT` quá lớn (timeout / giới hạn tham số) khi khoảng 50.000 dòng. Kích thước mỗi lô: `PRODUCT_INSERT_CHUNK_SIZE` trong `file.constants.ts`.
- Cả import chạy trong **một transaction** (có thể điều chỉnh nếu pooler Supabase yêu cầu transaction ngắn hơn).

## Biến môi trường (BE)

- `DATABASE_URL` — bắt buộc khi bật `TypeOrmModule` (chuỗi kết nối Postgres, ví dụ pooler Supabase từ `be/.env.example`).

## FE nối tới

- Trong thư mục [fe](../../../fe), tạo `.env.local` từ [fe/.env.example](../../../fe/.env.example) và gán `NEXT_PUBLIC_CSV_UPLOAD_URL=http://localhost:4000/file/products/csv` (cùng port với `be`, xem `src/main.ts`).

## So sánh với stream

- Module này parse sync toàn bộ `file.buffer` rồi mới validate/insert.
- Để test phương án stream, dùng endpoint `POST /file/products/csv-stream` từ `upload_stream`.
