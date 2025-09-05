'use client'

import { ZaloChatBox } from './zalo-chat-box'
import { usePathname } from 'next/navigation'

export function ChatBoxWrapper() {
  const pathname = usePathname()
  
  // Ẩn chat box trên trang admin
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }

  return <ZaloChatBox />
}
