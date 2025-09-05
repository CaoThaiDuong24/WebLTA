const fs = require('fs');
const path = require('path');

// Đường dẫn đến các file
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json');
const TRASH_FILE_PATH = path.join(process.cwd(), 'data', 'trash-news.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'news-backup.json');
const DELETED_BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'deleted-news-backup.json');

// Đảm bảo thư mục data tồn tại
const ensureDataDirectory = () => {
  const dataDir = path.dirname(NEWS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Xóa dữ liệu tin tức
const clearNewsData = (options = {}) => {
  try {
    console.log('🗑️ Bắt đầu xóa dữ liệu tin tức...');
    
    const {
      clearMain = true,
      clearTrash = true,
      clearBackups = false,
      createBackup = true
    } = options;
    
    // Tạo backup trước khi xóa (nếu được yêu cầu)
    if (createBackup && fs.existsSync(NEWS_FILE_PATH)) {
      console.log('💾 Tạo backup trước khi xóa...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(process.cwd(), 'data', `news-backup-before-clear-${timestamp}.json`);
      
      try {
        const currentData = fs.readFileSync(NEWS_FILE_PATH, 'utf8');
        fs.writeFileSync(backupPath, currentData);
        console.log(`✅ Backup đã tạo: ${backupPath}`);
      } catch (error) {
        console.log('⚠️ Không thể tạo backup:', error.message);
      }
    }
    
    // Xóa file tin tức chính
    if (clearMain) {
      if (fs.existsSync(NEWS_FILE_PATH)) {
        fs.unlinkSync(NEWS_FILE_PATH);
        console.log('✅ Đã xóa file news.json');
      } else {
        console.log('ℹ️ File news.json không tồn tại');
      }
      
      // Tạo file trống mới
      ensureDataDirectory();
      fs.writeFileSync(NEWS_FILE_PATH, '[]');
      console.log('✅ Đã tạo file news.json trống');
    }
    
    // Xóa thùng rác
    if (clearTrash) {
      if (fs.existsSync(TRASH_FILE_PATH)) {
        fs.unlinkSync(TRASH_FILE_PATH);
        console.log('✅ Đã xóa file trash-news.json');
      } else {
        console.log('ℹ️ File trash-news.json không tồn tại');
      }
      
      // Tạo file thùng rác trống mới
      ensureDataDirectory();
      fs.writeFileSync(TRASH_FILE_PATH, '[]');
      console.log('✅ Đã tạo file trash-news.json trống');
    }
    
    // Xóa các file backup (tùy chọn)
    if (clearBackups) {
      if (fs.existsSync(BACKUP_FILE_PATH)) {
        fs.unlinkSync(BACKUP_FILE_PATH);
        console.log('✅ Đã xóa file news-backup.json');
      }
      
      if (fs.existsSync(DELETED_BACKUP_FILE_PATH)) {
        fs.unlinkSync(DELETED_BACKUP_FILE_PATH);
        console.log('✅ Đã xóa file deleted-news-backup.json');
      }
    }
    
    console.log('🎉 Xóa dữ liệu tin tức hoàn tất!');
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    return false;
  }
};

// Kiểm tra trạng thái hiện tại
const checkCurrentStatus = () => {
  console.log('🔍 Kiểm tra trạng thái hiện tại...');
  
  const files = {
    news: fs.existsSync(NEWS_FILE_PATH),
    trash: fs.existsSync(TRASH_FILE_PATH),
    backup: fs.existsSync(BACKUP_FILE_PATH),
    deletedBackup: fs.existsSync(DELETED_BACKUP_FILE_PATH)
  };
  
  let newsCount = 0;
  let trashCount = 0;
  
  if (files.news) {
    try {
      const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8');
      const news = JSON.parse(data);
      if (Array.isArray(news)) {
        newsCount = news.length;
      }
    } catch (error) {
      console.log('⚠️ Không thể đọc file news.json');
    }
  }
  
  if (files.trash) {
    try {
      const data = fs.readFileSync(TRASH_FILE_PATH, 'utf8');
      const trash = JSON.parse(data);
      if (Array.isArray(trash)) {
        trashCount = trash.length;
      }
    } catch (error) {
      console.log('⚠️ Không thể đọc file trash-news.json');
    }
  }
  
  console.log('📊 Thống kê:');
  console.log(`   - Tin tức chính: ${newsCount} (${files.news ? 'tồn tại' : 'không tồn tại'})`);
  console.log(`   - Thùng rác: ${trashCount} (${files.trash ? 'tồn tại' : 'không tồn tại'})`);
  console.log(`   - Backup: ${files.backup ? 'tồn tại' : 'không tồn tại'}`);
  console.log(`   - Deleted backup: ${files.deletedBackup ? 'tồn tại' : 'không tồn tại'}`);
  
  return {
    files,
    counts: { news: newsCount, trash: trashCount }
  };
};

// Main function
const main = () => {
  console.log('🚀 Script xóa dữ liệu tin tức');
  console.log('==============================');
  
  const status = checkCurrentStatus();
  
  if (status.counts.news === 0 && status.counts.trash === 0) {
    console.log('ℹ️ Không có dữ liệu tin tức để xóa');
    return;
  }
  
  console.log('\n⚠️ CẢNH BÁO: Bạn sắp xóa tất cả dữ liệu tin tức local!');
  console.log('📋 Các file sẽ bị ảnh hưởng:');
  console.log('   - news.json (tin tức chính)');
  console.log('   - trash-news.json (thùng rác)');
  console.log('   - Các file backup (tùy chọn)');
  
  console.log('\n💡 Lựa chọn:');
  console.log('   1. Xóa tất cả (bao gồm backup)');
  console.log('   2. Xóa tin tức và thùng rác (giữ backup)');
  console.log('   3. Chỉ xóa tin tức chính');
  console.log('   4. Hủy bỏ');
  
  // Trong môi trường thực tế, bạn có thể sử dụng readline để nhận input
  // Ở đây tôi sẽ mặc định chọn option 2 (xóa tin tức và thùng rác, giữ backup)
  
  const choice = process.argv[2] || '2';
  
  switch (choice) {
    case '1':
      console.log('\n🗑️ Xóa tất cả dữ liệu (bao gồm backup)...');
      clearNewsData({ clearMain: true, clearTrash: true, clearBackups: true, createBackup: true });
      break;
    case '2':
      console.log('\n🗑️ Xóa tin tức và thùng rác (giữ backup)...');
      clearNewsData({ clearMain: true, clearTrash: true, clearBackups: false, createBackup: true });
      break;
    case '3':
      console.log('\n🗑️ Chỉ xóa tin tức chính...');
      clearNewsData({ clearMain: true, clearTrash: false, clearBackups: false, createBackup: true });
      break;
    case '4':
      console.log('\n❌ Đã hủy bỏ');
      return;
    default:
      console.log('\n🗑️ Xóa tin tức và thùng rác (giữ backup)...');
      clearNewsData({ clearMain: true, clearTrash: true, clearBackups: false, createBackup: true });
  }
  
  console.log('\n🔍 Kiểm tra sau khi xóa:');
  checkCurrentStatus();
};

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  clearNewsData,
  checkCurrentStatus
};
