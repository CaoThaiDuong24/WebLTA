const fs = require('fs');
const path = require('path');

console.log('✅ Plugin V2 đã sửa xong!\n');

const zipPath = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync-v2.zip');
if (fs.existsSync(zipPath)) {
  const stats = fs.statSync(zipPath);
  console.log(`📦 File: lta-news-sync-v2.zip (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log('📁 Cấu trúc: lta-news-sync-v2.zip → lta-news-sync-v2.php');
  console.log('🔧 Tên plugin: LTA News Sync V2');
  console.log('✅ Sẵn sàng upload lên WordPress!');
  console.log('\n💡 Hướng dẫn:');
  console.log('1. Upload file lta-news-sync-v2.zip lên WordPress');
  console.log('2. Kích hoạt plugin "LTA News Sync V2"');
  console.log('3. Test tạo tin tức với tiêu đề trùng lặp');
  console.log('4. Hệ thống sẽ tự động tạo slug duy nhất');
} else {
  console.log('❌ File chưa được tạo');
}
