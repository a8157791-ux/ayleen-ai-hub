import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { fetchAllAINews } from '@/lib/rss'

// POST /api/news — 뉴스 수집 (관리자 or cron secret)
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const items = await fetchAllAINews()
    let created = 0
    let skipped = 0

    for (const item of items) {
      if (!item.url || !item.title) continue
      try {
        await prisma.aiNews.create({
          data: {
            title: item.title,
            url: item.url,
            source: item.source,
            summary: item.summary,
            category: item.category,
            // ✅ v2: publishedAt 저장 (ISO 문자열 → DateTime)
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          },
        })
        created++
      } catch {
        // url unique constraint 위반 = 중복 skip
        skipped++
      }
    }

    return NextResponse.json({ ok: true, created, skipped, total: items.length })
  } catch (err) {
    console.error('News fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

// GET /api/news — 목록 조회
// ?cat=design|code|video|3d|plan|research  카테고리 필터
// ?limit=200                                최대 500건
// ?sortBy=publishedAt|createdAt             정렬 기준 (기본: publishedAt 우선)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat = searchParams.get('cat')
  const limit = Math.min(Number(searchParams.get('limit') ?? '200'), 500)
  const sortBy = searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'publishedAt'

  const where = cat ? { category: cat } : {}

  // publishedAt 정렬: null은 뒤로 보내기 위해 createdAt도 함께 사용
  const news = await prisma.aiNews.findMany({
    where,
    orderBy:
      sortBy === 'publishedAt'
        ? [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }],
    take: limit,
  })

  return NextResponse.json(news)
}