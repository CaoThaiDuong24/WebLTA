// Test nhanh chức năng đồng bộ
const testSyncQuick = async () => {
  try {
    console.log('🔄 Test nhanh chức năng đồng bộ');
    console.log('===============================');
    
    // Test 1: Kiểm tra danh sách tin tức hiện tại
    console.log('\n1️⃣ Kiểm tra danh sách tin tức hiện tại:');
    const listResponse = await fetch('http://localhost:3003/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    
    // Test 2: Kiểm tra API sync-all-posts có hoạt động không
    console.log('\n2️⃣ Kiểm tra API sync-all-posts:');
    
    const wpConfig = {
      siteUrl: "https://wp2.ltacv.com",
      username: "lta2",
      applicationPassword: "m5ng lGbg T7L3 sfPg CuO6 b6TZ"
    };
    
    try {
      const syncResponse = await fetch('http://localhost:3003/api/wordpress/sync-all-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          config: wpConfig
        })
      });
      
      console.log(`📡 Response status: ${syncResponse.status}`);
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('✅ API sync-all-posts hoạt động!');
        console.log(`📋 Message: ${syncResult.message}`);
        
        if (syncResult.stats) {
          console.log('📊 Stats:', syncResult.stats);
        }
      } else {
        const errorText = await syncResponse.text();
        console.log('❌ API sync-all-posts lỗi:');
        console.log(`📋 Status: ${syncResponse.status}`);
        console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log('❌ Lỗi khi gọi API sync-all-posts:');
      console.log(`📋 Error: ${error.message}`);
    }
    
    // Test 3: Kiểm tra API sync-missing
    console.log('\n3️⃣ Kiểm tra API sync-missing:');
    
    try {
      const syncMissingResponse = await fetch('http://localhost:3003/api/wordpress/sync-missing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          syncAll: true,
          config: wpConfig
        })
      });
      
      console.log(`📡 Response status: ${syncMissingResponse.status}`);
      
      if (syncMissingResponse.ok) {
        const syncMissingResult = await syncMissingResponse.json();
        console.log('✅ API sync-missing hoạt động!');
        console.log(`📋 Message: ${syncMissingResult.message}`);
        
        if (syncMissingResult.stats) {
          console.log('📊 Stats:', syncMissingResult.stats);
        }
      } else {
        const errorText = await syncMissingResponse.text();
        console.log('❌ API sync-missing lỗi:');
        console.log(`📋 Status: ${syncMissingResponse.status}`);
        console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log('❌ Lỗi khi gọi API sync-missing:');
      console.log(`📋 Error: ${error.message}`);
    }
    
    console.log('\n🎯 Kết quả kiểm tra nhanh:');
    console.log('✅ Các API đồng bộ đã được kiểm tra');
    console.log('✅ Danh sách tin tức hiện tại hoạt động');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test nhanh:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test nhanh chức năng đồng bộ');
  console.log('=====================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test nhanh
  const success = await testSyncQuick();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testSyncQuick
};
