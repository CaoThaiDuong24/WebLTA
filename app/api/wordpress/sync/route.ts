import { NextRequest, NextResponse } from 'next/server'
import { WordPressAPI, SyncOptions } from '@/lib/wordpress'

export async function POST(request: NextRequest) {
  try {
    const { config, syncOptions, localPosts } = await request.json()
    
    const { siteUrl, username, applicationPassword } = config
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    const wpAPI = new WordPressAPI(config)
    const options: SyncOptions = {
      syncDirection: syncOptions?.syncDirection || 'both',
      syncImages: syncOptions?.syncImages ?? true,
      syncCategories: syncOptions?.syncCategories ?? true,
      syncTags: syncOptions?.syncTags ?? true,
      lastSyncDate: syncOptions?.lastSyncDate
    }

    const results: any = {
      fromWordPress: [],
      toWordPress: [],
      summary: {
        totalFromWordPress: 0,
        totalToWordPress: 0,
        successFromWordPress: 0,
        successToWordPress: 0,
        errors: []
      }
    }

    // Đồng bộ từ WordPress về Admin
    if (options.syncDirection === 'from-wordpress' || options.syncDirection === 'both') {
      try {
        const wordpressPosts = await wpAPI.syncFromWordPress(options)
        results.fromWordPress = wordpressPosts
        results.summary.totalFromWordPress = wordpressPosts.length
        results.summary.successFromWordPress = wordpressPosts.length
      } catch (error) {
        results.summary.errors.push({
          direction: 'from-wordpress',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Đồng bộ từ Admin lên WordPress
    if ((options.syncDirection === 'to-wordpress' || options.syncDirection === 'both') && localPosts) {
      try {
        const syncResults = await wpAPI.syncToWordPress(localPosts, options)
        results.toWordPress = syncResults
        results.summary.totalToWordPress = syncResults.length
        results.summary.successToWordPress = syncResults.filter(r => r.success).length
        
        // Thêm lỗi vào summary
        const errors = syncResults.filter(r => !r.success)
        results.summary.errors.push(...errors.map(e => ({
          direction: 'to-wordpress',
          localId: e.localId,
          title: e.title,
          error: e.error
        })))
      } catch (error) {
        results.summary.errors.push({
          direction: 'to-wordpress',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Cập nhật lastSyncDate
    const newLastSyncDate = new Date().toISOString()

    return NextResponse.json({
      success: true,
      results,
      lastSyncDate: newLastSyncDate
    })

  } catch (error) {
    console.error('WordPress sync error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi đồng bộ dữ liệu với WordPress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configParam = searchParams.get('config')
    
    if (!configParam) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình' },
        { status: 400 }
      )
    }

    const config = JSON.parse(decodeURIComponent(configParam))
    const { siteUrl, username, applicationPassword } = config
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    const wpAPI = new WordPressAPI(config)
    
    // Lấy thống kê từ WordPress
    const posts = await wpAPI.getPosts({ per_page: 1 })
    const categories = await wpAPI.getCategories()
    const tags = await wpAPI.getTags()

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts: posts.length > 0 ? posts[0]._links?.collection?.[0]?.href?.match(/total=(\d+)/)?.[1] || 'Unknown' : 0,
        totalCategories: categories.length,
        totalTags: tags.length,
        lastSync: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('WordPress stats error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy thống kê từ WordPress' },
      { status: 500 }
    )
  }
} 