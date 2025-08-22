const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

console.log('🔍 Testing Settings Save/Load...\n');

// Test 1: Kiểm tra file tồn tại
console.log('1. Kiểm tra file settings.json:');
if (fs.existsSync(SETTINGS_FILE)) {
  console.log('✅ File tồn tại:', SETTINGS_FILE);
  const stats = fs.statSync(SETTINGS_FILE);
  console.log('   Size:', stats.size, 'bytes');
  console.log('   Modified:', stats.mtime);
} else {
  console.log('❌ File không tồn tại');
  process.exit(1);
}

// Test 2: Đọc và parse JSON
console.log('\n2. Kiểm tra parse JSON:');
try {
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const settings = JSON.parse(data);
  console.log('✅ JSON parse thành công');
  console.log('   Site name:', settings.siteName);
  console.log('   Session timeout:', settings.sessionTimeout);
  console.log('   Last updated:', settings.lastUpdated);
} catch (error) {
  console.log('❌ Lỗi parse JSON:', error.message);
}

// Test 3: Test API endpoint
console.log('\n3. Test API endpoint:');
const http = require('http');

const testApi = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      siteName: 'TEST - LTA Updated',
      sessionTimeout: 60,
      maintenanceMode: true
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/settings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Chạy test API nếu server đang chạy
testApi()
  .then((result) => {
    console.log('✅ API test thành công');
    console.log('   Status:', result.status);
    console.log('   Response:', result.data.success ? 'Success' : 'Error');
  })
  .catch((error) => {
    console.log('⚠️  API test failed (server có thể không chạy):', error.message);
  });

console.log('\n4. Kiểm tra file sau khi test:');
setTimeout(() => {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    console.log('✅ File vẫn tồn tại và valid');
    console.log('   Site name:', settings.siteName);
    console.log('   Session timeout:', settings.sessionTimeout);
  } catch (error) {
    console.log('❌ Lỗi đọc file sau test:', error.message);
  }
}, 2000);
