const fs = require('fs');
const path = require('path');

// Đường dẫn đến các file
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'news-backup.json');
const DELETED_BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'deleted-news-backup.json');

// Đảm bảo thư mục data tồn tại
const ensureDataDirectory = () => {
  const dataDir = path.dirname(NEWS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Khôi phục từ backup
const restoreFromBackup = () => {
  try {
    console.log('🔄 Bắt đầu khôi phục dữ liệu tin tức...');
    
    // Kiểm tra file backup
    if (!fs.existsSync(BACKUP_FILE_PATH)) {
      console.log('❌ Không tìm thấy file backup:', BACKUP_FILE_PATH);
      return false;
    }
    
    // Đọc file backup
    console.log('📖 Đang đọc file backup...');
    const backupData = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
    const backupNews = JSON.parse(backupData);
    
    if (!Array.isArray(backupNews)) {
      console.log('❌ Dữ liệu backup không đúng định dạng');
      return false;
    }
    
    console.log(`📊 Tìm thấy ${backupNews.length} tin tức trong backup`);
    
    // Đảm bảo thư mục data tồn tại
    ensureDataDirectory();
    
    // Lưu vào file news.json
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(backupNews, null, 2));
    
    console.log('✅ Khôi phục thành công!');
    console.log(`📝 Đã khôi phục ${backupNews.length} tin tức vào ${NEWS_FILE_PATH}`);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục:', error);
    return false;
  }
};

// Khôi phục từ deleted backup
const restoreFromDeletedBackup = () => {
  try {
    console.log('🔄 Bắt đầu khôi phục từ deleted backup...');
    
    // Kiểm tra file deleted backup
    if (!fs.existsSync(DELETED_BACKUP_FILE_PATH)) {
      console.log('❌ Không tìm thấy file deleted backup:', DELETED_BACKUP_FILE_PATH);
      return false;
    }
    
    // Đọc file deleted backup
    console.log('📖 Đang đọc file deleted backup...');
    const deletedBackupData = fs.readFileSync(DELETED_BACKUP_FILE_PATH, 'utf8');
    const deletedBackupNews = JSON.parse(deletedBackupData);
    
    if (!Array.isArray(deletedBackupNews)) {
      console.log('❌ Dữ liệu deleted backup không đúng định dạng');
      return false;
    }
    
    console.log(`📊 Tìm thấy ${deletedBackupNews.length} tin tức trong deleted backup`);
    
    // Đảm bảo thư mục data tồn tại
    ensureDataDirectory();
    
    // Lưu vào file news.json
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(deletedBackupNews, null, 2));
    
    console.log('✅ Khôi phục từ deleted backup thành công!');
    console.log(`📝 Đã khôi phục ${deletedBackupNews.length} tin tức vào ${NEWS_FILE_PATH}`);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục từ deleted backup:', error);
    return false;
  }
};

// Kiểm tra trạng thái hiện tại
const checkCurrentStatus = () => {
  console.log('🔍 Kiểm tra trạng thái hiện tại...');
  
  const currentNews = [];
  if (fs.existsSync(NEWS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        currentNews.push(...parsed);
      }
    } catch (error) {
      console.log('⚠️ Không thể đọc file news.json hiện tại');
    }
  }
  
  console.log(`📊 Tin tức hiện tại: ${currentNews.length}`);
  
  const backupExists = fs.existsSync(BACKUP_FILE_PATH);
  const deletedBackupExists = fs.existsSync(DELETED_BACKUP_FILE_PATH);
  
  console.log(`📦 Backup tồn tại: ${backupExists}`);
  console.log(`🗑️ Deleted backup tồn tại: ${deletedBackupExists}`);
  
  return {
    currentCount: currentNews.length,
    backupExists,
    deletedBackupExists
  };
};

// Main function
const main = () => {
  console.log('🚀 Script khôi phục dữ liệu tin tức');
  console.log('=====================================');
  
  const status = checkCurrentStatus();
  
  if (status.currentCount > 0) {
    console.log('⚠️ Đã có dữ liệu tin tức hiện tại. Bạn có muốn ghi đè không? (y/N)');
    // Trong môi trường thực tế, bạn có thể sử dụng readline để nhận input
    console.log('💡 Để ghi đè, hãy chạy lại script với tham số --force');
    return;
  }
  
  // Thử khôi phục từ backup chính trước
  if (status.backupExists) {
    if (restoreFromBackup()) {
      return;
    }
  }
  
  // Nếu không thành công, thử từ deleted backup
  if (status.deletedBackupExists) {
    if (restoreFromDeletedBackup()) {
      return;
    }
  }
  
  console.log('❌ Không thể khôi phục dữ liệu từ bất kỳ file backup nào');
  console.log('💡 Vui lòng kiểm tra các file backup hoặc đồng bộ từ WordPress');
};

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  restoreFromBackup,
  restoreFromDeletedBackup,
  checkCurrentStatus
};
