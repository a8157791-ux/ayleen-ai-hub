import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { translateItems, NewsItem } from '@/lib/rss'

// POST /api/news/translate — titleKo가 없는 뉴스 번역
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
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY or GOOGLE_API_KEY is required for translation' },
        { status: 500 }
      )
    }

    // titleKo나 summaryKo가 비어있는 항목 최대 20건 가져오기
    const untranslated = await prisma.aiNews.findMany({
      where: {
        OR: [
          { titleKo: null },
          { titleKo: '' },
          { summaryKo: null },
          { summaryKo: '' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    if (untranslated.length === 0) {
      return NextResponse.json({ ok: true, translated: 0, message: '번역할 항목 없음' })
    }

    // NewsItem 형태로 변환
    const items: NewsItem[] = untranslated.map(n => ({
      title: n.title,
      url: n.url,
      source: n.source ?? '',
      summary: n.summary ?? undefined,
    }))

    // Gemini 번역 호출
    const translated = await translateItems(items)

    // DB 업데이트
    let count = 0
    for (let i = 0; i < translated.length; i++) {
      const t = translated[i]
      const original = untranslated[i]
      if (!t.titleKo && !t.summaryKo) continue
      await prisma.aiNews.update({
        where: { id: original.id },
        data: {
          titleKo: t.titleKo ?? null,
          summaryKo: t.summaryKo ?? null,
        },
      })
      count++
    }

    return NextResponse.json({ ok: true, translated: count, total: untranslated.length })
  } catch (err) {
    console.error('Translate error:', err)
    const message = err instanceof Error ? err.message : 'Failed to translate'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}