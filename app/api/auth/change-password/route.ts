import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const adminDataPath = path.join(process.cwd(), 'data', 'admin.json')

// Đọc dữ liệu admin từ file
function readAdminData() {
  try {
    const data = fs.readFileSync(adminDataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading admin data:', error)
    return null
  }
}

// Ghi dữ liệu admin vào file
function writeAdminData(data: any) {
  try {
    fs.writeFileSync(adminDataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing admin data:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin mật khẩu' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    // Đọc dữ liệu admin hiện tại
    const adminData = readAdminData()
    if (!adminData) {
      return NextResponse.json(
        { error: 'Không thể đọc dữ liệu admin' },
        { status: 500 }
      )
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminData.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mật khẩu hiện tại không đúng' },
        { status: 400 }
      )
    }

    // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
    const isNewPasswordSame = await bcrypt.compare(newPassword, adminData.password)
    if (isNewPasswordSame) {
      return NextResponse.json(
        { error: 'Mật khẩu mới không được trùng với mật khẩu cũ' },
        { status: 400 }
      )
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Cập nhật dữ liệu admin
    const updatedAdminData = {
      ...adminData,
      password: hashedNewPassword,
      lastPasswordChange: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHistory: [
        ...adminData.passwordHistory,
        {
          password: adminData.password,
          changedAt: adminData.lastPasswordChange
        }
      ].slice(-5) // Giữ lại 5 mật khẩu gần nhất
    }

    // Ghi dữ liệu mới
    const writeSuccess = writeAdminData(updatedAdminData)
    if (!writeSuccess) {
      return NextResponse.json(
        { error: 'Không thể lưu mật khẩu mới' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công'
    })

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi thay đổi mật khẩu' },
      { status: 500 }
    )
  }
} 