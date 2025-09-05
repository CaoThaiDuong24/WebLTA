'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  TestTube, 
  Loader2, 
  CheckCircle,
  XCircle,
  UserPlus,
  AlertCircle,
  Settings,
  Key,
  Save,
  Globe,
  Shield,
  Wrench
} from 'lucide-react'

export default function TestWordPressPage() {
  const { toast } = useToast()
  const [isTestingDirect, setIsTestingDirect] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingAuth, setIsTestingAuth] = useState(false)
  const [isTestingPermissions, setIsTestingPermissions] = useState(false)
  const [isFixingUnauthorized, setIsFixingUnauthorized] = useState(false)
  const [isTestingUserCreation, setIsTestingUserCreation] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [directResult, setDirectResult] = useState<any>(null)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [authResult, setAuthResult] = useState<any>(null)
  const [permissionsResult, setPermissionsResult] = useState<any>(null)
  const [fixUnauthorizedResult, setFixUnauthorizedResult] = useState<any>(null)
  const [userCreationResult, setUserCreationResult] = useState<any>(null)
  
  // Config form
  const [config, setConfig] = useState({
    siteUrl: 'https://wp2.ltacv.com',
    username: 'lta2',
    applicationPassword: '1SPd 7wD4 45Lm Ie2B O4zX lSO4'
  })

  const testDirect = async () => {
    setIsTestingDirect(true)
    try {
      const response = await fetch('/api/wordpress/test-direct')
      const result = await response.json()
      
      setDirectResult(result)
      
      if (result.success) {
        toast({
          title: "Kết nối trực tiếp thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Kết nối trực tiếp thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error testing direct connection:', error)
      toast({
        title: "Lỗi",
        description: "Không thể test kết nối trực tiếp",
        variant: "destructive"
      })
    } finally {
      setIsTestingDirect(false)
    }
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/wordpress/test-connection')
      const result = await response.json()
      
      setConnectionResult(result)
      
      if (result.success) {
        toast({
          title: "Kết nối thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Kết nối thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast({
        title: "Lỗi",
        description: "Không thể test kết nối",
        variant: "destructive"
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const testAuth = async () => {
    setIsTestingAuth(true)
    try {
      const response = await fetch('/api/wordpress/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      setAuthResult(result)
      
      if (result.success) {
        toast({
          title: "Authentication thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Authentication thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error testing auth:', error)
      toast({
        title: "Lỗi",
        description: "Không thể test authentication",
        variant: "destructive"
      })
    } finally {
      setIsTestingAuth(false)
    }
  }

  const fixUnauthorized = async () => {
    setIsFixingUnauthorized(true)
    try {
      const response = await fetch('/api/wordpress/fix-unauthorized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      setFixUnauthorizedResult(result)
      
      if (result.success) {
        toast({
          title: "Fix UNAUTHORIZED thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Fix UNAUTHORIZED thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fixing unauthorized:', error)
      toast({
        title: "Lỗi",
        description: "Không thể fix UNAUTHORIZED",
        variant: "destructive"
      })
    } finally {
      setIsFixingUnauthorized(false)
    }
  }

  const testPermissions = async () => {
    setIsTestingPermissions(true)
    try {
      const response = await fetch('/api/wordpress/check-user-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      setPermissionsResult(result)
      
      if (result.success) {
        toast({
          title: "Kiểm tra quyền thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Kiểm tra quyền thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error testing permissions:', error)
      toast({
        title: "Lỗi",
        description: "Không thể test quyền",
        variant: "destructive"
      })
    } finally {
      setIsTestingPermissions(false)
    }
  }

  const saveConfig = async () => {
    setIsSavingConfig(true)
    try {
      const response = await fetch('/api/wordpress/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Lưu cấu hình thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Lưu cấu hình thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình",
        variant: "destructive"
      })
    } finally {
      setIsSavingConfig(false)
    }
  }

  const testUserCreation = async () => {
    setIsTestingUserCreation(true)
    try {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'subscriber'
      }

      const response = await fetch('/api/wordpress/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      })

      const result = await response.json()
      setUserCreationResult(result)

      if (result.success) {
        toast({
          title: "Tạo user thành công",
          description: result.message,
          variant: "default"
        })
      } else {
        toast({
          title: "Tạo user thất bại",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error testing user creation:', error)
      toast({
        title: "Lỗi",
        description: "Không thể test tạo user",
        variant: "destructive"
      })
    } finally {
      setIsTestingUserCreation(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Test WordPress Integration
          </h1>
          <p className="text-slate-600">
            Kiểm tra kết nối và chức năng tạo user WordPress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Direct Connection Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Test Kết nối Trực tiếp</CardTitle>
                  <CardDescription>
                    Kiểm tra site WordPress có thể truy cập không
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testDirect}
                disabled={isTestingDirect}
                className="w-full mb-4"
              >
                {isTestingDirect ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang test...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Test Kết nối Trực tiếp
                  </>
                )}
              </Button>

              {directResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {directResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {directResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(directResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Cấu hình WordPress</CardTitle>
                  <CardDescription>
                    Thông tin kết nối WordPress
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={config.siteUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={config.username}
                  onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                />
              </div>
              
              <div>
                <Label htmlFor="applicationPassword">Application Password</Label>
                <Input
                  id="applicationPassword"
                  type="password"
                  value={config.applicationPassword}
                  onChange={(e) => setConfig(prev => ({ ...prev, applicationPassword: e.target.value }))}
                  placeholder="Application Password"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testAuth}
                  disabled={isTestingAuth}
                  className="flex-1"
                >
                  {isTestingAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang test...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Test Auth
                    </>
                  )}
                </Button>

                <Button 
                  onClick={saveConfig}
                  disabled={isSavingConfig}
                  variant="outline"
                  className="flex-1"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu Config
                    </>
                  )}
                </Button>
              </div>

              {authResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {authResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {authResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(authResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fix UNAUTHORIZED */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Fix UNAUTHORIZED</CardTitle>
                  <CardDescription>
                    Sửa lỗi UNAUTHORIZED và kiểm tra authentication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fixUnauthorized}
                disabled={isFixingUnauthorized}
                className="w-full mb-4 bg-red-600 hover:bg-red-700"
              >
                {isFixingUnauthorized ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang sửa...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Fix UNAUTHORIZED
                  </>
                )}
              </Button>

              {fixUnauthorizedResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {fixUnauthorizedResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {fixUnauthorizedResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(fixUnauthorizedResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Test Quyền User</CardTitle>
                  <CardDescription>
                    Kiểm tra quyền tạo user
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testPermissions}
                disabled={isTestingPermissions}
                className="w-full mb-4"
              >
                {isTestingPermissions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Kiểm tra Quyền
                  </>
                )}
              </Button>

              {permissionsResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {permissionsResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {permissionsResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(permissionsResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TestTube className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Test Kết nối WordPress</CardTitle>
                  <CardDescription>
                    Kiểm tra kết nối đến WordPress REST API
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testConnection}
                disabled={isTestingConnection}
                className="w-full mb-4"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang test...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Kết nối
                  </>
                )}
              </Button>

              {connectionResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {connectionResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {connectionResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(connectionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Creation Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Test Tạo User</CardTitle>
                  <CardDescription>
                    Kiểm tra chức năng tạo user mới
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testUserCreation}
                disabled={isTestingUserCreation}
                className="w-full mb-4"
              >
                {isTestingUserCreation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Test Tạo User
                  </>
                )}
              </Button>

              {userCreationResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {userCreationResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {userCreationResult.success ? 'Thành công' : 'Thất bại'}
                    </span>
                  </div>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(userCreationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Hướng dẫn Debug</CardTitle>
                <CardDescription>
                  Các bước kiểm tra khi gặp lỗi UNAUTHORIZED
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Test kết nối trực tiếp:</strong> Kiểm tra site có thể truy cập không</li>
              <li><strong>Fix UNAUTHORIZED:</strong> Sử dụng nút "Fix UNAUTHORIZED" để kiểm tra và sửa lỗi</li>
              <li><strong>Kiểm tra Application Password:</strong> Đảm bảo password có quyền truy cập REST API</li>
              <li><strong>WordPress Settings:</strong> Vào WordPress Admin → Users → Profile → Application Passwords</li>
              <li><strong>Tạo mới Application Password:</strong> Tạo password mới với quyền đầy đủ</li>
              <li><strong>REST API Permissions:</strong> Đảm bảo user có quyền tạo user khác</li>
              <li><strong>WordPress Version:</strong> Kiểm tra WordPress có hỗ trợ REST API</li>
              <li><strong>Plugin Conflicts:</strong> Tắt các plugin có thể block REST API</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
