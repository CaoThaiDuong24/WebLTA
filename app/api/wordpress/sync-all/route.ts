import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')
const NEWS_DATA_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Lấy cấu hình WordPress
const getWordPressConfig = () => {
  try {
    if (fs.existsSync(WORDPRESS_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(WORDPRESS_CONFIG_FILE_PATH, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading WordPress config:', error)
    return null
  }
}

// Lấy dữ liệu tin tức từ local
const getLocalNews = () => {
  try {
    if (fs.existsSync(NEWS_DATA_FILE_PATH)) {
      const newsData = fs.readFileSync(NEWS_DATA_FILE_PATH, 'utf8')
      return JSON.parse(newsData)
    }
    return []
  } catch (error) {
    console.error('Error loading local news:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 WordPress sync-all API called')

    // Lấy WordPress config
    const wordpressConfig = getWordPressConfig()
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress chưa được cấu hình' },
        { status: 400 }
      )
    }

    const { siteUrl, username, applicationPassword } = wordpressConfig
    
    if (!siteUrl || !username || !applicationPassword) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cấu hình WordPress' },
        { status: 400 }
      )
    }

    // Lấy tin tức từ local
    const localNews = getLocalNews()
    console.log(`📋 Found ${localNews.length} local news items`)

    if (localNews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có tin tức nào để đồng bộ',
        syncedCount: 0,
        failedCount: 0
      })
    }

    // Lọc tin tức chưa được sync
    const unsyncedNews = localNews.filter((news: any) => !news.syncedToWordPress)
    console.log(`📤 Found ${unsyncedNews.length} unsynced news items`)

    if (unsyncedNews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tất cả tin tức đã được đồng bộ',
        syncedCount: 0,
        failedCount: 0
      })
    }

    // Tạo Basic Auth header
    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64')
    
    let syncedCount = 0
    let failedCount = 0
    const results = []

    // Đồng bộ từng tin tức
    for (const news of unsyncedNews) {
      try {
        console.log(`🔄 Syncing news: ${news.title}`)

        // Chuẩn bị dữ liệu bài viết
        const postPayload: any = {
          title: news.title,
          content: news.content,
          status: news.status === 'published' ? 'publish' : 'draft'
        }

        // Thêm excerpt nếu có
        if (news.excerpt) {
          postPayload.excerpt = news.excerpt
        }

        // Thêm categories nếu có
        if (news.category) {
          postPayload.categories = [news.category]
        }

        // Thêm tags nếu có
        if (news.tags && Array.isArray(news.tags)) {
          postPayload.tags = news.tags
        }

        // Thêm featured image nếu có
        if (news.featuredImage) {
          const featuredMediaId = parseInt(news.featuredImage.toString())
          if (!isNaN(featuredMediaId)) {
            postPayload.featured_media = featuredMediaId
          }
        }

        console.log(`📤 Publishing to WordPress: ${news.title}`)

        // Thử publish qua REST API
        const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postPayload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ WordPress API error for "${news.title}":`, errorText)
          
          // Nếu REST API bị hạn chế, thử fallback method
          if (response.status === 401 || response.status === 403) {
            console.log(`🔄 Trying fallback method for "${news.title}"...`)
            
            try {
              const fallbackResponse = await fetch('/api/wordpress/publish-post-fallback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(news),
              })
              
              const fallbackResult = await fallbackResponse.json()
              
              if (fallbackResult.success) {
                console.log(`✅ Fallback success for "${news.title}"`)
                syncedCount++
                results.push({
                  id: news.id,
                  title: news.title,
                  status: 'success',
                  method: 'fallback',
                  data: fallbackResult.data
                })
                
                // Cập nhật trạng thái sync trong local
                await updateNewsSyncStatus(news.id, true, fallbackResult.data.id)
              } else {
                console.log(`❌ Fallback failed for "${news.title}"`)
                failedCount++
                results.push({
                  id: news.id,
                  title: news.title,
                  status: 'failed',
                  error: fallbackResult.error
                })
              }
            } catch (fallbackError) {
              console.error(`❌ Fallback error for "${news.title}":`, fallbackError)
              failedCount++
              results.push({
                id: news.id,
                title: news.title,
                status: 'failed',
                error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
              })
            }
          } else {
            failedCount++
            results.push({
              id: news.id,
              title: news.title,
              status: 'failed',
              error: `WordPress API error: ${response.status} ${response.statusText}`
            })
          }
        } else {
          const result = await response.json()
          console.log(`✅ WordPress success for "${news.title}"`)
          syncedCount++
          results.push({
            id: news.id,
            title: news.title,
            status: 'success',
            method: 'rest-api',
            data: {
              id: result.id,
              title: result.title?.rendered || news.title,
              link: result.link,
              status: result.status,
              date: result.date,
              slug: result.slug
            }
          })
          
          // Cập nhật trạng thái sync trong local
          await updateNewsSyncStatus(news.id, true, result.id)
        }

      } catch (error) {
        console.error(`❌ Error syncing "${news.title}":`, error)
        failedCount++
        results.push({
          id: news.id,
          title: news.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`📊 Sync completed: ${syncedCount} success, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Đồng bộ hoàn tất: ${syncedCount} thành công, ${failedCount} thất bại`,
      syncedCount,
      failedCount,
      results
    })

  } catch (error) {
    console.error('WordPress sync-all error:', error)
    return NextResponse.json(
      { error: `Lỗi khi đồng bộ lên WordPress: ${error}` },
      { status: 500 }
    )
  }
}

// Cập nhật trạng thái sync trong local news
async function updateNewsSyncStatus(newsId: string, synced: boolean, wordpressId?: number) {
  try {
    const response = await fetch(`/api/news/${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncedToWordPress: synced,
        wordpressId: wordpressId,
        lastSyncDate: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      console.error(`Failed to update sync status for news ${newsId}`)
    }
  } catch (error) {
    console.error(`Error updating sync status for news ${newsId}:`, error)
  }
} 