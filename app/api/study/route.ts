import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const cat = searchParams.get('cat')

  // 단일 항목 조회 (편집 페이지용)
  if (id) {
    const note = await prisma.studyNote.findUnique({ where: { id: Number(id) } })
    return NextResponse.json(note)
  }

  const where = { published: true, ...(cat ? { category: cat } : {}) }
  const notes = await prisma.studyNote.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const note = await prisma.studyNote.create({ data: body })
  return NextResponse.json(note)
}
