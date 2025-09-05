'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  List,
  Globe,
  RefreshCw,
  Copy,
  ExternalLink,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface AdminSidebarProps {
  onClose?: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true // Chỉ active khi đúng path
  },
  {
    title: 'Tin tức',
    href: '/admin/news',
    icon: FileText,
    children: [
      {
        title: 'Danh sách tin tức',
        href: '/admin/news',
        exact: true
      },
      {
        title: 'Thêm tin tức mới',
        href: '/admin/news/create',
        exact: true
      },
      {
        title: 'Danh mục tin tức',
        href: '/admin/news-categories',
        exact: true
      },
      {
        title: 'Thùng rác tin tức',
        href: '/admin/news/trash',
        exact: true
      }
    ]
  },
  {
    title: 'Người dùng',
    href: '/admin/users',
    icon: Users,
    exact: true
  },
  {
    title: 'Tuyển dụng',
    href: '/admin/recruitment',
    icon: Briefcase,
    children: [
      {
        title: 'Danh sách tuyển dụng',
        href: '/admin/recruitment',
        exact: true
      },
      {
        title: 'Thêm tin tuyển dụng',
        href: '/admin/recruitment/create',
        exact: true
      },
      {
        title: 'Danh sách ứng viên',
        href: '/admin/recruitment/applicants',
        exact: true
      }
    ]
  },
  {
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
    exact: true
  },

  {
    title: 'WordPress Sync Manager',
    href: '/admin/wordpress-sync-manager',
    icon: RefreshCw,
    exact: true
  },
  {
    title: 'Đồng bộ thủ công WordPress',
    href: '/admin/manual-wordpress-sync',
    icon: Copy,
    exact: true
  },
  {
    title: 'WordPress Plugin Manager',
    href: '/admin/wordpress-plugin',
    icon: Globe,
    exact: true
  },
  {
    title: 'Đồng bộ hình ảnh',
    href: '/admin/image-sync',
    icon: RefreshCw,
    exact: true
  },
  {
    title: 'Test Multipart',
    href: '/admin/test-multipart',
    icon: Copy,
    exact: true
  }
]

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    // Đóng sidebar trên mobile khi click vào link
    if (onClose) {
      onClose()
    }
  }

  // Hàm kiểm tra active state
  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href
    }
    // Cho các trang con, kiểm tra pathname bắt đầu với href
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Hàm kiểm tra parent active (cho submenu)
  const isParentActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo section - chỉ hiển thị trên desktop */}
      <div className="flex-shrink-0 p-4 lg:p-6 hidden lg:block border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LTA</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý hệ thống</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-3 lg:px-4 py-4 overflow-y-auto admin-scrollbar">
        <ul className="space-y-1 lg:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const itemIsActive = isActive(item.href, item.exact)
            const parentIsActive = isParentActive(item.href)
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 lg:py-2 rounded-lg text-sm font-medium transition-colors',
                    itemIsActive
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="truncate">{item.title}</span>
                </Link>
                
                {item.children && parentIsActive && (
                  <ul className="ml-4 lg:ml-8 mt-1 lg:mt-2 space-y-1">
                    {item.children.map((child) => {
                      const childIsActive = isActive(child.href, child.exact)
                      
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center space-x-2 px-2 lg:px-3 py-1 lg:py-2 rounded-lg text-sm transition-colors',
                              childIsActive
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            )}
                          >
                            {childIsActive ? (
                              <div className="w-1 h-1 bg-green-600 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0" />
                            )}
                            <span className="truncate">{child.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout button - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:hover:border-red-700 text-sm"
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.href = '/admin/login'
          }}
        >
          <LogOut className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
          <span className="truncate">Đăng xuất</span>
        </Button>
      </div>
    </div>
  )
} 