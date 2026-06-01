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
          },
        })
        created++
      } catch {
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
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat = searchParams.get('cat')
  const limit = Number(searchParams.get('limit') ?? '200')
  const where = cat ? { category: cat } : {}
  const news = await prisma.aiNews.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 500),
  })
  return NextResponse.json(news)
}
