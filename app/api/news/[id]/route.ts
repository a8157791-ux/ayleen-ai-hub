import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { translateItems, NewsItem } from '@/lib/rss'

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.aiNews.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}

// PUT /api/news/[id] — 단건 번역
export async function PUT(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is required' }, { status: 500 })
    }

    const news = await prisma.aiNews.findUnique({ where: { id: Number(params.id) } })
    if (!news) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // 한국어 원문이면 번역 스킵
    const isKorean = /[\uAC00-\uD7AF]/.test(news.title)
    if (isKorean) {
      return NextResponse.json({ ok: true, skipped: true, message: '한국어 원문' })
    }

    const items: NewsItem[] = [{ title: news.title, url: news.url, source: news.source ?? '', summary: news.summary ?? undefined }]
    const translated = await translateItems(items)
    const t = translated[0]

    if (!t?.titleKo && !t?.summaryKo) {
      return NextResponse.json({ error: '번역 결과 없음' }, { status: 500 })
    }

    const updated = await prisma.aiNews.update({
      where: { id: news.id },
      data: { titleKo: t.titleKo ?? null, summaryKo: t.summaryKo ?? null },
    })

    return NextResponse.json({ ok: true, titleKo: updated.titleKo, summaryKo: updated.summaryKo })
  } catch (err) {
    console.error('Single translate error:', err)
    const message = err instanceof Error ? err.message : 'Failed to translate'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
