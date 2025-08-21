'use client'

import { Search, User, Menu, Settings, LogOut, ChevronDown, AlertTriangle, Shield, Activity, HelpCircle, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSession, signOut } from 'next-auth/react'
import { useSettings, useMaintenanceMode } from '@/contexts/settings-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { isMaintenanceMode } = useMaintenanceMode()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Chức năng mở trang hồ sơ cá nhân
  const handleProfileClick = () => {
    router.push('/admin/profile')
  }

  // Chức năng mở trang cài đặt
  const handleSettingsClick = () => {
    router.push('/admin/settings')
  }

  // Chức năng đổi mật khẩu
  const handleChangePassword = () => {
    router.push('/admin/change-password')
  }

  // Chức năng xem lịch sử hoạt động
  const handleActivityHistory = () => {
    router.push('/admin/activity-history')
  }

  // Chức năng hỗ trợ
  const handleSupport = () => {
    window.open('/admin/support', '_blank')
  }

  // Chức năng bảo mật
  const handleSecurity = () => {
    router.push('/admin/security')
  }

  // Chức năng mở popup xác nhận đăng xuất
  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  // Chức năng xác nhận đăng xuất
  const handleConfirmLogout = () => {
    ;(async () => {
      await signOut({ redirect: false })
      window.location.href = '/admin/login'
    })()
    setShowLogoutDialog(false)
  }

  // Chức năng hủy đăng xuất
  const handleCancelLogout = () => {
    setShowLogoutDialog(false)
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm w-full">
      <div className="flex items-center justify-between h-full px-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10 w-60 lg:w-80 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Maintenance Mode Indicator */}
          {isMaintenanceMode && (
            <div className="hidden sm:flex items-center space-x-2 px-2 lg:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 hidden lg:inline">
                Chế độ bảo trì
              </span>
            </div>
          )}

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 lg:h-10 px-2 lg:px-3 rounded-lg hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <Avatar className="h-6 w-6 lg:h-8 lg:w-8 ring-2 ring-green-100 dark:ring-green-900/30 group-hover:ring-green-200 dark:group-hover:ring-green-800/50 transition-all duration-200">
                    <AvatarImage src="/placeholder-user.jpg" alt={session?.user?.name || 'Admin'} />
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <User className="w-3 h-3 lg:w-4 lg:h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session?.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session?.user?.email || 'admin@lta.com'}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                    {session?.user?.email || 'admin@lta.com'}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Hồ sơ cá nhân */}
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="p-3 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <User className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Hồ sơ cá nhân</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý thông tin cá nhân</p>
                </div>
              </DropdownMenuItem>

              {/* Đổi mật khẩu */}
              <DropdownMenuItem 
                onClick={handleChangePassword}
                className="p-3 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Key className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Đổi mật khẩu</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật mật khẩu bảo mật</p>
                </div>
              </DropdownMenuItem>

              {/* Bảo mật */}
              <DropdownMenuItem 
                onClick={handleSecurity}
                className="p-3 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Shield className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Bảo mật</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cài đặt bảo mật tài khoản</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Cài đặt */}
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                className="p-3 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Settings className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Cài đặt</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tùy chỉnh hệ thống</p>
                </div>
              </DropdownMenuItem>

              {/* Lịch sử hoạt động */}
              <DropdownMenuItem 
                onClick={handleActivityHistory}
                className="p-3 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Activity className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Lịch sử hoạt động</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Xem lịch sử đăng nhập</p>
                </div>
              </DropdownMenuItem>

              {/* Hỗ trợ */}
              <DropdownMenuItem 
                onClick={handleSupport}
                className="p-3 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Hỗ trợ</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Liên hệ hỗ trợ kỹ thuật</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              {/* Đăng xuất */}
              <DropdownMenuItem 
                onClick={handleLogoutClick}
                className="p-3 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Đăng xuất</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Thoát khỏi hệ thống</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert Dialog for Logout Confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn đăng xuất không?</AlertDialogTitle>
            <AlertDialogDescription>
              Đăng xuất sẽ xóa tất cả các phiên làm việc và đăng nhập lại để tiếp tục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLogout}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>Đăng xuất</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
} 