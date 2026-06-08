import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/reference/bulk-thumbnail — imageUrl 없는 레퍼런스 일괄 업데이트
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // imageUrl이 없는 것만
  const refs = await prisma.reference.findMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    select: { id: true, url: true },
  })

  if (refs.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: '업데이트할 항목 없음' })
  }

  let updated = 0
  let failed = 0

  for (const ref of refs) {
    try {
      const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/fetch-og?url=${encodeURIComponent(ref.url)}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) { failed++; continue }
      const data = await res.json()
      if (!data.imageUrl) { failed++; continue }

      await prisma.reference.update({
        where: { id: ref.id },
        data: { imageUrl: data.imageUrl },
      })
      updated++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ ok: true, updated, failed, total: refs.length })
}
