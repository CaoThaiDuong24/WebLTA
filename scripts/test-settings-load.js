const http = require('http');

console.log('🔍 Testing Settings Load from API...\n');

const testLoadSettings = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/settings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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

    req.end();
  });
};

// Test load settings
testLoadSettings()
  .then((result) => {
    console.log('✅ Load settings thành công');
    console.log('   Status:', result.status);
    console.log('   Success:', result.data.success);
    
    if (result.data.settings) {
      console.log('   Site name:', result.data.settings.siteName);
      console.log('   Session timeout:', result.data.settings.sessionTimeout);
      console.log('   Maintenance mode:', result.data.settings.maintenanceMode);
      console.log('   Last updated:', result.data.settings.lastUpdated);
    } else {
      console.log('   ❌ No settings data in response');
    }
  })
  .catch((error) => {
    console.log('❌ Load settings failed:', error.message);
  });
