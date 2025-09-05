import { NextRequest, NextResponse } from 'next/server'
import { getWpDbPool } from '@/lib/wp-db'
import mysql from 'mysql2'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test environment variables
    const envVars = {
      WP_DB_HOST: process.env.WP_DB_HOST,
      WP_DB_PORT: process.env.WP_DB_PORT,
      WP_DB_NAME: process.env.WP_DB_NAME,
      WP_DB_USER: process.env.WP_DB_USER,
      WP_DB_PASSWORD: process.env.WP_DB_PASSWORD ? '***' : 'missing',
      WP_TABLE_PREFIX: process.env.WP_TABLE_PREFIX
    }
    
    console.log('Environment variables:', envVars)
    
    // Test database connection
    const pool = getWpDbPool()
    const [rows] = await pool.query('SELECT 1 as test')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      envVars,
      testQuery: rows
    })
  } catch (error: any) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      envVars: {
        WP_DB_HOST: process.env.WP_DB_HOST,
        WP_DB_PORT: process.env.WP_DB_PORT,
        WP_DB_NAME: process.env.WP_DB_NAME,
        WP_DB_USER: process.env.WP_DB_USER,
        WP_DB_PASSWORD: process.env.WP_DB_PASSWORD ? '***' : 'missing',
        WP_TABLE_PREFIX: process.env.WP_TABLE_PREFIX
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const host = body.host || body.dbHost
    const user = body.user || body.dbUser
    const password = body.password || body.dbPassword
    const database = body.database || body.dbName
    const port = body.port || body.dbPort || 3306
    const tablePrefix = body.tablePrefix || body.wpTablePrefix || 'wp_'

    if (!host || !user || !password || !database) {
      return NextResponse.json({
        success: false,
        error: 'Thiếu cấu hình: host, user, password, database là bắt buộc',
      }, { status: 400 })
    }

    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port: Number(port) || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      charset: 'utf8mb4'
    }).promise()

    const [rows] = await pool.query('SELECT 1 as test')

    // Kiểm tra bảng chính của WordPress
    const [usersTable]: any = await pool.query('SHOW TABLES LIKE ?', [`${tablePrefix}users`])
    const [userMetaTable]: any = await pool.query('SHOW TABLES LIKE ?', [`${tablePrefix}usermeta`])

    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'Kết nối DB thành công',
      testQuery: rows,
      tables: {
        users: usersTable.length > 0,
        usermeta: userMetaTable.length > 0,
        prefix: tablePrefix
      }
    })
  } catch (error: any) {
    console.error('Database test (POST) failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 })
  }
}
