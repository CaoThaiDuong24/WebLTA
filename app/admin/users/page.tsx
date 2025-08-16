'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettings, useMaintenanceMode } from '@/contexts/settings-context'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Users, 
  Plus, 
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Activity,
  AlertTriangle
} from 'lucide-react'

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'Admin LTA',
    email: 'admin@lta.com',
    role: 'admin',
    status: 'active',
    avatar: '/placeholder-user.jpg',
    lastLogin: '2024-01-15 10:30',
    joinDate: '2023-01-15',
    loginCount: 156
  },
  {
    id: 2,
    name: 'Editor User',
    email: 'editor@lta.com',
    role: 'editor',
    status: 'active',
    avatar: '/placeholder-user.jpg',
    lastLogin: '2024-01-14 15:45',
    joinDate: '2023-06-20',
    loginCount: 89
  },
  {
    id: 3,
    name: 'Viewer User',
    email: 'viewer@lta.com',
    role: 'viewer',
    status: 'inactive',
    avatar: '/placeholder-user.jpg',
    lastLogin: '2024-01-10 09:15',
    joinDate: '2023-09-10',
    loginCount: 23
  }
]

export default function UsersManagementPage() {
  const { settings } = useSettings()
  const { isMaintenanceMode } = useMaintenanceMode()
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'editor':
        return <Edit className="w-4 h-4" />
      case 'viewer':
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Mode Alert */}
      {isMaintenanceMode && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Hệ thống đang trong chế độ bảo trì. Một số tính năng có thể bị hạn chế.
            <Link href="/admin/settings" className="ml-2 text-yellow-700 dark:text-yellow-300 underline hover:no-underline">
              Cài đặt
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Tìm kiếm
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg" asChild>
            <Link href="/admin/users/create">
              <Plus className="h-4 w-4" />
              Thêm người dùng mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tổng người dùng</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {mockUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Không hoạt động</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {mockUsers.filter(u => u.status === 'inactive').length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Quản trị viên</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {mockUsers.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Danh sách người dùng</CardTitle>
              <CardDescription className="text-sm">
                Tổng cộng {mockUsers.length} người dùng
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold">Người dùng</TableHead>
                    <TableHead className="font-semibold">Vai trò</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Đăng nhập cuối</TableHead>
                    <TableHead className="font-semibold">Thống kê</TableHead>
                    <TableHead className="font-semibold text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-900/30">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              <Users className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Tham gia: {user.joinDate}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(user.role)} border gap-1`}>
                          {getRoleIcon(user.role)}
                          {user.role === 'admin' ? 'Quản trị viên' : 
                           user.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(user.status)} border`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.lastLogin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                            <Activity className="h-3 w-3" />
                            <span>{user.loginCount} lần</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="h-4 w-4" />
                              Gửi email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 gap-2">
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {mockUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-green-100 dark:ring-green-900/30">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <Users className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Tham gia: {user.joinDate}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Mail className="h-4 w-4" />
                            Gửi email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 gap-2">
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={`${getRoleColor(user.role)} border gap-1`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'admin' ? 'Quản trị viên' : 
                         user.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
                      </Badge>
                      <Badge className={`${getStatusColor(user.status)} border`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Đăng nhập cuối: {user.lastLogin}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Đăng nhập: {user.loginCount} lần</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 