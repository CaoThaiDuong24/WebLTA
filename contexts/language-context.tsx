"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { defaultLanguage } from '@/lib/i18n'

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (language: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage)

  useEffect(() => {
    // Load saved language from localStorage
    try {
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error)
    }
  }, [])

  const setLanguage = (language: string) => {
    setCurrentLanguage(language)
    try {
      localStorage.setItem('language', language)
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 