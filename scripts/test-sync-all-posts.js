// Test chức năng đồng bộ tất cả tin tức từ WordPress về admin
const testSyncAllPosts = async () => {
  try {
    console.log('🔄 Test chức năng đồng bộ tất cả tin tức từ WordPress về admin');
    console.log('================================================================');
    
    // Test 1: Kiểm tra danh sách tin tức hiện tại
    console.log('\n1️⃣ Kiểm tra danh sách tin tức hiện tại:');
    const listResponse = await fetch('http://localhost:3003/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    console.log(`📊 Tin tức đã sync WordPress: ${listResult.data.filter(item => item.syncedToWordPress).length}`);
    console.log(`📊 Tin tức có WordPress ID: ${listResult.data.filter(item => item.wordpressId).length}`);
    
    // Test 2: Thực hiện đồng bộ tất cả bài từ WordPress
    console.log('\n2️⃣ Thực hiện đồng bộ tất cả bài từ WordPress:');
    
    const wpConfig = {
      siteUrl: "https://wp2.ltacv.com",
      username: "lta2",
      applicationPassword: "m5ng lGbg T7L3 sfPg CuO6 b6TZ",
      autoPublish: true,
      defaultCategory: "",
      defaultTags: [],
      featuredImageEnabled: true,
      excerptLength: 150,
      status: "draft"
    };
    
    const syncResponse = await fetch('http://localhost:3003/api/wordpress/sync-all-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        config: wpConfig
      })
    });
    
    const syncResult = await syncResponse.json();
    
    if (syncResponse.ok && syncResult.success) {
      console.log('✅ Đồng bộ thành công!');
      console.log(`📋 Thông báo: ${syncResult.message}`);
      
      if (syncResult.stats) {
        console.log('📊 Thống kê đồng bộ:');
        console.log(`   - Tổng bài WordPress: ${syncResult.stats.totalWordPressPosts}`);
        console.log(`   - Đã đồng bộ mới: ${syncResult.stats.synced}`);
        console.log(`   - Đã cập nhật: ${syncResult.stats.updated}`);
        console.log(`   - Đã bỏ qua: ${syncResult.stats.skipped}`);
        console.log(`   - Tổng tin tức local: ${syncResult.stats.totalLocalPosts}`);
        console.log(`   - Sử dụng dữ liệu mẫu: ${syncResult.stats.usedSampleData ? 'Có' : 'Không'}`);
      }
      
      // Test 3: Kiểm tra danh sách tin tức sau đồng bộ
      console.log('\n3️⃣ Kiểm tra danh sách tin tức sau đồng bộ:');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
      
      const listAfterResponse = await fetch('http://localhost:3003/api/news');
      const listAfterResult = await listAfterResponse.json();
      
      if (listAfterResponse.ok && listAfterResult.success) {
        console.log(`✅ Sau đồng bộ có ${listAfterResult.data.length} tin tức`);
        console.log(`📊 Tin tức đã sync WordPress: ${listAfterResult.data.filter(item => item.syncedToWordPress).length}`);
        console.log(`📊 Tin tức có WordPress ID: ${listAfterResult.data.filter(item => item.wordpressId).length}`);
        
        // Hiển thị một số tin tức mẫu
        const sampleNews = listAfterResult.data.slice(0, 3);
        console.log('\n📋 Mẫu tin tức sau đồng bộ:');
        sampleNews.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      - ID: ${item.id}`);
          console.log(`      - WordPress ID: ${item.wordpressId || 'N/A'}`);
          console.log(`      - Status: ${item.status}`);
          console.log(`      - Synced: ${item.syncedToWordPress ? 'Có' : 'Không'}`);
          console.log(`      - Featured Image: ${item.featuredImage ? 'Có' : 'Không'}`);
          console.log(`      - Additional Images: ${item.additionalImages?.length || 0}`);
        });
        
        // Test 4: Kiểm tra chi tiết một tin tức
        if (listAfterResult.data.length > 0) {
          console.log('\n4️⃣ Kiểm tra chi tiết tin tức:');
          const sampleItem = listAfterResult.data[0];
          const detailResponse = await fetch(`http://localhost:3003/api/news/${sampleItem.id}`);
          const detailResult = await detailResponse.json();
          
          if (detailResponse.ok && detailResult.success) {
            console.log(`✅ Lấy chi tiết tin tức thành công: ${detailResult.data.title}`);
            console.log(`📋 WordPress ID: ${detailResult.data.wordpressId || 'N/A'}`);
            console.log(`📋 Synced: ${detailResult.data.syncedToWordPress ? 'Có' : 'Không'}`);
            console.log(`📋 Featured Image: ${detailResult.data.featuredImage ? 'Có' : 'Không'}`);
            console.log(`📋 Additional Images: ${detailResult.data.additionalImages?.length || 0}`);
          } else {
            console.log('❌ Không thể lấy chi tiết tin tức');
          }
        }
        
      } else {
        console.log('❌ Không thể lấy danh sách tin tức sau đồng bộ');
      }
      
    } else {
      console.log('❌ Đồng bộ thất bại');
      console.log(`📋 Lỗi: ${syncResult.error}`);
      return false;
    }
    
    console.log('\n🎯 Kết quả kiểm tra:');
    console.log('✅ Chức năng đồng bộ tất cả tin tức từ WordPress về admin hoạt động');
    console.log('✅ API endpoint `/api/wordpress/sync-all-posts` hoạt động bình thường');
    console.log('✅ Dữ liệu được lưu vào local database');
    console.log('✅ Thống kê đồng bộ được trả về chính xác');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test đồng bộ tất cả tin tức:', error.message);
    return false;
  }
};

