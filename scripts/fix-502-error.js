const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Fixing 502 Error for News Creation');
console.log('=====================================\n');

// 1. Kiểm tra và sửa cấu hình
function checkAndFixConfig() {
  console.log('1️⃣ Checking configurations...');
  
  const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
  const wpConfigPath = path.join(process.cwd(), 'data', 'wordpress-config.json');
  
  let issues = [];
  
  // Kiểm tra plugin config
  if (!fs.existsSync(pluginConfigPath)) {
    issues.push('❌ Plugin config file missing');
  } else {
    try {
      const pluginConfig = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'));
      if (!pluginConfig.apiKey) {
        issues.push('❌ API key missing in plugin config');
      }
    } catch (error) {
      issues.push('❌ Invalid plugin config JSON');
    }
  }
  
  // Kiểm tra WordPress config
  if (!fs.existsSync(wpConfigPath)) {
    issues.push('❌ WordPress config file missing');
  } else {
    try {
      const wpConfig = JSON.parse(fs.readFileSync(wpConfigPath, 'utf8'));
      if (!wpConfig.siteUrl) {
        issues.push('❌ Site URL missing in WordPress config');
      }
    } catch (error) {
      issues.push('❌ Invalid WordPress config JSON');
    }
  }
  
  if (issues.length > 0) {
    console.log('⚠️  Issues found:');
    issues.forEach(issue => console.log(`   ${issue}`));
    return false;
  } else {
    console.log('✅ All configurations look good');
    return true;
  }
}

// 2. Tạo API key mới nếu cần
function generateNewApiKey() {
  console.log('\n2️⃣ Generating new API key...');
  
  const newApiKey = 'lta_' + crypto.randomBytes(32).toString('hex');
  
  const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
  
  try {
    let config = {};
    if (fs.existsSync(pluginConfigPath)) {
      config = JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8'));
    }
    
    config.apiKey = newApiKey;
    config.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(pluginConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ New API key generated and saved');
    console.log(`📋 API Key: ${newApiKey}`);
    
    return newApiKey;
  } catch (error) {
    console.error('❌ Failed to generate API key:', error.message);
    return null;
  }
}

// 3. Test kết nối WordPress
async function testWordPressConnection() {
  console.log('\n3️⃣ Testing WordPress connection...');
  
  try {
    const response = await fetch('https://wp2.ltacv.com/wp-json/wp/v2/posts?per_page=1', {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      console.log('✅ WordPress site is accessible');
      return true;
    } else {
      console.log(`❌ WordPress site returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ WordPress connection failed: ${error.message}`);
    return false;
  }
}

// 4. Test plugin endpoint
async function testPluginEndpoint(apiKey) {
  console.log('\n4️⃣ Testing plugin endpoint...');
  
  try {
    const response = await fetch('https://wp2.ltacv.com/wp-admin/admin-ajax.php?action=lta_news_create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: apiKey,
        title: `Test Fix ${Date.now()}`,
        content: 'Test content for fixing 502 error',
        excerpt: 'Test excerpt',
        status: 'draft'
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    console.log(`📊 Plugin response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Plugin endpoint working');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Plugin endpoint error: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Plugin test failed: ${error.message}`);
    return false;
  }
}

// 5. Tạo file backup
function createBackup() {
  console.log('\n5️⃣ Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'data', 'backup');
  
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const files = ['plugin-config.json', 'wordpress-config.json'];
    
    files.forEach(file => {
      const sourcePath = path.join(process.cwd(), 'data', file);
      const backupPath = path.join(backupDir, `${file}.backup-${timestamp}`);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`✅ Backed up ${file}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return false;
  }
}

// 6. Tạo hướng dẫn sửa lỗi
function createFixGuide() {
  console.log('\n6️⃣ Creating fix guide...');
  
  const guide = `
# Hướng dẫn sửa lỗi 502 khi lưu tin tức

## Nguyên nhân có thể:
1. API key không đúng hoặc hết hạn
2. WordPress site không accessible
3. Plugin không hoạt động
4. Network timeout

## Các bước sửa:

### Bước 1: Cập nhật API key trong WordPress
1. Vào WordPress Admin → LTA News Sync
2. Copy API key mới: ${generateNewApiKey()}
3. Paste vào trường "API Key"
4. Click "Lưu cấu hình"

### Bước 2: Kiểm tra plugin
1. Đảm bảo plugin "LTA News Sync" đã được cài đặt và kích hoạt
2. Kiểm tra plugin có hoạt động không

### Bước 3: Test lại
1. Thử tạo tin tức mới
2. Nếu vẫn lỗi, kiểm tra console để xem lỗi chi tiết

### Bước 4: Nếu vẫn lỗi
1. Kiểm tra WordPress site có hoạt động không
2. Kiểm tra hosting có block REST API không
3. Liên hệ admin WordPress để kiểm tra

## Lưu ý:
- Backup dữ liệu trước khi thay đổi
- Test trên môi trường dev trước
- Ghi log lỗi để debug
`;

  const guidePath = path.join(process.cwd(), 'FIX_502_GUIDE.md');
  fs.writeFileSync(guidePath, guide);
  
  console.log('✅ Fix guide created: FIX_502_GUIDE.md');
}

// Main function
async function main() {
  console.log('🚀 Starting 502 error fix process...\n');
  
  // Tạo backup trước
  createBackup();
  
  // Kiểm tra config
  const configOk = checkAndFixConfig();
  
  // Test WordPress connection
  const wpOk = await testWordPressConnection();
  
  // Tạo API key mới
  const newApiKey = generateNewApiKey();
  
  // Test plugin với API key mới
  if (newApiKey) {
    await testPluginEndpoint(newApiKey);
  }
  
  // Tạo hướng dẫn
  createFixGuide();
  
  console.log('\n✅ Fix process completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy the new API key above');
  console.log('2. Update it in WordPress Admin → LTA News Sync');
  console.log('3. Test creating a news post');
  console.log('4. Check FIX_502_GUIDE.md for detailed instructions');
}

// Chạy
main().catch(console.error);
