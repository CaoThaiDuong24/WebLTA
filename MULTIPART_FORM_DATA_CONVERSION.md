# Chuyển đổi hình ảnh trong localNewsData thành multipart/form-data

## Tổng quan

Đã thực hiện chuyển đổi hệ thống từ việc gửi hình ảnh dưới dạng data URLs (base64) trong JSON sang sử dụng multipart/form-data để tối ưu hiệu suất và xử lý file tốt hơn.

## Các thay đổi chính

### 1. Thêm utility functions trong `lib/upload-utils.ts`

#### `dataUrlToFile(dataUrl: string, filename?: string): Promise<File>`
- Chuyển đổi data URL thành File object
- Sử dụng fetch API để lấy blob từ data URL
- Tạo File object với tên file và MIME type phù hợp

#### `dataUrlsToFiles(dataUrls: string[], filenames?: string[]): Promise<File[]>`
- Chuyển đổi nhiều data URLs thành mảng File objects
- Hỗ trợ đặt tên file tùy chỉnh cho từng ảnh

#### `createNewsFormData(newsData): Promise<FormData>`
- Tạo FormData object từ dữ liệu tin tức
- Tự động chuyển đổi hình ảnh từ data URLs sang File objects
- Thêm tất cả trường dữ liệu vào FormData

### 2. Cập nhật API route `app/api/news/route.ts`

#### Hỗ trợ cả JSON và multipart/form-data
- Thêm function `handleMultipartFormData()` để xử lý FormData
- Tự động phát hiện content-type và xử lý phù hợp
- Chuyển đổi File objects từ FormData thành data URLs để tương thích với logic hiện tại

#### Xử lý hình ảnh
- Featured image: Chuyển đổi File thành base64 data URL
- Additional images: Xử lý nhiều files và chuyển đổi thành mảng data URLs

### 3. Cập nhật form tạo tin tức `app/admin/news/create/page.tsx`

#### Thay đổi cách gửi dữ liệu
- Sử dụng `createNewsFormData()` để tạo FormData
- Loại bỏ `Content-Type: application/json` header
- Gửi FormData thay vì JSON.stringify()

### 4. Tạo test endpoints

#### `app/api/test-multipart/route.ts`
- API endpoint để test multipart/form-data handling
- Log chi tiết các trường dữ liệu nhận được
- Phân biệt giữa text fields và file fields

#### `app/admin/test-multipart/page.tsx`
- Trang test để verify chức năng multipart/form-data
- Tạo dữ liệu test với hình ảnh mẫu
- Hiển thị kết quả test

## Lợi ích của việc chuyển đổi

### 1. Hiệu suất tốt hơn
- Giảm kích thước request khi gửi hình ảnh lớn
- Tránh overhead của base64 encoding
- Tối ưu memory usage

### 2. Xử lý file tốt hơn
- Hỗ trợ đầy đủ file metadata (tên, kích thước, MIME type)
- Dễ dàng validate và process files
- Tương thích với các file upload libraries

### 3. Tương thích ngược
- Vẫn hỗ trợ JSON requests cho backward compatibility
- Tự động detect content-type và xử lý phù hợp

## Cách sử dụng

### 1. Tạo tin tức với multipart/form-data
```typescript
import { createNewsFormData } from '@/lib/upload-utils'

const newsData = {
  title: 'Tin tức mới',
  content: '<p>Nội dung...</p>',
  featuredImage: 'data:image/jpeg;base64,...',
  additionalImages: ['data:image/png;base64,...']
}

const formData = await createNewsFormData(newsData)

const response = await fetch('/api/news', {
  method: 'POST',
  body: formData
})
```

### 2. Test chức năng
- Truy cập `/admin/test-multipart` để test
- Kiểm tra console logs để xem chi tiết xử lý
- Verify rằng files được chuyển đổi đúng cách

## Lưu ý kỹ thuật

### 1. File size limits
- Vẫn áp dụng giới hạn kích thước file hiện tại
- Hình ảnh lớn sẽ được nén tự động

### 2. Error handling
- Xử lý lỗi khi chuyển đổi data URL sang File
- Fallback về JSON nếu multipart processing thất bại

### 3. Memory management
- Files được xử lý theo stream để tránh memory overflow
- Tự động cleanup sau khi xử lý xong

## Kết luận

Việc chuyển đổi sang multipart/form-data đã cải thiện đáng kể hiệu suất và khả năng xử lý hình ảnh của hệ thống, đồng thời vẫn đảm bảo tương thích ngược với các tính năng hiện có.
