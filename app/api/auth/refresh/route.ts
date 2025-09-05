import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      // Session vẫn hợp lệ, trả về thông tin mới
      return NextResponse.json({
        success: true,
        session: {
          user: session.user,
          expires: session.expires
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No valid session found'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh session' 
      },
      { status: 500 }
    )
  }
} 