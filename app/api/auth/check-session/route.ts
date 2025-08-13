import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json({
        valid: true,
        user: session.user,
        expires: session.expires
      })
    } else {
      return NextResponse.json({
        valid: false,
        message: 'No valid session found'
      })
    }
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Failed to check session' 
      },
      { status: 500 }
    )
  }
} 