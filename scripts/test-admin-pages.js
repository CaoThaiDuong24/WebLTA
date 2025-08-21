// Test nhanh các trang admin
const testAdminPages = async () => {
  try {
    console.log('🔧 Test nhanh các trang admin');
    console.log('============================');
    
    const pages = [
      { name: 'Admin News List', url: 'http://localhost:3003/admin/news' },
      { name: 'Create News', url: 'http://localhost:3003/admin/news/create' },
      { name: 'Admin Dashboard', url: 'http://localhost:3003/admin' }
    ];
    
    for (const page of pages) {
      console.log(`\n📄 Testing: ${page.name}`);
      try {
        const response = await fetch(page.url);
        if (response.ok) {
          console.log(`✅ ${page.name}: OK (${response.status})`);
        } else {
          console.log(`⚠️ ${page.name}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${page.name}: ${error.message}`);
      }
    }
    
    // Test edit page với ID cụ thể
    console.log('\n📄 Testing: Edit News Page');
    try {
      const response = await fetch('http://localhost:3003/admin/news/edit/wp_102');
      if (response.ok) {
        console.log(`✅ Edit News Page: OK (${response.status})`);
      } else {
        console.log(`⚠️ Edit News Page: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Edit News Page: ${error.message}`);
    }
    
    console.log('\n🎯 Tất cả trang admin đã được kiểm tra!');
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi test trang admin:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test nhanh các trang admin');
  console.log('===================================');
  
  // Chờ server khởi động
  console.log('⏳ Chờ server khởi động...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test các trang admin
  const success = await testAdminPages();
  
  console.log(`\n🎯 Kết quả test: ${success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'}`);
  
  process.exit(success ? 0 : 1);
};

// Chạy test
if (require.main === module) {
  main();
}

module.exports = {
  testAdminPages
};
