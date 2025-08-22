# Sửa lỗi Timeout khi lưu tin tức

## 🔍 Phân tích vấn đề

Lỗi timeout xảy ra khi:
1. **API Key không đúng**: WordPress plugin trả về 401 Unauthorized
2. **Plugin chưa được cấu hình**: API key chưa được lưu trong WordPress
3. **Timeout quá ngắn**: WordPress xử lý chậm

## 🔧 Các sửa đổi đã thực hiện

### 1. **Tăng timeout và thêm retry logic**
- **File**: `app/api/wordpress/publish-via-plugin/route.ts`
- **Thay đổi**: 
  - Tăng timeout từ 15s → 30s
  - Thêm retry logic (3 lần thử)
  - Chờ 2s giữa các lần thử

### 2. **Cải thiện error handling**
- **File**: `app/api/news/route.ts`
- **Thay đổi**:
  - Tăng timeout từ 15s → 35s
  - Thêm retry logic (2 lần thử)
  - Chờ 3s giữa các lần thử

## 📋 Hướng dẫn sửa lỗi

### Bước 1: Kiểm tra API Key
```bash
node scripts/check-plugin-api-key.js
```

### Bước 2: Cập nhật API Key trong WordPress
1. **Truy cập WordPress Admin**
   - Đăng nhập vào WordPress admin
   - Vào menu **LTA News Sync**

2. **Cập nhật API Key**
   - Copy API key mới từ script output
   - Paste vào trường **API Key**
   - Click **Lưu cấu hình**

3. **Kiểm tra lại**
   - Chạy lại script test
   - Thử tạo tin tức mới

### Bước 3: Nếu vẫn lỗi
1. **Kiểm tra plugin**
   - Đảm bảo plugin **LTA News Sync** đã được kích hoạt
   - Kiểm tra log lỗi trong WordPress

2. **Kiểm tra quyền**
   - Đảm bảo user có quyền tạo bài viết
   - Kiểm tra Application Password

## 🧪 Scripts test

### Test kết nối WordPress
```bash
node scripts/test-wordpress-timeout.js
```

### Test API Key
```bash
node scripts/check-plugin-api-key.js
```

### Test tạo tin tức
```bash
node scripts/test-news-save-speed.js
```

## ⚡ Tối ưu hiệu suất

### Timeout settings hiện tại:
- **REST API**: 10s
- **Plugin endpoint**: 30s (với retry)
- **News save**: 35s (với retry)

### Retry logic:
- **Plugin endpoint**: 3 lần thử, chờ 2s
- **News save**: 2 lần thử, chờ 3s

## 🔍 Debug tips

### Kiểm tra log:
1. **Browser Console**: Xem lỗi JavaScript
2. **Network Tab**: Xem response từ API
3. **WordPress Log**: Kiểm tra error log

### Common issues:
1. **401 Unauthorized**: API key sai
2. **Timeout**: WordPress chậm hoặc lỗi
3. **500 Error**: Plugin lỗi

## ✅ Kết quả mong đợi

Sau khi sửa:
- ✅ Tin tức lưu thành công trong 5-15s
- ✅ Không còn lỗi timeout
- ✅ API key hoạt động đúng
- ✅ Plugin response nhanh

## 🚨 Lưu ý quan trọng

1. **API Key phải khớp** giữa local config và WordPress plugin
2. **Plugin phải được kích hoạt** trong WordPress
3. **User phải có quyền** tạo bài viết
4. **Application Password** phải đúng
