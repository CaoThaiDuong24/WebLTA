import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { decryptSensitiveData, verifyPassword, sanitizeForLog } from './security'

// Extend the built-in session types
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

// Đọc dữ liệu admin từ file
function getAdminData() {
  try {
    const adminDataPath = path.join(process.cwd(), 'data', 'admin.json')
    const data = fs.readFileSync(adminDataPath, 'utf8')
    const adminData = JSON.parse(data)
    
    // Decrypt sensitive data
    const decryptedData = {
      ...adminData,
      email: adminData.email.startsWith('ENCRYPTED:') ? 
        decryptSensitiveData(adminData.email.replace('ENCRYPTED:', '')) : adminData.email,
      password: adminData.password.startsWith('ENCRYPTED:') ? 
        decryptSensitiveData(adminData.password.replace('ENCRYPTED:', '')) : adminData.password,
      name: adminData.name.startsWith('ENCRYPTED:') ? 
        decryptSensitiveData(adminData.name.replace('ENCRYPTED:', '')) : adminData.name,
      passwordHistory: adminData.passwordHistory?.map((item: any) => ({
        ...item,
        password: item.password.startsWith('ENCRYPTED:') ? 
          decryptSensitiveData(item.password.replace('ENCRYPTED:', '')) : item.password
      })) || []
    }
    
    console.log('Admin data loaded:', sanitizeForLog(decryptedData))
    return decryptedData
  } catch (error) {
    console.error('Error reading admin data:', error)
    // Fallback data nếu không đọc được file
    return {
      id: '1',
      email: 'admin@lta.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Admin LTA',
      role: 'admin'
    }
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

        // Đọc dữ liệu admin từ file
        const adminData = getAdminData()

        // Kiểm tra email
        if (credentials.email !== adminData.email) {
          return null
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(credentials.password, adminData.password)
        
        if (!isPasswordValid) {
          console.log('Password verification failed for:', sanitizeForLog(credentials.email))
          return null
        }

        return {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 365 * 24 * 60 * 60, // 365 days (1 year) - practically no timeout
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 365 * 24 * 60 * 60, // 365 days (1 year) - practically no timeout
  },
  pages: {
    signIn: '/admin/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }
      
      // Extend token expiration
      token.exp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id as string
        // Extend session expiration
        session.expires = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString()
      }
      return session
    }
  },
  // Prevent automatic logout on tab switch
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        maxAge: 365 * 24 * 60 * 60 // 1 year
      }
    }
  }
} 