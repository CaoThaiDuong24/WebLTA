'use client'

import { useState } from 'react'
import { ArrowLeft, Activity, Calendar, Filter, Download, Search, Clock, MapPin, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default function ActivityHistoryPage() {
  const [filter, setFilter] = useState({
    type: 'all',
    date: 'all',
    status: 'all'
  })

  const [activities] = useState([
    {
      id: 1,
      type: 'login',
      action: 'Đăng nhập thành công',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.100',
      timestamp: '2024-01-15 14:30:25',
      status: 'success',
      details: 'Đăng nhập từ thiết bị mới'
    },
    {
      id: 2,
      type: 'news',
      action: 'Tạo tin tức mới',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.100',
      timestamp: '2024-01-15 13:45:12',
      status: 'success',
      details: 'Tin tức: "Cập nhật hệ thống mới"'
    },
    {
      id: 3,
      type: 'settings',
      action: 'Cập nhật cài đặt',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.100',
      timestamp: '2024-01-15 12:20:08',
      status: 'success',
      details: 'Thay đổi cài đặt WordPress'
    },
    {
      id: 4,
      type: 'login',
      action: 'Đăng nhập thất bại',
      device: 'Safari trên iPhone',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.101',
      timestamp: '2024-01-14 09:15:42',
      status: 'failed',
      details: 'Mật khẩu không đúng'
    },
    {
      id: 5,
      type: 'news',
      action: 'Chỉnh sửa tin tức',
      device: 'Firefox trên MacOS',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.102',
      timestamp: '2024-01-13 16:45:18',
      status: 'success',
      details: 'Cập nhật tin tức: "Sự kiện LTA 2024"'
    },
    {
      id: 6,
      type: 'logout',
      action: 'Đăng xuất',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.100',
      timestamp: '2024-01-13 15:30:25',
      status: 'success',
      details: 'Đăng xuất thủ công'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Activity className="h-4 w-4 text-green-600" />
      case 'logout':
        return <Activity className="h-4 w-4 text-blue-600" />
      case 'news':
        return <Monitor className="h-4 w-4 text-purple-600" />
      case 'settings':
        return <Monitor className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Thành công</Badge>
    } else {
      return <Badge variant="destructive">Thất bại</Badge>
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (filter.type !== 'all' && activity.type !== filter.type) return false
    if (filter.status !== 'all' && activity.status !== filter.status) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lịch sử hoạt động</h1>
            <p className="text-gray-600 dark:text-gray-400">Xem lịch sử đăng nhập và hoạt động</p>
          </div>
        </div>
        <Button className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Xuất báo cáo</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Bộ lọc</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại hoạt động</label>
              <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="login">Đăng nhập</SelectItem>
                  <SelectItem value="logout">Đăng xuất</SelectItem>
                  <SelectItem value="news">Tin tức</SelectItem>
                  <SelectItem value="settings">Cài đặt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian</label>
              <Select value={filter.date} onValueChange={(value) => setFilter({ ...filter, date: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Tìm kiếm..." className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{activity.action}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {activity.details}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Monitor className="h-3 w-3" />
                        <span>{activity.device}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">IP: {activity.ip}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có hoạt động nào được tìm thấy</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 