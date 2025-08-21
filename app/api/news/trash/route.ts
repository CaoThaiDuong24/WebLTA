import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TRASH_FILE_PATH = path.join(process.cwd(), 'data', 'trash-news.json')
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const id: string = body?.id
    if (!id) {
      return NextResponse.json({ error: 'Thiếu id' }, { status: 400 })
    }

    let trash: any[] = []
    if (fs.existsSync(TRASH_FILE_PATH)) {
      try {
        trash = JSON.parse(fs.readFileSync(TRASH_FILE_PATH, 'utf8'))
      } catch {
        trash = []
      }
    }

    const index = trash.findIndex((t: any) => t.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy mục trong thùng rác' }, { status: 404 })
    }

    const removed = trash.splice(index, 1)[0]
    fs.writeFileSync(TRASH_FILE_PATH, JSON.stringify(trash, null, 2))

    return NextResponse.json({ success: true, data: removed })
  } catch (e) {
    return NextResponse.json({ error: 'Không thể xóa vĩnh viễn' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id: string = body?.id
    if (!id) {
      return NextResponse.json({ error: 'Thiếu id' }, { status: 400 })
    }

    let trash: any[] = []
    if (fs.existsSync(TRASH_FILE_PATH)) {
      try {
        trash = JSON.parse(fs.readFileSync(TRASH_FILE_PATH, 'utf8'))
      } catch {
        trash = []
      }
    }

    const index = trash.findIndex((t: any) => t.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy mục trong thùng rác' }, { status: 404 })
    }

    const item = trash.splice(index, 1)[0]

    // Ghi lại file trash
    fs.writeFileSync(TRASH_FILE_PATH, JSON.stringify(trash, null, 2))

    // Đưa về news.json
    let news: any[] = []
    if (fs.existsSync(NEWS_FILE_PATH)) {
      try {
        news = JSON.parse(fs.readFileSync(NEWS_FILE_PATH, 'utf8'))
      } catch {
        news = []
      }
    }

    // Nếu đã tồn tại id thì thay thế, nếu không thì thêm mới
    const idx = news.findIndex((n: any) => n.id === item.id)
    if (idx >= 0) {
      news[idx] = { ...news[idx], ...item, updatedAt: new Date().toISOString() }
    } else {
      news.push({ ...item, updatedAt: new Date().toISOString() })
    }

    fs.writeFileSync(NEWS_FILE_PATH, JSON.stringify(news, null, 2))

    return NextResponse.json({ success: true, data: item })
  } catch (e) {
    return NextResponse.json({ error: 'Không thể khôi phục' }, { status: 500 })
  }
}


