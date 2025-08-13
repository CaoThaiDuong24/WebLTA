'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Copy, ExternalLink, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content: string
  excerpt: string
  status: 'draft' | 'published'
  syncedToWordPress: boolean
  wordpressId?: number
  createdAt: string
  author: string
}

export default function ManualWordPressSync() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    loadNewsItems()
  }, [])

  const loadNewsItems = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNewsItems(data.news || [])
      }
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const openWordPressAdmin = () => {
    window.open('https://wp2.ltacv.com/wp-admin/', '_blank')
  }

  const markAsSynced = async (newsId: string) => {
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncedToWordPress: true,
          lastSyncDate: new Date().toISOString()
        }),
      })

      if (response.ok) {
        // Update local state
        setNewsItems(prev => prev.map(item => 
          item.id === newsId 
            ? { ...item, syncedToWordPress: true, lastSyncDate: new Date().toISOString() }
            : item
        ))
      }
    } catch (error) {
      console.error('Error marking as synced:', error)
    }
  }

  const unsyncedNews = newsItems.filter(item => !item.syncedToWordPress)
  const syncedNews = newsItems.filter(item => item.syncedToWordPress)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading news items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Manual WordPress Sync</h1>
        <p className="text-muted-foreground">
          WordPress REST API is blocked by hosting provider. Use manual sync until resolved.
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>REST API Blocked:</strong> WordPress REST API access is restricted by the hosting provider. 
          Contact <strong>apisupport@xecurify.com</strong> to enable REST API access for automated sync.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Essential tools for manual WordPress synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={openWordPressAdmin} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open WordPress Admin
            </Button>
            <Button 
              onClick={() => copyToClipboard(
                `WordPress Admin: https://wp2.ltacv.com/wp-admin/\nUsername: lta2\nPassword: [Application Password]`,
                'WordPress credentials'
              )}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy WordPress Credentials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Sync Instructions</CardTitle>
          <CardDescription>
            Step-by-step guide for manually syncing news to WordPress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Access WordPress Admin</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Open WordPress Admin" above or go to: <br />
                  <code className="text-xs bg-muted p-1 rounded">https://wp2.ltacv.com/wp-admin/</code>
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">2. Login Credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Username: <code className="text-xs bg-muted p-1 rounded">lta2</code><br />
                  Password: Application Password (use "Copy WordPress Credentials")
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">3. Create New Post</h4>
                <p className="text-sm text-muted-foreground">
                  In WordPress Admin, go to Posts → Add New, then copy content from the news items below.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">4. Mark as Synced</h4>
                <p className="text-sm text-muted-foreground">
                  After publishing in WordPress, click "Mark as Synced" to update the LTA system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsynced News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Unsynced News
            <Badge variant="secondary">{unsyncedNews.length}</Badge>
          </CardTitle>
          <CardDescription>
            News items that need to be manually synced to WordPress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unsyncedNews.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">All news items have been synced!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unsyncedNews.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(item.createdAt).toLocaleDateString()} by {item.author}
                      </p>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(item.title, 'Title')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Title
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(item.content, 'Content')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Content
                      </Button>
                      {item.excerpt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(item.excerpt, 'Excerpt')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Excerpt
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => markAsSynced(item.id)}
                      >
                        Mark as Synced
                      </Button>
                    </div>
                  </div>
                  
                  {item.excerpt && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Excerpt:</strong> {item.excerpt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synced News */}
      {syncedNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Synced News
              <Badge variant="outline">{syncedNews.length}</Badge>
            </CardTitle>
            <CardDescription>
              News items that have been manually synced to WordPress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncedNews.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Synced: {item.lastSyncDate ? new Date(item.lastSyncDate).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              ))}
              {syncedNews.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  ... and {syncedNews.length - 5} more synced items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
