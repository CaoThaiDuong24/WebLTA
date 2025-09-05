const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Tạo API key mới
function generateApiKey() {
  return 'lta_' + crypto.randomBytes(32).toString('hex');
}

// Reset API key
function resetApiKey() {
  console.log('🔄 Resetting API key...\n');
  
  const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
  
  try {
    // Đọc config hiện tại
    let config = {};
    if (fs.existsSync(pluginConfigPath)) {
      config = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'));
    }
    
    // Tạo API key mới
    const newApiKey = generateApiKey();
    
    // Cập nhật config
    config.apiKey = newApiKey;
    config.updatedAt = new Date().toISOString();
    
    // Lưu config
    fs.writeFileSync(pluginConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ API key đã được reset!');
    console.log(`📋 API Key mới: ${newApiKey}`);
    console.log('\n📝 Hướng dẫn:');
    console.log('1. Copy API key mới ở trên');
    console.log('2. Vào WordPress Admin → LTA News Sync');
    console.log('3. Cập nhật API key mới');
    console.log('4. Lưu cấu hình');
    console.log('5. Test lại việc tạo tin tức');
    
    return newApiKey;
    
  } catch (error) {
    console.error('❌ Lỗi khi reset API key:', error.message);
    return null;
  }
}

// Test kết nối với API key mới
async function testNewApiKey(apiKey) {
  console.log('\n🧪 Testing new API key...');
  
  try {
    const response = await fetch('https://wp2.ltacv.com/wp-admin/admin-ajax.php?action=lta_news_create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: apiKey,
        title: 'Test API Key Reset',
        content: 'Testing new API key',
        excerpt: 'Test excerpt',
        status: 'draft'
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ API key mới hoạt động!');
      console.log(`📄 Response: ${result.substring(0, 200)}...`);
    } else {
      const errorText = await response.text();
      console.log('❌ API key mới chưa hoạt động');
      console.log(`📄 Error: ${errorText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Main function
async function main() {
  const newApiKey = resetApiKey();
  
  if (newApiKey) {
    await testNewApiKey(newApiKey);
  }
  
  console.log('\n✅ Reset completed!');
}

// Chạy
main().catch(console.error);
