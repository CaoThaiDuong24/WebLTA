# Hướng Dẫn Sửa Lỗi Hình Ảnh Không Được Lưu Trên WordPress

## Tổng Quan Vấn Đề

**Lỗi**: Hình ảnh không được lưu trên WordPress khi đồng bộ tin tức từ hệ thống LTA.

**Nguyên nhân**: Các phương pháp đồng bộ hiện tại chỉ gửi dữ liệu văn bản (title, content, excerpt) mà không bao gồm thông tin hình ảnh.

## Giải Pháp Đã Triển Khai

### 1. **Cập Nhật WordPress Plugin**

#### Thêm Xử Lý Hình Ảnh
- **File**: `wordpress-plugin-lta-news-sync.php`
- **Thay đổi**: Thêm các phương thức xử lý hình ảnh

```php
// Thêm vào class LTA_News_Sync
private function handle_post_images($post_id, $post_data) {
    // Xử lý featured image
    // Xử lý main image
    // Xử lý additional images
    // Xử lý related images
}

private function upload_image_from_url($image_url, $alt_text = '') {
    // Tải hình ảnh từ URL
    // Upload vào WordPress media library
    // Tạo attachment và metadata
}
```

#### Cập Nhật REST API Routes
```php
// Thêm các trường hình ảnh vào REST API
'featuredImage' => array(
    'required' => false,
    'type' => 'string',
    'sanitize_callback' => 'esc_url_raw'
),
'image' => array(
    'required' => false,
    'type' => 'string',
    'sanitize_callback' => 'esc_url_raw'
),
'additionalImages' => array(
    'required' => false,
    'type' => 'array',
    'items' => array(
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw'
    )
),
'relatedImages' => array(
    'required' => false,
    'type' => 'array',
    'items' => array(
        'type' => 'object',
        'properties' => array(
            'id' => array('type' => 'string'),
            'url' => array('type' => 'string'),
            'alt' => array('type' => 'string'),
            'order' => array('type' => 'integer')
        )
    )
),
'imageAlt' => array(
    'required' => false,
    'type' => 'string',
    'sanitize_callback' => 'sanitize_text_field'
)
```

### 2. **Cập Nhật Multi-Method Sync**

#### File: `app/api/wordpress/sync-multi-method/route.ts`

**Thêm thông tin hình ảnh vào payload**:
```typescript
// Thêm thông tin hình ảnh
if (newsData.featuredImage) {
  postPayload.featuredImage = newsData.featuredImage
}
if (newsData.image) {
  postPayload.image = newsData.image
}
if (newsData.additionalImages && newsData.additionalImages.length > 0) {
  postPayload.additionalImages = newsData.additionalImages
}
if (newsData.relatedImages && newsData.relatedImages.length > 0) {
  postPayload.relatedImages = newsData.relatedImages
}
if (newsData.imageAlt) {
  postPayload.imageAlt = newsData.imageAlt
}
```

**Cập nhật các phương pháp sync**:
- **XML-RPC**: Sử dụng WordPress plugin endpoint `/wp-json/lta/v1/sync`
- **cURL**: Sử dụng WordPress plugin endpoint
- **wp-cron**: Sử dụng WordPress plugin endpoint

### 3. **Cấu Trúc Dữ Liệu Hình Ảnh**

#### Trong Hệ Thống LTA
```typescript
interface NewsItem {
  featuredImage?: string        // Hình ảnh nổi bật
  image?: string               // Hình ảnh chính
  additionalImages?: string[]  // Hình ảnh bổ sung
  relatedImages?: Array<{      // Hình ảnh liên quan
    id: string
    url: string
    alt: string
    order: number
  }>
  imageAlt?: string            // Alt text cho hình ảnh
}
```

#### Trên WordPress
- **Featured Image**: Được set làm `post_thumbnail`
- **Main Image**: Lưu trong meta `_lta_main_image_id`
- **Additional Images**: Lưu trong meta `_lta_additional_images`
- **Related Images**: Lưu trong meta `_lta_related_images`

## Cách Sử Dụng

### 1. **Cài Đặt WordPress Plugin**

1. Upload file `wordpress-plugin-lta-news-sync.php` vào thư mục `/wp-content/plugins/`
2. Kích hoạt plugin trong WordPress Admin
3. Kiểm tra logs trong bảng `wp_lta_sync_logs`

### 2. **Kiểm Tra Cấu Hình**

```bash
# Kiểm tra endpoint có hoạt động không
curl -X POST "https://your-wordpress-site.com/wp-json/lta/v1/sync" \
  -H "Authorization: Basic base64_credentials" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'
```

### 3. **Test Đồng Bộ Hình Ảnh**

