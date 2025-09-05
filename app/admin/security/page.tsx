'use client'

import { useState } from 'react'
import { ArrowLeft, Shield, Smartphone, Monitor, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function SecurityPage() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    deviceTracking: true,
    suspiciousActivityAlerts: true
  })

  const [recentLogins] = useState([
    {
      id: 1,
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.100',
      time: '2024-01-15 14:30:25',
      status: 'success'
    },
    {
      id: 2,
      device: 'Safari trên iPhone',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.101',
      time: '2024-01-14 09:15:42',
      status: 'success'
    },
    {
      id: 3,
      device: 'Firefox trên MacOS',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.102',
      time: '2024-01-13 16:45:18',
      status: 'success'
    }
  ])

  const handleSettingChange = (setting: string, value: boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bảo mật</h1>
          <p className="text-gray-600 dark:text-gray-400">Cài đặt bảo mật tài khoản</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Cài đặt bảo mật</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Xác thực hai yếu tố</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bảo vệ tài khoản bằng mã xác thực
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Thông báo đăng nhập</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhận thông báo khi có đăng nhập mới
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => handleSettingChange('loginNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Theo dõi thiết bị</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ghi lại thông tin thiết bị đăng nhập
                  </p>
                </div>
                <Switch
                  checked={securitySettings.deviceTracking}
                  onCheckedChange={(checked) => handleSettingChange('deviceTracking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cảnh báo hoạt động đáng ngờ</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thông báo khi phát hiện hoạt động bất thường
                  </p>
                </div>
                <Switch
                  checked={securitySettings.suspiciousActivityAlerts}
                  onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Cài đặt phiên làm việc</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Thời gian timeout (phút)</label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={120}>2 giờ</option>
                  <option value={480}>8 giờ</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Hết hạn mật khẩu (ngày)</label>
                <select
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value={30}>30 ngày</option>
                  <option value={60}>60 ngày</option>
                  <option value={90}>90 ngày</option>
                  <option value={180}>180 ngày</option>
                  <option value={365}>1 năm</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-green-600" />
                <span>Hoạt động gần đây</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogins.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                        <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{login.device}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {login.location} • {login.ip}
                        </p>
                        <p className="text-xs text-gray-500">{login.time}</p>
                      </div>
                    </div>
                    <Badge variant={login.status === 'success' ? 'default' : 'destructive'}>
                      {login.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Khuyến nghị bảo mật</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Mật khẩu mạnh</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Mật khẩu của bạn đã đáp ứng yêu cầu bảo mật
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Đăng nhập an toàn</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Không có hoạt động đáng ngờ được phát hiện
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Xác thực hai yếu tố</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Bật xác thực hai yếu tố để tăng cường bảo mật
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 