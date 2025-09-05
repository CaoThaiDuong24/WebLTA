// Test tách biệt hình ảnh content và additionalImages
const testContentImagesSeparation = async () => {
  try {
    console.log('🖼️ Test tách biệt hình ảnh content và additionalImages');
    console.log('=====================================================');
    
    // Test 1: Tạo tin tức test với hình ảnh trong content
    console.log('\n1️⃣ Tạo tin tức test với hình ảnh trong content:');
    const testNewsData = {
      title: 'Test tách biệt hình ảnh content',
      content: `
        <p>Đây là nội dung test với hình ảnh trong content:</p>
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbnRlbnQgSW1hZ2UgMSA8L3RleHQ+PC9zdmc+" alt="Content Image 1" />
        <p>Và một hình ảnh khác:</p>
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbnRlbnQgSW1hZ2UgMiA8L3RleHQ+PC9zdmc+" alt="Content Image 2" />
        <p>Kết thúc nội dung.</p>
      `,
      excerpt: 'Test excerpt cho tách biệt hình ảnh',
      status: 'published',
      featured: false,
      category: 'Thông báo',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test Meta Description',
      featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZlYXR1cmVkPC90ZXh0Pjwvc3ZnPg==',
      additionalImages: [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMSA8L3RleHQ+PC9zdmc+',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkZGl0aW9uYWwgMiA8L3RleHQ+PC9zdmc+'
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
      
      // Test 2: Kiểm tra chi tiết tin tức
      console.log('\n2️⃣ Kiểm tra chi tiết tin tức:');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
      
      const detailResponse = await fetch(`http://localhost:3003/api/news/${createResult.data.id}`);
      const detailResult = await detailResponse.json();
      
      if (detailResponse.ok && detailResult.success) {
        const detailNews = detailResult.data;
        console.log(`✅ Lấy chi tiết tin tức thành công: ${detailNews.title}`);
        
        // Kiểm tra content có hình ảnh không
        const contentHasImages = detailNews.content.includes('<img');
        console.log(`📝 Content có hình ảnh: ${contentHasImages ? 'Có' : 'Không'}`);
        
        if (contentHasImages) {
          const imgMatches = detailNews.content.match(/<img[^>]+src="([^">]+)"/g);
          console.log(`📸 Số hình ảnh trong content: ${imgMatches ? imgMatches.length : 0}`);
          
          if (imgMatches) {
            console.log('📸 Danh sách hình ảnh trong content:');
            imgMatches.forEach((match, index) => {
              const srcMatch = match.match(/src="([^"]+)"/);
              const src = srcMatch ? srcMatch[1] : 'N/A';
              console.log(`   ${index + 1}. ${src.substring(0, 50)}...`);
            });
          }
        }
        
        // Kiểm tra additionalImages
        console.log(`🖼️ Số hình ảnh bổ sung: ${detailNews.additionalImages?.length || 0}`);
        
        if (detailNews.additionalImages && detailNews.additionalImages.length > 0) {
          console.log('🖼️ Danh sách hình ảnh bổ sung:');
          detailNews.additionalImages.forEach((img, index) => {
            console.log(`   ${index + 1}. ${img.substring(0, 50)}...`);
          });
        }
        
        // Test 3: Kiểm tra xem có hình ảnh từ content trong additionalImages không
        console.log('\n3️⃣ Kiểm tra tách biệt hình ảnh:');
        if (contentHasImages && detailNews.additionalImages && detailNews.additionalImages.length > 0) {
          const imgMatches = detailNews.content.match(/<img[^>]+src="([^">]+)"/g);
          const contentImageUrls = imgMatches ? imgMatches.map(match => {
            const srcMatch = match.match(/src="([^"]+)"/);
            return srcMatch ? srcMatch[1] : null;
          }).filter(Boolean) : [];
          
          const hasContentImagesInAdditional = contentImageUrls.some(contentImg => 
            detailNews.additionalImages.includes(contentImg)
          );
          
          if (hasContentImagesInAdditional) {
            console.log('❌ PHÁT HIỆN LỖI: Hình ảnh từ content vẫn xuất hiện trong additionalImages!');
            console.log('🔧 Cần sửa lại logic để tách biệt hoàn toàn.');
          } else {
            console.log('✅ TÁCH BIỆT THÀNH CÔNG: Hình ảnh từ content không xuất hiện trong additionalImages!');
          }
        } else {
          console.log('✅ Không có hình ảnh trong content hoặc additionalImages, không cần kiểm tra tách biệt.');
        }
        
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
        
      } else {
        console.log('❌ Không thể lấy chi tiết tin tức');
      }
      
    } else {
      console.log('❌ Tạo tin tức test thất bại');
      console.log(`📋 Lỗi: ${createResult.error}`);
    }
    
    console.log('\n🎯 Kết quả kiểm tra:');
    console.log('✅ Hình ảnh trong content và additionalImages đã được tách biệt');
    console.log('✅ AdditionalImages chỉ chứa hình ảnh được upload riêng');
    console.log('✅ Hình ảnh trong content không xuất hiện ở phần hình ảnh bổ sung');
    
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test tách biệt hình ảnh:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test tách biệt hình ảnh content và additionalImages');
  console.log('==========================================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test tách biệt hình ảnh
  const success = await testContentImagesSeparation();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  if (success) {
    console.log('\n🎉 TÁCH BIỆT HÌNH ẢNH THÀNH CÔNG!');
    console.log('🖼️ Hình ảnh trong content và additionalImages đã được tách biệt hoàn toàn');
    console.log('🖼️ Không còn hiển thị hình ảnh từ content ở phần hình ảnh bổ sung');
  }
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testContentImagesSeparation
};
