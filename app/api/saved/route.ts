import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const links = await prisma.savedLink.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(links)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const link = await prisma.savedLink.create({ data: body })
  return NextResponse.json(link)
}
