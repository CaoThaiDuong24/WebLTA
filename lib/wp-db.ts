import mysql from 'mysql2'
import fs from 'fs'
import path from 'path'
import { getWordPressConfig } from './wordpress-config'

function readDbConfigFromFile() {
  try {
    // Use centralized config loader (handles decryption)
    const wpConfig = getWordPressConfig()
    if (!wpConfig) return null
    const cfg = wpConfig.db || null
    return cfg
  } catch {
    return null
  }
}

export function getWpTablePrefix(): string {
  const fileCfg = readDbConfigFromFile()
  return (process.env.WP_TABLE_PREFIX || fileCfg?.tablePrefix || 'wp_') as string
}

export function getWpDbPool() {
  const fileCfg = readDbConfigFromFile()

  const host = process.env.WP_DB_HOST || fileCfg?.dbHost || fileCfg?.host
  const user = process.env.WP_DB_USER || fileCfg?.dbUser || fileCfg?.user
  const password = process.env.WP_DB_PASSWORD || fileCfg?.dbPassword || fileCfg?.password
  const database = process.env.WP_DB_NAME || fileCfg?.dbName || fileCfg?.database
  const port = process.env.WP_DB_PORT
    ? parseInt(process.env.WP_DB_PORT, 10)
    : (fileCfg?.dbPort || fileCfg?.port || 3306)

  console.log('DB Config:', { host, user, database, port, hasPassword: !!password })

  if (!host || !user || !password || !database) {
    throw new Error('Thiếu cấu hình database WordPress (WP_DB_HOST, WP_DB_USER, WP_DB_PASSWORD, WP_DB_NAME)')
  }

  const pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: 'utf8mb4'
  }).promise()

  return pool
}


