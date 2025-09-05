'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Upload, 
  RefreshCw,
  Save,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function BackupPage() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isAutoBackup, setIsAutoBackup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export backup
  const exportBackup = async () => {
    try {
      setIsExporting(true)
      console.log('📦 Starting export...')
      
      const response = await fetch('/api/backup/export')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lta-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "✅ Export thành công",
          description: "File backup đã được tải về",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Lỗi khi export')
      }
    } catch (error: any) {
      console.error('❌ Export error:', error)
      toast({
        title: "❌ Lỗi export",
        description: error.message || "Không thể export dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Import backup
  const importBackup = async (file: File) => {
    try {
      setIsImporting(true)
      console.log('📦 Starting import...')
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "✅ Import thành công",
          description: result.message,
        })
        
        // Reload page để cập nhật dữ liệu
        window.location.reload()
      } else {
        throw new Error(result.error || 'Lỗi khi import')
      }
    } catch (error: any) {
      console.error('❌ Import error:', error)
      toast({
        title: "❌ Lỗi import",
        description: error.message || "Không thể import dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Auto backup
  const createAutoBackup = async () => {
    try {
      setIsAutoBackup(true)
      console.log('🔄 Starting auto backup...')
      
      const response = await fetch('/api/backup/auto-backup', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "✅ Auto backup thành công",
          description: result.message,
        })
      } else {
        throw new Error(result.error || 'Lỗi khi auto backup')
      }
    } catch (error: any) {
      console.error('❌ Auto backup error:', error)
      toast({
        title: "❌ Lỗi auto backup",
        description: error.message || "Không thể tạo auto backup",
        variant: "destructive",
      })
    } finally {
      setIsAutoBackup(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importBackup(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quản lý Backup & Restore</h1>
        <p className="text-muted-foreground">Sao lưu và khôi phục dữ liệu tin tức</p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Quan trọng:</strong> Luôn tạo backup trước khi deploy code mới lên production để tránh mất dữ liệu.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Export Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Tải về file backup chứa tất cả dữ liệu tin tức hiện tại. 
              File này có thể được sử dụng để khôi phục dữ liệu sau khi deploy.
            </p>
            
            <Button 
              onClick={exportBackup} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang export...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Tải về Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Khôi phục dữ liệu từ file backup. 
              Dữ liệu hiện tại sẽ được merge với dữ liệu từ backup.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Chọn File Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Auto Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Auto Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Tạo backup tự động và lưu vào server. 
              Hệ thống sẽ giữ lại 10 file backup gần nhất.
            </p>
            
            <Button 
              onClick={createAutoBackup} 
              disabled={isAutoBackup}
              variant="outline"
              className="w-full"
            >
              {isAutoBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo backup...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
              Tạo Auto Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Backup Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Thông tin Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Backup được lưu trong thư mục data/backups/</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tự động giữ lại 10 file backup gần nhất</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Merge dữ liệu khi import (không ghi đè)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Trước khi deploy code mới:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Tạo Auto Backup hoặc Export Backup</li>
              <li>Lưu file backup vào nơi an toàn</li>
              <li>Deploy code mới</li>
              <li>Import Backup nếu cần khôi phục dữ liệu</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Lưu ý quan trọng:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Luôn backup trước khi deploy</li>
              <li>File backup chứa tất cả dữ liệu tin tức</li>
              <li>Import sẽ merge dữ liệu, không ghi đè hoàn toàn</li>
              <li>Auto backup được lưu tự động trên server</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
