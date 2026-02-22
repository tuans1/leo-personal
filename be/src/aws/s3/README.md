# AWS S3 Module – Controller & Service

Tài liệu mô tả cách implement các controller và service trong module S3: endpoint, luồng xử lý, và các điểm cần lưu ý.

---

## 1. Tổng quan

Module cung cấp API REST để:

- **Upload** file lên S3 (multipart/form-data).
- **Lấy file** (stream) theo key.
- **Lấy presigned URL** để tải/xem file (không qua backend).
- **Xóa** file theo key.

**Base path:** `GET|POST|DELETE /aws/s3/...`

**Công nghệ:** NestJS, AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`), Multer (FileInterceptor).

---

## 2. Controller (`s3.controller.ts`)

### 2.1. POST `/aws/s3/upload` – Upload file

**Cách implement:**

- Dùng `FileInterceptor('file')` (Multer) để nhận field `file` trong `multipart/form-data`.
- `ParseFilePipe` bắt buộc có file và dùng `MaxFileSizeValidator` giới hạn **10 MB**.
- Query params:
  - `key` (optional): full S3 key (e.g. `folder/subfolder/file.pdf`).
  - `prefix` (optional): thư mục; key = `prefix + "/" + originalname`.
- Nếu không truyền `key` thì dùng `prefix` + tên file gốc, hoặc chỉ tên file gốc.
- Gọi `s3Service.upload({ key, body: file.buffer, contentType: file.mimetype })` và trả về `UploadResult`.

**Highlight:**

- Key/prefix được chuẩn hóa trong `resolveUploadKey`: trim, bỏ slash thừa ở cuối prefix.
- File được giữ trong memory (`file.buffer`) → với file lớn hoặc nhiều request đồng thời cần cân nhắc stream hoặc giới hạn concurent upload.

---

### 2.2. GET `/aws/s3/file/:key` – Lấy file (stream)

**Cách implement:**

- Path param `key` có thể đã bị encode (e.g. `%2F` cho `/`). Controller gọi `decodeURIComponent(key)` trước khi gửi xuống service.
- Gọi `s3Service.getFileStream(decodedKey)`. Nếu không tìm thấy (null) → `NotFoundException`.
- Trả về `StreamableFile` với `body` (Readable stream), `type` (contentType), `length` (contentLength) để client tải đúng định dạng và size.

**Highlight:**

- Stream trực tiếp từ S3 → backend không load cả file vào memory, phù hợp file lớn.
- Client cần gọi đúng URL với key đã encode (e.g. `my-folder%2Ffile.pdf`).

---

### 2.3. GET `/aws/s3/presigned-url` – Lấy presigned URL

**Cách implement:**

- Query: `key` (bắt buộc), `expiresIn` (optional, đơn vị giây).
- `key` được decode bằng `decodeURIComponent`.
- `expiresIn` được clamp: tối thiểu 60, tối đa `S3_MAX_PRESIGNED_EXPIRES_IN` (24h). Nếu không truyền thì service dùng default (1h).
- Trả về `{ url, expiresIn }` từ `s3Service.getPresignedUrl`.

**Highlight:**

- Presigned URL cho phép client (hoặc frontend) tải/xem file trực tiếp từ S3, không đi qua backend → giảm tải và băng thông cho server.
- Thời hạn URL được giới hạn chặt (60s–24h) để cân bằng giữa bảo mật và tiện dùng.

---

### 2.4. DELETE `/aws/s3/file/:key` – Xóa file

**Cách implement:**

- Path param `key`, decode bằng `decodeURIComponent`.
- Gọi `s3Service.delete(decodedKey)`.
- Dùng `@HttpCode(HttpStatus.NO_CONTENT)` → response body rỗng, status 204.

**Highlight:**

- S3 DeleteObject không báo lỗi khi key không tồn tại; nếu cần “chỉ xóa khi có” thì phải check tồn tại (e.g. HeadObject) trước.

---

## 3. Service (`s3.service.ts`)

### 3.1. Khởi tạo (constructor)

- Đọc config qua `ConfigService`: `REGION`, `BUCKET`. Bucket bắt buộc; thiếu thì throw Error.
- Tạo `S3Client` với `region` (không truyền credentials → SDK dùng default credential chain: env, `~/.aws/credentials`, IAM role khi chạy trên EC2/ECS/Lambda).
- Lưu `bucket` để dùng cho mọi thao tác.

**Highlight:**

- Trên AWS (EC2/ECS/Lambda) nên dùng IAM role; không cần (và không nên) hard-code access key trong code. Local có thể dùng `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` trong env hoặc `aws configure`.

---

### 3.2. `upload(input: UploadInput): Promise<UploadResult>`

- Dùng `PutObjectCommand`: Bucket, Key, Body (Buffer), ContentType.
- Trả về `{ key, bucket, etag? }` (ETag từ S3 response).

**Highlight:**

- Body là Buffer trong memory; với file rất lớn có thể cân nhắc stream (stream từ request xuống S3) để tránh OOM.

---

### 3.3. `getFileStream(key: string): Promise<GetFileStreamResult | null>`

- Dùng `GetObjectCommand`; nếu `output.Body` không có thì trả về `null`.
- Trả về `{ body: Readable, contentType?, contentLength? }` để controller bọc thành `StreamableFile`.

**Highlight:**

- Stream từ S3 → không đọc hết file vào memory, phù hợp file lớn.

---

### 3.4. `getPresignedUrl(key, expiresIn?): Promise<PresignedUrlResult>`

- Dùng `GetObjectCommand` + `getSignedUrl(..., { expiresIn })` từ `@aws-sdk/s3-request-presigner`.
- Mặc định `expiresIn = S3_DEFAULT_PRESIGNED_EXPIRES_IN` (3600s). Controller đã clamp input nên service nhận giá trị trong khoảng cho phép.

**Highlight:**

- URL chỉ dùng cho GET (xem/tải). Nếu cần upload qua presigned URL thì dùng PutObject + presigner tương ứng.

---

### 3.5. `delete(key: string): Promise<DeleteResult>`

- Dùng `DeleteObjectCommand`; sau khi send trả về `{ deleted: true }`.

**Highlight:**

- S3 trả về 204 ngay cả khi key không tồn tại; logic “chỉ xóa khi có” cần thêm bước kiểm tra (e.g. HeadObject) nếu nghiệp vụ yêu cầu.

---

## 4. Types (`s3.types.ts`)

- **UploadedFilePayload:** shape file từ Multer (memory): `buffer`, `mimetype`, `originalname`, `size`.
- **UploadResult:** `key`, `bucket`, `etag?`.
- **PresignedUrlResult:** `url`, `expiresIn`.
- **GetFileStreamResult:** `body` (Readable), `contentType?`, `contentLength?`.
- **DeleteResult:** `deleted: true`.

Dùng type rõ ràng cho payload và response, tránh `any`.

---

## 5. Constants (`s3.constants.ts`)

- **S3ConfigKey:** tên biến env dùng cho config (Region, Bucket, AccessKey, SecretAccessKey). Nên dùng làm key khi gọi `ConfigService.get(...)` thay vì gán `process.env` vào đây (tránh đọc env lúc load module → undefined).
- **S3_DEFAULT_PRESIGNED_EXPIRES_IN:** 3600 (1h).
- **S3_MAX_PRESIGNED_EXPIRES_IN:** 86400 (24h).

---

## 6. Module (`s3.module.ts`)

- Import `ConfigModule` (để `ConfigService` có env).
- Khai báo `S3Controller`, `S3Service`; export `S3Service` để module khác dùng (e.g. upload từ service khác).

---

## 7. Các điểm cần lưu ý (Highlights tổng hợp)

| Chủ đề | Ghi chú |
|--------|--------|
| **Credentials** | Không truyền credentials vào `S3Client` → SDK dùng default chain (env, file, IAM role). Trên AWS nên dùng IAM role. |
| **Config / Env** | Nên đọc giá trị trong constructor/service qua `ConfigService.get(S3ConfigKey.xxx)`; tránh gán `process.env` vào constant ở top-level (có thể undefined lúc load). |
| **Key encoding** | Key trong path/query cần encode (e.g. `%2F` cho `/`). Controller decode bằng `decodeURIComponent` trước khi gọi service. |
| **Upload size** | Giới hạn 10 MB; file lớn hơn cần tăng limit hoặc dùng multipart upload / stream. |
| **Stream vs Buffer** | Get file dùng stream; upload hiện dùng buffer. File rất lớn nên cân nhắc stream upload. |
| **Presigned URL** | Chỉ dùng cho GET; nếu cần upload từ client trực tiếp lên S3 thì cần presigned PutObject. |
| **Delete idempotent** | S3 delete “no error if not exists”; cần 404/409 thì phải check tồn tại trước. |
| **Public access** | API không có auth trong module; nếu cần bảo vệ thì thêm Guard (JWT, API key, …) ở controller hoặc global. |

---

## 8. API tóm tắt

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/aws/s3/upload` | Upload file (form-data `file`), query `key` hoặc `prefix`. Max 10 MB. |
| GET | `/aws/s3/file/:key` | Tải file (stream). Key URL-encoded. |
| GET | `/aws/s3/presigned-url?key=...&expiresIn=...` | Lấy URL tạm (key bắt buộc, expiresIn 60–86400s). |
| DELETE | `/aws/s3/file/:key` | Xóa file. 204 No Content. Key URL-encoded. |
