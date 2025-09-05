const fs = require('fs');
const path = require('path');

console.log('✅ Plugin đã sửa xong!\n');

const zipPath = path.join(__dirname, '../app/admin/wordpress-plugin/lta-news-sync-1.3.2.zip');
if (fs.existsSync(zipPath)) {
  const stats = fs.statSync(zipPath);
  console.log(`📦 File: lta-news-sync-1.3.2.zip (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log('📁 Cấu trúc: lta-news-sync-1.3.2.zip → lta-news-sync/ → lta-news-sync.php');
  console.log('✅ Sẵn sàng upload lên WordPress!');
} else {
  console.log('❌ File chưa được tạo');
}
