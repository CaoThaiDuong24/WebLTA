# Zalo Chat Box - Hướng dẫn sử dụng

## Tổng quan
Chat box Zalo được tích hợp vào website để cung cấp hỗ trợ khách hàng trực tiếp. Component này xuất hiện ở góc dưới bên phải của website và cho phép khách hàng liên hệ qua nhiều kênh khác nhau.

## Tính năng

### 1. Giao diện
- **Floating Button**: Nút tròn với icon chat ở góc dưới bên phải
- **Chat Box**: Cửa sổ chat với giao diện đẹp và responsive
- **Animation**: Hiệu ứng mượt mà khi mở/đóng và hover
- **Responsive**: Tương thích với mobile và desktop

### 2. Chức năng
- **Chat Zalo**: Mở Zalo chat với OA
- **Gọi điện**: Gọi trực tiếp qua điện thoại
- **Gửi email**: Mở ứng dụng email
- **Minimize**: Thu nhỏ chat box
- **Auto-hide**: Tự động ẩn trên trang admin

### 3. Thông tin hiển thị
- Tên công ty
- Thời gian phản hồi
- Giờ làm việc
- Địa chỉ

## Cấu hình

### File cấu hình: `data/contact-info.json`
```json
{
  "zaloId": "ltacompany",
  "phoneNumber": "0886 116 668",
  "companyName": "LTA - Logistics Technology Application",
  "responseTime": "5-10 phút",
  "workingHours": "8:00 - 18:00 (Thứ 2 - Thứ 6)",
  "email": "info@ltacv.com",
  "address": "Hà Nội, Việt Nam"
}
```

### Các tham số có thể tùy chỉnh:
- `zaloId`: ID Zalo OA
- `phoneNumber`: Số điện thoại hỗ trợ
- `companyName`: Tên công ty
- `responseTime`: Thời gian phản hồi
- `workingHours`: Giờ làm việc
- `email`: Email hỗ trợ
- `address`: Địa chỉ công ty

## Sử dụng

### 1. Tích hợp vào layout
Component đã được tích hợp sẵn vào `app/layout.tsx` và sẽ xuất hiện trên tất cả các trang (trừ trang admin).

### 2. Tùy chỉnh thông tin
Chỉnh sửa file `data/contact-info.json` để thay đổi thông tin liên hệ.

### 3. Tùy chỉnh giao diện
Chỉnh sửa file `components/zalo-chat-box.tsx` để thay đổi:
- Màu sắc
- Kích thước
- Animation
- Layout

## Cấu trúc file

```
components/
├── zalo-chat-box.tsx          # Component chính
├── chat-box-wrapper.tsx       # Wrapper quản lý hiển thị
└── ui/                        # UI components

data/
└── contact-info.json          # Cấu hình thông tin

docs/
└── ZALO_CHAT_BOX.md          # Tài liệu này
```

## Tùy chỉnh nâng cao

### 1. Thay đổi vị trí
```tsx
// Trong zalo-chat-box.tsx
<div className="fixed bottom-4 right-4 z-50">
  // Thay đổi bottom-4 right-4 thành vị trí mong muốn
</div>
```

### 2. Thay đổi màu sắc
```tsx
// Thay đổi gradient
className="bg-gradient-to-r from-blue-500 to-blue-600"
// Thành
className="bg-gradient-to-r from-green-500 to-green-600"
```

### 3. Thêm tính năng mới
```tsx
// Thêm button mới
<Button onClick={handleNewFeature}>
  <NewIcon className="w-4 h-4 mr-2" />
  Tính năng mới
</Button>
```

## Lưu ý

1. **Performance**: Component sử dụng lazy loading và chỉ hiển thị sau 2 giây
2. **Accessibility**: Hỗ trợ keyboard navigation và screen readers
3. **Mobile**: Responsive design cho mobile devices
4. **SEO**: Không ảnh hưởng đến SEO vì là client-side component

## Troubleshooting

### Chat box không hiển thị
- Kiểm tra console để xem lỗi
- Đảm bảo component được import đúng
- Kiểm tra file cấu hình JSON

### Link Zalo không hoạt động
- Kiểm tra `zaloId` trong file cấu hình
- Đảm bảo Zalo OA đã được tạo và cấu hình

### Giao diện bị lỗi
- Kiểm tra CSS classes
- Đảm bảo Tailwind CSS được cấu hình đúng
- Kiểm tra responsive breakpoints
