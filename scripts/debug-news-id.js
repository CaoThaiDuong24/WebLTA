// Debug vấn đề với ID tin tức
const debugNewsId = async () => {
  try {
    console.log('🔍 Debug vấn đề với ID tin tức');
    console.log('==============================');
    
    // Test 1: Kiểm tra danh sách tin tức
    console.log('\n1️⃣ Kiểm tra danh sách tin tức:');
    const listResponse = await fetch('http://localhost:3003/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    
    if (listResult.data.length === 0) {
      console.log('⚠️ Không có tin tức nào');
      return true;
    }
    
    // Test 2: Hiển thị chi tiết từng tin tức
    console.log('\n2️⃣ Chi tiết từng tin tức:');
    listResult.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title}`);
      console.log(`      - ID: "${item.id}" (type: ${typeof item.id})`);
      console.log(`      - WordPress ID: ${item.wordpressId || 'N/A'}`);
      console.log(`      - Slug: "${item.slug}"`);
      console.log(`      - Status: ${item.status}`);
    });
    
    // Test 3: Test tìm kiếm tin tức theo ID
    console.log('\n3️⃣ Test tìm kiếm tin tức theo ID:');
    const testNews = listResult.data[0];
    const testId = testNews.id;
    
    console.log(`🔍 Tìm kiếm tin tức với ID: "${testId}"`);
    
    const detailResponse = await fetch(`http://localhost:3003/api/news/${testId}`);
    console.log(`📡 Response status: ${detailResponse.status}`);
    
    if (detailResponse.ok) {
      const detailResult = await detailResponse.json();
      console.log('✅ Tìm thấy tin tức!');
      console.log(`📋 Title: ${detailResult.data.title}`);
      console.log(`📋 ID: ${detailResult.data.id}`);
    } else {
      const errorText = await detailResponse.text();
      console.log('❌ Không tìm thấy tin tức:');
      console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
    }
    
    // Test 4: Test PATCH với ID
    console.log('\n4️⃣ Test PATCH với ID:');
    console.log(`🔄 Thử PATCH tin tức với ID: "${testId}"`);
    
    const patchResponse = await fetch(`http://localhost:3003/api/news/${testId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        status: testNews.status === 'published' ? 'draft' : 'published',
        title: testNews.title // Giữ nguyên title để test
      })
    });
    
    console.log(`📡 PATCH Response status: ${patchResponse.status}`);
    
    if (patchResponse.ok) {
      const patchResult = await patchResponse.json();
      console.log('✅ PATCH thành công!');
      console.log(`📋 Message: ${patchResult.message}`);
      console.log(`📋 Status mới: ${patchResult.data.status}`);
    } else {
      const errorText = await patchResponse.text();
      console.log('❌ PATCH thất bại:');
      console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
    }
    
    // Test 5: Kiểm tra file news.json
    console.log('\n5️⃣ Kiểm tra file news.json:');
    const fs = require('fs');
    const path = require('path');
    
    const newsFilePath = path.join(process.cwd(), 'data', 'news.json');
    console.log(`📁 File path: ${newsFilePath}`);
    
    if (fs.existsSync(newsFilePath)) {
      const fileContent = fs.readFileSync(newsFilePath, 'utf8');
      const fileData = JSON.parse(fileContent);
      console.log(`✅ File tồn tại, có ${fileData.length} tin tức`);
      
      if (fileData.length > 0) {
        console.log('📋 Mẫu tin tức từ file:');
        fileData.slice(0, 2).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      - ID: "${item.id}" (type: ${typeof item.id})`);
          console.log(`      - WordPress ID: ${item.wordpressId || 'N/A'}`);
        });
      }
    } else {
      console.log('❌ File news.json không tồn tại');
    }
    
    console.log('\n🎯 Kết quả debug:');
    console.log('✅ Đã kiểm tra chi tiết vấn đề với ID tin tức');
    console.log('✅ Đã test tìm kiếm và PATCH');
    console.log('✅ Đã kiểm tra file news.json');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi debug:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script debug vấn đề với ID tin tức');
  console.log('====================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Debug
  const success = await debugNewsId();
  
  console.log(`\n🎯 Kết quả debug: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit(success ? 0 : 1);
};

// Chạy debug
if (require.main === module) {
  main();
}

module.exports = {
  debugNewsId
};
