import { NextRequest, NextResponse } from 'next/server'
import { getWpDbPool } from '@/lib/wp-db'

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
