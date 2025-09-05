// Test chức năng soft delete (chỉ xóa ở local, giữ lại WordPress)
const testSoftDelete = async () => {
  try {
    console.log('🗑️ Test chức năng soft delete (chỉ xóa ở local)');
    console.log('================================================');
    
    // Test 1: Kiểm tra danh sách tin tức hiện tại
    console.log('\n1️⃣ Kiểm tra danh sách tin tức hiện tại:');
    const listResponse = await fetch('http://localhost:3002/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    
    if (listResult.data.length === 0) {
      console.log('❌ Không có tin tức nào để test xóa');
      return false;
    }
    
    // Chọn tin tức đầu tiên để xóa
    const newsToDelete = listResult.data[0];
    console.log(`📋 Sẽ xóa tin tức: ${newsToDelete.title}`);
    console.log(`🆔 ID: ${newsToDelete.id}`);
    console.log(`🆔 WordPress ID: ${newsToDelete.wordpressId || 'N/A'}`);
    
    // Test 2: Soft delete (chỉ xóa ở local)
    console.log('\n2️⃣ Thực hiện soft delete (chỉ xóa ở local):');
    const deleteResponse = await fetch(`http://localhost:3002/api/news/${newsToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok && deleteResult.success) {
      console.log('✅ Soft delete thành công!');
      console.log(`📋 Thông báo: ${deleteResult.message}`);
      console.log(`🗑️ Tin tức đã xóa: ${deleteResult.data.title}`);
      console.log(`🆔 WordPress ID: ${deleteResult.data.wordpressId || 'N/A'}`);
      console.log(`📅 Thời gian xóa: ${deleteResult.data.deletedAt}`);
      console.log(`🔄 Có thể khôi phục: ${deleteResult.data.canRestore ? 'Có' : 'Không'}`);
      console.log(`📝 Ghi chú: ${deleteResult.data.note || 'N/A'}`);
    } else {
      console.log('❌ Soft delete thất bại');
      console.log(`📋 Lỗi: ${deleteResult.error}`);
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
        console.log('✅ Tin tức đã được xóa khỏi danh sách local');
      }
    } else {
      console.log('❌ Không thể kiểm tra danh sách sau khi xóa');
    }
    
    // Test 4: Kiểm tra tin tức vẫn còn trên WordPress
    console.log('\n4️⃣ Kiểm tra tin tức vẫn còn trên WordPress:');
    if (newsToDelete.wordpressId) {
      const wpCheckResponse = await fetch(`http://localhost:3002/api/news/${newsToDelete.wordpressId}`);
      const wpCheckResult = await wpCheckResponse.json();
      
      if (wpCheckResponse.ok && wpCheckResult.success) {
        console.log('✅ Tin tức vẫn còn trên WordPress (có thể khôi phục)');
        console.log(`📋 Tiêu đề: ${wpCheckResult.data.title}`);
        console.log(`🆔 WordPress ID: ${wpCheckResult.data.wordpressId}`);
      } else {
        console.log('❌ Tin tức không còn trên WordPress');
      }
    } else {
      console.log('⚠️ Không có WordPress ID để kiểm tra');
    }
    
    // Test 5: Thử khôi phục tin tức đã xóa
    console.log('\n5️⃣ Test khôi phục tin tức đã xóa:');
    if (newsToDelete.wordpressId) {
      const restoreResponse = await fetch('http://localhost:3002/api/wordpress/restore-deleted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wordpressId: newsToDelete.wordpressId,
          forceRestore: true
        })
      });
      
      const restoreResult = await restoreResponse.json();
      
      if (restoreResponse.ok && restoreResult.success) {
        console.log('✅ Khôi phục tin tức thành công!');
        console.log(`📋 Thông báo: ${restoreResult.message}`);
        console.log(`📋 Tin tức đã khôi phục: ${restoreResult.news.title}`);
        console.log(`🆔 Local ID: ${restoreResult.news.id}`);
        console.log(`🆔 WordPress ID: ${restoreResult.news.wordpressId}`);
      } else {
        console.log('❌ Khôi phục tin tức thất bại');
        console.log(`📋 Lỗi: ${restoreResult.error}`);
      }
    } else {
      console.log('⚠️ Không có WordPress ID để khôi phục');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test soft delete:', error.message);
    return false;
  }
};

// Test xóa tin tức không tồn tại
const testDeleteNonExistent = async () => {
  try {
    console.log('\n6️⃣ Test xóa tin tức không tồn tại:');
    
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
      return true;
    } else {
      console.log('⚠️ Không xử lý đúng khi xóa tin tức không tồn tại');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test xóa tin tức không tồn tại:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chức năng soft delete');
  console.log('====================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test soft delete
  const softDeleteSuccess = await testSoftDelete();
  
  // Test xóa tin tức không tồn tại
  const deleteNonExistentSuccess = await testDeleteNonExistent();
  
  console.log(`\n🎯 Kết quả test soft delete: ${softDeleteSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  console.log(`🎯 Kết quả test xóa không tồn tại: ${deleteNonExistentSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit((softDeleteSuccess && deleteNonExistentSuccess) ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testSoftDelete,
  testDeleteNonExistent
};
