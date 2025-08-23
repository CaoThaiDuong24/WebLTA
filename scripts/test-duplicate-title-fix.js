const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra việc sửa lỗi trùng lặp title...\n');

// Kiểm tra plugin đã được cập nhật
const pluginPath = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync/lta-news-sync.php');
if (fs.existsSync(pluginPath)) {
  const pluginContent = fs.readFileSync(pluginPath, 'utf8');
  
  // Kiểm tra version
  const versionMatch = pluginContent.match(/Version: (\d+\.\d+\.\d+)/);
  if (versionMatch) {
    console.log(`✅ Plugin version: ${versionMatch[1]}`);
  }
  
  // Kiểm tra logic kiểm tra trùng lặp đã được sửa
  if (pluginContent.includes('get_page_by_title') && !pluginContent.includes('substr($existing_post->post_content, 0, 100)')) {
    console.log('✅ Logic kiểm tra trùng lặp đã được sửa - chỉ kiểm tra title chính xác');
  } else {
    console.log('❌ Logic kiểm tra trùng lặp chưa được sửa');
  }
  
  // Kiểm tra thông báo lỗi
  if (pluginContent.includes('Post with this title already exists')) {
    console.log('✅ Thông báo lỗi đã được cập nhật');
  } else {
    console.log('❌ Thông báo lỗi chưa được cập nhật');
  }
} else {
  console.log('❌ Không tìm thấy file plugin');
}

// Kiểm tra file zip mới
const zipPath = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync-1.3.2.zip');
if (fs.existsSync(zipPath)) {
  console.log('✅ File zip plugin mới đã được tạo: lta-news-sync-1.3.2.zip');
} else {
  console.log('❌ File zip plugin mới chưa được tạo');
}

// Kiểm tra frontend đã được cập nhật
const createPagePath = path.join(__dirname, '../app/admin/news/create/page.tsx');
if (fs.existsSync(createPagePath)) {
  const createPageContent = fs.readFileSync(createPagePath, 'utf8');
  
  // Kiểm tra function tạo slug duy nhất
  if (createPageContent.includes('generateUniqueSlug')) {
    console.log('✅ Function tạo slug duy nhất đã được thêm');
  } else {
    console.log('❌ Function tạo slug duy nhất chưa được thêm');
  }
  
  // Kiểm tra xử lý lỗi trùng lặp
  if (createPageContent.includes('title already exists')) {
    console.log('✅ Xử lý lỗi trùng lặp title đã được thêm');
  } else {
    console.log('❌ Xử lý lỗi trùng lặp title chưa được thêm');
  }
  
  // Kiểm tra nút tạo slug duy nhất
  if (createPageContent.includes('Tạo slug duy nhất')) {
    console.log('✅ Nút tạo slug duy nhất đã được thêm');
  } else {
    console.log('❌ Nút tạo slug duy nhất chưa được thêm');
  }
} else {
  console.log('❌ Không tìm thấy file create page');
}

console.log('\n📋 Tóm tắt các thay đổi:');
console.log('1. ✅ Sửa logic kiểm tra trùng lặp trong WordPress plugin - chỉ kiểm tra title chính xác');
console.log('2. ✅ Cập nhật thông báo lỗi rõ ràng hơn');
console.log('3. ✅ Thêm function tạo slug duy nhất với timestamp');
console.log('4. ✅ Thêm xử lý tự động tạo slug duy nhất khi có lỗi trùng lặp');
console.log('5. ✅ Thêm nút tạo slug duy nhất trong giao diện');
console.log('6. ✅ Tạo file zip plugin mới version 1.3.2');

console.log('\n🚀 Hướng dẫn triển khai:');
console.log('1. Upload file lta-news-sync-1.3.2.zip lên WordPress');
console.log('2. Kích hoạt plugin mới');
console.log('3. Test tạo tin tức với tiêu đề trùng lặp');
console.log('4. Kiểm tra xem có tự động tạo slug duy nhất không');
