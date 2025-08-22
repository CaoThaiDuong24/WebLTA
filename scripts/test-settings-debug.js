const http = require('http');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

console.log('🔍 Debug Settings Save/Load Process...\n');

// Test 1: Kiểm tra file hiện tại
console.log('1. Current settings file:');
if (fs.existsSync(SETTINGS_FILE)) {
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const settings = JSON.parse(data);
  console.log('✅ File exists, size:', data.length, 'bytes');
  console.log('   Site name:', settings.siteName);
  console.log('   Session timeout:', settings.sessionTimeout);
  console.log('   Maintenance mode:', settings.maintenanceMode);
  console.log('   Last updated:', settings.lastUpdated);
} else {
  console.log('❌ File does not exist');
}

// Test 2: Save new settings
console.log('\n2. Saving new test settings...');
const testSettings = {
  siteName: 'DEBUG TEST - LTA',
  sessionTimeout: 120,
  maintenanceMode: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'test@lta.com.vn',
  smtpPass: 'testpass123',
  twoFactorAuth: true,
  passwordPolicy: true,
  loginAttempts: 10,
  maxPasswordAge: 60,
  requireSpecialChars: true,
  lockoutDuration: 30,
  enableAuditLog: true,
  ipWhitelist: '192.168.1.1\n10.0.0.1',
  sessionConcurrency: 2,
  emailNotifications: true,
  pushNotifications: true,
  newsAlerts: false,
  systemAlerts: true,
  wordpressSiteUrl: 'https://wp2.ltacv.com',
  wordpressUsername: 'testuser',
  wordpressApplicationPassword: 'testpass',
  wordpressAutoPublish: true,
  wordpressDefaultCategory: 'Test Category',
  wordpressDefaultTags: ['test', 'debug'],
  wordpressFeaturedImageEnabled: false,
  wordpressExcerptLength: 200,
  wordpressStatus: 'publish',
  googleAppsScriptUrl: 'https://script.google.com/macros/s/TEST/exec',
  contactRequestTimeoutMs: 15000
};

const saveSettings = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testSettings);

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

// Test 3: Load settings
const loadSettings = () => {
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

// Run tests
async function runTests() {
  try {
    // Save settings
    console.log('Saving settings...');
    const saveResult = await saveSettings();
    console.log('✅ Save result:', saveResult.status, saveResult.data.success ? 'Success' : 'Failed');
    
    if (saveResult.data.settings) {
      console.log('   Saved site name:', saveResult.data.settings.siteName);
      console.log('   Saved session timeout:', saveResult.data.settings.sessionTimeout);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check file after save
    console.log('\n3. File after save:');
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(data);
      console.log('✅ File updated, size:', data.length, 'bytes');
      console.log('   Site name:', settings.siteName);
      console.log('   Session timeout:', settings.sessionTimeout);
      console.log('   Maintenance mode:', settings.maintenanceMode);
      console.log('   Last updated:', settings.lastUpdated);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Load settings
    console.log('\n4. Loading settings...');
    const loadResult = await loadSettings();
    console.log('✅ Load result:', loadResult.status, loadResult.data.success ? 'Success' : 'Failed');
    
    if (loadResult.data.settings) {
      console.log('   Loaded site name:', loadResult.data.settings.siteName);
      console.log('   Loaded session timeout:', loadResult.data.settings.sessionTimeout);
      console.log('   Loaded maintenance mode:', loadResult.data.settings.maintenanceMode);
      
      // Compare with what we saved
      const savedName = testSettings.siteName;
      const loadedName = loadResult.data.settings.siteName;
      console.log('   Comparison - Saved vs Loaded:');
      console.log('     Site name:', savedName === loadedName ? '✅ Match' : `❌ Mismatch (${savedName} vs ${loadedName})`);
      
      const savedTimeout = testSettings.sessionTimeout;
      const loadedTimeout = loadResult.data.settings.sessionTimeout;
      console.log('     Session timeout:', savedTimeout === loadedTimeout ? '✅ Match' : `❌ Mismatch (${savedTimeout} vs ${loadedTimeout})`);
    } else {
      console.log('   ❌ No settings data in response');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

runTests();
