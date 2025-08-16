import mysql from 'mysql2'

export function getWpTablePrefix(): string {
  return process.env.WP_TABLE_PREFIX || 'wp_'
}

export function getWpDbPool() {
  const host = process.env.WP_DB_HOST
  const user = process.env.WP_DB_USER
  const password = process.env.WP_DB_PASSWORD
  const database = process.env.WP_DB_NAME
  const port = process.env.WP_DB_PORT ? parseInt(process.env.WP_DB_PORT, 10) : 3306

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


