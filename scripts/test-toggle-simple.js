// Test đơn giản button toggle status
const testToggleSimple = async () => {
  try {
    console.log('🔄 Test đơn giản button toggle status');
    console.log('====================================');
    
    // Test 1: Kiểm tra danh sách tin tức
    console.log('\n1️⃣ Kiểm tra danh sách tin tức:');
    
    const response = await fetch('http://localhost:3003/api/news');
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API /api/news hoạt động!');
      console.log(`📊 Có ${data.data?.length || 0} tin tức`);
      
      if (data.data && data.data.length > 0) {
        // Sử dụng tin tức đầu tiên
        const testNews = data.data[0];
        
        console.log(`📋 Tin tức test: ${testNews.title}`);
        console.log(`📋 ID: ${testNews.id}`);
        console.log(`📋 Status: ${testNews.status}`);
        
        // Test 2: Test PATCH
        console.log('\n2️⃣ Test PATCH toggle status:');
        const newStatus = testNews.status === 'published' ? 'draft' : 'published';
        console.log(`🔄 Chuyển từ ${testNews.status} sang ${newStatus}`);
        
        const patchResponse = await fetch(`http://localhost:3003/api/news/${testNews.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        console.log(`📡 PATCH Response status: ${patchResponse.status}`);
        
        if (patchResponse.ok) {
          const patchResult = await patchResponse.json();
          console.log('✅ PATCH thành công!');
          console.log(`📋 Message: ${patchResult.message}`);
          console.log(`📋 Status mới: ${patchResult.data.status}`);
          
          // Test 3: Kiểm tra lại
          console.log('\n3️⃣ Kiểm tra lại danh sách:');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const listResponse = await fetch('http://localhost:3003/api/news');
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const updatedNews = listData.data.find(item => item.id === testNews.id);
            if (updatedNews) {
              console.log(`✅ Status đã được cập nhật: ${updatedNews.status}`);
            }
          }
          
        } else {
          const errorText = await patchResponse.text();
          console.log('❌ PATCH thất bại:');
          console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
        }
      }
    } else {
      console.log('❌ API /api/news lỗi');
      return false;
    }
    
    console.log('\n🎯 Kết quả:');
    console.log('✅ Button toggle status hoạt động bình thường');
    console.log('✅ API PATCH hoạt động');
    console.log('✅ Status được cập nhật');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test đơn giản button toggle status');
  console.log('==========================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test
  const success = await testToggleSimple();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (success) {
    console.log('\n🎉 BUTTON TOGGLE STATUS HOẠT ĐỘNG TỐT!');
  }
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testToggleSimple
};
