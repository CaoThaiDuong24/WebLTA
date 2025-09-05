import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Checking WordPress user permissions')
    const body = await request.json()
    const { siteUrl, username, applicationPassword } = body

    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    // Tạo Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')

    try {
      // Kiểm tra quyền user bằng cách lấy thông tin user
      const userResponse = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('User check response status:', userResponse.status)

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('User check error:', errorText)
        return NextResponse.json(
          { error: `Không thể xác thực user: ${userResponse.status} ${userResponse.statusText}` },
          { status: 401 }
        )
      }

      const userData = await userResponse.json()
      console.log('User data:', userData)

      // Kiểm tra capabilities
      const capabilities = userData.capabilities || {}
      const canEditPosts = capabilities.edit_posts || false
      const canPublishPosts = capabilities.publish_posts || false
      const canEditPages = capabilities.edit_pages || false
      const canPublishPages = capabilities.publish_pages || false

      // Kiểm tra roles
      const roles = userData.roles || []
      const hasEditorRole = roles.includes('editor')
      const hasAdminRole = roles.includes('administrator')

      const permissions = {
        canEditPosts,
        canPublishPosts,
        canEditPages,
        canPublishPages,
        hasEditorRole,
        hasAdminRole,
        roles,
        capabilities
      }

      console.log('User permissions:', permissions)

      // Kiểm tra xem user có thể tạo bài viết không
      if (!canEditPosts && !canPublishPosts) {
        return NextResponse.json({
          success: false,
          error: 'User không có quyền tạo bài viết',
          message: 'User phải có quyền Editor hoặc Administrator để tạo bài viết',
          user: {
            id: userData.id,
            name: userData.name,
            username: userData.slug,
            email: userData.email
          },
          permissions
        }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        message: 'User có quyền tạo bài viết',
        user: {
          id: userData.id,
          name: userData.name,
          username: userData.slug,
          email: userData.email
        },
        permissions
      })

    } catch (error) {
      console.error('Error checking user permissions:', error)
      return NextResponse.json(
        { error: `Lỗi khi kiểm tra quyền user: ${error}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('WordPress user permissions check error:', error)
    return NextResponse.json(
      { error: `Lỗi server: ${error}` },
      { status: 500 }
    )
  }
} 