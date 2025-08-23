# Sửa lỗi "Post with similar title or content already exists"

## Vấn đề
Khi tạo tin tức mới, hệ thống báo lỗi "Post with similar title or content already exists" ngay cả khi tiêu đề chỉ tương tự nhau.

## Nguyên nhân
Logic kiểm tra trùng lặp trong WordPress plugin quá nghiêm ngặt:
- Kiểm tra title giống hệt nhau
- Kiểm tra 100 ký tự đầu của content giống hệt nhau

## Giải pháp đã thực hiện

### 1. Sửa logic kiểm tra trùng lặp trong WordPress Plugin
**File:** `app/admin/wordpress-plugin/lta-news-sync/lta-news-sync.php`

**Thay đổi:**
- Chỉ kiểm tra title chính xác thay vì kiểm tra cả content
- Sử dụng `get_page_by_title()` thay vì `get_posts()`
- Cập nhật thông báo lỗi rõ ràng hơn

**Trước:**
```php
// Kiểm tra tránh duplicate posts - kiểm tra cả title và content
$existing_posts = get_posts(array(
    'post_type' => 'post',
    'post_status' => array('publish', 'draft'),
    'posts_per_page' => 5
));

foreach ($existing_posts as $existing_post) {
    if ($existing_post->post_title === $title || 
        substr($existing_post->post_content, 0, 100) === substr($content, 0, 100)) {
        wp_send_json(array('success' => false, 'error' => 'Post with similar title or content already exists'), 409);
    }
}
```

**Sau:**
```php
// Kiểm tra tránh duplicate posts - chỉ kiểm tra title chính xác
$existing_post = get_page_by_title($title, OBJECT, 'post');
if ($existing_post) {
    wp_send_json(array('success' => false, 'error' => 'Post with this title already exists'), 409);
}
```

### 2. Cải thiện xử lý lỗi trong Frontend
**File:** `app/admin/news/create/page.tsx`

**Thêm tính năng:**
- Function tạo slug duy nhất với timestamp
- Xử lý tự động tạo slug duy nhất khi có lỗi trùng lặp
- Nút tạo slug duy nhất trong giao diện

**Function tạo slug duy nhất:**
```typescript
const generateUniqueSlug = (title: string): string => {
  const baseSlug = generateSlug(title)
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}
```

**Xử lý lỗi trùng lặp:**
```typescript
// Kiểm tra nếu là lỗi trùng lặp title, tự động tạo slug duy nhất và thử lại
if (errorMessage.includes('title already exists') || errorMessage.includes('similar title')) {
  const currentTitle = watch('title')
  const uniqueSlug = generateUniqueSlug(currentTitle)
  setValue('slug', uniqueSlug)
  
  toast({
    title: "⚠️ Tiêu đề đã tồn tại",
    description: `Đã tự động tạo slug duy nhất: ${uniqueSlug}. Vui lòng thử lại.`,
    variant: "default",
  })
  
  throw new Error(`Tiêu đề "${currentTitle}" đã tồn tại. Đã tự động tạo slug duy nhất: ${uniqueSlug}`)
}
```

### 3. Tạo Plugin mới
**File:** `app/admin/wordpress-plugin/lta-news-sync-1.3.2.zip`

- Cập nhật version từ 1.3.0 lên 1.3.2
- Bao gồm tất cả các sửa đổi logic kiểm tra trùng lặp

## Hướng dẫn triển khai

### Bước 1: Upload Plugin mới
1. Vào WordPress Admin → Plugins → Add New → Upload Plugin
2. Upload file `lta-news-sync-1.3.2.zip`
3. Kích hoạt plugin mới

### Bước 2: Test tính năng
1. Vào trang tạo tin tức mới
2. Thử tạo tin tức với tiêu đề đã tồn tại
3. Kiểm tra xem có tự động tạo slug duy nhất không
4. Test nút "Tạo slug duy nhất" trong giao diện

### Bước 3: Kiểm tra kết quả
- Lỗi trùng lặp title sẽ hiển thị thông báo rõ ràng
- Hệ thống sẽ tự động tạo slug duy nhất
- Người dùng có thể thủ công tạo slug duy nhất bằng nút trong giao diện

## Lợi ích
1. **Giảm false positive:** Chỉ kiểm tra title chính xác, không kiểm tra content
2. **Trải nghiệm người dùng tốt hơn:** Tự động tạo slug duy nhất khi có lỗi
3. **Thông báo rõ ràng:** Hiển thị lỗi cụ thể và hướng dẫn khắc phục
4. **Tính linh hoạt:** Cho phép người dùng tạo slug duy nhất thủ công

## Kiểm tra
Chạy script test để xác nhận tất cả thay đổi:
```bash
node scripts/test-duplicate-title-fix.js
```

Script sẽ kiểm tra:
- ✅ Plugin version đã được cập nhật
- ✅ Logic kiểm tra trùng lặp đã được sửa
- ✅ Thông báo lỗi đã được cập nhật
- ✅ Function tạo slug duy nhất đã được thêm
- ✅ Xử lý lỗi trùng lặp đã được thêm
- ✅ Nút tạo slug duy nhất đã được thêm
- ✅ File zip plugin mới đã được tạo
