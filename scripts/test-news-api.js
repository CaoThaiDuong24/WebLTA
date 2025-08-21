const fs = require('fs');
const path = require('path');

// Đường dẫn đến file news.json
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json');

// Test đọc dữ liệu tin tức
const testNewsAPI = () => {
  try {
    console.log('🧪 Test API tin tức');
    console.log('===================');
    
    // Kiểm tra file tồn tại
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      console.log('❌ File news.json không tồn tại');
      return;
    }
    
    // Đọc file
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8');
    const news = JSON.parse(data);
    
    if (!Array.isArray(news)) {
      console.log('❌ Dữ liệu không phải array');
      return;
    }
    
    console.log(`✅ Đọc thành công ${news.length} tin tức`);
    
    // Hiển thị thông tin cơ bản
    if (news.length > 0) {
      console.log('\n📋 Danh sách tin tức:');
      news.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title || 'Không có tiêu đề'} (ID: ${item.id})`);
        console.log(`   - Trạng thái: ${item.status || 'N/A'}`);
        console.log(`   - Tác giả: ${item.author || 'N/A'}`);
        console.log(`   - Ngày tạo: ${item.createdAt || 'N/A'}`);
        console.log(`   - WordPress ID: ${item.wordpressId || 'N/A'}`);
        console.log(`   - Đã sync WordPress: ${item.syncedToWordPress || false}`);
        console.log('');
      });
    }
    
    // Thống kê
    const published = news.filter(item => item.status === 'published').length;
    const drafts = news.filter(item => item.status === 'draft').length;
    const synced = news.filter(item => item.syncedToWordPress).length;
    
    console.log('📊 Thống kê:');
    console.log(`   - Tổng số: ${news.length}`);
    console.log(`   - Đã xuất bản: ${published}`);
    console.log(`   - Bản nháp: ${drafts}`);
    console.log(`   - Đã sync WordPress: ${synced}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi test API:', error);
  }
};

// Test tạo tin tức mới
const testCreateNews = async () => {
  try {
    console.log('\n🧪 Test tạo tin tức mới');
    console.log('========================');
    
    const testNews = {
      title: 'Tin tức test - ' + new Date().toISOString(),
      slug: 'tin-tuc-test-' + Date.now(),
      excerpt: 'Đây là tin tức test để kiểm tra API',
      content: '<p>Nội dung test</p>',
      status: 'draft',
      featured: false,
      category: 'Test',
      author: 'Admin Test',
      featuredImage: '',
      additionalImages: []
    };
    
    console.log('📝 Dữ liệu test:', testNews);
    
    // Gọi API tạo tin tức
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNews)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Tạo tin tức thành công');
      console.log('📋 Kết quả:', result);
    } else {
      console.log('❌ Lỗi khi tạo tin tức');
      console.log('📋 Lỗi:', result);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test tạo tin tức:', error);
  }
};

// Main function
const main = async () => {
  testNewsAPI();
  
  // Chờ một chút để server khởi động
  console.log('\n⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test tạo tin tức mới
  await testCreateNews();
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testNewsAPI,
  testCreateNews
};
