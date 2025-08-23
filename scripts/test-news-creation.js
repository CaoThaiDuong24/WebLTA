const fetch = require('node-fetch');

async function testNewsCreation() {
  console.log('🧪 Testing news creation...\n');
  
  const uniqueTitle = `Test Post ${Date.now()}`;
  const testData = {
    title: uniqueTitle,
    excerpt: 'Test excerpt for unique post',
    content: 'Test content for unique post',
    status: 'draft',
    category: 'Test',
    tags: 'test,unique',
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
    
    const result = await response.text();
    console.log(`📄 Response Body: ${result.substring(0, 500)}...`);
    
    if (response.ok) {
      console.log('✅ News creation successful!');
    } else {
      console.log('❌ News creation failed!');
      
      if (response.status === 409) {
        console.log('🔧 This is a duplicate title error - expected behavior');
      } else if (response.status === 502) {
        console.log('🔧 This is a WordPress connection error');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Chạy test
testNewsCreation();
