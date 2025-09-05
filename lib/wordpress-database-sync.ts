export interface DatabaseSyncConfig {
  wordpressDb: {
    host: string
    database: string
    username: string
    password: string
    port: number
  }
  syncTables: string[]
  syncInterval: number // minutes
  lastSyncTimestamp: number
}

export interface SyncTable {
  name: string
  primaryKey: string
  fields: string[]
  conditions?: string
}

export class WordPressDatabaseSync {
  private config: DatabaseSyncConfig
  private syncTables: SyncTable[]

  constructor(config: DatabaseSyncConfig) {
    this.config = config
    this.syncTables = [
      {
        name: 'wp_posts',
        primaryKey: 'ID',
        fields: ['ID', 'post_title', 'post_content', 'post_excerpt', 'post_status', 'post_date', 'post_modified'],
        conditions: "post_type = 'post' AND post_status IN ('publish', 'draft')"
      },
      {
        name: 'wp_postmeta',
        primaryKey: 'meta_id',
        fields: ['meta_id', 'post_id', 'meta_key', 'meta_value'],
        conditions: "meta_key IN ('_thumbnail_id', 'custom_field_1', 'custom_field_2')"
      },
      {
        name: 'wp_terms',
        primaryKey: 'term_id',
        fields: ['term_id', 'name', 'slug', 'term_group']
      },
      {
        name: 'wp_term_relationships',
        primaryKey: 'object_id',
        fields: ['object_id', 'term_taxonomy_id', 'term_order']
      }
    ]
  }

  async syncTable(table: SyncTable, direction: 'to-wordpress' | 'from-wordpress'): Promise<SyncResult> {
    const result: SyncResult = {
      table: table.name,
      direction,
      recordsProcessed: 0,
      recordsSynced: 0,
      errors: [],
      startTime: Date.now()
    }

    try {
      if (direction === 'from-wordpress') {
        await this.syncFromWordPress(table, result)
      } else {
        await this.syncToWordPress(table, result)
      }
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      })
    }

    result.endTime = Date.now()
    result.duration = result.endTime - result.startTime

    return result
  }

  private async syncFromWordPress(table: SyncTable, result: SyncResult): Promise<void> {
    // Lấy dữ liệu từ WordPress database
    const wordpressData = await this.queryWordPressDatabase(table)
    
    // Lưu vào local database
    for (const record of wordpressData) {
      try {
        await this.saveToLocalDatabase(table.name, record)
        result.recordsSynced++
      } catch (error) {
        result.errors.push({
          message: `Failed to sync record ${record[table.primaryKey]}: ${error}`,
          timestamp: Date.now()
        })
      }
      result.recordsProcessed++
    }
  }

  private async syncToWordPress(table: SyncTable, result: SyncResult): Promise<void> {
    // Lấy dữ liệu từ local database
    const localData = await this.queryLocalDatabase(table)
    
    // Gửi lên WordPress database
    for (const record of localData) {
      try {
        await this.saveToWordPressDatabase(table.name, record)
        result.recordsSynced++
      } catch (error) {
        result.errors.push({
          message: `Failed to sync record ${record[table.primaryKey]}: ${error}`,
          timestamp: Date.now()
        })
      }
      result.recordsProcessed++
    }
  }

  private async queryWordPressDatabase(table: SyncTable): Promise<any[]> {
    // Implementation để query WordPress database
    // Trong thực tế, bạn sẽ sử dụng MySQL connection
    let query = `SELECT ${table.fields.join(', ')} FROM ${table.name}`
    if (table.conditions) {
      query += ` WHERE ${table.conditions}`
    }
    
    // Mock implementation
    return []
  }

  private async queryLocalDatabase(table: SyncTable): Promise<any[]> {
    // Implementation để query local database
    // Trong thực tế, bạn sẽ sử dụng local database connection
    return []
  }

  private async saveToLocalDatabase(tableName: string, record: any): Promise<void> {
    // Implementation để lưu vào local database
    console.log(`Saving to local ${tableName}:`, record)
  }

  private async saveToWordPressDatabase(tableName: string, record: any): Promise<void> {
    // Implementation để lưu vào WordPress database
    console.log(`Saving to WordPress ${tableName}:`, record)
  }

  async startScheduledSync(): Promise<void> {
    const now = Date.now()
    const lastSync = this.config.lastSyncTimestamp
    const intervalMs = this.config.syncInterval * 60 * 1000

    if (now - lastSync >= intervalMs) {
      console.log('Starting scheduled database sync...')
      
      const results: SyncResult[] = []
      
      for (const table of this.syncTables) {
        if (this.config.syncTables.includes(table.name)) {
          // Sync both directions
          const resultFrom = await this.syncTable(table, 'from-wordpress')
          const resultTo = await this.syncTable(table, 'to-wordpress')
          results.push(resultFrom, resultTo)
        }
      }

      this.config.lastSyncTimestamp = now
      
      console.log('Database sync completed:', results)
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const now = Date.now()
    const lastSync = this.config.lastSyncTimestamp
    const intervalMs = this.config.syncInterval * 60 * 1000

    return {
      lastSync: new Date(lastSync),
      nextSync: new Date(lastSync + intervalMs),
      isOverdue: now - lastSync >= intervalMs,
      tablesCount: this.syncTables.length,
      enabledTables: this.config.syncTables
    }
  }
}

export interface SyncResult {
  table: string
  direction: 'to-wordpress' | 'from-wordpress' | 'both'
  recordsProcessed: number
  recordsSynced: number
  errors: Array<{
    message: string
    timestamp: number
  }>
  startTime: number
  endTime?: number
  duration?: number
}

export interface SyncStatus {
  lastSync: Date
  nextSync: Date
  isOverdue: boolean
  tablesCount: number
  enabledTables: string[]
} 