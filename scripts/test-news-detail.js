const fs = require('fs');
const path = require('path');

// Test lấy chi tiết tin tức
const testGetNewsDetail = async (newsId) => {
  try {
    console.log(`🧪 Test lấy chi tiết tin tức ID: ${newsId}`);
    console.log('=====================================');
    
    const response = await fetch(`http://localhost:3001/api/news/${newsId}`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Lấy chi tiết thành công!');
      console.log(`📋 Tiêu đề: ${result.data.title}`);
      console.log(`🔗 Slug: ${result.data.slug}`);
      console.log(`📝 Trạng thái: ${result.data.status}`);
      console.log(`👤 Tác giả: ${result.data.author}`);
      console.log(`📅 Ngày tạo: ${result.data.createdAt}`);
      console.log(`🆔 WordPress ID: ${result.data.wordpressId || 'N/A'}`);
      console.log(`🖼️ Featured Image: ${result.data.featuredImage ? 'Có' : 'Không có'}`);
      console.log(`📸 Additional Images: ${result.data.additionalImages?.length || 0} ảnh`);
      console.log(`🔗 Link: ${result.data.link || 'N/A'}`);
      
      if (result.data.content) {
        const contentLength = result.data.content.length;
        console.log(`📄 Nội dung: ${contentLength} ký tự`);
        console.log(`📄 Excerpt: ${result.data.excerpt?.substring(0, 100)}...`);
      }
      
      return result.data;
    } else {
      console.log('❌ Lấy chi tiết thất bại');
      console.log(`📋 Lỗi: ${result.error}`);
      if (result.details) {
        console.log(`🔍 Chi tiết: ${result.details}`);
      }
      return null;
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết:', error);
    return null;
  }
};

// Test lấy danh sách tin tức trước
const testGetNewsList = async () => {
  try {
    console.log('📋 Lấy danh sách tin tức để test...');
    
    const response = await fetch('http://localhost:3001/api/news');
    const result = await response.json();
    
    if (response.ok && result.success && result.data.length > 0) {
      console.log(`✅ Tìm thấy ${result.data.length} tin tức`);
      return result.data;
    } else {
      console.log('❌ Không có tin tức nào để test');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách:', error);
    return [];
  }
};

// Test các ID khác nhau
const testDifferentIds = async () => {
  try {
    console.log('🧪 Test các loại ID khác nhau');
    console.log('==============================');
    
    // Test 1: WordPress ID với prefix wp_
    console.log('\n1️⃣ Test WordPress ID với prefix wp_:');
    await testGetNewsDetail('wp_92');
    
    // Test 2: WordPress ID không có prefix
    console.log('\n2️⃣ Test WordPress ID không có prefix:');
    await testGetNewsDetail('92');
    
    // Test 3: Slug
    console.log('\n3️⃣ Test bằng slug:');
    await testGetNewsDetail('tin-tuc-test-wordpress-1755741705130');
    
    // Test 4: ID không tồn tại
    console.log('\n4️⃣ Test ID không tồn tại:');
    await testGetNewsDetail('999999');
    
  } catch (error) {
    console.error('❌ Lỗi khi test các ID:', error);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chi tiết tin tức');
  console.log('===============================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test lấy danh sách trước
  const newsList = await testGetNewsList();
  
  if (newsList.length > 0) {
    // Test chi tiết tin tức đầu tiên
    const firstNews = newsList[0];
    console.log(`\n🎯 Test chi tiết tin tức đầu tiên: ${firstNews.title}`);
    await testGetNewsDetail(firstNews.id);
    
    // Test các loại ID khác nhau
    await testDifferentIds();
  } else {
    console.log('❌ Không có tin tức nào để test chi tiết');
  }
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testGetNewsDetail,
  testGetNewsList,
  testDifferentIds
};
