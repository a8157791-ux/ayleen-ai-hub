import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name, setupSecret } = body

  if (setupSecret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

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
