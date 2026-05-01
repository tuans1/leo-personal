# Module `upload_stream` (Nest) - import CSV direct stream

## Mục tiêu

Module này nhận file CSV sản phẩm, kiểm tra dữ liệu theo từng dòng, rồi insert vào bảng `products` theo từng lô nhỏ.

Điểm chính:

- Upload nhận qua multipart field `file`.
- Parse multipart trực tiếp bằng stream (không tạo `file.buffer` trong RAM như multer memory).
- Parse CSV theo record stream rồi insert theo chunk policy.
- Chạy trong 1 transaction: lỗi giữa chừng sẽ rollback toàn bộ.

## Endpoint

- `POST /file/products/csv-stream`
- Giới hạn kích thước file: `MAX_CSV_FILE_BYTES` trong `file.constants.ts`.

## Flow xử lý (dễ hình dung cho người mới)

1. Controller nhận raw `Request` multipart.
2. Service dùng `busboy` để tách file stream từ multipart (field `file`).
3. File stream được pipe trực tiếp vào `csv-parse`.
4. `for await ... of parser` để đọc từng record:
   - Chuẩn hóa tên cột (`trim + lowercase`)
   - Check header bắt buộc: `name`, `price`, `quantity`
   - Validate từng dòng
   - Dòng hợp lệ được đưa vào `batch`
5. Khi batch đạt ngưỡng chunk thì insert 1 lần:
   - `PRODUCT_INSERT_CHUNK_SIZE` (số record)
   - `PRODUCT_INSERT_CHUNK_BYTES` (payload bytes xấp xỉ)
6. Hết stream: flush batch còn lại, commit transaction, trả kết quả.
7. Nếu có lỗi: rollback transaction, ném lỗi ra ngoài.

## "Stream" trong module này là gì?

Hiện tại module là **direct stream end-to-end**:

- multipart request stream -> `busboy`
- file stream -> `csv-parse`
- records hợp lệ -> DB insert theo chunk

Không giữ toàn bộ file trong `file.buffer`.

## Định dạng CSV

- Header cần đủ 3 cột: `name,price,quantity` (không cần đúng thứ tự, miễn đủ tên cột).
- `name` bắt buộc nếu dòng có dữ liệu.
- `price`, `quantity` có thể để trống -> lưu `null`.
- `price` phải nằm trong phạm vi PostgreSQL `integer`.
- `quantity` phải nằm trong phạm vi PostgreSQL `smallint`.
- Dòng trống hoàn toàn sẽ bị bỏ qua.

Ví dụ:

```csv
name,price,quantity
Iphone 15,22000000,10
Type C Cable,120000,200
Mouse,,50
```

## Retry behavior

- Direct stream là one-pass: server không có full buffer để rewind.
- Nếu stream lỗi giữa chừng, request fail-fast và rollback transaction.
- Retry nên do client re-upload hoặc thông qua tầng lưu tạm (temp file/object storage).

## Cấu hình liên quan

- `DATABASE_URL`: bắt buộc cho `TypeOrmModule`.
- `PRODUCT_INSERT_CHUNK_SIZE`: ngưỡng số record mỗi lần insert.
- `PRODUCT_INSERT_CHUNK_BYTES`: ngưỡng payload bytes xấp xỉ mỗi lần insert.

## Logging để tracking stream

Service log theo các mốc:

- Bắt đầu upload stream (filename, mimetype)
- Tiến trình bytes nhận được (`bytesReceived`) theo ngưỡng định kỳ
- Tiến trình parse (`rowsParsed`, `rowsInserted`, `bytesReceived`)
- Tiến trình insert chunk (reason: row-threshold/byte-threshold/final-flush)
- Kết thúc import (bytes, rows, chunks, tổng thời gian)

## FE gọi API

FE cần upload đến:

- `http://localhost:4000/file/products/csv-stream`
