import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const ref = await prisma.reference.findUnique({ where: { id: Number(params.id) } })
  if (!ref) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ref)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updated = await prisma.reference.update({
    where: { id: Number(params.id) },
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.reference.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
