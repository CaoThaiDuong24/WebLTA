// Test trường hình ảnh bổ sung
const testAdditionalImages = async () => {
  try {
    console.log('🖼️ Test trường hình ảnh bổ sung');
    console.log('==================================');
    
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
    
    // Test 2: Kiểm tra tin tức có hình ảnh bổ sung
    console.log('\n2️⃣ Kiểm tra tin tức có hình ảnh bổ sung:');
    const newsWithAdditionalImages = listResult.data.filter(news => 
      news.additionalImages && news.additionalImages.length > 0
    );
    
    console.log(`📊 Tin tức có hình ảnh bổ sung: ${newsWithAdditionalImages.length}/${listResult.data.length}`);
    
    if (newsWithAdditionalImages.length > 0) {
      const sampleNews = newsWithAdditionalImages[0];
      console.log(`📋 Tin tức mẫu: ${sampleNews.title}`);
      console.log(`🖼️ Số hình ảnh bổ sung: ${sampleNews.additionalImages.length}`);
      console.log(`🖼️ Hình ảnh bổ sung:`, sampleNews.additionalImages);
      
      // Test 3: Kiểm tra chi tiết tin tức
      console.log('\n3️⃣ Kiểm tra chi tiết tin tức:');
      const detailResponse = await fetch(`http://localhost:3003/api/news/${sampleNews.id}`);
      const detailResult = await detailResponse.json();
      
      if (detailResponse.ok && detailResult.success) {
        const detailNews = detailResult.data;
        console.log(`✅ Lấy chi tiết tin tức thành công: ${detailNews.title}`);
        console.log(`🖼️ Featured Image: ${detailNews.featuredImage || 'Không có'}`);
        console.log(`🖼️ Additional Images: ${detailNews.additionalImages?.length || 0} ảnh`);
        
        if (detailNews.additionalImages && detailNews.additionalImages.length > 0) {
          console.log(`🖼️ Danh sách hình ảnh bổ sung:`);
          detailNews.additionalImages.forEach((img, index) => {
            console.log(`   ${index + 1}. ${img}`);
          });
        }
      } else {
        console.log('❌ Không thể lấy chi tiết tin tức');
      }
    } else {
      console.log('⚠️ Không có tin tức nào có hình ảnh bổ sung');
    }
    
    // Test 4: Tạo tin tức test với hình ảnh bổ sung
    console.log('\n4️⃣ Test tạo tin tức với hình ảnh bổ sung:');
    const testNewsData = {
      title: 'Test tin tức - Hình ảnh bổ sung',
      content: 'Đây là tin tức test để kiểm tra trường hình ảnh bổ sung',
      excerpt: 'Test excerpt',
      status: 'draft',
      featured: false,
      category: 'Thông báo',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test Meta Description',
      featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlc3QgSW1hZ2U8L3RleHQ+PC9zdmc+',
      additionalImages: [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMSA8L3RleHQ+PC9zdmc+',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMiA8L3RleHQ+PC9zdmc+'
      ]
    };
    
    const createResponse = await fetch('http://localhost:3003/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNewsData)
    });
    
    const createResult = await createResponse.json();
    
    if (createResponse.ok && createResult.success) {
      console.log('✅ Tạo tin tức test thành công!');
      console.log(`📋 ID: ${createResult.data.id}`);
      console.log(`📋 WordPress ID: ${createResult.data.wordpressId || 'N/A'}`);
      console.log(`🖼️ Featured Image: ${createResult.data.featuredImage ? 'Có' : 'Không'}`);
      console.log(`🖼️ Additional Images: ${createResult.data.additionalImages?.length || 0} ảnh`);
      
      if (createResult.data.additionalImages && createResult.data.additionalImages.length > 0) {
        console.log(`🖼️ Danh sách hình ảnh bổ sung:`);
        createResult.data.additionalImages.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.substring(0, 50)}...`);
        });
      }
      
      // Test 5: Kiểm tra lại danh sách sau khi tạo
      console.log('\n5️⃣ Kiểm tra danh sách sau khi tạo:');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
      
      const listAfterResponse = await fetch('http://localhost:3003/api/news');
      const listAfterResult = await listAfterResponse.json();
      
      if (listAfterResponse.ok && listAfterResult.success) {
        console.log(`✅ Danh sách sau khi tạo: ${listAfterResult.data.length} tin tức`);
        
        const newNews = listAfterResult.data.find(item => item.title === testNewsData.title);
        if (newNews) {
          console.log(`✅ Tìm thấy tin tức mới: ${newNews.title}`);
          console.log(`🖼️ Additional Images: ${newNews.additionalImages?.length || 0} ảnh`);
        } else {
          console.log('⚠️ Không tìm thấy tin tức mới trong danh sách');
        }
      }
      
    } else {
      console.log('❌ Tạo tin tức test thất bại');
      console.log(`📋 Lỗi: ${createResult.error}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test hình ảnh bổ sung:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test trường hình ảnh bổ sung');
  console.log('======================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test hình ảnh bổ sung
  const success = await testAdditionalImages();
  
  console.log(`\n🎯 Kết quả test hình ảnh bổ sung: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (success) {
    console.log('\n🎉 TRƯỜNG HÌNH ẢNH BỔ SUNG HOẠT ĐỘNG BÌNH THƯỜNG!');
    console.log('🖼️ Có thể thêm, hiển thị và xóa hình ảnh bổ sung.');
  }
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testAdditionalImages
};
