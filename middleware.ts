import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Chỉ áp dụng cho admin routes (trừ login và API)
  // Loại trừ trang tin tức public và các trang public khác
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname !== '/admin/login' &&
      !request.nextUrl.pathname.startsWith('/admin/api') &&
      !request.nextUrl.pathname.startsWith('/tin-tuc') &&
      !request.nextUrl.pathname.startsWith('/chinh-sach-faq')) {
    
    // Kiểm tra session token - ưu tiên session token trước
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token') ||
                        request.cookies.get('__Host-next-auth.session-token')
    
    // Nếu có session token, cho phép truy cập
    if (sessionToken) {
      return NextResponse.next()
    }
    
    // Kiểm tra JWT token như fallback
    const jwtToken = request.cookies.get('next-auth.jwt-token') ||
                     request.cookies.get('__Secure-next-auth.jwt-token')
    
    if (jwtToken) {
      return NextResponse.next()
    }
    
    // Kiểm tra CSRF token như một indicator khác
    const csrfToken = request.cookies.get('next-auth.csrf-token') ||
                      request.cookies.get('__Host-next-auth.csrf-token')
    
    if (csrfToken) {
      return NextResponse.next()
    }
    
    // Kiểm tra bất kỳ NextAuth cookie nào
    const hasNextAuthCookie = request.cookies.getAll().some(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('__Secure-next-auth') ||
      cookie.name.includes('__Host-next-auth')
    )
    
    if (hasNextAuthCookie) {
      return NextResponse.next()
    }
    
    // Nếu không có token nào, redirect về trang login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 