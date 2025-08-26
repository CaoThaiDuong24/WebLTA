'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Eye,
  Activity,
  Plus,
  Calendar,
  Clock,
  User,
  BarChart3,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Settings,
  Loader2,
  
} from 'lucide-react'
import Link from 'next/link'
import { useSettings, useMaintenanceMode } from '@/contexts/settings-context'
import { useEffect, useState } from 'react'
import { stripHtmlTags } from '@/lib/utils'

// Color mapping for dynamic colors
const colorMap: Record<string, { bg: string; text: string }> = {
  blue: {
    bg: "from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20",
    text: "text-blue-600 dark:text-blue-400"
  },
  green: {
    bg: "from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20",
    text: "text-green-600 dark:text-green-400"
  },
  purple: {
    bg: "from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20",
    text: "text-purple-600 dark:text-purple-400"
  },
  orange: {
    bg: "from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20",
    text: "text-orange-600 dark:text-orange-400"
  }
}

// Icon mapping
const iconMap: Record<string, any> = {
  FileText,
  Eye,
  Target,
  Activity
}

// Types
interface DashboardData {
  stats: Array<{
    title: string
    value: string
    change: string
    trend: string
    icon: string
    color: string
  }>
  recentNews: Array<{
    id: string
    title: string
    views: number
    status: string
    date: string
    author: string
    category: string
  }>
  recentActivities: Array<{
    id: number
    action: string
    user: string
    time: string
    type: string
  }>
  performanceData: Array<{
    month: string
    news: number
    categories: number
  }>
}

export default function AdminDashboardPage() {
  const { settings, isLoading: settingsLoading } = useSettings()
  const { isMaintenanceMode } = useMaintenanceMode()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4 text-blue-600" />
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'update':
        return <Activity className="w-4 h-4 text-yellow-600" />
      case 'delete':
        return <Zap className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Không thể tải dữ liệu dashboard: {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.reload()} 
          className="gap-2"
        >
          <Loader2 className="w-4 h-4" />
          Thử lại
        </Button>
      </div>
    )
  }

  // Fallback data if no dashboard data
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Không có dữ liệu dashboard. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    )
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
            {settings?.siteName || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {settings?.siteDescription || 'Tổng quan về hoạt động của hệ thống LTA'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Hôm nay
          </Button>
          <Link href="/admin/news/create">
            <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
              <Plus className="h-4 w-4" />
              Thêm tin tức mới
          </Button>
        </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardData.stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon] || FileText
          const color = colorMap[stat.color as keyof typeof colorMap]
          return (
            <Card 
              key={stat.title} 
              className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up admin-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      {stat.title}
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <div className="flex items-center space-x-1 flex-wrap">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 hidden sm:inline">so với tháng trước</span>
                    </div>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-br ${color.bg} flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 lg:w-8 lg:h-8 ${color.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6 mb-6">
        {/* Recent News */}
        <Card className="lg:col-span-4 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg admin-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg lg:text-xl font-semibold">Tin tức gần đây</CardTitle>
                <CardDescription className="text-sm">
                  3 tin tức mới nhất được xuất bản
                </CardDescription>
              </div>
              <Link href="/admin/news">
                <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                  Xem tất cả
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentNews.slice(0, 3).map((news, index) => (
              <div 
                key={news.id} 
                className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {stripHtmlTags(news.title)}
                    </h3>
                    <Badge className={`${getStatusColor(news.status)} border flex-shrink-0`}>
                      {news.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 lg:space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{news.author}</span>
                    </div>
                    {news.category && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span className="truncate">{news.category}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{news.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{news.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg admin-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg lg:text-xl font-semibold">Hoạt động gần đây</CardTitle>
                <CardDescription className="text-sm">
                  Những hoạt động mới nhất trong hệ thống
            </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentActivities.slice(0, 4).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.action}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg admin-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg lg:text-xl font-semibold">Tổng quan hiệu suất</CardTitle>
              <CardDescription className="text-sm">
                Thống kê tin tức và danh mục trong 8 tháng gần đây
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Tin tức</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Danh mục</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto admin-chart-container">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 lg:gap-4 min-w-max admin-chart-grid">
              {dashboardData.performanceData.map((data, index) => (
                <div key={data.month} className="text-center space-y-2 min-w-[80px]">
                  <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {data.month}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">{data.news}</span>
                      <span className="text-green-600 dark:text-green-400 text-xs">{data.categories}</span>
                    </div>
                    <div className="flex space-x-1">
                      <div 
                        className="bg-blue-500 rounded-sm" 
                        style={{ 
                          height: '4px', 
                          width: `${Math.min((data.news / 10) * 100, 100)}%` 
                        }}
                      ></div>
                      <div 
                        className="bg-green-500 rounded-sm" 
                        style={{ 
                          height: '4px', 
                          width: `${Math.min((data.categories / 10) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Mục tiêu tháng</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Đạt 100% tin tức có danh mục</p>
                <Progress value={100} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
              <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">Thành tích</h3>
                <p className="text-sm text-green-700 dark:text-green-300">5 danh mục đã tạo</p>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">5</span>
                  <span className="text-sm text-green-600 dark:text-green-400 ml-1">danh mục</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
              <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Phân tích</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Tăng trưởng nhanh</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400 ml-1">+250%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 