const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pluginConfigPath = path.join(process.cwd(), 'data', 'plugin-config.json');

function generateNewApiKey() {
  return 'lta_' + crypto.randomBytes(32).toString('hex');
}

function updatePluginConfig() {
  try {
    console.log('🔑 Generating new API key...');
    
    const newApiKey = generateNewApiKey();
    console.log('📝 New API Key:', newApiKey);
    
    let config = {};
    if (fs.existsSync(pluginConfigPath)) {
      const configData = fs.readFileSync(pluginConfigPath, 'utf8');
      config = JSON.parse(configData);
    }
    
    config.apiKey = newApiKey;
    config.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(pluginConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ Plugin config updated successfully!');
    return newApiKey;
    
  } catch (error) {
    console.error('❌ Error updating plugin config:', error);
    return null;
  }
}

function main() {
  console.log('🔄 Resetting WordPress Plugin API Key...\n');
  
  const newApiKey = updatePluginConfig();
  
  if (newApiKey) {
    console.log('\n📋 Next steps:');
    console.log('1. Copy the new API key above');
    console.log('2. Go to WordPress Admin → LTA News Sync');
    console.log('3. Paste the new API key in the "API Key" field');
    console.log('4. Click "Lưu cấu hình"');
    console.log('5. Test creating a news post');
    
    console.log('\n🔑 New API Key to copy:');
    console.log('='.repeat(50));
    console.log(newApiKey);
    console.log('='.repeat(50));
  } else {
    console.log('\n❌ Failed to generate new API key');
  }
}

main();
