const fs = require('fs');
const path = require('path');

console.log('🧹 Kiểm tra việc dọn dẹp file plugin...\n');

const pluginDir = path.join(__dirname, '../app/admin/wordpress-plugin');

// Danh sách file cần giữ lại
const keepFiles = [
  'lta-news-sync-1.3.2.zip', // Plugin chính đã sửa
  'lta-news-sync-plugin', // Thư mục plugin
  'lta-news-sync-plugin/lta-news-sync.php', // File PHP chính
  'lta-settings-sync', // Plugin settings
  'lta-user-manager', // Plugin user manager
  'page.tsx' // File giao diện
];

// Danh sách file đã xóa
const deletedFiles = [
  'lta-news-sync-1.2.0.zip',
  'lta-news-sync-1.3.0.zip', 
  'lta-news-sync-1.3.1.zip',
  'lta-news-sync-complete.zip',
  'lta-news-sync-correct.zip',
  'lta-news-sync-fast.zip',
  'lta-news-sync-final.zip',
  'lta-news-sync-fixed.zip',
  'lta-news-sync-optimized.zip',
  'lta-news-sync-working.zip',
  'lta-news-sync.zip',
  'lta-news-sync-fixed.php',
  'lta-news-sync-1.3.2.php'
];

console.log('✅ Các file đã được xóa:');
deletedFiles.forEach(file => {
  const filePath = path.join(pluginDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (chưa xóa)`);
  }
});

console.log('\n📁 Các file còn lại:');
const remainingFiles = fs.readdirSync(pluginDir);
remainingFiles.forEach(file => {
  const filePath = path.join(pluginDir, file);
  const stats = fs.statSync(filePath);
  const size = stats.isDirectory() ? 'DIR' : `${(stats.size / 1024).toFixed(1)} KB`;
  console.log(`   📄 ${file} (${size})`);
});

console.log('\n🎯 File plugin chính: lta-news-sync-1.3.2.zip');
console.log('📦 Sẵn sàng upload lên WordPress!');
