const fs = require('fs')
const path = require('path')

// Kiểm tra trạng thái mã hóa hiện tại
function checkEncryptionStatus() {
  const adminFile = path.join(process.cwd(), 'data', 'admin.json')
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  
  let adminEncrypted = false
  let usersEncrypted = false
  
  if (fs.existsSync(adminFile)) {
    const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'))
    adminEncrypted = adminData.encryption_enabled === true
  }
  
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
    usersEncrypted = users.length > 0 && users[0].security_version === "2.0"
  }
  
  return { adminEncrypted, usersEncrypted }
}

// Bật mã hóa
function enableEncryption() {
  console.log('🔐 Bật mã hóa dữ liệu...')
  
  // Chạy script mã hóa
  const { execSync } = require('child_process')
  try {
    execSync('node scripts/encrypt-data.js', { stdio: 'inherit' })
    console.log('✅ Mã hóa đã được bật!')
  } catch (error) {
    console.error('❌ Lỗi khi bật mã hóa:', error.message)
  }
}

// Tắt mã hóa (chuyển về dữ liệu thường)
function disableEncryption() {
  console.log('🔓 Tắt mã hóa dữ liệu...')
  
  // Tạo lại dữ liệu thường
  const adminData = {
    email: "admin@lta.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    name: "LTA Admin",
    role: "administrator",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    security_version: "1.0",
    encryption_enabled: false
  }
  
  const usersData = [
    {
      id: 1703123456789,
      user_login: "testuser1",
      user_email: "test1@lta.com",
      user_pass: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      display_name: "Test User 1",
      user_nicename: "test-user-1",
      role: "editor",
      user_registered: "2024-01-15 10:30:00",
      created_at: "2024-01-15T10:30:00.000Z",
      is_active: true,
      security_version: "1.0"
    },
    {
      id: 1755575000000,
      user_login: "test",
      user_email: "test@test.com",
      user_pass: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      display_name: "Test Account",
      user_nicename: "test-account",
      role: "editor",
      user_registered: "2025-08-19 04:00:00",
      created_at: "2025-08-19T04:00:00.000Z",
      is_active: true,
      security_version: "1.0"
    }
  ]
  
  // Lưu file
  fs.writeFileSync(path.join(process.cwd(), 'data', 'admin.json'), JSON.stringify(adminData, null, 2))
  fs.writeFileSync(path.join(process.cwd(), 'data', 'users.json'), JSON.stringify(usersData, null, 2))
  
  console.log('✅ Mã hóa đã được tắt!')
}

// Main function
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'status') {
    const status = checkEncryptionStatus()
    console.log('📊 Trạng thái mã hóa:')
    console.log(`   Admin: ${status.adminEncrypted ? '🔐 Đã mã hóa' : '🔓 Chưa mã hóa'}`)
    console.log(`   Users: ${status.usersEncrypted ? '🔐 Đã mã hóa' : '🔓 Chưa mã hóa'}`)
  } else if (command === 'enable') {
    enableEncryption()
  } else if (command === 'disable') {
    disableEncryption()
  } else {
    console.log('🔧 Cách sử dụng:')
    console.log('   node scripts/toggle-encryption.js status   - Xem trạng thái')
    console.log('   node scripts/toggle-encryption.js enable   - Bật mã hóa')
    console.log('   node scripts/toggle-encryption.js disable  - Tắt mã hóa')
  }
}

main()
