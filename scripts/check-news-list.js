// Kiểm tra danh sách tin tức
const checkNewsList = async () => {
  try {
    console.log('📋 Kiểm tra danh sách tin tức');
    console.log('=============================');
    
    const response = await fetch('http://localhost:3003/api/news');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Có ${data.data?.length || 0} tin tức`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Danh sách tin tức:');
        data.data.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      - ID: ${item.id}`);
          console.log(`      - Status: ${item.status}`);
          console.log(`      - WordPress ID: ${item.wordpressId || 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Không thể lấy danh sách tin tức');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script kiểm tra danh sách tin tức');
  console.log('==================================');
  
  await checkNewsList();
  
  process.exit(0);
};

// Chạy
if (require.main === module) {
  main();
}
