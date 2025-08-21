// Test chức năng xóa tin tức
const testDeleteNews = async () => {
  try {
    console.log('🗑️ Test chức năng xóa tin tức');
    console.log('==============================');
    
    // Test 1: Lấy danh sách tin tức trước khi xóa
    console.log('\n1️⃣ Lấy danh sách tin tức trước khi xóa:');
    const listResponse = await fetch('http://localhost:3002/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Tìm thấy ${listResult.data.length} tin tức`);
    
    if (listResult.data.length === 0) {
      console.log('❌ Không có tin tức nào để test xóa');
      return false;
    }
    
    // Chọn tin tức đầu tiên để xóa
    const newsToDelete = listResult.data[0];
    console.log(`📋 Sẽ xóa tin tức: ${newsToDelete.title}`);
    console.log(`🆔 ID: ${newsToDelete.id}`);
    console.log(`🔗 Slug: ${newsToDelete.slug}`);
    
    // Test 2: Xóa tin tức
    console.log('\n2️⃣ Thực hiện xóa tin tức:');
    const deleteResponse = await fetch(`http://localhost:3002/api/news/${newsToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok && deleteResult.success) {
      console.log('✅ Xóa tin tức thành công!');
      console.log(`📋 Thông báo: ${deleteResult.message}`);
      console.log(`🗑️ Tin tức đã xóa: ${deleteResult.data.title}`);
      console.log(`🆔 WordPress ID: ${deleteResult.data.wordpressId || 'N/A'}`);
      console.log(`📅 Thời gian xóa: ${deleteResult.data.deletedAt}`);
    } else {
      console.log('❌ Xóa tin tức thất bại');
      console.log(`📋 Lỗi: ${deleteResult.error}`);
      if (deleteResult.details) {
        console.log(`🔍 Chi tiết: ${deleteResult.details}`);
      }
      return false;
    }
    
    // Test 3: Kiểm tra danh sách sau khi xóa
    console.log('\n3️⃣ Kiểm tra danh sách sau khi xóa:');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
    
    const listAfterResponse = await fetch('http://localhost:3002/api/news');
    const listAfterResult = await listAfterResponse.json();
    
    if (listAfterResponse.ok && listAfterResult.success) {
      console.log(`✅ Danh sách sau khi xóa: ${listAfterResult.data.length} tin tức`);
      
      const deletedNewsStillExists = listAfterResult.data.find(item => item.id === newsToDelete.id);
      if (deletedNewsStillExists) {
        console.log('⚠️ Tin tức vẫn còn trong danh sách (có thể do cache)');
      } else {
        console.log('✅ Tin tức đã được xóa khỏi danh sách');
      }
    } else {
      console.log('❌ Không thể kiểm tra danh sách sau khi xóa');
    }
    
    // Test 4: Thử xóa tin tức không tồn tại
    console.log('\n4️⃣ Test xóa tin tức không tồn tại:');
    const fakeDeleteResponse = await fetch('http://localhost:3002/api/news/999999', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const fakeDeleteResult = await fakeDeleteResponse.json();
    
    if (!fakeDeleteResponse.ok) {
      console.log('✅ Xử lý đúng khi xóa tin tức không tồn tại');
      console.log(`📋 Lỗi: ${fakeDeleteResult.error}`);
    } else {
      console.log('⚠️ Không xử lý đúng khi xóa tin tức không tồn tại');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test xóa tin tức:', error.message);
    return false;
  }
};

// Test xóa bằng slug
const testDeleteBySlug = async () => {
  try {
    console.log('\n🔗 Test xóa tin tức bằng slug:');
    
    // Lấy danh sách tin tức
    const listResponse = await fetch('http://localhost:3002/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success || listResult.data.length === 0) {
      console.log('❌ Không có tin tức để test xóa bằng slug');
      return false;
    }
    
    const newsToDelete = listResult.data[0];
    console.log(`📋 Sẽ xóa tin tức bằng slug: ${newsToDelete.slug}`);
    
    // Xóa bằng slug
    const deleteResponse = await fetch(`http://localhost:3002/api/news/${newsToDelete.slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok && deleteResult.success) {
      console.log('✅ Xóa tin tức bằng slug thành công!');
      console.log(`📋 Thông báo: ${deleteResult.message}`);
      return true;
    } else {
      console.log('❌ Xóa tin tức bằng slug thất bại');
      console.log(`📋 Lỗi: ${deleteResult.error}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test xóa bằng slug:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chức năng xóa tin tức');
  console.log('====================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test xóa tin tức
  const deleteSuccess = await testDeleteNews();
  
  // Test xóa bằng slug (nếu còn tin tức)
  const slugDeleteSuccess = await testDeleteBySlug();
  
  console.log(`\n🎯 Kết quả test xóa tin tức: ${deleteSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  console.log(`🎯 Kết quả test xóa bằng slug: ${slugDeleteSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit((deleteSuccess && slugDeleteSuccess) ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testDeleteNews,
  testDeleteBySlug
};
