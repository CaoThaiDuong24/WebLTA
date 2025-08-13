export interface CacheConfig {
  enabled: boolean
  ttl: number // seconds
  maxSize: number // MB
  storageType: 'memory' | 'redis' | 'file'
  redisConfig?: {
    host: string
    port: number
    password?: string
    db: number
  }
}

export interface CacheItem {
  key: string
  value: any
  timestamp: number
  ttl: number
  size: number
}

export class WordPressCache {
  public config: CacheConfig
  private cache: Map<string, CacheItem> = new Map()
  private redisClient?: any

  constructor(config: CacheConfig) {
    this.config = config
    this.initializeCache()
  }

  private async initializeCache(): Promise<void> {
    if (this.config.storageType === 'redis' && this.config.redisConfig) {
      try {
        // Trong thực tế, bạn sẽ sử dụng Redis client
        // this.redisClient = new Redis(this.config.redisConfig)
        console.log('Redis cache initialized')
      } catch (error) {
        console.error('Failed to initialize Redis cache:', error)
        this.config.storageType = 'memory'
      }
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.config.storageType === 'redis' && this.redisClient) {
        return await this.getFromRedis(key)
      } else {
        return this.getFromMemory(key)
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const item: CacheItem = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
        size: this.calculateSize(value)
      }

      if (this.config.storageType === 'redis' && this.redisClient) {
        return await this.setToRedis(key, item)
      } else {
        return this.setToMemory(key, item)
      }
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.config.storageType === 'redis' && this.redisClient) {
        return await this.deleteFromRedis(key)
      } else {
        return this.deleteFromMemory(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.config.storageType === 'redis' && this.redisClient) {
        return await this.clearRedis()
      } else {
        return this.clearMemory()
      }
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  private getFromMemory(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  private setToMemory(key: string, item: CacheItem): boolean {
    // Check cache size limit
    if (this.getCacheSize() + item.size > this.config.maxSize * 1024 * 1024) {
      this.evictOldest()
    }

    this.cache.set(key, item)
    return true
  }

  private deleteFromMemory(key: string): boolean {
    return this.cache.delete(key)
  }

  private clearMemory(): boolean {
    this.cache.clear()
    return true
  }

  private async getFromRedis(key: string): Promise<any | null> {
    // Mock Redis implementation
    const data = await this.redisClient.get(key)
    if (!data) return null

    const item: CacheItem = JSON.parse(data)
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      await this.redisClient.del(key)
      return null
    }

    return item.value
  }

  private async setToRedis(key: string, item: CacheItem): Promise<boolean> {
    const data = JSON.stringify(item)
    await this.redisClient.setex(key, item.ttl, data)
    return true
  }

  private async deleteFromRedis(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key)
    return result > 0
  }

  private async clearRedis(): Promise<boolean> {
    await this.redisClient.flushdb()
    return true
  }

  private getCacheSize(): number {
    let totalSize = 0
    for (const item of this.cache.values()) {
      totalSize += item.size
    }
    return totalSize
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // WordPress specific cache methods
  async getWordPressPosts(page: number = 1, perPage: number = 10): Promise<any[] | null> {
    const key = `wordpress_posts_${page}_${perPage}`
    return await this.get(key)
  }

  async setWordPressPosts(posts: any[], page: number = 1, perPage: number = 10): Promise<boolean> {
    const key = `wordpress_posts_${page}_${perPage}`
    return await this.set(key, posts, 300) // Cache for 5 minutes
  }

  async getWordPressPost(postId: number): Promise<any | null> {
    const key = `wordpress_post_${postId}`
    return await this.get(key)
  }

  async setWordPressPost(post: any): Promise<boolean> {
    const key = `wordpress_post_${post.id}`
    return await this.set(key, post, 600) // Cache for 10 minutes
  }

  async getWordPressCategories(): Promise<any[] | null> {
    const key = 'wordpress_categories'
    return await this.get(key)
  }

  async setWordPressCategories(categories: any[]): Promise<boolean> {
    const key = 'wordpress_categories'
    return await this.set(key, categories, 1800) // Cache for 30 minutes
  }

  async invalidateWordPressCache(): Promise<void> {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('wordpress_')) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key)
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    const stats: CacheStats = {
      totalItems: this.cache.size,
      totalSize: this.getCacheSize(),
      hitRate: 0,
      missRate: 0,
      storageType: this.config.storageType,
      enabled: this.config.enabled
    }

    // Calculate hit/miss rates (simplified)
    const totalRequests = stats.totalItems * 2 // Mock calculation
    stats.hitRate = totalRequests > 0 ? (stats.totalItems / totalRequests) * 100 : 0
    stats.missRate = 100 - stats.hitRate

    return stats
  }
}

export interface CacheStats {
  totalItems: number
  totalSize: number
  hitRate: number
  missRate: number
  storageType: string
  enabled: boolean
}

// WordPress API with caching
export class CachedWordPressAPI {
  private wordpressAPI: any
  private cache: WordPressCache

  constructor(wordpressAPI: any, cacheConfig: CacheConfig) {
    this.wordpressAPI = wordpressAPI
    this.cache = new WordPressCache(cacheConfig)
  }

  async getPosts(params: any = {}): Promise<any[]> {
    if (!this.cache.config.enabled) {
      return await this.wordpressAPI.getPosts(params)
    }

    const cacheKey = `posts_${JSON.stringify(params)}`
    let posts = await this.cache.get(cacheKey)

    if (!posts) {
      posts = await this.wordpressAPI.getPosts(params)
      await this.cache.set(cacheKey, posts, 300) // Cache for 5 minutes
    }

    return posts
  }

  async getPost(postId: number): Promise<any> {
    if (!this.cache.config.enabled) {
      return await this.wordpressAPI.getPost(postId)
    }

    let post = await this.cache.getWordPressPost(postId)

    if (!post) {
      post = await this.wordpressAPI.getPost(postId)
      if (post) {
        await this.cache.setWordPressPost(post)
      }
    }

    return post
  }

  async getCategories(): Promise<any[]> {
    if (!this.cache.config.enabled) {
      return await this.wordpressAPI.getCategories()
    }

    let categories = await this.cache.getWordPressCategories()

    if (!categories) {
      categories = await this.wordpressAPI.getCategories()
      if (categories) {
        await this.cache.setWordPressCategories(categories)
      }
    }

    return categories || []
  }

  async createPost(postData: any): Promise<any> {
    const result = await this.wordpressAPI.createPost(postData)
    
    // Invalidate cache after creating new post
    if (result && this.cache.config.enabled) {
      await this.cache.invalidateWordPressCache()
    }

    return result
  }

  async updatePost(postId: number, postData: any): Promise<any> {
    const result = await this.wordpressAPI.updatePost(postId, postData)
    
    // Invalidate cache after updating post
    if (result && this.cache.config.enabled) {
      await this.cache.invalidateWordPressCache()
    }

    return result
  }

  async deletePost(postId: number): Promise<any> {
    const result = await this.wordpressAPI.deletePost(postId)
    
    // Invalidate cache after deleting post
    if (result && this.cache.config.enabled) {
      await this.cache.invalidateWordPressCache()
    }

    return result
  }
} 