export interface MediaSyncConfig {
  wordpressSiteUrl: string
  credentials: string
  syncOptions: {
    syncImages: boolean
    syncVideos: boolean
    syncDocuments: boolean
    maxFileSize: number // MB
    allowedExtensions: string[]
    compressImages: boolean
    resizeImages: boolean
    maxImageWidth: number
    maxImageHeight: number
  }
}

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  localPath?: string
  wordpressId?: number
  metadata?: {
    width?: number
    height?: number
    duration?: number
    thumbnail?: string
  }
}

export class WordPressMediaSync {
  private config: MediaSyncConfig

  constructor(config: MediaSyncConfig) {
    this.config = config
  }

  async syncMediaToWordPress(mediaFiles: MediaFile[]): Promise<MediaSyncResult[]> {
    const results: MediaSyncResult[] = []

    for (const file of mediaFiles) {
      try {
        // Validate file
        if (!this.validateFile(file)) {
          results.push({
            success: false,
            fileId: file.id,
            filename: file.filename,
            error: 'File không hợp lệ hoặc vượt quá kích thước cho phép'
          })
          continue
        }

        // Process file if needed
        const processedFile = await this.processFile(file)

        // Upload to WordPress
        const wordpressId = await this.uploadToWordPress(processedFile)

        results.push({
          success: true,
          fileId: file.id,
          filename: file.filename,
          wordpressId,
          wordpressUrl: `${this.config.wordpressSiteUrl}/wp-content/uploads/${file.filename}`
        })

      } catch (error) {
        results.push({
          success: false,
          fileId: file.id,
          filename: file.filename,
          error: error instanceof Error ? error.message : 'Upload thất bại'
        })
      }
    }

    return results
  }

  async syncMediaFromWordPress(): Promise<MediaFile[]> {
    try {
      const response = await fetch(`${this.config.wordpressSiteUrl}/wp-json/wp/v2/media`, {
        headers: {
          'Authorization': `Basic ${this.config.credentials}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status}`)
      }

      const mediaData = await response.json()
      
      return mediaData.map((item: any) => ({
        id: item.id.toString(),
        filename: item.media_details?.file || item.source_url.split('/').pop(),
        originalName: item.title?.rendered || item.source_url.split('/').pop(),
        mimeType: item.mime_type,
        size: item.media_details?.filesize || 0,
        url: item.source_url,
        wordpressId: item.id,
        metadata: {
          width: item.media_details?.width,
          height: item.media_details?.height,
          thumbnail: item.media_details?.sizes?.thumbnail?.source_url
        }
      }))

    } catch (error) {
      console.error('Error syncing media from WordPress:', error)
      return []
    }
  }

  private validateFile(file: MediaFile): boolean {
    // Check file size
    if (file.size > this.config.syncOptions.maxFileSize * 1024 * 1024) {
      return false
    }

    // Check file extension
    const extension = file.filename.split('.').pop()?.toLowerCase()
    if (!extension || !this.config.syncOptions.allowedExtensions.includes(extension)) {
      return false
    }

    // Check file type based on sync options
    if (file.mimeType.startsWith('image/') && !this.config.syncOptions.syncImages) {
      return false
    }

    if (file.mimeType.startsWith('video/') && !this.config.syncOptions.syncVideos) {
      return false
    }

    if (file.mimeType.startsWith('application/') && !this.config.syncOptions.syncDocuments) {
      return false
    }

    return true
  }

  private async processFile(file: MediaFile): Promise<MediaFile> {
    if (file.mimeType.startsWith('image/') && this.config.syncOptions.compressImages) {
      return await this.compressImage(file)
    }

    return file
  }

  private async compressImage(file: MediaFile): Promise<MediaFile> {
    // Implementation để compress image
    // Trong thực tế, bạn sẽ sử dụng Sharp hoặc Canvas API
    console.log(`Compressing image: ${file.filename}`)
    return file
  }

  private async uploadToWordPress(file: MediaFile): Promise<number> {
    try {
      // Download file from URL if needed
      let fileBlob: Blob
      
      if (file.localPath) {
        // Read from local path
        const fs = require('fs')
        const buffer = fs.readFileSync(file.localPath)
        fileBlob = new Blob([buffer], { type: file.mimeType })
      } else {
        // Download from URL
        const response = await fetch(file.url)
        fileBlob = await response.blob()
      }

      // Create FormData
      const formData = new FormData()
      formData.append('file', fileBlob, file.filename)

      // Upload to WordPress
      const uploadUrl = `${this.config.wordpressSiteUrl}/wp-json/wp/v2/media`
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.config.credentials}`,
        },
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const uploadResult = await uploadResponse.json()
      return uploadResult.id

    } catch (error) {
      throw new Error(`Failed to upload ${file.filename}: ${error}`)
    }
  }

  async deleteFromWordPress(wordpressId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.wordpressSiteUrl}/wp-json/wp/v2/media/${wordpressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${this.config.credentials}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting media from WordPress:', error)
      return false
    }
  }

  async getMediaStats(): Promise<MediaStats> {
    try {
      const response = await fetch(`${this.config.wordpressSiteUrl}/wp-json/wp/v2/media`, {
        headers: {
          'Authorization': `Basic ${this.config.credentials}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get media stats: ${response.status}`)
      }

      const mediaData = await response.json()
      
      const stats: MediaStats = {
        totalFiles: mediaData.length,
        totalSize: 0,
        byType: {
          images: 0,
          videos: 0,
          documents: 0,
          others: 0
        },
        recentUploads: []
      }

      mediaData.forEach((item: any) => {
        const size = item.media_details?.filesize || 0
        stats.totalSize += size

        if (item.mime_type.startsWith('image/')) {
          stats.byType.images++
        } else if (item.mime_type.startsWith('video/')) {
          stats.byType.videos++
        } else if (item.mime_type.startsWith('application/')) {
          stats.byType.documents++
        } else {
          stats.byType.others++
        }

        // Get recent uploads (last 10)
        if (stats.recentUploads.length < 10) {
          stats.recentUploads.push({
            id: item.id,
            filename: item.media_details?.file || item.source_url.split('/').pop(),
            uploadDate: item.date,
            size: size
          })
        }
      })

      return stats

    } catch (error) {
      console.error('Error getting media stats:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: { images: 0, videos: 0, documents: 0, others: 0 },
        recentUploads: []
      }
    }
  }
}

export interface MediaSyncResult {
  success: boolean
  fileId: string
  filename: string
  wordpressId?: number
  wordpressUrl?: string
  error?: string
}

export interface MediaStats {
  totalFiles: number
  totalSize: number
  byType: {
    images: number
    videos: number
    documents: number
    others: number
  }
  recentUploads: Array<{
    id: number
    filename: string
    uploadDate: string
    size: number
  }>
} 