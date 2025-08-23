import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { decryptSensitiveData } from '@/lib/security'

// Đường dẫn đến file cấu hình
const PLUGIN_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'plugin-config.json')
const settingsDataPath = path.join(process.cwd(), 'data', 'settings.json')

// Lấy cấu hình Plugin đồng bộ WordPress
const getPluginConfig = () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(PLUGIN_CONFIG_FILE_PATH, 'utf8')
      const config = JSON.parse(configData)
      
      // Decrypt API key if needed
      if (config.apiKey && config.apiKey.startsWith('ENCRYPTED:')) {
        config.apiKey = decryptSensitiveData(config.apiKey.replace('ENCRYPTED:', ''))
      }
      
      return config
    }
    return null
  } catch (error) {
    console.error('Error loading Plugin config:', error)
    return null
  }
}

// Function to strip HTML tags
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  const decoded = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
  
  // Remove extra whitespace and normalize line breaks
  const cleaned = decoded
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
  
  return cleaned
}

// Lấy dữ liệu tin tức từ WordPress
async function getNewsFromWordPress(request: NextRequest) {
  try {
    const pluginConfig = getPluginConfig()
    if (!pluginConfig?.apiKey) {
      console.log('Plugin chưa được cấu hình, trả về dữ liệu rỗng')
      return []
    }

    // Lấy danh sách bài viết từ WordPress
    const response = await fetch(`${request.nextUrl.origin}/api/wordpress/posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error('Không thể lấy tin tức từ WordPress:', response.status)
      return []
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching news from WordPress:', error)
    return []
  }
}

// Tính toán thống kê từ dữ liệu tin tức
function calculateStats(newsData: any[]) {
  const totalNews = newsData.length
  const publishedNews = newsData.filter(news => news.status === 'published').length
  const draftNews = newsData.filter(news => news.status === 'draft').length
  
  // Lấy danh sách categories duy nhất
  const categories = [...new Set(newsData.map(news => news.category).filter(Boolean))]
  const totalCategories = categories.length
  
  // Tính toán thay đổi so với tháng trước (mock data cho demo)
  const lastMonthNews = Math.max(0, totalNews - 5) // Giả sử tháng trước có ít hơn 5 tin
  const lastMonthPublished = Math.max(0, publishedNews - 3)
  const lastMonthCategories = Math.max(0, totalCategories - 2)
  
  const newsChange = totalNews - lastMonthNews
  const publishedChange = publishedNews - lastMonthPublished
  const categoriesChange = totalCategories - lastMonthCategories
  
  return {
    totalNews: {
      value: totalNews.toString(),
      change: newsChange > 0 ? `+${newsChange}` : newsChange.toString(),
      trend: newsChange >= 0 ? 'up' : 'down'
    },
    publishedNews: {
      value: publishedNews.toString(),
      change: publishedChange > 0 ? `+${publishedChange}` : publishedChange.toString(),
      trend: publishedChange >= 0 ? 'up' : 'down'
    },
    totalCategories: {
      value: totalCategories.toString(),
      change: categoriesChange > 0 ? `+${categoriesChange}` : categoriesChange.toString(),
      trend: categoriesChange >= 0 ? 'up' : 'down'
    },
    systemHealth: {
      value: '100%',
      change: '+0%',
      trend: 'up'
    }
  }
}

// Lấy tin tức gần đây
function getRecentNews(newsData: any[], limit: number = 5) {
  return newsData
    .filter(news => news.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, limit)
    .map(news => ({
      id: news.id,
      title: stripHtmlTags(news.title),
      views: 0, // Mock data - có thể thêm tracking sau
      status: news.status,
      date: new Date(news.publishedAt || news.createdAt).toLocaleDateString('vi-VN'),
      author: 'Admin LTA',
      category: news.category || 'Không phân loại'
    }))
}

// Lấy hoạt động gần đây (mock data)
function getRecentActivities() {
  return [
    {
      id: 1,
      action: 'Đăng nhập hệ thống',
      user: 'Admin LTA',
      time: 'Vừa xong',
      type: 'login'
    },
    {
      id: 2,
      action: 'Tạo tin tức mới',
      user: 'Admin LTA',
      time: 'Hôm nay',
      type: 'create'
    },
    {
      id: 3,
      action: 'Cập nhật danh mục',
      user: 'Admin LTA',
      time: 'Hôm nay',
      type: 'update'
    },
    {
      id: 4,
      action: 'Xóa tin tức test',
      user: 'Admin LTA',
      time: 'Hôm nay',
      type: 'delete'
    }
  ]
}

// Tính toán dữ liệu hiệu suất theo tháng
function getPerformanceData(newsData: any[]) {
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']
  const currentMonth = new Date().getMonth() + 1 // Tháng hiện tại (1-12)
  
  return months.map((month, index) => {
    const monthNumber = index + 1
    const monthNews = newsData.filter(news => {
      const newsDate = new Date(news.createdAt)
      return newsDate.getMonth() + 1 === monthNumber
    }).length
    
    // Mock data cho categories
    const monthCategories = monthNumber === 8 ? 5 : 0 // Tháng 8 có 5 categories
    
    return {
      month,
      news: monthNews,
      categories: monthCategories
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    // Lấy dữ liệu từ WordPress
    const newsData = await getNewsFromWordPress(request)
    
    // Đọc settings từ file local (nếu có)
    let settingsData = {}
    try {
      if (fs.existsSync(settingsDataPath)) {
        const settingsContent = fs.readFileSync(settingsDataPath, 'utf-8')
        settingsData = JSON.parse(settingsContent)
      }
    } catch (error) {
      console.error('Error reading settings:', error)
    }
    
    // Tính toán thống kê
    const stats = calculateStats(newsData)
    
    // Lấy tin tức gần đây
    const recentNews = getRecentNews(newsData, 3)
    
    // Lấy hoạt động gần đây
    const recentActivities = getRecentActivities()
    
    // Lấy dữ liệu hiệu suất
    const performanceData = getPerformanceData(newsData)
    
    // Tạo response data
    const dashboardData = {
      stats: [
        {
          title: 'Tổng tin tức',
          value: stats.totalNews.value,
          change: stats.totalNews.change,
          trend: stats.totalNews.trend,
          icon: 'FileText',
          color: 'green'
        },
        {
          title: 'Tin tức đã xuất bản',
          value: stats.publishedNews.value,
          change: stats.publishedNews.change,
          trend: stats.publishedNews.trend,
          icon: 'Eye',
          color: 'blue'
        },
        {
          title: 'Danh mục tin tức',
          value: stats.totalCategories.value,
          change: stats.totalCategories.change,
          trend: stats.totalCategories.trend,
          icon: 'Target',
          color: 'purple'
        },
        {
          title: 'Hoạt động hệ thống',
          value: stats.systemHealth.value,
          change: stats.systemHealth.change,
          trend: stats.systemHealth.trend,
          icon: 'Activity',
          color: 'orange'
        }
      ],
      recentNews,
      recentActivities,
      performanceData,
      settings: settingsData
    }
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 