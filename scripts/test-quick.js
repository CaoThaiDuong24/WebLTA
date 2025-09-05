// Test nhanh API
const testQuick = async () => {
  try {
    console.log('🚀 Test nhanh API');
    console.log('================');
    
    // Test 1: Kiểm tra server có chạy không
    console.log('\n1️⃣ Kiểm tra server:');
    
    const response = await fetch('http://localhost:3003/api/news');
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API hoạt động!');
      console.log(`📊 Có ${data.data?.length || 0} tin tức`);
    } else {
      const errorText = await response.text();
      console.log('❌ API lỗi:');
      console.log(`📋 Error: ${errorText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Script test nhanh');
  console.log('==================');
  
  await testQuick();
  
  process.exit(0);
};

// Chạy
if (require.main === module) {
  main();
}
