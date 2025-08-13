import { decryptSensitiveData, encryptSensitiveData, sanitizeForLog } from './security'

export interface WordPressConfig {
  siteUrl: string
  username: string
  applicationPassword: string
}

export function getWordPressConfig(): WordPressConfig | null {
  // Try environment variables first
  const siteUrl = process.env.WORDPRESS_SITE_URL
  const username = process.env.WORDPRESS_USERNAME
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD

  if (siteUrl && username && applicationPassword) {
    const config = {
      siteUrl,
      username,
      applicationPassword
    }
    console.log('WordPress config loaded from env:', sanitizeForLog(config))
    return config
  }

  // Fallback to default values for development
  const fallbackConfig = {
    siteUrl: 'https://wp2.ltacv.com',
    username: 'admin',
    applicationPassword: 'your-application-password'
  }
  console.log('WordPress config using fallback:', sanitizeForLog(fallbackConfig))
  return fallbackConfig
}

export function encryptWordPressConfig(config: WordPressConfig): WordPressConfig {
  return {
    ...config,
    username: encryptSensitiveData(config.username),
    applicationPassword: encryptSensitiveData(config.applicationPassword)
  }
}

export function decryptWordPressConfig(config: WordPressConfig): WordPressConfig {
  return {
    ...config,
    username: decryptSensitiveData(config.username),
    applicationPassword: decryptSensitiveData(config.applicationPassword)
  }
}
