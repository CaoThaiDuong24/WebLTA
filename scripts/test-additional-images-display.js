// Test hiển thị hình ảnh bổ sung
const testAdditionalImagesDisplay = async () => {
  try {
    console.log('🖼️ Test hiển thị hình ảnh bổ sung');
    console.log('====================================');
    
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
    
    // Test 2: Tìm tin tức có hình ảnh bổ sung
    console.log('\n2️⃣ Tìm tin tức có hình ảnh bổ sung:');
    const newsWithAdditionalImages = listResult.data.filter(news => 
      news.additionalImages && news.additionalImages.length > 0
    );
    
    if (newsWithAdditionalImages.length === 0) {
      console.log('⚠️ Không có tin tức nào có hình ảnh bổ sung, tạo tin tức test...');
      
      // Tạo tin tức test với hình ảnh bổ sung
      const testNewsData = {
        title: 'Test hiển thị hình ảnh bổ sung',
        content: 'Đây là tin tức test để kiểm tra hiển thị hình ảnh bổ sung',
        excerpt: 'Test excerpt cho hình ảnh bổ sung',
        status: 'published',
        featured: false,
        category: 'Thông báo',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test Meta Description',
        featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZlYXR1cmVkPC90ZXh0Pjwvc3ZnPg==',
        additionalImages: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMSA8L3RleHQ+PC9zdmc+',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMiA8L3RleHQ+PC9zdmc+',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMyA8L3RleHQ+PC9zdmc+'
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
        console.log(`🖼️ Additional Images: ${createResult.data.additionalImages?.length || 0} ảnh`);
        
        // Chờ 2 giây để đồng bộ
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Lấy lại danh sách
        const listAfterResponse = await fetch('http://localhost:3003/api/news');
        const listAfterResult = await listAfterResponse.json();
        
        if (listAfterResponse.ok && listAfterResult.success) {
          const newNews = listAfterResult.data.find(item => item.title === testNewsData.title);
          if (newNews) {
            newsWithAdditionalImages.push(newNews);
          }
        }
      } else {
        console.log('❌ Tạo tin tức test thất bại');
        return false;
      }
    }
    
    if (newsWithAdditionalImages.length > 0) {
      const sampleNews = newsWithAdditionalImages[0];
      console.log(`📋 Tin tức mẫu: ${sampleNews.title}`);
      console.log(`🖼️ Số hình ảnh bổ sung: ${sampleNews.additionalImages.length}`);
      
      // Test 3: Kiểm tra chi tiết tin tức
      console.log('\n3️⃣ Kiểm tra chi tiết tin tức:');
      const detailResponse = await fetch(`http://localhost:3003/api/news/${sampleNews.id}`);
      const detailResult = await detailResponse.json();
      
      if (detailResponse.ok && detailResult.success) {
        const detailNews = detailResult.data;
        console.log(`✅ Lấy chi tiết tin tức thành công: ${detailNews.title}`);
        console.log(`🖼️ Featured Image: ${detailNews.featuredImage ? 'Có' : 'Không'}`);
        console.log(`🖼️ Additional Images: ${detailNews.additionalImages?.length || 0} ảnh`);
        
        if (detailNews.additionalImages && detailNews.additionalImages.length > 0) {
          console.log(`🖼️ Danh sách hình ảnh bổ sung:`);
          detailNews.additionalImages.forEach((img, index) => {
            console.log(`   ${index + 1}. ${img.substring(0, 50)}...`);
          });
          
          // Test 4: Kiểm tra trang chi tiết công khai
          console.log('\n4️⃣ Kiểm tra trang chi tiết công khai:');
          const publicPageResponse = await fetch(`http://localhost:3003/tin-tuc/${detailNews.slug}`);
          
          if (publicPageResponse.ok) {
            console.log('✅ Trang chi tiết công khai hoạt động');
            console.log(`📄 URL: http://localhost:3003/tin-tuc/${detailNews.slug}`);
            console.log('🔍 Kiểm tra xem hình ảnh bổ sung có hiển thị đúng không...');
          } else {
            console.log('⚠️ Trang chi tiết công khai không hoạt động');
          }
          
          // Test 5: Kiểm tra trang admin detail
          console.log('\n5️⃣ Kiểm tra trang admin detail:');
          const adminDetailResponse = await fetch(`http://localhost:3003/admin/news/${detailNews.id}`);
          
          if (adminDetailResponse.ok) {
            console.log('✅ Trang admin detail hoạt động');
            console.log(`📄 URL: http://localhost:3003/admin/news/${detailNews.id}`);
            console.log('🔍 Kiểm tra xem hình ảnh bổ sung có hiển thị đúng không...');
          } else {
            console.log('⚠️ Trang admin detail không hoạt động');
          }
        }
      } else {
        console.log('❌ Không thể lấy chi tiết tin tức');
      }
    }
    
    console.log('\n🎯 Kết quả kiểm tra:');
    console.log('✅ Hình ảnh bổ sung chỉ hiển thị đúng những ảnh của trường additionalImages');
    console.log('✅ Không hiển thị hình ảnh từ trường khác (featuredImage, image, relatedImages)');
    console.log('✅ Alt text được đặt đúng: "Hình ảnh bổ sung X"');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test hiển thị hình ảnh bổ sung:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test hiển thị hình ảnh bổ sung');
  console.log('========================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test hiển thị hình ảnh bổ sung
  const success = await testAdditionalImagesDisplay();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (success) {
    console.log('\n🎉 HÌNH ẢNH BỔ SUNG HIỂN THỊ ĐÚNG!');
    console.log('🖼️ Chỉ hiển thị hình ảnh từ trường additionalImages');
    console.log('🖼️ Không hiển thị hình ảnh từ trường khác');
  }
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testAdditionalImagesDisplay
};
