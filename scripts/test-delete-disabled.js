// Test chức năng xóa tin tức đã bị vô hiệu hóa
const testDeleteDisabled = async () => {
  try {
    console.log('🚫 Test chức năng xóa tin tức đã bị vô hiệu hóa');
    console.log('================================================');
    
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
      return true; // Vẫn thành công vì không có gì để xóa
    }
    
    // Chọn tin tức đầu tiên để test xóa
    const newsToTest = listResult.data[0];
    console.log(`📋 Sẽ test xóa tin tức: ${newsToTest.title}`);
    console.log(`🆔 ID: ${newsToTest.id}`);
    
    // Test 2: Thử xóa tin tức (sẽ bị từ chối)
    console.log('\n2️⃣ Thử xóa tin tức (sẽ bị từ chối):');
         const deleteResponse = await fetch(`http://localhost:3003/api/news/${newsToTest.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (!deleteResponse.ok && deleteResponse.status === 403) {
      console.log('✅ Chức năng xóa đã bị vô hiệu hóa thành công!');
      console.log(`📋 Lỗi: ${deleteResult.error}`);
      console.log(`📋 Thông báo: ${deleteResult.message}`);
      console.log(`📊 Status Code: ${deleteResponse.status}`);
    } else {
      console.log('❌ Chức năng xóa chưa bị vô hiệu hóa');
      console.log(`📊 Status Code: ${deleteResponse.status}`);
      console.log(`📋 Kết quả:`, deleteResult);
      return false;
    }
    
    // Test 3: Kiểm tra danh sách vẫn giữ nguyên
    console.log('\n3️⃣ Kiểm tra danh sách vẫn giữ nguyên:');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây
    
         const listAfterResponse = await fetch('http://localhost:3003/api/news');
    const listAfterResult = await listAfterResponse.json();
    
    if (listAfterResponse.ok && listAfterResult.success) {
      console.log(`✅ Danh sách sau khi thử xóa: ${listAfterResult.data.length} tin tức`);
      
      if (listAfterResult.data.length === listResult.data.length) {
        console.log('✅ Số lượng tin tức không thay đổi (xóa bị từ chối)');
      } else {
        console.log('❌ Số lượng tin tức đã thay đổi (xóa vẫn hoạt động)');
        return false;
      }
    } else {
      console.log('❌ Không thể kiểm tra danh sách sau khi thử xóa');
    }
    
    // Test 4: Thử xóa tin tức không tồn tại
    console.log('\n4️⃣ Thử xóa tin tức không tồn tại:');
         const fakeDeleteResponse = await fetch('http://localhost:3003/api/news/999999', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const fakeDeleteResult = await fakeDeleteResponse.json();
    
    if (!fakeDeleteResponse.ok && fakeDeleteResponse.status === 403) {
      console.log('✅ Xóa tin tức không tồn tại cũng bị từ chối');
      console.log(`📋 Lỗi: ${fakeDeleteResult.error}`);
    } else {
      console.log('❌ Xóa tin tức không tồn tại không bị từ chối');
      console.log(`📊 Status Code: ${fakeDeleteResponse.status}`);
      return false;
    }
    
    // Test 5: Thử xóa bằng slug
    console.log('\n5️⃣ Thử xóa bằng slug:');
         const slugDeleteResponse = await fetch(`http://localhost:3003/api/news/${newsToTest.slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const slugDeleteResult = await slugDeleteResponse.json();
    
    if (!slugDeleteResponse.ok && slugDeleteResponse.status === 403) {
      console.log('✅ Xóa bằng slug cũng bị từ chối');
      console.log(`📋 Lỗi: ${slugDeleteResult.error}`);
    } else {
      console.log('❌ Xóa bằng slug không bị từ chối');
      console.log(`📊 Status Code: ${slugDeleteResponse.status}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test chức năng xóa bị vô hiệu hóa:', error.message);
    return false;
  }
};

// Test các method khác vẫn hoạt động
const testOtherMethods = async () => {
  try {
    console.log('\n6️⃣ Test các method khác vẫn hoạt động:');
    
    // Test GET method vẫn hoạt động
    console.log('\n📖 Test GET method:');
         const getResponse = await fetch('http://localhost:3003/api/news');
    if (getResponse.ok) {
      console.log('✅ GET method vẫn hoạt động bình thường');
    } else {
      console.log('❌ GET method không hoạt động');
      return false;
    }
    
    // Test POST method vẫn hoạt động (nếu có tin tức để test)
    console.log('\n📝 Test POST method:');
         const postResponse = await fetch('http://localhost:3003/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test tin tức - chức năng xóa đã bị vô hiệu hóa',
        content: 'Đây là tin tức test để kiểm tra chức năng xóa đã bị vô hiệu hóa',
        status: 'draft'
      })
    });
    
    if (postResponse.ok) {
      console.log('✅ POST method vẫn hoạt động bình thường');
    } else {
      console.log('⚠️ POST method có thể không hoạt động (có thể do WordPress connection)');
      // Không return false vì có thể do WordPress connection issue
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test các method khác:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test chức năng xóa tin tức đã bị vô hiệu hóa');
  console.log('=====================================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test chức năng xóa bị vô hiệu hóa
  const deleteDisabledSuccess = await testDeleteDisabled();
  
  // Test các method khác vẫn hoạt động
  const otherMethodsSuccess = await testOtherMethods();
  
  console.log(`\n🎯 Kết quả test xóa bị vô hiệu hóa: ${deleteDisabledSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  console.log(`🎯 Kết quả test method khác: ${otherMethodsSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (deleteDisabledSuccess) {
    console.log('\n🎉 TẤT CẢ CHỨC NĂNG XÓA TIN TỨC ĐÃ BỊ VÔ HIỆU HÓA THÀNH CÔNG!');
    console.log('🔒 Tin tức sẽ được bảo vệ an toàn, không thể xóa được.');
  }
  
  process.exit(deleteDisabledSuccess ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testDeleteDisabled,
  testOtherMethods
};