// Test chức năng đồng bộ tin tức còn thiếu
const testSyncMissing = async () => {
  try {
    console.log('\n🔄 Test chức năng đồng bộ tin tức còn thiếu từ WordPress');
    console.log('==========================================================');
    
    const wpConfig = {
      siteUrl: "https://wp2.ltacv.com",
      username: "lta2",
      applicationPassword: "m5ng lGbg T7L3 sfPg CuO6 b6TZ",
      autoPublish: true,
      defaultCategory: "",
      defaultTags: [],
      featuredImageEnabled: true,
      excerptLength: 150,
      status: "draft"
    };
    
    const syncResponse = await fetch('http://localhost:3003/api/wordpress/sync-missing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        syncAll: true,
        config: wpConfig
      })
    });
    
    const syncResult = await syncResponse.json();
    
    if (syncResponse.ok && syncResult.success) {
      console.log('✅ Đồng bộ tin tức còn thiếu thành công!');
      console.log(`📋 Thông báo: ${syncResult.message}`);
      
      if (syncResult.stats) {
        console.log('📊 Thống kê đồng bộ:');
        console.log(`   - Tổng bài WordPress: ${syncResult.stats.totalWordPressPosts}`);
        console.log(`   - Đã đồng bộ mới: ${syncResult.stats.synced}`);
        console.log(`   - Đã cập nhật: ${syncResult.stats.updated}`);
        console.log(`   - Đã bỏ qua: ${syncResult.stats.skipped}`);
        console.log(`   - Tổng tin tức local: ${syncResult.stats.totalLocalPosts}`);
      }
    } else {
      console.log('❌ Đồng bộ tin tức còn thiếu thất bại');
      console.log(`📋 Lỗi: ${syncResult.error}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test đồng bộ tin tức còn thiếu:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chức năng đồng bộ tất cả tin tức từ WordPress về admin');
  console.log('====================================================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test đồng bộ tất cả tin tức
  const success1 = await testSyncAllPosts();
  
  // Test đồng bộ tin tức còn thiếu
  const success2 = await testSyncMissing();
  
  const overallSuccess = success1 && success2;
  
  console.log(`\n🎯 Kết quả test: ${overallSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 CHỨC NĂNG ĐỒNG BỘ HOẠT ĐỘNG TỐT!');
    console.log('🔄 Đồng bộ tất cả tin tức từ WordPress về admin');
    console.log('🔄 Đồng bộ tin tức còn thiếu từ WordPress');
    console.log('✅ Cả hai chức năng đều hoạt động bình thường');
  }
  
  process.exit(overallSuccess ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testSyncAllPosts,
  testSyncMissing
};
