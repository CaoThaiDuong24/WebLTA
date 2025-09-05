'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createNewsFormData } from '@/lib/upload-utils'

export default function TestMultipartPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      // Tạo dữ liệu test
      const testData = {
        title: 'Test News Title',
        slug: 'test-news-slug',
        excerpt: 'Test excerpt',
        content: '<p>Test content</p>',
        status: 'draft',
        featured: false,
        category: 'test',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test meta description',
        author: 'Test Author',
        featuredImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        additionalImages: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        ]
      }

      // Chuyển đổi thành FormData
      const formData = await createNewsFormData(testData)

      // Gửi test request
      const response = await fetch('/api/test-multipart', {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()
      setResult(responseData)

      if (response.ok) {
        toast({
          title: "✅ Thành công",
          description: "Test multipart/form-data thành công",
        })
      } else {
        toast({
          title: "❌ Lỗi",
          description: responseData.error || "Test thất bại",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "❌ Lỗi",
        description: "Lỗi khi test multipart/form-data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Multipart/Form-Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Đang test...' : 'Test Multipart/Form-Data'}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Kết quả:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
