import { useLanguage } from '@/contexts/language-context'
import { getTranslation } from '@/lib/i18n'

export function useTranslation() {
  const { currentLanguage } = useLanguage()

  const t = (key: string): string => {
    return getTranslation(currentLanguage, key)
  }

  return { t, currentLanguage }
} 