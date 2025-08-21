'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Globe,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  TestTube,
  ArrowLeft,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

const configSchema = z.object({
  siteUrl: z.string().url('URL WordPress không hợp lệ'),
  username: z.string().min(1, 'Username là bắt buộc'),
  applicationPassword: z.string().min(1, 'Application Password là bắt buộc'),
  dbHost: z.string().optional(),
  dbPort: z.union([z.string(), z.number()]).optional(),
  dbName: z.string().optional(),
  dbUser: z.string().optional(),
  dbPassword: z.string().optional(),
  tablePrefix: z.string().optional(),
})

type ConfigForm = z.infer<typeof configSchema>

interface WordPressConfig {
  siteUrl: string
  username: string
  applicationPassword: string
  isConnected: boolean
  db?: {
    host?: string
    user?: string
    password?: string
    database?: string
    port?: number | string
    tablePrefix?: string
  }
}

export default function WordPressConfigPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<WordPressConfig | null>(null)
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      siteUrl: '',
      username: '',
      applicationPassword: '',
      dbHost: '',
      dbPort: 3306,
      dbName: '',
      dbUser: '',
      dbPassword: '',
      tablePrefix: 'wp_',
    },
  })

  // Load current config from API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/wordpress/test-config')
        if (response.ok) {
          const config = await response.json()
          setCurrentConfig(config)
          setValue('siteUrl', config.siteUrl || '')
          setValue('username', config.username || '')
          setValue('applicationPassword', config.applicationPassword || '')
          setValue('dbHost', config.db?.host || '')
          setValue('dbPort', config.db?.port || 3306)
          setValue('dbName', config.db?.database || '')
          setValue('dbUser', config.db?.user || '')
          setValue('dbPassword', '')
          setValue('tablePrefix', config.db?.tablePrefix || 'wp_')
        }
      } catch (error) {
        console.error('Error loading config:', error)
      }
    }

    loadConfig()
  }, [setValue])

  // Test WordPress connection
  const testConnection = async (data: ConfigForm) => {
    setIsTesting(true)
    setTestResult('idle')

    try {
      const response = await fetch('/api/wordpress/test-connection-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult('success')
        toast({
          title: "✅ Kết nối thành công",
          description: "WordPress đã được kết nối thành công!",
        })
      } else {
        setTestResult('error')
        toast({
          title: "❌ Kết nối thất bại",
          description: result.error || "Không thể kết nối với WordPress",
          variant: "destructive",
        })
      }
    } catch (error) {
      setTestResult('error')
      toast({
        title: "❌ Lỗi kết nối",
        description: "Lỗi mạng khi test kết nối",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Save configuration
  const saveConfig = async (data: ConfigForm) => {
    setIsLoading(true)

    try {
      // Test connection first
      const testResponse = await fetch('/api/wordpress/test-connection-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const testResult = await testResponse.json()

      if (testResponse.ok) {
        // If test successful, save config
        const saveResponse = await fetch('/api/wordpress/save-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        const saveResult = await saveResponse.json()

        if (saveResponse.ok) {
          // Update current config
          const configToSave = {
            ...data,
            isConnected: true
          }
          setCurrentConfig(configToSave)

          toast({
            title: "✅ Lưu thành công",
            description: "Cấu hình WordPress đã được lưu và kết nối thành công!",
          })

          setTestResult('success')
        } else {
          toast({
            title: "❌ Lưu thất bại",
            description: saveResult.error || "Không thể lưu cấu hình",
            variant: "destructive",
          })
          setTestResult('error')
        }
      } else {
        toast({
          title: "❌ Kết nối thất bại",
          description: testResult.error || "Không thể kết nối với WordPress",
          variant: "destructive",
        })
        setTestResult('error')
      }
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi lưu cấu hình",
        variant: "destructive",
      })
      setTestResult('error')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (data: ConfigForm) => {
    saveConfig(data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/news">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Cấu hình WordPress</h1>
          <p className="text-muted-foreground">Kết nối với WordPress để xuất bản tin tức</p>
        </div>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Quan trọng:</strong> User WordPress phải có quyền "Editor" hoặc "Administrator" để có thể tạo bài viết. 
          Nếu gặp lỗi "401 Unauthorized", hãy kiểm tra quyền của user trong WordPress Admin.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Cấu hình kết nối</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="siteUrl">URL WordPress *</Label>
                <Input
                  id="siteUrl"
                  {...register('siteUrl')}
                  placeholder="https://example.com"
                  className={errors.siteUrl ? 'border-red-500' : ''}
                />
                {errors.siteUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.siteUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="admin"
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Username phải có quyền Editor hoặc Administrator
                </p>
              </div>

              <div>
                <Label htmlFor="applicationPassword">Application Password *</Label>
                <Input
                  id="applicationPassword"
                  type="password"
                  {...register('applicationPassword')}
                  placeholder="Nhập Application Password"
                  className={errors.applicationPassword ? 'border-red-500' : ''}
                />
                {errors.applicationPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.applicationPassword.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Tạo Application Password trong WordPress Admin → Users → Profile → Application Passwords
                </p>
              </div>

              {/* DB Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dbHost">DB Host</Label>
                  <Input id="dbHost" {...register('dbHost')} placeholder="localhost" />
                </div>
                <div>
                  <Label htmlFor="dbPort">DB Port</Label>
                  <Input id="dbPort" {...register('dbPort')} placeholder="3306" />
                </div>
                <div>
                  <Label htmlFor="dbName">DB Name</Label>
                  <Input id="dbName" {...register('dbName')} placeholder="wordpress_db" />
                </div>
                <div>
                  <Label htmlFor="dbUser">DB User</Label>
                  <Input id="dbUser" {...register('dbUser')} placeholder="root" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="dbPassword">DB Password</Label>
                  <Input id="dbPassword" type="password" {...register('dbPassword')} placeholder="••••••••" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tablePrefix">Table Prefix</Label>
                  <Input id="tablePrefix" {...register('tablePrefix')} placeholder="wp_" />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu & Kết nối
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isTesting || !isValid}
                  onClick={handleSubmit(testConnection)}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang test...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test kết nối
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isTesting}
                  onClick={async () => {
                    setIsTesting(true)
                    try {
                      const payload = {
                        host: (document.getElementById('dbHost') as HTMLInputElement)?.value,
                        port: Number((document.getElementById('dbPort') as HTMLInputElement)?.value) || 3306,
                        database: (document.getElementById('dbName') as HTMLInputElement)?.value,
                        user: (document.getElementById('dbUser') as HTMLInputElement)?.value,
                        password: (document.getElementById('dbPassword') as HTMLInputElement)?.value,
                        tablePrefix: (document.getElementById('tablePrefix') as HTMLInputElement)?.value || 'wp_',
                      }
                      const res = await fetch('/api/test-db', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      })
                      const json = await res.json()
                      if (res.ok) {
                        toast({
                          title: '✅ Kết nối DB thành công',
                          description: `Bảng users: ${json?.tables?.users ? 'OK' : 'MISSING'}, usermeta: ${json?.tables?.usermeta ? 'OK' : 'MISSING'}`,
                        })
                      } else {
                        toast({ title: '❌ Kết nối DB thất bại', description: json.error || 'Unknown error', variant: 'destructive' })
                      }
                    } catch (e: any) {
                      toast({ title: '❌ Lỗi test DB', description: e?.message || String(e), variant: 'destructive' })
                    } finally {
                      setIsTesting(false)
                    }
                  }}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang test DB...
                    </>
                  ) : (
                    'Test DB'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Trạng thái kết nối</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentConfig?.isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Đã kết nối</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">URL:</span> {currentConfig.siteUrl}
                  </div>
                  <div>
                    <span className="font-medium">Username:</span> {currentConfig.username}
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    WordPress đã được kết nối thành công. Bạn có thể xuất bản tin tức lên WordPress.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Chưa kết nối</span>
                </div>
                
                <Alert>
                  <AlertDescription>
                    WordPress chưa được cấu hình. Vui lòng nhập thông tin kết nối để xuất bản tin tức.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Test Result */}
            {testResult === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Kết nối WordPress thành công! Có thể xuất bản tin tức.
                </AlertDescription>
              </Alert>
            )}

            {testResult === 'error' && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Không thể kết nối với WordPress. Kiểm tra lại thông tin cấu hình và quyền user.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cấu hình</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">1. Kiểm tra quyền User WordPress:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Đăng nhập vào WordPress Admin</li>
              <li>Vào Users → All Users</li>
              <li>Tìm user bạn muốn sử dụng</li>
              <li>Kiểm tra Role phải là "Editor" hoặc "Administrator"</li>
              <li>Nếu không đúng, click "Edit" và thay đổi Role</li>
            </ol>

            <h4 className="font-medium">2. Tạo Application Password:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Đăng nhập vào WordPress Admin</li>
              <li>Vào Users → Profile</li>
              <li>Cuộn xuống phần "Application Passwords"</li>
              <li>Nhập tên (ví dụ: "LTA News")</li>
              <li>Click "Add New Application Password"</li>
              <li>Copy password được tạo ra</li>
            </ol>

            <h4 className="font-medium">3. Cấu hình trong hệ thống:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Nhập URL WordPress (ví dụ: https://example.com)</li>
              <li>Nhập Username WordPress (phải có quyền Editor/Admin)</li>
              <li>Nhập Application Password đã tạo</li>
              <li>Click "Test kết nối" để kiểm tra</li>
              <li>Click "Lưu & Kết nối" để lưu cấu hình</li>
            </ol>

            <h4 className="font-medium">4. Xuất bản tin tức:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Sau khi kết nối thành công, vào trang tạo tin tức</li>
              <li>Tạo tin tức mới</li>
              <li>Click "Lưu & Xuất bản"</li>
              <li>Tin tức sẽ được lưu trực tiếp lên WordPress</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 