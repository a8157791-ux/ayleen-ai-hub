import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.studyNote.findUnique({
      where: { id: parseInt(params.id) },
    })
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const note = await prisma.studyNote.update({
      where: { id: parseInt(params.id) },
      data: {
        title: body.title,
        category: body.category,
        tool: body.tool || null,
        content: body.content || null,
        prompt: body.prompt || null,
        siteUrl: body.siteUrl || null,
        mediaUrl: body.mediaUrl || null,
        tags: body.tags || null,
        studiedAt: body.studiedAt ? new Date(body.studiedAt) : null,
        published: body.published ?? true,
      },
    })
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.studyNote.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}