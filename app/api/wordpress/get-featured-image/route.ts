import { NextRequest, NextResponse } from 'next/server'
import { getWordPressConfig } from '@/lib/wordpress-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Thiếu postId' },
        { status: 400 }
      )
    }

    const config = getWordPressConfig()
    if (!config || !config.siteUrl || !config.username || !config.applicationPassword) {
      return NextResponse.json(
        { error: 'Chưa cấu hình WordPress' },
        { status: 400 }
      )
    }

    const credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
    const siteUrl = config.siteUrl.replace(/\/$/, '')

    // Lấy post để có featured_media ID
    const postUrl = `${siteUrl}/wp-json/wp/v2/posts/${postId}`
    const postResponse = await fetch(postUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!postResponse.ok) {
      return NextResponse.json(
        { error: 'Không tìm thấy post' },
        { status: 404 }
      )
    }

    const post = await postResponse.json()
    const featuredMediaId = post.featured_media

    if (!featuredMediaId) {
      return NextResponse.json(
        { featuredImage: '' },
        { status: 200 }
      )
    }

    // Lấy thông tin media
    const mediaUrl = `${siteUrl}/wp-json/wp/v2/media/${featuredMediaId}`
    const mediaResponse = await fetch(mediaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!mediaResponse.ok) {
      return NextResponse.json(
        { featuredImage: '' },
        { status: 200 }
      )
    }

    const media = await mediaResponse.json()
    const featuredImage = media.source_url || media.guid?.rendered || ''

    return NextResponse.json({
      featuredImage,
      mediaDetails: {
        id: media.id,
        title: media.title?.rendered,
        alt: media.alt_text,
        sizes: media.media_details?.sizes
      }
    })

  } catch (error) {
    console.error('Error getting featured image:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy featured image' },
      { status: 500 }
    )
  }
}
