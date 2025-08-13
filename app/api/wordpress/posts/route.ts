import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { WordPressAPI } from '@/lib/wordpress'

const WORDPRESS_CONFIG_FILE_PATH = path.join(process.cwd(), 'data', 'wordpress-config.json')

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

export async function GET(request: NextRequest) {
  try {
    const wordpressConfig = getWordPressConfig()
    
    if (!wordpressConfig) {
      return NextResponse.json(
        { error: 'WordPress config not found' },
        { status: 404 }
      )
    }

    if (!wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.applicationPassword) {
      return NextResponse.json(
        { error: 'WordPress config incomplete' },
        { status: 400 }
      )
    }

    const wpAPI = new WordPressAPI(wordpressConfig)
    const posts = await wpAPI.getPosts({ per_page: 10 })

    return NextResponse.json({
      success: true,
      posts: posts,
      count: posts.length
    })

  } catch (error) {
    console.error('Error getting WordPress posts:', error)
    return NextResponse.json(
      { error: 'Failed to get WordPress posts' },
      { status: 500 }
    )
  }
} 