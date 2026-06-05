import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const type = searchParams.get('type') ?? 'all'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const skip = (page - 1) * limit

  if (!q) return NextResponse.json({ results: {}, total: 0 })

  const where = (fields: string[]) => ({
    OR: fields.map(f => ({ [f]: { contains: q, mode: 'insensitive' as const } })),
  })

  // 전체 검색 — 섹션별 미리보기 (각 5건)
  if (type === 'all') {
    const [news, study, tools, prompts, saved, reference] = await Promise.all([
      prisma.aiNews.findMany({
        where: where(['title', 'titleKo', 'summary', 'summaryKo', 'source']),
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, titleKo: true, summaryKo: true, summary: true, source: true, category: true, url: true, createdAt: true },
      }),
      prisma.studyNote.findMany({
        where: { published: true, ...where(['title', 'content', 'tool', 'tags']) },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, category: true, tool: true, tags: true, studiedAt: true, createdAt: true },
      }),
      prisma.aiTool.findMany({
        where: { published: true, ...where(['name', 'description', 'review']) },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, description: true, category: true, pricing: true, url: true, createdAt: true },
      }),
      prisma.promptItem.findMany({
        where: { published: true, ...where(['title', 'body', 'tool']) },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, category: true, tool: true, createdAt: true },
      }),
      prisma.savedLink.findMany({
        where: where(['title', 'memo', 'category']),
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, url: true, linkType: true, category: true, createdAt: true },
      }),
      prisma.reference.findMany({
        where: where(['title', 'desc', 'category']),
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, url: true, refType: true, category: true, createdAt: true },
      }),
    ])

    return NextResponse.json({
      results: { news, study, tools, prompts, saved, reference },
      counts: {
        news: news.length, study: study.length, tools: tools.length,
        prompts: prompts.length, saved: saved.length, reference: reference.length,
      },
    })
  }

  // 섹션별 검색 — 페이징
  let items: any[] = []
  let total = 0

  if (type === 'news') {
    const w = where(['title', 'titleKo', 'summary', 'summaryKo', 'source'])
    ;[items, total] = await Promise.all([
      prisma.aiNews.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, title: true, titleKo: true, summaryKo: true, summary: true, source: true, category: true, url: true, createdAt: true } }),
      prisma.aiNews.count({ where: w }),
    ])
  } else if (type === 'study') {
    const w = { published: true, ...where(['title', 'content', 'tool', 'tags']) }
    ;[items, total] = await Promise.all([
      prisma.studyNote.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, title: true, category: true, tool: true, tags: true, studiedAt: true, createdAt: true } }),
      prisma.studyNote.count({ where: w }),
    ])
  } else if (type === 'tools') {
    const w = { published: true, ...where(['name', 'description', 'review']) }
    ;[items, total] = await Promise.all([
      prisma.aiTool.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, name: true, description: true, category: true, pricing: true, url: true, createdAt: true } }),
      prisma.aiTool.count({ where: w }),
    ])
  } else if (type === 'prompts') {
    const w = { published: true, ...where(['title', 'body', 'tool']) }
    ;[items, total] = await Promise.all([
      prisma.promptItem.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, title: true, category: true, tool: true, createdAt: true } }),
      prisma.promptItem.count({ where: w }),
    ])
  } else if (type === 'saved') {
    const w = where(['title', 'memo', 'category'])
    ;[items, total] = await Promise.all([
      prisma.savedLink.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, title: true, url: true, linkType: true, category: true, createdAt: true } }),
      prisma.savedLink.count({ where: w }),
    ])
  } else if (type === 'reference') {
    const w = where(['title', 'desc', 'category'])
    ;[items, total] = await Promise.all([
      prisma.reference.findMany({ where: w, orderBy: { createdAt: 'desc' }, skip, take: limit,
        select: { id: true, title: true, url: true, refType: true, category: true, createdAt: true } }),
      prisma.reference.count({ where: w }),
    ])
  }

  return NextResponse.json({
    results: { [type]: items },
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
