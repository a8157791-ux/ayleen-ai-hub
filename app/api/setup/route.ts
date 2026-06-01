import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/setup — 최초 관리자 계정 생성 (1회만 동작)
// curl -X POST https://your-site.vercel.app/api/setup \
//   -H "Content-Type: application/json" \
//   -d '{"email":"your@email.com","password":"yourpassword","name":"Ayleen","setupSecret":"your-setup-secret"}'
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name, setupSecret } = body

  // Protect with a one-time secret
  if (setupSecret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

  // Only allow if no admin exists
  const existing = await prisma.admin.count()
  if (existing > 0) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.admin.create({
    data: { email, password: hashed, name: name ?? 'Admin' },
  })

  return NextResponse.json({ ok: true, email: admin.email })
}
