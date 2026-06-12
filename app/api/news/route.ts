import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { fetchAllAINews, translateItems, NewsItem } from '@/lib/rss'

// POST /api/news — 뉴스 수집 (관리자 or cron secret)
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  const isDev = process.env.NODE_ENV !== 'production'
  if (cronSecret !== process.env.CRON_SECRET && !isDev) {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // 1단계: RSS 수집 (번역 없이)
    const items = await fetchAllAINews()
    let created = 0
    let skipped = 0

    const savedPairs: { id: number; item: NewsItem }[] = []

    // 2단계: DB 저장 (번역 전)
    for (const item of items) {
      if (!item.url || !item.title) continue
      try {
        const saved = await prisma.aiNews.create({
          data: {
            title: item.title,
            url: item.url,
            source: item.source,
            summary: item.summary,
            category: item.category,
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
            imageUrl: item.imageUrl ?? null,
          },
        })
        savedPairs.push({ id: saved.id, item })
        created++
      } catch (error) {
        console.error('Failed to save news item:', { title: item.title, url: item.url, source: item.source }, error)
        skipped++
      }
    }

    // 3단계: 새로 저장된 글만 번역 (최대 20건)
    if (savedPairs.length > 0) {
      const toTranslate = savedPairs.slice(0, 20).map(p => p.item)
      const translated = await translateItems(toTranslate)

      for (let i = 0; i < translated.length; i++) {
        const t = translated[i]
        const pair = savedPairs[i]
        if (!pair) continue
        if (!t.titleKo && !t.summaryKo) continue
        await prisma.aiNews.update({
          where: { id: pair.id },
          data: {
            titleKo: t.titleKo ?? null,
            summaryKo: t.summaryKo ?? null,
          },
        })
      }
    }

    return NextResponse.json({ ok: true, created, skipped, total: items.length })
  } catch (err) {
    console.error('News fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

// GET /api/news — 목록 조회 (페이지네이션 지원)
// 쿼리: page (1-based, 기본 1), limit (기본 100, 최대 500), cat, sortBy
// page 파라미터가 있으면 { items, total, page, totalPages } 형태로 반환
// page 파라미터가 없으면 기존처럼 배열 그대로 반환 (하위호환)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cat = searchParams.get('cat')
  const sortBy = searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'publishedAt'
  const pageParam = searchParams.get('page')

  const where = cat ? { category: cat } : {}

  try {
    const orderBy =
      sortBy === 'publishedAt'
        ? [{ publishedAt: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }]

    // ── 페이지네이션 모드 ──
    if (pageParam) {
      const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500)
      const page = Math.max(Number(pageParam) || 1, 1)
      const skip = (page - 1) * limit

      const [items, total] = await Promise.all([
        prisma.aiNews.findMany({ where, orderBy, skip, take: limit }),
        prisma.aiNews.count({ where }),
      ])

      return NextResponse.json({
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      })
    }

    // ── 기존 방식 (하위호환) ──
    const limit = Math.min(Number(searchParams.get('limit') ?? '200'), 500)
    const news = await prisma.aiNews.findMany({ where, orderBy, take: limit })
    return NextResponse.json(news)
  } catch (error) {
    console.error('News API DB error:', error)
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    )
  }
}
