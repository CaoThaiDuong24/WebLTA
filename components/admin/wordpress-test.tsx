'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function WordPressTest() {
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [siteUrl, setSiteUrl] = useState('https://wp2.ltacv.com')

  const testWordPressConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`/api/wordpress/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteUrl }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Kết nối WordPress thành công!',
          data: result
        })
        
        toast({
          title: "Kết nối thành công",
          description: "WordPress API hoạt động bình thường.",
        })
      } else {
        throw new Error(result.error || 'Kết nối thất bại')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định'
      setTestResult({
        success: false,
        message: 'Kết nối WordPress thất bại',
        error: errorMessage
      })
      
      toast({
        title: "Kết nối thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Test Kết nối WordPress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testSiteUrl">WordPress Site URL</Label>
          <Input
            id="testSiteUrl"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://wp2.ltacv.com"
          />
        </div>
        
        <Button 
          onClick={testWordPressConnection}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang test...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Test Kết nối
            </>
          )}
        </Button>

        {testResult && (
          <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
              <div className="space-y-2">
                <p className="font-medium">{testResult.message}</p>
                {!testResult.success && testResult.error && (
                  <p className="text-sm">Lỗi: {testResult.error}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 