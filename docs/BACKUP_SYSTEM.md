# Hệ thống Backup & Restore

## Tổng quan

Hệ thống backup được thiết kế để đảm bảo không mất dữ liệu tin tức khi deploy code mới lên production. Hệ thống cung cấp nhiều phương thức backup và restore linh hoạt.

## Tính năng chính

### 1. Export Backup
- **API**: `GET /api/backup/export`
- **Chức năng**: Tải về file backup chứa tất cả dữ liệu tin tức
- **Định dạng**: JSON với metadata
- **Sử dụng**: Backup thủ công trước khi deploy

### 2. Import Backup
- **API**: `POST /api/backup/import`
- **Chức năng**: Khôi phục dữ liệu từ file backup
- **Chiến lược**: Merge dữ liệu (không ghi đè hoàn toàn)
- **Sử dụng**: Khôi phục dữ liệu sau khi deploy

### 3. Auto Backup
- **API**: `POST /api/backup/auto-backup`
- **Chức năng**: Tạo backup tự động trên server
- **Lưu trữ**: `data/backups/` (giữ 10 file gần nhất)
- **Sử dụng**: Backup định kỳ hoặc trước khi deploy

### 4. Pre-deploy Script
- **File**: `scripts/pre-deploy-backup.js`
- **Chức năng**: Script tự động backup trước khi deploy
- **Sử dụng**: Chạy trong CI/CD pipeline

## Cấu trúc dữ liệu backup

```json
{
  "version": "1.0.0",
  "backupDate": "2024-01-01T00:00:00.000Z",
  "totalItems": 100,
  "data": {
    "news": [
      {
        "id": "unique-id",
        "title": "Tiêu đề tin tức",
        "content": "Nội dung tin tức",
        "excerpt": "Tóm tắt",
        "status": "published",
        "wordpressId": 123,
        "syncedToWordPress": true,
        // ... các trường khác
      }
    ]
  }
}
```

## Hướng dẫn sử dụng

### Trước khi deploy code mới

1. **Tạo backup thủ công**:
   ```bash
   # Truy cập trang admin
   http://localhost:3004/admin/backup
   
   # Bấm "Tải về Backup" hoặc "Tạo Auto Backup"
   ```

2. **Sử dụng script tự động**:
   ```bash
   # Chạy script pre-deploy
   node scripts/pre-deploy-backup.js
   ```

3. **Lưu file backup** vào nơi an toàn

### Sau khi deploy

1. **Kiểm tra dữ liệu** trên production
2. **Nếu cần khôi phục**:
   ```bash
   # Truy cập trang admin
   http://localhost:3004/admin/backup
   
   # Bấm "Chọn File Backup" và upload file backup
   ```

### Tích hợp vào CI/CD

Thêm vào pipeline deploy:

```yaml
# Ví dụ với GitHub Actions
- name: Pre-deploy backup
  run: node scripts/pre-deploy-backup.js

- name: Deploy to production
  run: # deploy commands

- name: Verify deployment
  run: # verification commands
```

## Chiến lược merge dữ liệu

Khi import backup, hệ thống sử dụng chiến lược merge thông minh:

1. **Kiểm tra ID local**: Nếu tin tức có cùng ID → Cập nhật
2. **Kiểm tra WordPress ID**: Nếu tin tức có cùng WordPress ID → Cập nhật
3. **Thêm mới**: Nếu không tìm thấy → Thêm tin tức mới

Điều này đảm bảo:
- Không mất dữ liệu hiện tại
- Khôi phục được dữ liệu đã mất
- Tránh trùng lặp

## Lưu trữ backup

### Thư mục backup
```
data/
├── backups/
│   ├── auto-backup-2024-01-01T00-00-00-000Z.json
│   ├── pre-deploy-backup-2024-01-01T00-00-00-000Z.json
│   └── lta-backup-2024-01-01T00-00-00-000Z.json
├── news.json
└── wordpress-config.json
```

### Chính sách lưu trữ
- **Auto backup**: Giữ 10 file gần nhất
- **Pre-deploy backup**: Giữ 5 file gần nhất
- **Manual backup**: Không tự động xóa

## Bảo mật

### Khuyến nghị
1. **Mã hóa file backup** trước khi upload lên cloud
2. **Giới hạn quyền truy cập** trang backup
3. **Logging** tất cả hoạt động backup/restore
4. **Test restore** trên môi trường staging

### Cấu hình bảo mật
```typescript
// Thêm middleware bảo mật
export function middleware(request: NextRequest) {
  // Kiểm tra quyền admin
  // Rate limiting
  // Logging
}
```

## Troubleshooting

### Lỗi thường gặp

1. **File backup không đúng định dạng**
   - Kiểm tra file JSON hợp lệ
   - Đảm bảo cấu trúc dữ liệu đúng

2. **Lỗi quyền truy cập**
   - Kiểm tra quyền ghi thư mục `data/backups/`
   - Đảm bảo user có quyền admin

3. **Dữ liệu bị trùng lặp**
   - Kiểm tra logic merge
   - Xem log để debug

### Debug

```bash
# Xem log backup
tail -f logs/backup.log

# Kiểm tra file backup
cat data/backups/auto-backup-*.json | jq '.totalItems'

# Test restore trên staging
curl -X POST -F "file=@backup.json" http://staging/api/backup/import
```

## Monitoring

### Metrics cần theo dõi
- Số lượng backup được tạo
- Kích thước file backup
- Thời gian backup/restore
- Tỷ lệ thành công

### Alerting
- Backup thất bại
- Restore thất bại
- Dung lượng backup quá lớn
- Backup không được tạo trong 24h

## Kết luận

Hệ thống backup này đảm bảo:
- ✅ Không mất dữ liệu khi deploy
- ✅ Khôi phục dữ liệu dễ dàng
- ✅ Tự động hóa quá trình backup
- ✅ Bảo mật và an toàn
- ✅ Dễ sử dụng cho admin

**Lưu ý quan trọng**: Luôn test backup/restore trên môi trường staging trước khi sử dụng trên production.
