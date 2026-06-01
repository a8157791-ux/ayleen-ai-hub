import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat = searchParams.get('cat')
  const admin = searchParams.get('admin')
  const session = await getServerSession(authOptions)

  const where = (admin && session)
    ? (cat ? { category: cat } : {})
    : { published: true, ...(cat ? { category: cat } : {}) }

  const prompts = await prisma.promptItem.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(prompts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const item = await prisma.promptItem.create({ data: body })
  return NextResponse.json(item)
}
