export interface WordPressConfig {
  siteUrl: string
  username: string
  applicationPassword: string
  isConnected: boolean
  password?: string
  autoPublish?: boolean
  defaultCategory?: string
  defaultTags?: string[]
  featuredImageEnabled?: boolean
  excerptLength?: number
  status?: 'draft' | 'publish' | 'private'
}

export interface WordPressPost {
  title: string
  content: string
  excerpt?: string
  featuredImage?: string
  categories?: number[]
  tags?: string[]
  status?: 'draft' | 'publish' | 'private'
}

export interface WordPressPostResponse {
  id: number
  date: string
  date_gmt: string
  guid: { rendered: string }
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: any[]
  _links: any
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number
      source_url: string
      alt_text: string
    }>
    'wp:term'?: Array<{
      id: number
      taxonomy: string
      embeddable: boolean
      href: string
    }>
  }
}

export interface SyncOptions {
  syncDirection: 'to-wordpress' | 'from-wordpress' | 'both'
  syncImages: boolean
  syncCategories: boolean
  syncTags: boolean
  lastSyncDate?: string
}

export class WordPressAPI {
  private config: WordPressConfig
  private credentials: string

  constructor(config: WordPressConfig) {
    this.config = config
    this.credentials = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')
  }

  private getBaseUrl(): string {
    return this.config.siteUrl.replace(/\/$/, '')
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.getBaseUrl()}/wp-json/wp/v2/${endpoint}`
    
    const defaultHeaders = {
      'Authorization': `Basic ${this.credentials}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async testConnection(): Promise<{ success: boolean; user?: any; categories?: any[] }> {
    try {
      const user = await this.makeRequest('users/me')
      const categories = await this.makeRequest('categories')
      
      return {
        success: true,
        user,
        categories: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }))
      }
    } catch (error) {
      return {
        success: false
      }
    }
  }

  async createPost(postData: WordPressPost) {
    const payload: any = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.substring(0, this.config.excerptLength || 150),
      status: (this.config.autoPublish ? 'publish' : (postData.status || this.config.status || 'draft')),
      categories: postData.categories || (this.config.defaultCategory ? [parseInt(this.config.defaultCategory)] : []),
      tags: postData.tags || this.config.defaultTags || []
    }

    // Handle featured image if enabled
    if (postData.featuredImage) {
      try {
        // Nếu featuredImage là URL, upload lên WordPress
        if (postData.featuredImage.startsWith('http')) {
          const mediaId = await this.uploadMedia(postData.featuredImage)
          payload.featured_media = mediaId
        } else if (postData.featuredImage.startsWith('data:')) {
          // Nếu là base64, bỏ qua vì không thể upload trực tiếp
          console.log('Skipping base64 image for WordPress upload')
        } else {
          // Nếu là media ID, sử dụng trực tiếp
          payload.featured_media = parseInt(postData.featuredImage)
        }
      } catch (error) {
        console.error('Error handling featured image:', error)
      }
    }

    return this.makeRequest('posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async uploadMedia(imageUrl: string): Promise<number> {
    try {
      // Download image from URL
      const imageResponse = await fetch(imageUrl)
      const imageBlob = await imageResponse.blob()
      
      // Create FormData
      const formData = new FormData()
      formData.append('file', imageBlob, 'featured-image.jpg')
      
      const url = `${this.getBaseUrl()}/wp-json/wp/v2/media`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Media upload failed: ${response.status}`)
      }

      const mediaData = await response.json()
      return mediaData.id
    } catch (error) {
      throw new Error(`Failed to upload media: ${error}`)
    }
  }

  async uploadMediaFile(file: File): Promise<any> {
    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      
      const url = `${this.getBaseUrl()}/wp-json/wp/v2/media`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Media upload failed: ${response.status} ${response.statusText}`)
      }

      const mediaData = await response.json()
      return mediaData
    } catch (error) {
      throw new Error(`Failed to upload media: ${error}`)
    }
  }

  async getCategories() {
    return this.makeRequest('categories')
  }

  async getTags() {
    return this.makeRequest('tags')
  }

  async getPosts(params: { per_page?: number; page?: number; status?: string; after?: string } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    // Thêm _embed để lấy thông tin media và terms
    queryParams.append('_embed', '1')
    
    const endpoint = `posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint) as Promise<WordPressPostResponse[]>
  }

  async getPost(postId: number): Promise<WordPressPostResponse> {
    return this.makeRequest(`posts/${postId}?_embed=1`) as Promise<WordPressPostResponse>
  }

  async syncFromWordPress(options: SyncOptions = { syncDirection: 'from-wordpress', syncImages: true, syncCategories: true, syncTags: true }) {
    const params: any = { per_page: 100 }
    
    if (options.lastSyncDate) {
      params.after = options.lastSyncDate
    }
    
    const posts = await this.getPosts(params)
    
    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      content: post.content.rendered,
      excerpt: post.excerpt.rendered,
      slug: post.slug,
      status: post.status,
      date: post.date,
      modified: post.modified,
      link: post.link,
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      categories: post._embedded?.['wp:term']?.filter(term => term.taxonomy === 'category').map(term => term.id) || [],
      tags: post._embedded?.['wp:term']?.filter(term => term.taxonomy === 'post_tag').map(term => term.id) || []
    }))
  }

  async syncToWordPress(localPosts: any[], options: SyncOptions = { syncDirection: 'to-wordpress', syncImages: true, syncCategories: true, syncTags: true }) {
    const results = []
    
    for (const post of localPosts) {
      try {
        const result = await this.createPost({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: options.syncImages ? post.featuredImage : undefined,
          categories: options.syncCategories ? post.categories : undefined,
          tags: options.syncTags ? post.tags : undefined,
          status: post.status
        })
        
        results.push({
          success: true,
          localId: post.id,
          wordpressId: result.id,
          title: post.title
        })
      } catch (error) {
        results.push({
          success: false,
          localId: post.id,
          title: post.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  }

  async updatePost(postId: number, postData: Partial<WordPressPost>) {
    return this.makeRequest(`posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  async deletePost(postId: number) {
    return this.makeRequest(`posts/${postId}`, {
      method: 'DELETE'
    })
  }

  async searchPosts(searchTerm: string) {
    const queryParams = new URLSearchParams({
      search: searchTerm,
      per_page: '10'
    })
    
    const endpoint = `posts?${queryParams.toString()}`
    return this.makeRequest(endpoint) as Promise<WordPressPostResponse[]>
  }
}

// Utility functions
export function validateWordPressConfig(config: Partial<WordPressConfig>): string[] {
  const errors: string[] = []
  
  if (!config.siteUrl) {
    errors.push('WordPress site URL is required')
  } else if (!config.siteUrl.startsWith('http')) {
    errors.push('WordPress site URL must start with http:// or https://')
  }
  
  if (!config.username) {
    errors.push('WordPress username is required')
  }
  
  if (!config.applicationPassword) {
    errors.push('WordPress application password is required')
  }
  
  return errors
}

export function getWordPressConfig(): WordPressConfig | null {
  if (typeof window === 'undefined') return null
  
  const savedConfig = localStorage.getItem('wordpress-config')
  if (!savedConfig) return null
  
  try {
    return JSON.parse(savedConfig)
  } catch (error) {
    console.error('Error parsing WordPress config:', error)
    return null
  }
}

export function saveWordPressConfig(config: WordPressConfig): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('wordpress-config', JSON.stringify(config))
}

export function clearWordPressConfig(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('wordpress-config')
} 