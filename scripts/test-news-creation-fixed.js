const fetch = require('node-fetch');

async function testNewsCreation() {
  console.log('🧪 Testing news creation after JSON fix...\n');
  
  const uniqueTitle = `Test Post Fixed ${Date.now()}`;
  const testData = {
    title: uniqueTitle,
    excerpt: 'Test excerpt for fixed JSON parsing',
    content: 'Test content for fixed JSON parsing',
    status: 'draft',
    category: 'Test',
    tags: 'test,fixed,json',
    featuredImage: '',
    additionalImages: []
  };
  
  try {
    console.log(`📝 Creating post with title: "${uniqueTitle}"`);
    
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'admin-panel'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    // Đọc response text trước
    const responseText = await response.text();
    console.log(`📄 Raw Response: ${responseText.substring(0, 500)}...`);
    
    let result = null;
    try {
      result = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
    } catch (e) {
      console.log('❌ JSON parsing failed:', e.message);
      console.log('🔍 This is the issue we fixed!');
      return;
    }
    
    if (response.ok && result.success) {
      console.log('✅ News creation successful!');
      console.log(`📋 WordPress ID: ${result.data?.wordpressId || 'N/A'}`);
      console.log(`📝 Message: ${result.message || 'N/A'}`);
    } else {
      console.log('❌ News creation failed!');
      console.log(`📄 Error: ${result.error || 'Unknown error'}`);
      console.log(`⚠️ Warning: ${result.warning || 'N/A'}`);
      
      if (response.status === 409) {
        console.log('🔧 This is a duplicate title error - expected behavior');
      } else if (response.status === 502) {
        console.log('🔧 This is a WordPress connection error');
      } else if (response.status === 401) {
        console.log('🔧 This is an authentication error - API key issue');
      }
      
      if (result.details) {
        console.log('🔍 Error details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🔧 Network error - Make sure the server is running on localhost:3000');
    }
  }
}

// Test với title trùng lặp để kiểm tra xử lý lỗi
async function testDuplicateTitle() {
  console.log('\n🧪 Testing duplicate title handling...\n');
  
  const duplicateTitle = 'Test Duplicate Title';
  const testData = {
    title: duplicateTitle,
    excerpt: 'Test duplicate title',
    content: 'Test content for duplicate title',
    status: 'draft'
  };
  
  try {
    console.log(`📝 Creating post with duplicate title: "${duplicateTitle}"`);
    
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'admin-panel'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📄 Raw Response: ${responseText.substring(0, 300)}...`);
    
    if (response.status === 409) {
      console.log('✅ Duplicate title error handled correctly!');
      try {
        const result = JSON.parse(responseText);
        console.log(`📄 Error message: ${result.error || 'N/A'}`);
        console.log(`💡 Suggestion: ${result.suggestion || 'N/A'}`);
      } catch (e) {
        console.log('❌ JSON parsing failed for error response');
      }
    } else {
      console.log('⚠️ Unexpected response for duplicate title');
    }
    
  } catch (error) {
    console.error('❌ Duplicate title test failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Testing news creation with JSON fix...\n');
  
  await testNewsCreation();
  await testDuplicateTitle();
  
  console.log('\n✅ Test completed!');
  console.log('\n📋 Summary:');
  console.log('- If you see "JSON parsing successful", the fix worked');
  console.log('- If you see "JSON parsing failed", there are still issues');
  console.log('- Check the response status codes for different error types');
}

// Chạy test
main().catch(console.error);
