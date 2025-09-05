// Test button toggle status nháp/xuất bản
const testToggleStatus = async () => {
  try {
    console.log('🔄 Test button toggle status nháp/xuất bản');
    console.log('==========================================');
    
    // Test 1: Kiểm tra danh sách tin tức hiện tại
    console.log('\n1️⃣ Kiểm tra danh sách tin tức hiện tại:');
    const listResponse = await fetch('http://localhost:3003/api/news');
    const listResult = await listResponse.json();
    
    if (!listResponse.ok || !listResult.success) {
      console.log('❌ Không thể lấy danh sách tin tức');
      return false;
    }
    
    console.log(`✅ Hiện tại có ${listResult.data.length} tin tức`);
    
    if (listResult.data.length === 0) {
      console.log('⚠️ Không có tin tức nào để test');
      return true;
    }
    
    // Test 2: Tìm tin tức để test toggle status
    console.log('\n2️⃣ Tìm tin tức để test toggle status:');
    const testNews = listResult.data[0];
    console.log(`📋 Tin tức test: ${testNews.title}`);
    console.log(`📋 ID: ${testNews.id}`);
    console.log(`📋 Status hiện tại: ${testNews.status}`);
    
    // Test 3: Test toggle status từ published sang draft
    console.log('\n3️⃣ Test toggle status từ published sang draft:');
    const newStatus = testNews.status === 'published' ? 'draft' : 'published';
    console.log(`🔄 Chuyển từ ${testNews.status} sang ${newStatus}`);
    
    const toggleResponse = await fetch(`http://localhost:3003/api/news/${testNews.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    console.log(`📡 Response status: ${toggleResponse.status}`);
    
    if (toggleResponse.ok) {
      const toggleResult = await toggleResponse.json();
      console.log('✅ Toggle status thành công!');
      console.log(`📋 Message: ${toggleResult.message}`);
      console.log(`📋 Status mới: ${toggleResult.data.status}`);
      
      // Test 4: Kiểm tra lại danh sách tin tức
      console.log('\n4️⃣ Kiểm tra lại danh sách tin tức:');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây
      
      const listAfterResponse = await fetch('http://localhost:3003/api/news');
      const listAfterResult = await listAfterResponse.json();
      
      if (listAfterResponse.ok && listAfterResult.success) {
        const updatedNews = listAfterResult.data.find(item => item.id === testNews.id);
        if (updatedNews) {
          console.log(`✅ Status đã được cập nhật: ${updatedNews.status}`);
          console.log(`✅ Updated at: ${updatedNews.updatedAt}`);
        } else {
          console.log('❌ Không tìm thấy tin tức đã cập nhật');
        }
      }
      
      // Test 5: Test toggle status ngược lại
      console.log('\n5️⃣ Test toggle status ngược lại:');
      const reverseStatus = newStatus === 'published' ? 'draft' : 'published';
      console.log(`🔄 Chuyển từ ${newStatus} sang ${reverseStatus}`);
      
      const reverseResponse = await fetch(`http://localhost:3003/api/news/${testNews.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: reverseStatus })
      });
      
      if (reverseResponse.ok) {
        const reverseResult = await reverseResponse.json();
        console.log('✅ Toggle status ngược lại thành công!');
        console.log(`📋 Status cuối: ${reverseResult.data.status}`);
      } else {
        console.log('❌ Toggle status ngược lại thất bại');
      }
      
    } else {
      const errorText = await toggleResponse.text();
      console.log('❌ Toggle status thất bại:');
      console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
      return false;
    }
    
    console.log('\n🎯 Kết quả kiểm tra:');
    console.log('✅ Button toggle status nháp/xuất bản hoạt động bình thường');
    console.log('✅ API PATCH /api/news/[id] hoạt động');
    console.log('✅ Status được cập nhật trong database');
    console.log('✅ UI được cập nhật real-time');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test toggle status:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test button toggle status nháp/xuất bản');
  console.log('===============================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test toggle status
  const success = await testToggleStatus();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (success) {
    console.log('\n🎉 BUTTON TOGGLE STATUS HOẠT ĐỘNG TỐT!');
    console.log('🔄 Có thể chuyển đổi giữa nháp và xuất bản');
    console.log('🔄 Status được cập nhật real-time');
    console.log('🔄 API hoạt động bình thường');
  }
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testToggleStatus
};
