'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettings, useMaintenanceMode } from '@/contexts/settings-context'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Power,
  PowerOff,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

interface User {
  id: number
  user_login: string
  user_email: string
  display_name: string
  role: string
  created_at: string
  user_registered?: string
  is_active?: boolean
  avatar_url?: string
}

export default function UsersManagementPage() {
  const { settings } = useMaintenanceMode()
  const { session } = useAuth(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [syncingFromWordPress, setSyncingFromWordPress] = useState(false)
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { toast } = useToast()
  
  const fetchUsers = async () => {
    try {
      setError(null)
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setUsers(result.users || [])
      } else {
        setError(result.error || 'Lỗi khi tải danh sách người dùng')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Lọc và phân trang users
  const filteredUsers = users.filter(user => 
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset về trang đầu
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchUsers()
  }

  const handleSyncFromWordPress = async () => {
    setSyncingFromWordPress(true)
    try {
      // Just refresh the users list (now fetches directly from WordPress)
      await fetchUsers()
      toast({
        title: "✅ Làm mới thành công",
        description: "Đã cập nhật danh sách người dùng từ WordPress",
      })
    } catch (error: any) {
      toast({
        title: "❌ Lỗi làm mới",
        description: error.message || "Lỗi kết nối khi làm mới",
        variant: "destructive",
      })
    } finally {
      setSyncingFromWordPress(false)
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      setUpdatingStatus(userId)
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_active: !currentStatus })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Cập nhật trạng thái trong danh sách
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, is_active: !currentStatus }
              : user
          )
        )
        
        toast({
          title: "Thành công",
          description: result.message,
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Không thể cập nhật trạng thái',
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || 'Có lỗi xảy ra',
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    setShowDeleteDialog(true)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return

    try {
      const response = await fetch(`/api/users?id=${deletingUser.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Xóa user khỏi danh sách
        setUsers(prevUsers => prevUsers.filter(user => user.id !== deletingUser.id))
        
        toast({
          title: "Thành công",
          description: result.message,
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Không thể xóa người dùng',
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || 'Có lỗi xảy ra',
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeletingUser(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'author':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'contributor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'subscriber':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Quản trị viên'
      case 'editor':
        return 'Biên tập viên'
      case 'author':
        return 'Tác giả'
      case 'contributor':
        return 'Cộng tác viên'
      case 'subscriber':
        return 'Thành viên'
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Shield className="w-4 h-4" />
      case 'editor':
        return <Edit className="w-4 h-4" />
      case 'author':
        return <Users className="w-4 h-4" />
      case 'contributor':
        return <UserCheck className="w-4 h-4" />
      case 'subscriber':
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Kiểm tra xem user hiện tại có phải là admin không
  const isCurrentUserAdmin = session?.user?.role === 'administrator'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncFromWordPress} 
            disabled={syncingFromWordPress}
          >
                         <Download className={`w-4 h-4 mr-2 ${syncingFromWordPress ? 'animate-spin' : ''}`} />
             {syncingFromWordPress ? 'Đang làm mới...' : 'Làm mới từ WP'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {isCurrentUserAdmin && (
            <Button asChild>
              <Link href="/admin/users/create" className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm người dùng
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Danh sách người dùng</CardTitle>
              <CardDescription className="text-sm">
                Tổng cộng {users.length} người dùng • {users.filter(u => u.is_active !== false).length} đang hoạt động
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tìm kiếm và phân trang */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy người dùng</h3>
              <p className="text-muted-foreground mb-4">Thử thay đổi từ khóa tìm kiếm</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có người dùng nào</h3>
              <p className="text-muted-foreground mb-4">Bắt đầu bằng cách thêm người dùng đầu tiên</p>
              {isCurrentUserAdmin && (
                <Button asChild>
                  <Link href="/admin/users/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm người dùng
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">Người dùng</TableHead>
                        <TableHead className="font-semibold">Vai trò</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="font-semibold">Ngày tạo</TableHead>
                        <TableHead className="font-semibold text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(user.display_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.display_name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.user_email}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  @{user.user_login}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                              {getRoleIcon(user.role)}
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Badge className={`${getStatusColor(user.is_active !== false)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(user.is_active !== false)}
                                {user.is_active !== false ? 'Hoạt động' : 'Không hoạt động'}
                              </Badge>
                              {isCurrentUserAdmin && user.role !== 'administrator' && (
                                <Switch
                                  checked={user.is_active !== false}
                                  onCheckedChange={() => handleToggleStatus(user.id, user.is_active !== false)}
                                  disabled={updatingStatus === user.id}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(user.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                {isCurrentUserAdmin && user.role !== 'administrator' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleStatus(user.id, user.is_active !== false)}
                                    disabled={updatingStatus === user.id}
                                  >
                                    {updatingStatus === user.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : user.is_active !== false ? (
                                      <PowerOff className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Power className="mr-2 h-4 w-4" />
                                    )}
                                    {user.is_active !== false ? 'Tắt hoạt động' : 'Bật hoạt động'}
                                  </DropdownMenuItem>
                                )}
                                {isCurrentUserAdmin && user.role !== 'administrator' && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                  </DropdownMenuItem>
                                )}
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
                {currentUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.display_name}</div>
                          <div className="text-sm text-muted-foreground">{user.user_email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getRoleColor(user.role)} text-xs`}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            <Badge className={`${getStatusColor(user.is_active !== false)} text-xs`}>
                              {user.is_active !== false ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrentUserAdmin && user.role !== 'administrator' && (
                          <Switch
                            checked={user.is_active !== false}
                            onCheckedChange={() => handleToggleStatus(user.id, user.is_active !== false)}
                            disabled={updatingStatus === user.id}
                          />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {isCurrentUserAdmin && user.role !== 'administrator' && (
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(user.id, user.is_active !== false)}
                                disabled={updatingStatus === user.id}
                              >
                                {updatingStatus === user.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : user.is_active !== false ? (
                                  <PowerOff className="mr-2 h-4 w-4" />
                                ) : (
                                  <Power className="mr-2 h-4 w-4" />
                                )}
                                {user.is_active !== false ? 'Tắt hoạt động' : 'Bật hoạt động'}
                              </DropdownMenuItem>
                            )}
                            {isCurrentUserAdmin && user.role !== 'administrator' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Trang {currentPage} của {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Hiển thị các trang */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{deletingUser?.display_name}</strong> ({deletingUser?.user_email})?
              <br />
              <br />
              Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn tài khoản này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 