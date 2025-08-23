const fs = require('fs');
const path = require('path');

// Load configs
const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
const wpConfigPath = path.join(process.cwd(), 'data', 'wordpress-config.json');

function decryptSensitiveData(encryptedData) {
  // Simple decryption for testing
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from('your-secret-key-32-chars-long!!', 'utf8');
  const iv = Buffer.from('your-iv-16-chars!', 'utf8');
  
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}

function getPluginConfig() {
  try {
    if (fs.existsSync(pluginConfigPath)) {
      const configData = fs.readFileSync(pluginConfigPath, 'utf8');
      const config = JSON.parse(configData);
      
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''));
      }
      
      return config;
    }
    return null;
  } catch (error) {
    console.error('Error loading Plugin config:', error);
    return null;
  }
}

function getWordPressConfig() {
  try {
    if (fs.existsSync(wpConfigPath)) {
      const configData = fs.readFileSync(wpConfigPath, 'utf8');
      const config = JSON.parse(configData);
      
      if (config.username && config.username.startsWith('ENCRYPTED:')) {
        config.username = decryptSensitiveData(config.username.replace('ENCRYPTED:', ''));
      }
      if (config.applicationPassword && config.applicationPassword.startsWith('ENCRYPTED:')) {
        config.applicationPassword = decryptSensitiveData(config.applicationPassword.replace('ENCRYPTED:', ''));
      }
      
      return config;
    }
    return null;
  } catch (error) {
    console.error('Error loading WordPress config:', error);
    return null;
  }
}

async function testPluginConnection() {
  console.log('🔍 Testing WordPress Plugin Connection...\n');
  
  const wordpressConfig = getWordPressConfig();
  const pluginConfig = getPluginConfig();
  
  console.log('📋 Configs loaded:');
  console.log('- WordPress URL:', wordpressConfig?.siteUrl || 'NOT FOUND');
  console.log('- Username:', wordpressConfig?.username ? '***' + wordpressConfig.username.slice(-3) : 'NOT FOUND');
  console.log('- API Key:', pluginConfig?.apiKey ? '***' + pluginConfig.apiKey.slice(-3) : 'NOT FOUND');
  
  if (!wordpressConfig?.siteUrl || !pluginConfig?.apiKey) {
    console.log('\n❌ Missing required configs!');
    return;
  }
  
  const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`;
  console.log('\n🌐 Testing URL:', ajaxUrl);
  
  const testPayload = {
    apiKey: pluginConfig.apiKey,
    title: 'Test Post - ' + new Date().toISOString(),
    content: '<p>This is a test post to check plugin connection.</p>',
    excerpt: 'Test excerpt',
    status: 'draft',
    category: '',
    tags: '',
    featuredImage: '',
    additionalImages: [],
    slug: '',
    authorUsername: wordpressConfig.username
  };
  
  try {
    console.log('\n🚀 Sending test request...');
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(30000)
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📄 Response Body:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('\n✅ Plugin Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n❌ Invalid JSON response');
    }
    
  } catch (error) {
    console.log('\n❌ Request failed:', error.message);
  }
}

testPluginConnection();
