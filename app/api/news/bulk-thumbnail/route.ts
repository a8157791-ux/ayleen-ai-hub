import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/news/bulk-thumbnail?page=0
// imageUrl 없는 뉴스 20개씩 썸네일 업데이트
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = Number(req.nextUrl.searchParams.get('page') ?? '0')
  const PAGE_SIZE = 20

  // YouTube URL에서 썸네일 추출
  function getYouTubeThumbnail(url: string): string | undefined {
    const match = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
    if (!match) return undefined
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  }

  const items = await prisma.aiNews.findMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    select: { id: true, url: true },
    orderBy: { createdAt: 'desc' },
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  // 전체 미처리 건수 (다음 페이지 여부 판단용)
  const totalRemaining = await prisma.aiNews.count({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
  })

  if (items.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, failed: 0, remaining: 0, hasMore: false })
  }

  let updated = 0
  let failed = 0

  for (const item of items) {
    try {
      // YouTube면 video ID로 바로 처리 (fetch 불필요)
      const ytThumb = getYouTubeThumbnail(item.url)
      if (ytThumb) {
        await prisma.aiNews.update({ where: { id: item.id }, data: { imageUrl: ytThumb } })
        updated++
        continue
      }

      // 일반 RSS — fetch-og API 호출
      const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/fetch-og?url=${encodeURIComponent(item.url)}`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (!res.ok) { failed++; continue }
      const data = await res.json()
      if (!data.imageUrl) { failed++; continue }

      await prisma.aiNews.update({ where: { id: item.id }, data: { imageUrl: data.imageUrl } })
      updated++
    } catch {
      failed++
    }
  }

  const remaining = totalRemaining - items.length
  return NextResponse.json({
    ok: true,
    updated,
    failed,
    page,
    remaining: Math.max(0, remaining),
    hasMore: remaining > 0,
  })
}
