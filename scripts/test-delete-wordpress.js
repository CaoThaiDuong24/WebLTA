async function testDeleteWordPress() {
  console.log('🚀 Test xóa tin tức ở WordPress')
  console.log('===============================')

  try {
    // Lấy danh sách tin tức hiện tại
    const listResponse = await fetch('http://localhost:3000/api/news')
    const listResult = await listResponse.json()
    
    if (listResult.data.length === 0) {
      console.log('❌ Không có tin tức nào để xóa')
      return
    }
    
    const firstPost = listResult.data[0]
    console.log(`📋 Tin tức đầu tiên: ${firstPost.title} (ID: ${firstPost.wordpressId})`)
    
    // Xóa tin tức ở WordPress
    const deleteResponse = await fetch(`http://localhost:3000/api/wordpress/delete-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wordpressId: firstPost.wordpressId
      })
    })
    
    const deleteResult = await deleteResponse.json()
    
    console.log(`📡 Delete response status: ${deleteResponse.status}`)
    
    if (deleteResponse.ok) {
      console.log('✅ Xóa tin tức ở WordPress thành công!')
      console.log('📋 Result:', deleteResult)
      
      // Kiểm tra lại danh sách
      console.log('\n🔄 Kiểm tra lại danh sách...')
      const newListResponse = await fetch('http://localhost:3000/api/news')
      const newListResult = await newListResponse.json()
      
      console.log(`📋 Số tin tức sau khi xóa: ${newListResult.data.length}`)
      
      if (newListResult.data.length === 0) {
        console.log('✅ Tin tức đã được xóa khỏi danh sách admin!')
      } else {
        console.log('❌ Tin tức vẫn còn trong danh sách admin')
        console.log('📋 Remaining posts:', newListResult.data.map(p => p.title))
      }
      
    } else {
      console.log('❌ Xóa tin tức thất bại:')
      console.log('📋 Error:', deleteResult.error)
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  }
}

testDeleteWordPress()
