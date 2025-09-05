'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { ProtectedRoute } from './protected-route'
import { SettingsProvider } from '@/contexts/settings-context'
import { SessionRefresh } from './session-refresh'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Control body scroll on mobile when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }

    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [sidebarOpen])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <SettingsProvider>
      <ProtectedRoute>
        <SessionRefresh />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden w-full">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Fixed Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LTA</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Admin</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Fixed Header */}
          <div className="admin-header-fixed">
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          </div>

          {/* Main Content Area - Fixed Layout with Width Control */}
          <div className="flex flex-col min-h-screen w-full lg:ml-64 admin-main-content-area">
            {/* Spacer for fixed header */}
            <div className="h-16 flex-shrink-0"></div>
            
            {/* Main Content - Scrollable with proper width constraints */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden admin-scrollbar w-full admin-content-container">
              <div className="w-full max-w-full min-h-[calc(100vh-4rem)] admin-content-inner">
                <main className="p-4 lg:p-6 w-full max-w-full box-border">
                  <div className="w-full max-w-full overflow-x-hidden">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </SettingsProvider>
  )
} 