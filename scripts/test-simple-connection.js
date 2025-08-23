const fs = require('fs');
const path = require('path');

// Load configs
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

async function testSimpleConnection() {
  console.log('🔍 Testing WordPress Connection...\n');
  
  const wordpressConfig = getWordPressConfig();
  const pluginConfig = getPluginConfig();
  
  console.log('📋 Configs loaded:');
  console.log('- WordPress URL:', wordpressConfig?.siteUrl || 'NOT FOUND');
  console.log('- Username:', wordpressConfig?.username ? 'ENCRYPTED' : 'NOT FOUND');
  console.log('- API Key:', pluginConfig?.apiKey ? 'ENCRYPTED' : 'NOT FOUND');
  
  if (!wordpressConfig?.siteUrl) {
    console.log('\n❌ WordPress URL not found!');
    return;
  }
  
  // Test basic WordPress connection
  const wpUrl = wordpressConfig.siteUrl.replace(/\/$/, '');
  console.log('\n🌐 Testing WordPress URL:', wpUrl);
  
  try {
    console.log('\n🚀 Testing basic connection...');
    const response = await fetch(wpUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    if (response.ok) {
      console.log('✅ WordPress site is accessible!');
    } else {
      console.log('❌ WordPress site returned error status');
    }
    
  } catch (error) {
    console.log('\n❌ Connection failed:', error.message);
  }
  
  // Test AJAX endpoint
  const ajaxUrl = `${wpUrl}/wp-admin/admin-ajax.php?action=lta_news_create`;
  console.log('\n🌐 Testing AJAX URL:', ajaxUrl);
  
  try {
    console.log('\n🚀 Testing AJAX endpoint...');
    const response = await fetch(ajaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: 'test',
        title: 'Test',
        content: 'Test'
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    console.log('📊 AJAX Response Status:', response.status);
    
    const text = await response.text();
    console.log('📄 AJAX Response Body:', text.substring(0, 200) + '...');
    
    if (response.status === 401) {
      console.log('✅ AJAX endpoint exists but needs valid API key');
    } else if (response.status === 404) {
      console.log('❌ AJAX endpoint not found - plugin may not be installed');
    } else {
      console.log('📊 AJAX endpoint responded with status:', response.status);
    }
    
  } catch (error) {
    console.log('\n❌ AJAX test failed:', error.message);
  }
}

testSimpleConnection();
