import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { NewsItem } from '@/lib/image-utils'

// Đường dẫn đến file JSON lưu tin tức
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Đọc danh sách tin tức từ file
const loadNews = (): NewsItem[] => {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      return []
    }
    const data = fs.readFileSync(NEWS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

// Lưu danh sách tin tức
function saveNews(news: NewsItem[]) {
  try {
    // Đảm bảo thư mục data tồn tại
    const dataDir = path.dirname(NEWS_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2))
  } catch (error) {
    console.error('Error saving news:', error)
    throw error
  }
}

// Lấy cấu hình WordPress từ file
const getWordPressConfig = () => {
  try {
    const configPath = path.join(process.cwd(), 'data', 'wordpress-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(configData)
    }
    return null
  } catch (error) {
    console.error('Error loading WordPress config:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const news = loadNews()
    
    // Tìm tin tức theo ID hoặc slug
    const foundNews = news.find(item => 
      item.id === id || item.slug === id
    )

    if (!foundNews) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: foundNews
    })
  } catch (error) {
    console.error('Error getting news by ID:', error)
    return NextResponse.json(
      { error: 'Không thể lấy tin tức' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const news = loadNews()
    const newsIndex = news.findIndex(item => item.id === id)
    
    if (newsIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      )
    }

    // Cập nhật tin tức - giữ nguyên ID và các trường quan trọng
    const updatedNews = {
      ...news[newsIndex], // Giữ nguyên tất cả dữ liệu cũ
      ...body, // Cập nhật với dữ liệu mới
      id: news[newsIndex].id, // Đảm bảo ID không bị thay đổi
      wordpressId: news[newsIndex].wordpressId, // Giữ nguyên WordPress ID
      syncedToWordPress: news[newsIndex].syncedToWordPress, // Giữ nguyên trạng thái sync
      createdAt: news[newsIndex].createdAt, // Giữ nguyên ngày tạo
      updatedAt: new Date().toISOString() // Cập nhật ngày sửa
    }

    news[newsIndex] = updatedNews

    // Lưu vào file
    saveNews(news)

    // Tự động đồng bộ lên WordPress nếu có cấu hình và tin tức đã được sync trước đó
    try {
      const wordpressConfig = getWordPressConfig()
      if (wordpressConfig && wordpressConfig.isConnected && wordpressConfig.autoPublish && updatedNews.wordpressId) {
        console.log('🔄 Auto-syncing updated news to WordPress...')
        
        // Chuẩn bị dữ liệu để sync
        const syncData = {
          id: updatedNews.wordpressId, // ID của bài viết trên WordPress
          title: updatedNews.title,
          content: updatedNews.content,
          excerpt: updatedNews.excerpt,
          status: updatedNews.status === 'published' ? 'publish' : 'draft',
          categories: updatedNews.category ? [updatedNews.category] : [],
          tags: updatedNews.tags ? updatedNews.tags.split(',').map((tag: string) => tag.trim()) : [],
          meta: {
            meta_title: updatedNews.metaTitle,
            meta_description: updatedNews.metaDescription
          }
        }

        // Sử dụng multi-method sync để cập nhật bài viết
        const syncResponse = await fetch(`${request.nextUrl.origin}/api/wordpress/sync-multi-method`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncData)
        })

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json()
          if (syncResult.success) {
            // Cập nhật trạng thái sync
            updatedNews.lastSyncDate = new Date().toISOString()
            
            // Lưu lại với thông tin sync
            const currentNews = loadNews()
            const currentNewsIndex = currentNews.findIndex(item => item.id === id)
            if (currentNewsIndex !== -1) {
              currentNews[currentNewsIndex] = updatedNews
              saveNews(currentNews)
            }
            
            console.log('✅ Auto-sync update to WordPress successful')
          } else {
            console.log('⚠️ Auto-sync update to WordPress failed:', syncResult.error)
          }
        } else {
          console.log('⚠️ Auto-sync update to WordPress failed:', syncResponse.status)
        }
      } else {
        console.log('ℹ️ Auto-sync disabled, WordPress not connected, or news not synced before')
      }
    } catch (syncError) {
      console.error('❌ Error during auto-sync update:', syncError)
      // Không làm gián đoạn việc cập nhật tin tức nếu sync thất bại
    }

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được cập nhật thành công',
      data: updatedNews
    })
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật tin tức' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const news = loadNews()
    const newsIndex = news.findIndex(item => item.id === id)
    
    if (newsIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      )
    }

    // Cập nhật một phần tin tức
    const updatedNews = {
      ...news[newsIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    news[newsIndex] = updatedNews

    // Lưu vào file
    saveNews(news)

    // Tự động đồng bộ lên WordPress nếu có cấu hình và tin tức đã được sync trước đó
    try {
      const wordpressConfig = getWordPressConfig()
      if (wordpressConfig && wordpressConfig.isConnected && wordpressConfig.autoPublish && updatedNews.wordpressId) {
        console.log('🔄 Auto-syncing patched news to WordPress...')
        
        // Chuẩn bị dữ liệu để sync (chỉ những trường đã thay đổi)
        const syncData: any = {
          id: updatedNews.wordpressId // ID của bài viết trên WordPress
        }

        // Chỉ sync những trường đã thay đổi
        if (body.title !== undefined) syncData.title = updatedNews.title
        if (body.content !== undefined) syncData.content = updatedNews.content
        if (body.excerpt !== undefined) syncData.excerpt = updatedNews.excerpt
        if (body.status !== undefined) syncData.status = updatedNews.status === 'published' ? 'publish' : 'draft'
        if (body.category !== undefined) syncData.categories = updatedNews.category ? [updatedNews.category] : []
        if (body.tags !== undefined) syncData.tags = updatedNews.tags ? updatedNews.tags.split(',').map((tag: string) => tag.trim()) : []
        if (body.metaTitle !== undefined || body.metaDescription !== undefined) {
          syncData.meta = {
            meta_title: updatedNews.metaTitle,
            meta_description: updatedNews.metaDescription
          }
        }

        // Chỉ sync nếu có thay đổi thực sự
        if (Object.keys(syncData).length > 1) { // > 1 vì luôn có id
          const syncResponse = await fetch(`${request.nextUrl.origin}/api/wordpress/sync-multi-method`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(syncData)
          })

          if (syncResponse.ok) {
            const syncResult = await syncResponse.json()
            if (syncResult.success) {
              // Cập nhật trạng thái sync
              updatedNews.lastSyncDate = new Date().toISOString()
              
              // Lưu lại với thông tin sync
              const currentNews = loadNews()
              const currentNewsIndex = currentNews.findIndex(item => item.id === id)
              if (currentNewsIndex !== -1) {
                currentNews[currentNewsIndex] = updatedNews
                saveNews(currentNews)
              }
              
              console.log('✅ Auto-sync patch to WordPress successful')
            } else {
              console.log('⚠️ Auto-sync patch to WordPress failed:', syncResult.error)
            }
          } else {
            console.log('⚠️ Auto-sync patch to WordPress failed:', syncResponse.status)
          }
        } else {
          console.log('ℹ️ No changes detected, skipping WordPress sync')
        }
      } else {
        console.log('ℹ️ Auto-sync disabled, WordPress not connected, or news not synced before')
      }
    } catch (syncError) {
      console.error('❌ Error during auto-sync patch:', syncError)
      // Không làm gián đoạn việc cập nhật tin tức nếu sync thất bại
    }

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được cập nhật thành công',
      data: updatedNews
    })
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật tin tức' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    console.log('🗑️ DELETE request received for ID:', id)
    console.log('🗑️ Looking for news with ID:', id)
    
    const news = loadNews()
    console.log('🗑️ Loaded news count:', news.length)
    
    const newsIndex = news.findIndex(item => item.id === id)
    console.log('🗑️ Found news at index:', newsIndex)
    
    if (newsIndex === -1) {
      console.log('❌ News not found with ID:', id)
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      )
    }

    // Lấy thông tin tin tức trước khi xóa
    const newsToDelete = news[newsIndex]
    console.log('🗑️ Deleting news:', newsToDelete.title)

    // Lưu backup trước khi xóa nếu có hình ảnh
    if (newsToDelete.featuredImage || newsToDelete.image || 
        (newsToDelete.additionalImages && newsToDelete.additionalImages.length > 0) ||
        (newsToDelete.relatedImages && newsToDelete.relatedImages.length > 0)) {
      try {
        const backupPath = path.join(process.cwd(), 'data', 'deleted-news-backup.json')
        let backup = []
        if (fs.existsSync(backupPath)) {
          backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
        }
        backup.push({
          ...newsToDelete,
          deletedAt: new Date().toISOString()
        })
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
        console.log('✅ Backup saved for deleted news with images')
      } catch (error) {
        console.log('⚠️ Failed to save backup:', error)
      }
    }

    // Xóa tin tức
    const deletedNews = news.splice(newsIndex, 1)[0]
    console.log('🗑️ Deleted news:', deletedNews.title)

    // Lưu vào file
    saveNews(news)
    console.log('✅ News file updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Tin tức đã được xóa thành công',
      data: deletedNews
    })
  } catch (error) {
    console.error('❌ Error deleting news:', error)
    return NextResponse.json(
      { error: 'Không thể xóa tin tức' },
      { status: 500 }
    )
  }
} 