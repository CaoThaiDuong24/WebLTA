import fs from 'fs'
import path from 'path'

export interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  category: string
  tags: string
  featuredImage: string
  imageAlt: string
  wordpressId?: number
  author: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  additionalImages?: string[]
  syncedToWordPress?: boolean
}

const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

export function loadNews(): NewsItem[] {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      console.log('📁 News file not found, creating empty file')
      fs.writeFileSync(NEWS_FILE_PATH, '[]', 'utf-8')
      return []
    }

    const fileContent = fs.readFileSync(NEWS_FILE_PATH, 'utf-8')
    const news = JSON.parse(fileContent)
    
    console.log(`📰 Loaded ${news.length} news items from file`)
    return Array.isArray(news) ? news : []
  } catch (error) {
    console.error('❌ Error loading news:', error)
    return []
  }
}

export function saveNews(news: NewsItem[]): void {
  try {
    // Đảm bảo thư mục data tồn tại
    const dataDir = path.dirname(NEWS_FILE_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Lưu tin tức vào file
    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2), 'utf-8')
    console.log(`💾 Saved ${news.length} news items to file`)
  } catch (error) {
    console.error('❌ Error saving news:', error)
    throw new Error('Không thể lưu tin tức')
  }
}

export function getNewsById(id: string): NewsItem | null {
  const news = loadNews()
  return news.find(item => item.id === id) || null
}

export function getNewsBySlug(slug: string): NewsItem | null {
  const news = loadNews()
  return news.find(item => item.slug === slug) || null
}

export function createNews(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>): NewsItem {
  const news = loadNews()
  
  const newNews: NewsItem = {
    ...newsData,
    id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: newsData.status === 'published' ? new Date().toISOString() : ''
  }

  news.push(newNews)
  saveNews(news)
  
  console.log(`➕ Created new news: ${newNews.title}`)
  return newNews
}

export function updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
  const news = loadNews()
  const index = news.findIndex(item => item.id === id)
  
  if (index === -1) {
    console.log(`❌ News with ID ${id} not found`)
    return null
  }

  news[index] = {
    ...news[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveNews(news)
  
  console.log(`🔄 Updated news: ${news[index].title}`)
  return news[index]
}

export function deleteNews(id: string): boolean {
  const news = loadNews()
  const index = news.findIndex(item => item.id === id)
  
  if (index === -1) {
    console.log(`❌ News with ID ${id} not found`)
    return false
  }

  const deletedNews = news.splice(index, 1)[0]
  saveNews(news)
  
  console.log(`🗑️ Deleted news: ${deletedNews.title}`)
  return true
}

export function getPublishedNews(): NewsItem[] {
  const news = loadNews()
  return news.filter(item => item.status === 'published')
}

export function getFeaturedNews(): NewsItem[] {
  const news = loadNews()
  return news.filter(item => item.featured && item.status === 'published')
}
