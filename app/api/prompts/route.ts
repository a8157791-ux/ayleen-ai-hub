import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get('cat')
  const where = { published: true, ...(cat ? { category: cat } : {}) }
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
