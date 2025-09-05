# LTA Recruitment Sync - WordPress Plugin

Plugin WordPress để đồng bộ thông tin tuyển dụng từ hệ thống LTA với WordPress thông qua API và webhook.

## Tính năng

- ✅ Tạo bảng cơ sở dữ liệu tự động để lưu thông tin tuyển dụng
- ✅ API endpoints để đồng bộ dữ liệu (thêm, sửa, xóa, lấy)
- ✅ Xác thực bằng API key
- ✅ Tự động tạo bài viết WordPress từ dữ liệu tuyển dụng
- ✅ Shortcode để hiển thị danh sách tuyển dụng
- ✅ Giao diện quản trị dễ sử dụng
- ✅ Hỗ trợ đa ngôn ngữ (tiếng Việt)

## Cài đặt

1. Tải plugin và giải nén vào thư mục `/wp-content/plugins/`
2. Kích hoạt plugin trong WordPress Admin
3. Vào menu "LTA Recruitment" để cấu hình

## Cấu hình

### 1. API Key
Tạo API key để xác thực khi đồng bộ dữ liệu từ hệ thống LTA.

### 2. Webhook URL (tùy chọn)
URL để nhận thông báo từ hệ thống LTA.

### 3. Tự động tạo bài viết
Bật/tắt tính năng tự động tạo bài viết WordPress khi đồng bộ.

### 4. Danh mục bài viết
Chọn danh mục mặc định cho các bài viết tuyển dụng.

### 5. Trạng thái bài viết
Chọn trạng thái mặc định (draft, publish, private).

## API Endpoints

### 1. Đồng bộ thông tin tuyển dụng

**URL:** `{site_url}/wp-admin/admin-ajax.php`  
**Method:** POST  
**Action:** `lta_sync_recruitment`

**Parameters:**
- `action`: lta_sync_recruitment
- `api_key`: API key đã cấu hình
- `recruitment`: Dữ liệu tuyển dụng (JSON)

**Ví dụ request:**
```javascript
fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        action: 'lta_sync_recruitment',
        api_key: 'your_api_key_here',
        recruitment: JSON.stringify({
            id: 'recruitment-1',
            title: 'Tuyển dụng Nhân viên Marketing',
            position: 'Nhân viên Marketing Digital',
            location: 'Hà Nội',
            salary: '15-25 triệu VNĐ',
            type: 'full-time',
            status: 'active',
            description: 'Mô tả công việc...',
            requirements: ['Yêu cầu 1', 'Yêu cầu 2'],
            benefits: ['Quyền lợi 1', 'Quyền lợi 2'],
            experience: '2-3 năm kinh nghiệm',
            education: 'Đại học trở lên',
            deadline: '2024-12-31T23:59:59.000Z',
            createdAt: '2024-01-15T08:00:00.000Z',
            updatedAt: '2024-01-15T08:00:00.000Z'
        })
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 2. Lấy thông tin tuyển dụng

**URL:** `{site_url}/wp-admin/admin-ajax.php`  
**Method:** GET  
**Action:** `lta_get_recruitment`

**Parameters:**
- `action`: lta_get_recruitment
- `api_key`: API key đã cấu hình
- `id`: ID tuyển dụng

### 3. Xóa thông tin tuyển dụng

**URL:** `{site_url}/wp-admin/admin-ajax.php`  
**Method:** POST  
**Action:** `lta_delete_recruitment`

**Parameters:**
- `action`: lta_delete_recruitment
- `api_key`: API key đã cấu hình
- `id`: ID tuyển dụng

## Shortcode

Sử dụng shortcode để hiển thị danh sách tuyển dụng trên trang:

```
[lta_recruitment_list status="active" limit="10"]
```

**Tham số:**
- `status`: Trạng thái tuyển dụng (active, inactive, all) - mặc định: active
- `limit`: Số lượng hiển thị - mặc định: 10
- `type`: Loại công việc (full-time, part-time, internship) - tùy chọn
- `location`: Địa điểm - tùy chọn

**Ví dụ:**
- `[lta_recruitment_list]` - Hiển thị 10 tin tuyển dụng đang hoạt động
- `[lta_recruitment_list status="all" limit="20"]` - Hiển thị tất cả tin tuyển dụng (tối đa 20)
- `[lta_recruitment_list type="full-time" location="Hà Nội"]` - Hiển thị tin tuyển dụng full-time tại Hà Nội

## Cấu trúc cơ sở dữ liệu

Plugin tự động tạo bảng `{prefix}lta_recruitment` với cấu trúc:

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | varchar(50) | ID duy nhất của tuyển dụng |
| title | text | Tiêu đề tuyển dụng |
| position | varchar(255) | Vị trí công việc |
| location | varchar(255) | Địa điểm làm việc |
| salary | varchar(255) | Mức lương |
| type | varchar(50) | Loại công việc |
| status | varchar(50) | Trạng thái |
| description | longtext | Mô tả công việc |
| requirements | longtext | Yêu cầu công việc (serialized) |
| benefits | longtext | Quyền lợi (serialized) |
| experience | varchar(255) | Yêu cầu kinh nghiệm |
| education | varchar(255) | Yêu cầu học vấn |
| deadline | datetime | Hạn nộp hồ sơ |
| created_at | datetime | Thời gian tạo |
| updated_at | datetime | Thời gian cập nhật |
| wp_post_id | bigint(20) | ID bài viết WordPress |
| sync_status | varchar(50) | Trạng thái đồng bộ |
| last_sync | datetime | Lần đồng bộ cuối |

## Tích hợp với hệ thống LTA

### 1. Đồng bộ dữ liệu
Sử dụng endpoint `lta_sync_recruitment` để gửi dữ liệu tuyển dụng từ hệ thống LTA.

### 2. Webhook (tùy chọn)
Cấu hình webhook URL để nhận thông báo tự động từ hệ thống LTA.

### 3. Kiểm tra trạng thái
Sử dụng endpoint `lta_get_recruitment` để kiểm tra trạng thái đồng bộ.

## Bảo mật

- API key được mã hóa và lưu trữ an toàn
- Tất cả dữ liệu đầu vào được sanitize
- Kiểm tra quyền truy cập admin
- Nonce verification cho form

## Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team LTA.

## Phiên bản

- **Version:** 1.0.0
- **WordPress:** 5.0+
- **PHP:** 7.4+
- **Author:** LTA Team
