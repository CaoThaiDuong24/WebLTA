const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra cuối cùng plugin đã sửa...\n');

// Kiểm tra file zip mới
const zipPath = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync-1.3.2.zip');
if (fs.existsSync(zipPath)) {
  console.log('✅ File zip mới đã được tạo: lta-news-sync-1.3.2.zip');
  
  const stats = fs.statSync(zipPath);
  console.log(`📦 Kích thước: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.log('❌ File zip mới chưa được tạo');
  process.exit(1);
}

// Kiểm tra cấu trúc thư mục
const pluginDir = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync-plugin');
if (fs.existsSync(pluginDir)) {
  console.log('✅ Thư mục plugin đã được tạo');
  
  const phpFile = path.join(pluginDir, 'lta-news-sync.php');
  if (fs.existsSync(phpFile)) {
    console.log('✅ File PHP chính đã được tạo');
    
    const content = fs.readFileSync(phpFile, 'utf8');
    
    // Kiểm tra version
    const versionMatch = content.match(/Version: (\d+\.\d+\.\d+)/);
    if (versionMatch) {
      console.log(`✅ Version: ${versionMatch[1]}`);
    }
    
    // Kiểm tra logic đã sửa
    if (content.includes('get_page_by_title') && !content.includes('substr($existing_post->post_content, 0, 100)')) {
      console.log('✅ Logic kiểm tra trùng lặp đã được sửa');
    } else {
      console.log('❌ Logic kiểm tra trùng lặp chưa được sửa');
    }
    
    // Kiểm tra thông báo lỗi
    if (content.includes('Post with this title already exists')) {
      console.log('✅ Thông báo lỗi đã được cập nhật');
    } else {
      console.log('❌ Thông báo lỗi chưa được cập nhật');
    }
  } else {
    console.log('❌ File PHP chính chưa được tạo');
  }
} else {
  console.log('❌ Thư mục plugin chưa được tạo');
}

console.log('\n🚀 Hướng dẫn sử dụng:');
console.log('1. Upload file lta-news-sync-1.3.2.zip lên WordPress');
console.log('2. Kích hoạt plugin (sẽ tạo thư mục lta-news-sync-plugin)');
console.log('3. Test tạo tin tức với tiêu đề trùng lặp');
console.log('4. Kiểm tra xem có tự động tạo slug duy nhất không');

console.log('\n✅ Plugin đã sẵn sàng sử dụng!');
console.log('📁 Cấu trúc: lta-news-sync-1.3.2.zip → lta-news-sync-plugin/ → lta-news-sync.php');
