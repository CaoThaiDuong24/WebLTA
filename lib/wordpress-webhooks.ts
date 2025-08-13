export interface WebhookConfig {
  endpoint: string
  secret: string
  events: string[]
  retryAttempts: number
  timeout: number
}

export interface WebhookPayload {
  event: string
  timestamp: number
  data: any
  signature?: string
}

export class WordPressWebhookManager {
  private config: WebhookConfig

  constructor(config: WebhookConfig) {
    this.config = config
  }

  async sendWebhook(event: string, data: any): Promise<boolean> {
    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      data
    }

    // Tạo signature để bảo mật
    const signature = this.createSignature(payload)
    payload.signature = signature

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'LTA-Webhook-Client/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      })

      return response.ok
    } catch (error) {
      console.error('Webhook delivery failed:', error)
      return false
    }
  }

  private createSignature(payload: WebhookPayload): string {
    const data = JSON.stringify(payload.data)
    const message = `${payload.event}.${payload.timestamp}.${data}`
    
    // Sử dụng HMAC-SHA256
    const encoder = new TextEncoder()
    const key = encoder.encode(this.config.secret)
    const messageBytes = encoder.encode(message)
    
    // Trong thực tế, bạn cần sử dụng crypto library
    // Đây là implementation đơn giản
    return btoa(message)
  }

  async verifyWebhookSignature(payload: WebhookPayload, signature: string): Promise<boolean> {
    const expectedSignature = this.createSignature(payload)
    return expectedSignature === signature
  }

  // Các events phổ biến
  async onPostCreated(postData: any): Promise<void> {
    await this.sendWebhook('post.created', postData)
  }

  async onPostUpdated(postData: any): Promise<void> {
    await this.sendWebhook('post.updated', postData)
  }

  async onPostDeleted(postId: number): Promise<void> {
    await this.sendWebhook('post.deleted', { id: postId })
  }

  async onMediaUploaded(mediaData: any): Promise<void> {
    await this.sendWebhook('media.uploaded', mediaData)
  }
}

// WordPress Webhook Receiver
export class WordPressWebhookReceiver {
  private handlers: Map<string, (data: any) => Promise<void>> = new Map()

  registerHandler(event: string, handler: (data: any) => Promise<void>): void {
    this.handlers.set(event, handler)
  }

  async handleWebhook(payload: WebhookPayload, signature: string): Promise<boolean> {
    // Verify signature
    const webhookManager = new WordPressWebhookManager({
      endpoint: '',
      secret: process.env.WEBHOOK_SECRET || '',
      events: [],
      retryAttempts: 3,
      timeout: 10000
    })

    const isValid = await webhookManager.verifyWebhookSignature(payload, signature)
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // Execute handler
    const handler = this.handlers.get(payload.event)
    if (handler) {
      await handler(payload.data)
      return true
    }

    return false
  }
} 