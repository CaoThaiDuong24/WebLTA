const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Hàm decrypt (copy từ lib/security.ts)
function decryptSensitiveData(encryptedData) {
  try {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lta-encryption-key-2024-stable-32chars';
    
    // Tạo key từ ENCRYPTION_KEY
    function getKey() {
      return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    }
    
    const key = getKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Tách salt và dữ liệu
    const salt = combined.subarray(0, 8);
    const encrypted = combined.subarray(8);
    const keyBuffer = Buffer.from(key);
    
    // XOR decryption
    const decrypted = Buffer.alloc(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length];
    }
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error.message);
    return '';
  }
}

// Đọc cấu hình
function getConfigs() {
  const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
  const wpConfigPath = path.join(process.cwd(), 'data', 'wordpress-config.json');
  
  let pluginConfig = null;
  let wpConfig = null;
  
  try {
    if (fs.existsSync(pluginConfigPath)) {
      pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading plugin config:', error.message);
  }
  
  try {
    if (fs.existsSync(wpConfigPath)) {
      const rawConfig = JSON.parse(fs.readFileSync(wpConfigPath, 'utf8'));
      wpConfig = {
        ...rawConfig,
        username: rawConfig.username.startsWith('ENCRYPTED:') 
          ? decryptSensitiveData(rawConfig.username.replace('ENCRYPTED:', ''))
          : rawConfig.username,
        applicationPassword: rawConfig.applicationPassword.startsWith('ENCRYPTED:')
          ? decryptSensitiveData(rawConfig.applicationPassword.replace('ENCRYPTED:', ''))
          : rawConfig.applicationPassword
      };
    }
  } catch (error) {
    console.error('Error reading WordPress config:', error.message);
  }
  
  return { pluginConfig, wpConfig };
}

// Test kết nối
async function testConnection() {
  console.log('🔍 Testing WordPress connection...\n');
  
  const { pluginConfig, wpConfig } = getConfigs();
  
  if (!pluginConfig) {
    console.error('❌ Plugin config not found or invalid');
    return;
  }
  
  if (!wpConfig) {
    console.error('❌ WordPress config not found or invalid');
    return;
  }
  
  console.log('📋 Plugin Config:');
  console.log(`  - API Key: ${pluginConfig.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - Webhook URL: ${pluginConfig.webhookUrl || '❌ Missing'}`);
  console.log(`  - Auto Sync: ${pluginConfig.autoSync ? '✅ Enabled' : '❌ Disabled'}`);
  
  console.log('\n📋 WordPress Config:');
  console.log(`  - Site URL: ${wpConfig.siteUrl || '❌ Missing'}`);
  console.log(`  - Username: ${wpConfig.username ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - App Password: ${wpConfig.applicationPassword ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - Is Connected: ${wpConfig.isConnected ? '✅ Yes' : '❌ No'}`);
  
  // Test 1: Kiểm tra site URL có accessible không
  console.log('\n🧪 Test 1: Checking site accessibility...');
  try {
    const response = await fetch(wpConfig.siteUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    console.log(`  - Status: ${response.status} ${response.statusText}`);
    console.log(`  - Accessible: ${response.ok ? '✅ Yes' : '❌ No'}`);
  } catch (error) {
    console.log(`  - Error: ${error.message}`);
    console.log('  - Accessible: ❌ No');
  }
  
  // Test 2: Kiểm tra WordPress REST API
  console.log('\n🧪 Test 2: Checking WordPress REST API...');
  try {
    const restUrl = `${wpConfig.siteUrl}/wp-json/wp/v2/posts?per_page=1`;
    const response = await fetch(restUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    console.log(`  - Status: ${response.status} ${response.statusText}`);
    console.log(`  - REST API: ${response.ok ? '✅ Working' : '❌ Blocked/Error'}`);
  } catch (error) {
    console.log(`  - Error: ${error.message}`);
    console.log('  - REST API: ❌ Error');
  }
  
  // Test 3: Kiểm tra plugin endpoint
  console.log('\n🧪 Test 3: Checking plugin endpoint...');
  try {
    const pluginUrl = `${wpConfig.siteUrl}/wp-admin/admin-ajax.php?action=lta_news_create`;
    const response = await fetch(pluginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: pluginConfig.apiKey,
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'draft'
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    console.log(`  - Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log(`  - Plugin: ✅ Working`);
      console.log(`  - Response: ${result.substring(0, 200)}...`);
    } else {
      const errorText = await response.text();
      console.log(`  - Plugin: ❌ Error`);
      console.log(`  - Error: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`  - Error: ${error.message}`);
    console.log('  - Plugin: ❌ Connection failed');
  }
  
  // Test 4: Kiểm tra authentication
  console.log('\n🧪 Test 4: Checking authentication...');
  try {
    const authUrl = `${wpConfig.siteUrl}/wp-json/wp/v2/users/me`;
    const credentials = Buffer.from(`${wpConfig.username}:${wpConfig.applicationPassword}`).toString('base64');
    
    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log(`  - Status: ${response.status} ${response.statusText}`);
    console.log(`  - Auth: ${response.ok ? '✅ Valid' : '❌ Invalid'}`);
    
    if (response.ok) {
      const userData = await response.json();
      console.log(`  - User: ${userData.name || userData.slug}`);
    }
  } catch (error) {
    console.log(`  - Error: ${error.message}`);
    console.log('  - Auth: ❌ Failed');
  }
  
  console.log('\n📊 Summary:');
  console.log('If you see ❌ in any test above, that could be the cause of 502 errors.');
  console.log('Common causes:');
  console.log('1. WordPress site is down or slow');
  console.log('2. REST API is blocked by hosting provider');
  console.log('3. Plugin is not installed or not working');
  console.log('4. Authentication credentials are wrong');
  console.log('5. Network timeout issues');
}

// Chạy test
testConnection().catch(console.error);
