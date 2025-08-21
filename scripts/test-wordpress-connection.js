const fs = require('fs');
const path = require('path');

// Đường dẫn đến file cấu hình
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json');

// Test kết nối WordPress
const testWordPressConnection = async () => {
  try {
    console.log('🧪 Test kết nối WordPress');
    console.log('========================');
    
    // Kiểm tra file cấu hình
    if (!fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      console.log('❌ File plugin-config.json không tồn tại');
      return;
    }
    
    const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    console.log('📋 Cấu hình plugin:');
    console.log(`   - API Key: ${config.apiKey ? '✅ Có' : '❌ Không có'}`);
    console.log(`   - Webhook URL: ${config.webhookUrl || '❌ Không có'}`);
    console.log(`   - Auto Sync: ${config.autoSync ? '✅ Bật' : '❌ Tắt'}`);
    
    if (!config.apiKey) {
      console.log('❌ Plugin chưa được cấu hình API key');
      return;
    }
    
    // Test kết nối
    console.log('\n🔍 Testing WordPress connection...');
    
    const testResponse = await fetch('http://localhost:3001/api/wordpress/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Không cần gửi config, API sẽ đọc từ file
    });
    
    const result = await testResponse.json();
    
    if (testResponse.ok && result.success) {
      console.log('✅ Kết nối WordPress thành công!');
      console.log(`📡 Site URL: ${result.siteUrl}`);
    } else {
      console.log('❌ Kết nối WordPress thất bại');
      console.log(`📋 Lỗi: ${result.error}`);
      if (result.details) {
        console.log(`🔍 Chi tiết: ${result.details}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test kết nối:', error);
  }
};

// Test tạo tin tức với WordPress
const testCreateNewsWithWordPress = async () => {
  try {
    console.log('\n🧪 Test tạo tin tức với WordPress');
    console.log('==================================');
    
    const testNews = {
      title: 'Tin tức test WordPress - ' + new Date().toISOString(),
      slug: 'tin-tuc-test-wordpress-' + Date.now(),
      excerpt: 'Đây là tin tức test để kiểm tra kết nối WordPress',
      content: '<p>Nội dung test WordPress</p><p>Kiểm tra xem có lưu được không.</p>',
      status: 'draft',
      featured: false,
      category: 'Test',
      author: 'Admin Test',
      featuredImage: '',
      additionalImages: []
    };
    
    console.log('📝 Dữ liệu test:', testNews);
    
    const response = await fetch('http://localhost:3001/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testNews)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Tạo tin tức thành công!');
      console.log(`📋 WordPress ID: ${result.data.wordpressId}`);
      console.log(`🔗 Link: ${result.data.link}`);
      console.log(`📝 Message: ${result.message}`);
    } else {
      console.log('❌ Tạo tin tức thất bại');
      console.log(`📋 Lỗi: ${result.error}`);
      if (result.warning) {
        console.log(`⚠️ Cảnh báo: ${result.warning}`);
      }
      if (result.details) {
        console.log(`🔍 Chi tiết: ${result.details}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test tạo tin tức:', error);
  }
};

// Test lấy danh sách tin tức
const testGetNewsList = async () => {
  try {
    console.log('\n🧪 Test lấy danh sách tin tức');
    console.log('==============================');
    
    const response = await fetch('http://localhost:3001/api/news');
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Lấy danh sách thành công!');
      console.log(`📊 Tổng số: ${result.data.length} tin tức`);
      console.log(`📡 Nguồn: ${result.source || 'unknown'}`);
      if (result.message) {
        console.log(`📝 Message: ${result.message}`);
      }
      
      if (result.data.length > 0) {
        console.log('\n📋 Danh sách tin tức:');
        result.data.slice(0, 3).forEach((item, index) => {
          console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
          console.log(`   - Trạng thái: ${item.status}`);
          console.log(`   - WordPress ID: ${item.wordpressId || 'N/A'}`);
          console.log(`   - Đã sync: ${item.syncedToWordPress ? '✅' : '❌'}`);
        });
      }
    } else {
      console.log('❌ Lấy danh sách thất bại');
      console.log(`📋 Lỗi: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách:', error);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test kết nối WordPress');
  console.log('================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test các chức năng
  await testWordPressConnection();
  await testCreateNewsWithWordPress();
  await testGetNewsList();
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testWordPressConnection,
  testCreateNewsWithWordPress,
  testGetNewsList
};
