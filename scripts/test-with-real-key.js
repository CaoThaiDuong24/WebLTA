const fs = require('fs');
const path = require('path');

const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');
const wpConfigPath = path.join(process.cwd(), 'data', 'wordpress-config.json');

function getPluginConfig() {
  try {
    if (fs.existsSync(pluginConfigPath)) {
      const configData = fs.readFileSync(pluginConfigPath, 'utf8');
      const config = JSON.parse(configData);
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
      return config;
    }
    return null;
  } catch (error) {
    console.error('Error loading WordPress config:', error);
    return null;
  }
}

async function testWithRealKey() {
  console.log('🔍 Testing with Real API Key...\n');
  
  const wordpressConfig = getWordPressConfig();
  const pluginConfig = getPluginConfig();
  
  console.log('📋 Configs loaded:');
  console.log('- WordPress URL:', wordpressConfig?.siteUrl || 'NOT FOUND');
  console.log('- API Key:', pluginConfig?.apiKey ? pluginConfig.apiKey.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!wordpressConfig?.siteUrl || !pluginConfig?.apiKey) {
    console.log('\n❌ Missing required configs!');
    return;
  }
  
  const ajaxUrl = `${wordpressConfig.siteUrl.replace(/\/$/, '')}/wp-admin/admin-ajax.php?action=lta_news_create`;
  console.log('\n🌐 Testing AJAX URL:', ajaxUrl);
  
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
    authorUsername: 'admin'
  };
  
  try {
    console.log('\n🚀 Sending test request with real API key...');
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(30000)
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    const text = await response.text();
    console.log('📄 Response Body:', text);
    
    try {
      const json = JSON.parse(text);
      if (json.success) {
        console.log('\n✅ SUCCESS! Plugin is working correctly!');
        console.log('📝 Post created with ID:', json.data?.id);
      } else {
        console.log('\n❌ Plugin returned error:', json.error);
      }
    } catch (e) {
      console.log('\n❌ Invalid JSON response');
    }
    
  } catch (error) {
    console.log('\n❌ Request failed:', error.message);
  }
}

testWithRealKey();
