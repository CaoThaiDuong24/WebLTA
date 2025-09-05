async function testCreateNews() {
  console.log('🚀 Test tạo tin tức mới')
  console.log('========================')

  try {
    const response = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test tin tức mới',
        excerpt: 'Test excerpt cho tin tức mới',
        content: '<p>Nội dung test tin tức mới</p>',
        status: 'draft',
        category: 'Test',
        tags: 'test, tin-tuc'
      })
    })

    const result = await response.json()
    
    console.log(`📡 Response status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Tạo tin tức thành công!')
      console.log('📋 Data:', JSON.stringify(result.data, null, 2))
    } else {
      console.log('❌ Tạo tin tức thất bại:')
      console.log('📋 Error:', result.error)
      console.log('📋 Details:', result.details)
      console.log('📋 Warning:', result.warning)
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  }
}

testCreateNews()
