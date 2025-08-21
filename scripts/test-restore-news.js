// Test chức năng restore tin tức đã xóa từ WordPress
const testRestoreNews = async () => {
  try {
    console.log('🔄 Test chức năng restore tin tức đã xóa');
    console.log('==========================================');
    
    // Test 1: Kiểm tra danh sách tin tức hiện tại
    console.log('\n1️⃣ Kiểm tra danh sách tin tức hiện tại:');
    const listResponse = await fetch('http://localhost:3002/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    
    // Test 2: Restore tin tức đã xóa (wp_92) từ WordPress
    console.log('\n2️⃣ Restore tin tức đã xóa (ID: 92) từ WordPress:');
    const restoreResponse = await fetch('http://localhost:3002/api/wordpress/restore-deleted', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wordpressId: 92,
        forceRestore: true,
        includeImages: true,
        includeContent: true
      })
    });
    
    const restoreResult = await restoreResponse.json();
    
    if (restoreResponse.ok && restoreResult.success) {
      console.log('✅ Restore tin tức thành công!');
      console.log(`📋 Thông báo: ${restoreResult.message}`);
      console.log(`📋 Tin tức đã restore: ${restoreResult.news.title}`);
      console.log(`🆔 Local ID: ${restoreResult.news.id}`);
      console.log(`🆔 WordPress ID: ${restoreResult.news.wordpressId}`);
      console.log(`🔗 Slug: ${restoreResult.news.slug}`);
      console.log(`📝 Trạng thái: ${restoreResult.news.status}`);
      console.log(`🖼️ Featured Image: ${restoreResult.news.featuredImage ? 'Có' : 'Không có'}`);
      console.log(`📸 Additional Images: ${restoreResult.news.additionalImagesCount} ảnh`);
      console.log(`🔄 Restored: ${restoreResult.news.restored ? 'Có' : 'Không'}`);
    } else {
      console.log('❌ Restore tin tức thất bại');
      console.log(`📋 Lỗi: ${restoreResult.error}`);
      if (restoreResult.existingNews) {
        console.log(`📋 Tin tức đã tồn tại: ${restoreResult.existingNews.title}`);
      }
      return false;
    }
    
    // Test 3: Kiểm tra danh sách sau khi restore
    console.log('\n3️⃣ Kiểm tra danh sách sau khi restore:');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
    
    const listAfterResponse = await fetch('http://localhost:3002/api/news');
    const listAfterResult = await listAfterResponse.json();
    
    if (listAfterResponse.ok && listAfterResult.success) {
      console.log(`✅ Danh sách sau khi restore: ${listAfterResult.data.length} tin tức`);
      
      const restoredNews = listAfterResult.data.find(item => item.wordpressId === 92);
      if (restoredNews) {
        console.log('✅ Tin tức đã được restore thành công vào danh sách');
        console.log(`📋 Tiêu đề: ${restoredNews.title}`);
        console.log(`🆔 Local ID: ${restoredNews.id}`);
        console.log(`🆔 WordPress ID: ${restoredNews.wordpressId}`);
      } else {
        console.log('⚠️ Tin tức chưa xuất hiện trong danh sách (có thể do cache)');
      }
    } else {
      console.log('❌ Không thể kiểm tra danh sách sau khi restore');
    }
    
    // Test 4: Restore tin tức không tồn tại
    console.log('\n4️⃣ Test restore tin tức không tồn tại (ID: 999999):');
    const fakeRestoreResponse = await fetch('http://localhost:3002/api/wordpress/restore-deleted', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wordpressId: 999999,
        forceRestore: true
      })
    });
    
    const fakeRestoreResult = await fakeRestoreResponse.json();
    
    if (!fakeRestoreResponse.ok) {
      console.log('✅ Xử lý đúng khi restore tin tức không tồn tại');
      console.log(`📋 Lỗi: ${fakeRestoreResult.error}`);
    } else {
      console.log('⚠️ Không xử lý đúng khi restore tin tức không tồn tại');
    }
    
    // Test 5: Restore bằng slug
    console.log('\n5️⃣ Test restore tin tức bằng slug:');
    const slugRestoreResponse = await fetch('http://localhost:3002/api/wordpress/restore-deleted', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug: 'tin-tuc-test-wordpress-1755741705130',
        forceRestore: true
      })
    });
    
    const slugRestoreResult = await slugRestoreResponse.json();
    
    if (slugRestoreResponse.ok && slugRestoreResult.success) {
      console.log('✅ Restore bằng slug thành công!');
      console.log(`📋 Thông báo: ${slugRestoreResult.message}`);
    } else {
      console.log('❌ Restore bằng slug thất bại');
      console.log(`📋 Lỗi: ${slugRestoreResult.error}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test restore tin tức:', error.message);
    return false;
  }
};

// Test sync missing news
const testSyncMissing = async () => {
  try {
    console.log('\n🔄 Test sync missing news:');
    
    const syncResponse = await fetch('http://localhost:3002/api/wordpress/sync-missing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        syncAll: true
      })
    });
    
    const syncResult = await syncResponse.json();
    
    if (syncResponse.ok && syncResult.success) {
      console.log('✅ Sync missing news thành công!');
      console.log(`📋 Thông báo: ${syncResult.message}`);
      console.log(`📊 Synced: ${syncResult.syncedCount || 0}`);
      console.log(`📊 Updated: ${syncResult.updatedCount || 0}`);
      return true;
    } else {
      console.log('❌ Sync missing news thất bại');
      console.log(`📋 Lỗi: ${syncResult.error}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test sync missing:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chức năng restore tin tức đã xóa');
  console.log('==============================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test restore tin tức
  const restoreSuccess = await testRestoreNews();
  
  // Test sync missing
  const syncSuccess = await testSyncMissing();
  
  console.log(`\n🎯 Kết quả test restore: ${restoreSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  console.log(`🎯 Kết quả test sync missing: ${syncSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit((restoreSuccess && syncSuccess) ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testRestoreNews,
  testSyncMissing
};
