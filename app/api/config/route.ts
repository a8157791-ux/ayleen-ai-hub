import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const row = await prisma.userConfig.findUnique({ where: { key } })
  if (!row) return NextResponse.json({ value: null })
  return NextResponse.json({ value: JSON.parse(row.value) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { key, value } = body
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const row = await prisma.userConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  })
  return NextResponse.json({ ok: true, value: JSON.parse(row.value) })
}
