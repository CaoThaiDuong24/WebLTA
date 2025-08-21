import { NextRequest, NextResponse } from 'next/server'
import { getWpDbPool, getWpTablePrefix } from '@/lib/wp-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email/username là bắt buộc'
      }, { status: 400 })
    }

    console.log('🔍 Checking user in database:', email)
    
    const pool = getWpDbPool()
    const prefix = getWpTablePrefix()
    
    // Tìm user bằng email hoặc username
    const [users]: any = await pool.query(
      `SELECT ID, user_login, user_email, user_pass, display_name 
       FROM ${prefix}users 
       WHERE user_email = ? OR user_login = ? 
       LIMIT 1`,
      [email, email]
    )
    
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0]
      return NextResponse.json({
        success: true,
        user: {
          id: user.ID,
          login: user.user_login,
          email: user.user_email,
          displayName: user.display_name,
          hasPassword: !!user.user_pass,
          passwordLength: user.user_pass?.length || 0
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'User not found in database',
        searchedFor: email
      })
    }
    
  } catch (error: any) {
    console.error('❌ Check user DB error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error',
      details: error.message
    }, { status: 500 })
  }
}
