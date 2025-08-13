# 🔄 Hướng dẫn khôi phục tin tức từ WordPress

## 📋 Tổng quan

Tính năng khôi phục tin tức từ WordPress cho phép bạn:
- ✅ Tìm kiếm tin tức đã bị xóa trong WordPress
- ✅ Khôi phục tin tức với đầy đủ nội dung và hình ảnh
- ✅ Cập nhật tin tức hiện có từ WordPress
- ✅ Đồng bộ categories và tags

## 🚀 Cách sử dụng

### 1. Truy cập trang khôi phục

```
/admin/news/restore
```

### 2. Tìm kiếm tin tức

#### Tìm kiếm theo từ khóa:
- Nhập tiêu đề hoặc từ khóa vào ô tìm kiếm
- Nhấn "Tìm kiếm" hoặc Enter
- Hệ thống sẽ tìm kiếm trong WordPress theo tiêu đề

#### Tìm kiếm theo WordPress ID:
- Nếu bạn biết WordPress ID của tin tức
- Sử dụng format: `ID:123` (trong đó 123 là WordPress ID)

### 3. Khôi phục tin tức

#### Khôi phục tin tức mới:
- Nhấn nút "Khôi phục" bên cạnh tin tức muốn khôi phục
- Hệ thống sẽ tải về đầy đủ nội dung và hình ảnh

#### Cập nhật tin tức hiện có:
- Nếu tin tức đã tồn tại, hệ thống sẽ hỏi có muốn cập nhật không
- Hoặc nhấn nút "Cập nhật" để force update

## 🔧 API Endpoints

### 1. Tìm kiếm posts từ WordPress

```
GET /api/wordpress/search-posts
```

**Parameters:**
- `q`: Từ khóa tìm kiếm
- `page`: Trang hiện tại (mặc định: 1)
- `per_page`: Số lượng posts mỗi trang (mặc định: 10)
- `status`: Trạng thái posts (mặc định: publish,draft)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Tiêu đề tin tức",
      "slug": "tieu-de-tin-tuc",
      "excerpt": "Tóm tắt tin tức",
      "content": "Nội dung đầy đủ",
      "status": "publish",
      "date": "2024-01-15T10:00:00Z",
      "modified": "2024-01-15T10:00:00Z",
      "author": "Tác giả",
      "featuredImage": "https://example.com/image.jpg",
      "categories": ["Công nghệ"],
      "tags": ["AI", "IoT"],
      "sticky": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 50,
    "perPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "searchQuery": "từ khóa tìm kiếm"
}
```

### 2. Khôi phục tin tức từ WordPress

```
POST /api/wordpress/restore-deleted
```

**Request Body:**
```json
{
  "wordpressId": 123,
  "title": "Tiêu đề tin tức",
  "slug": "tieu-de-tin-tuc",
  "forceRestore": false,
  "includeImages": true,
  "includeContent": true
}
```

**Parameters:**
- `wordpressId`: ID của post trong WordPress (optional)
- `title`: Tiêu đề để tìm kiếm (optional)
- `slug`: Slug để tìm kiếm (optional)
- `forceRestore`: Có cập nhật tin tức hiện có không (mặc định: false)
- `includeImages`: Có lấy hình ảnh không (mặc định: true)
- `includeContent`: Có lấy nội dung không (mặc định: true)

**Response:**
```json
{
  "success": true,
  "message": "Tin tức đã được khôi phục từ WordPress",
  "news": {
    "id": "abc123",
    "title": "Tiêu đề tin tức",
    "slug": "tieu-de-tin-tuc",
    "wordpressId": 123,
    "featuredImage": "https://example.com/image.jpg",
    "additionalImagesCount": 3,
    "status": "published",
    "restored": true
  }
}
```

## 🎯 Tính năng nổi bật

### 1. Tự động lấy hình ảnh
- ✅ Featured image từ WordPress
- ✅ Hình ảnh trong nội dung
- ✅ Alt text và metadata

### 2. Đồng bộ metadata
- ✅ Categories và tags
- ✅ Tác giả và ngày tạo
- ✅ Trạng thái publish/draft
- ✅ Sticky posts

### 3. Xử lý trùng lặp
- ✅ Kiểm tra tin tức đã tồn tại
- ✅ Hỏi người dùng có muốn cập nhật
- ✅ Force restore option

### 4. Giao diện thân thiện
- ✅ Tìm kiếm real-time
- ✅ Pagination
- ✅ Loading states
- ✅ Error handling

## 🔍 Cách tìm WordPress ID

### 1. Từ URL WordPress:
```
https://example.com/2024/01/15/tieu-de-tin-tuc/
```
WordPress ID thường hiển thị trong URL hoặc có thể tìm trong admin panel.

### 2. Từ WordPress Admin:
- Vào Posts > All Posts
- Hover vào tiêu đề post
- URL sẽ hiển thị: `post=123` (123 là WordPress ID)

### 3. Từ WordPress REST API:
```
GET /wp-json/wp/v2/posts
```
Response sẽ có `id` field cho mỗi post.

## ⚠️ Lưu ý quan trọng

### 1. Cấu hình WordPress
- ✅ WordPress site URL phải đúng
- ✅ Username và Application Password phải hợp lệ
- ✅ REST API phải được enable

### 2. Quyền truy cập
- ✅ User phải có quyền đọc posts
- ✅ Application Password phải có đủ quyền

### 3. Dữ liệu
- ✅ Backup dữ liệu trước khi restore
- ✅ Kiểm tra trùng lặp trước khi khôi phục
- ✅ Verify nội dung sau khi restore

## 🛠️ Troubleshooting

### Lỗi "Chưa cấu hình WordPress"
- Kiểm tra cấu hình WordPress trong admin panel
- Đảm bảo site URL, username, application password đúng

### Lỗi "Không tìm thấy tin tức"
- Kiểm tra từ khóa tìm kiếm
- Đảm bảo post tồn tại trong WordPress
- Kiểm tra quyền truy cập

### Lỗi "Tin tức đã tồn tại"
- Sử dụng "Cập nhật" thay vì "Khôi phục"
- Hoặc xóa tin tức cũ trước khi khôi phục

### Lỗi "Không thể lấy hình ảnh"
- Kiểm tra quyền truy cập media
- Đảm bảo hình ảnh tồn tại trong WordPress
- Kiểm tra URL hình ảnh có hợp lệ không

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Verify cấu hình WordPress
3. Test với post đơn giản trước
4. Liên hệ admin để được hỗ trợ