1. Tạo tin tức mới với hình ảnh trong hệ thống LTA
2. Đồng bộ lên WordPress
3. Kiểm tra hình ảnh đã được upload trong WordPress Media Library
4. Kiểm tra featured image đã được set cho post

## Xử Lý Lỗi

### 1. **Lỗi Upload Hình Ảnh**

**Nguyên nhân có thể**:
- URL hình ảnh không hợp lệ
- WordPress không có quyền ghi vào thư mục uploads
- Kích thước file quá lớn
- Timeout khi tải hình ảnh

**Giải pháp**:
```php
// Kiểm tra logs trong WordPress
SELECT * FROM wp_lta_sync_logs WHERE level = 'error' ORDER BY timestamp DESC;

// Kiểm tra quyền thư mục
chmod 755 wp-content/uploads
chmod 644 wp-content/uploads/*

// Tăng timeout
wp_remote_get($image_url, array(
    'timeout' => 60,  // Tăng từ 30 lên 60 giây
    'sslverify' => false
));
```

### 2. **Lỗi REST API**

**Nguyên nhân có thể**:
- Plugin chưa được kích hoạt
- REST API bị chặn
- Authentication không đúng

**Giải pháp**:
```bash
# Kiểm tra plugin có hoạt động không
curl -X GET "https://your-site.com/wp-json/lta/v1/sync"

# Kiểm tra REST API
curl -X GET "https://your-site.com/wp-json/wp/v2/posts"
```

### 3. **Lỗi Duplicate Images**

**Nguyên nhân**: Hình ảnh đã tồn tại trong Media Library

**Giải pháp**: Plugin sẽ tự động kiểm tra và sử dụng hình ảnh hiện có thay vì tạo mới.

## Monitoring và Debug

### 1. **WordPress Logs**

```sql
-- Xem tất cả logs
SELECT * FROM wp_lta_sync_logs ORDER BY timestamp DESC;

-- Xem logs lỗi
SELECT * FROM wp_lta_sync_logs WHERE level = 'error' ORDER BY timestamp DESC;

-- Xem logs hình ảnh
SELECT * FROM wp_lta_sync_logs WHERE message LIKE '%image%' ORDER BY timestamp DESC;
```

### 2. **LTA System Logs**

```bash
# Xem logs của Next.js API
tail -f logs/api.log

# Xem logs sync
grep "WordPress.*sync" logs/api.log
```

### 3. **Kiểm Tra Media Library**

1. Vào WordPress Admin > Media
2. Tìm kiếm theo tên file bắt đầu bằng "lta-"
3. Kiểm tra metadata của hình ảnh

## Tối Ưu Hóa

### 1. **Performance**

- Sử dụng CDN cho hình ảnh
- Nén hình ảnh trước khi upload
- Sử dụng lazy loading

### 2. **Storage**

- Định kỳ dọn dẹp hình ảnh không sử dụng
- Backup Media Library
- Sử dụng external storage (S3, etc.)

### 3. **Security**

- Validate URL hình ảnh
- Kiểm tra file type
- Giới hạn kích thước file

## Troubleshooting

### 1. **Hình Ảnh Không Hiển Thị**

```php
// Kiểm tra URL hình ảnh
$image_url = get_post_meta($post_id, '_lta_main_image_id', true);
if ($image_url) {
    $image_data = wp_get_attachment_image_src($image_url, 'full');
    if ($image_data) {
        echo $image_data[0]; // URL hình ảnh
    }
}
```

### 2. **Featured Image Không Được Set**

```php
// Kiểm tra featured image
$featured_id = get_post_thumbnail_id($post_id);
if (!$featured_id) {
    // Set lại featured image
    $main_image_id = get_post_meta($post_id, '_lta_main_image_id', true);
    if ($main_image_id) {
        set_post_thumbnail($post_id, $main_image_id);
    }
}
```

### 3. **Lỗi Permission**

```bash
# Kiểm tra quyền thư mục WordPress
ls -la wp-content/uploads/

# Sửa quyền nếu cần
chown www-data:www-data wp-content/uploads/
chmod 755 wp-content/uploads/
```

## Kết Luận

Với các cập nhật này, hệ thống LTA sẽ có thể đồng bộ hình ảnh một cách đầy đủ lên WordPress. Tất cả các phương pháp sync (REST API, XML-RPC, cURL, wp-cron) đều sẽ hỗ trợ hình ảnh thông qua WordPress plugin.

**Lưu ý quan trọng**:
1. Đảm bảo WordPress plugin đã được cài đặt và kích hoạt
2. Kiểm tra quyền ghi vào thư mục uploads
3. Monitor logs để phát hiện và xử lý lỗi kịp thời
4. Backup dữ liệu trước khi test trên production
