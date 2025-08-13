import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Load WordPress configuration
const getWordPressConfig = () => {
  try {
    const configPath = path.join(process.cwd(), 'data', 'wordpress-config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      return config
    }
  } catch (error) {
    console.error('Error loading WordPress config:', error)
  }
  return null
}

// XML-RPC request helper
async function makeXmlRpcRequest(url: string, method: string, params: any[]) {
  const xmlBody = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params.map(param => `<param><value><string>${param}</string></value></param>`).join('')}
  </params>
</methodCall>`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'WordPress XML-RPC Client'
      },
      body: xmlBody
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const xmlResponse = await response.text()
    return { success: true, data: xmlResponse }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Create post using XML-RPC
async function createPostViaXmlRpc(config: any, postData: any) {
  console.log('📝 Creating post via XML-RPC...')
  
  const xmlRpcUrl = `${config.siteUrl}/xmlrpc.php`
  
  // Prepare post content
  const postContent = {
    title: postData.title,
    description: postData.content,
    mt_excerpt: postData.excerpt || '',
    categories: postData.category ? [postData.category] : [],
    mt_keywords: postData.tags || '',
    post_status: postData.status
  }

  // Create post using metaWeblog.newPost
  const result = await makeXmlRpcRequest(
    xmlRpcUrl,
    'metaWeblog.newPost',
    [
      '1', // blog_id
      config.username,
      config.applicationPassword,
      postContent,
      postData.status === 'publish' ? '1' : '0' // publish flag
    ]
  )

  if (result.success) {
    // Parse XML response to get post ID
    const postIdMatch = result.data.match(/<value><string>(\d+)<\/string><\/value>/)
    if (postIdMatch) {
      const postId = postIdMatch[1]
      console.log(`✅ Post created successfully with ID: ${postId}`)
      return { success: true, postId }
    } else {
      console.log('✅ Post created successfully (ID not found in response)')
      return { success: true, postId: 'created' }
    }
  } else {
    console.log(`❌ XML-RPC request failed: ${result.error}`)
    return { success: false, error: result.error }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Auto sync to WordPress via XML-RPC called')
    
    const body = await request.json()
    console.log('📋 Sync data:', body)
    
    // Load WordPress configuration
    const config = getWordPressConfig()
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'WordPress configuration not found'
      }, { status: 400 })
    }
    
    // Create post via XML-RPC
    const result = await createPostViaXmlRpc(config, body)
    
    if (result.success) {
      console.log('✅ Post created successfully!')
      return NextResponse.json({
        success: true,
        message: 'Post created successfully in WordPress via XML-RPC',
        data: {
          id: result.postId,
          title: body.title,
          status: body.status
        }
      })
    } else {
      console.log(`❌ Post creation failed: ${result.error}`)
      return NextResponse.json({
        success: false,
        error: `Post creation failed: ${result.error}`
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Auto sync error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during auto sync'
    }, { status: 500 })
  }
}
