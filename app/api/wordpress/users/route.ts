import { NextRequest, NextResponse } from 'next/server'
import { getWpDbPool, getWpTablePrefix } from '@/lib/wp-db'
import { hashWordPressPassword } from '@/lib/wp-password'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function phpSerializeCapabilities(role: string): string {
  // a:1:{s:<len>:"<role>";b:1;}
  const len = role.length
  return `a:1:{s:${len}:"${role}";b:1;}`
}

function roleToLevel(role: string): number {
  switch (role) {
    case 'administrator':
      return 10
    case 'editor':
      return 7
    case 'author':
      return 2
    case 'contributor':
      return 1
    default:
      return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, name, role = 'subscriber' } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Thiếu thông tin: username, email, password là bắt buộc' },
        { status: 400 }
      )
    }

    const pool = getWpDbPool()
    const prefix = getWpTablePrefix()
    const now = new Date()
    const registered = now.toISOString().slice(0, 19).replace('T', ' ')

    const user_login = username.trim()
    const user_email = email.trim()
    const display_name = name?.trim() || username.trim()
    const user_nicename = slugify(display_name || user_login)
    const user_pass = hashWordPressPassword(password)

    // Check duplicates
    const [existingByLogin] = await pool.query(`SELECT ID FROM ${prefix}users WHERE user_login = ? LIMIT 1`, [user_login])
    // @ts-ignore
    if (Array.isArray(existingByLogin) && existingByLogin.length > 0) {
      return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 409 })
    }
    const [existingByEmail] = await pool.query(`SELECT ID FROM ${prefix}users WHERE user_email = ? LIMIT 1`, [user_email])
    // @ts-ignore
    if (Array.isArray(existingByEmail) && existingByEmail.length > 0) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
    }

    // Insert user
    const [result]: any = await pool.query(
      `INSERT INTO ${prefix}users (user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name)
       VALUES (?, ?, ?, ?, '', ?, '', 0, ?)`,
      [user_login, user_pass, user_nicename, user_email, registered, display_name]
    )

    const userId = result.insertId

    // Insert capabilities and level in usermeta
    const capabilitiesKey = `${prefix}capabilities`
    const userLevelKey = `${prefix}user_level`
    const capabilitiesVal = phpSerializeCapabilities(role)
    const userLevelVal = String(roleToLevel(role))

    await pool.query(
      `INSERT INTO ${prefix}usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?), (?, ?, ?)`,
      [userId, capabilitiesKey, capabilitiesVal, userId, userLevelKey, userLevelVal]
    )

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo người dùng (DB)', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}


