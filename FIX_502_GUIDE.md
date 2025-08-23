
# Hướng dẫn sửa lỗi 502 khi lưu tin tức

## Nguyên nhân có thể:
1. API key không đúng hoặc hết hạn
2. WordPress site không accessible
3. Plugin không hoạt động
4. Network timeout

## Các bước sửa:

### Bước 1: Cập nhật API key trong WordPress
1. Vào WordPress Admin → LTA News Sync
2. Copy API key mới: lta_122b21c747fa6efe534a4c6df255a3027e7ed7c5dba83ca27616e63c8490d3f4
3. Paste vào trường "API Key"
4. Click "Lưu cấu hình"

### Bước 2: Kiểm tra plugin
1. Đảm bảo plugin "LTA News Sync" đã được cài đặt và kích hoạt
2. Kiểm tra plugin có hoạt động không

### Bước 3: Test lại
1. Thử tạo tin tức mới
2. Nếu vẫn lỗi, kiểm tra console để xem lỗi chi tiết

### Bước 4: Nếu vẫn lỗi
1. Kiểm tra WordPress site có hoạt động không
2. Kiểm tra hosting có block REST API không
3. Liên hệ admin WordPress để kiểm tra

## Lưu ý:
- Backup dữ liệu trước khi thay đổi
- Test trên môi trường dev trước
- Ghi log lỗi để debug
