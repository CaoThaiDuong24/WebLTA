import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { decryptSensitiveData, verifyPassword, sanitizeForLog } from './security'
import mysql from 'mysql2/promise'
import { getWpDbPool, getWpTablePrefix } from './wp-db'
import { verifyWordPressPassword } from './wp-password'

interface AdminData {
  email: string
  password: string
  name: string
}

interface UserData {
  id: number
  user_login: string
  user_email: string
  user_pass: string
  display_name: string
  role: string
  created_at: string
  is_active?: boolean
}

// Hàm giải mã dữ liệu nếu đã mã hóa
function decryptIfEncrypted(data: string): string {
  if (data.startsWith('ENCRYPTED:')) {
    try {
      return decryptSensitiveData(data.replace('ENCRYPTED:', ''))
    } catch (error) {
      console.error('Failed to decrypt data:', error)
      return data.replace('ENCRYPTED:', '')
    }
  }
  return data
}

function getAdminData(): AdminData {
  try {
    const adminFile = path.join(process.cwd(), 'data', 'admin.json')
    if (fs.existsSync(adminFile)) {
      const data = fs.readFileSync(adminFile, 'utf8')
      const adminData = JSON.parse(data)
      
      // Kiểm tra xem dữ liệu có được mã hóa không
      if (adminData.encryption_enabled) {
        return {
          email: decryptIfEncrypted(adminData.email),
          password: decryptIfEncrypted(adminData.password),
          name: decryptIfEncrypted(adminData.name)
        }
      } else {
        // Dữ liệu chưa mã hóa
        return {
          email: adminData.email,
          password: adminData.password,
          name: adminData.name
        }
      }
    }
  } catch (error) {
    console.error('Error reading admin data:', error)
  }
  
  // Fallback to default admin
  return {
    email: 'admin@lta.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'LTA Admin'
  }
}

function getUsersFromFile(): UserData[] {
  try {
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8')
      const users = JSON.parse(data)
      
      // Kiểm tra xem dữ liệu có được mã hóa không
      if (users.length > 0 && users[0].security_version === "2.0") {
        // Giải mã dữ liệu cho mỗi user
        return users.map((user: any) => ({
          ...user,
          user_login: decryptIfEncrypted(user.user_login),
          user_email: decryptIfEncrypted(user.user_email),
          user_pass: decryptIfEncrypted(user.user_pass),
          display_name: decryptIfEncrypted(user.display_name)
        }))
      } else {
        // Dữ liệu chưa mã hóa
        return users
      }
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  return []
}

export async function authenticateUser(credentials: { email: string; password: string }) {
  try {
    // Đọc dữ liệu admin từ file
    const adminData = getAdminData()

    // Kiểm tra email
    if (credentials.email !== adminData.email) {
      // Nếu không phải admin, kiểm tra WordPress via plugin
      try {
        const { getWordPressConfig } = require('@/lib/wordpress-config')
        const config = getWordPressConfig()
        
        if (config?.siteUrl) {
          // Try to authenticate via custom plugin authentication endpoint
          const authEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/auth`
          const response = await fetch(authEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password
            })
          })
          
          if (response.ok) {
            const authData = await response.json()
            if (authData.success && authData.user) {
              // Check is_active via plugin users endpoint (deny login if inactive)
              try {
                const usersEndpoint = `${config.siteUrl.replace(/\/$/, '')}/wp-json/lta/v1/users`
                const usersResp = await fetch(usersEndpoint, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64'),
                  },
                  signal: AbortSignal.timeout(15000)
                })
                if (usersResp.ok) {
                  const usersJson = await usersResp.json()
                  const usersArr = usersJson.users || []
                  const matched = usersArr.find((u: any) => (u.ID || u.id) == authData.user.ID)
                  const isActive = typeof matched?.meta?.is_active !== 'undefined'
                    ? Boolean(matched.meta.is_active)
                    : true
                  if (!isActive) {
                    console.log('WordPress user is inactive, denying login:', authData.user.user_email)
                    return null
                  }
                }
              } catch (e) {
                // If meta cannot be checked, allow login to avoid false negatives
              }

              const authResult = {
                id: authData.user.ID,
                email: authData.user.user_email,
                name: authData.user.display_name,
                role: authData.user.role
              }
              console.log('WordPress plugin authentication successful:', authResult)
              return authResult
            }
          } else {
            console.log('WordPress plugin auth failed:', response.status)
          }
        }
      } catch (e) {
        console.log('WordPress plugin auth error:', e)
      }
      
      return null
    }

    // Kiểm tra password cho admin
    const isPasswordValid = await bcrypt.compare(credentials.password, adminData.password)
    
    if (!isPasswordValid) {
      console.log('Password verification failed for:', sanitizeForLog(credentials.email))
      return null
    }

    return {
      id: 'admin',
      email: adminData.email,
      name: adminData.name,
      role: 'administrator'
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Extend the built-in session types for NextAuth v5
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'lta-secret-key-2024-stable',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Sử dụng hàm authenticateUser đã được tối ưu
        const user = await authenticateUser(credentials)
        
        if (user) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token.role) {
        session.user.role = token.role
      }
      return session
    },
    // Force stable redirect base to avoid wrong port (e.g., 3001)
    async redirect({ url, baseUrl }) {
      const forcedBase = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      // Relative URLs -> attach to forced base
      if (url.startsWith('/')) return forcedBase + url
      try {
        const target = new URL(url)
        const allowedBases = new Set([baseUrl, forcedBase])
        // Only allow redirects to our base; otherwise, fallback home
        if (allowedBases.has(target.origin)) return url
        return forcedBase
      } catch {
        return forcedBase
      }
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  }
}