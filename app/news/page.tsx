import { databaseEnabled, prisma } from '@/lib/db'
import NewsClient from './NewsClient'

export const revalidate = 1800

export default async function NewsPage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">News</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 뉴스 목록을 볼 수 있습니다.</div>
      </div>
    )
  }

  let news: any[] = []
  let total = 0

  try {
    ;[news, total] = await Promise.all([
      prisma.aiNews.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.aiNews.count(),
    ])
  } catch (error) {
    console.error('News page DB error:', error)
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">News</div>
        <h1 className="hero-title">데이터베이스 연결에 실패했습니다</h1>
        <div className="hero-meta">로컬 DB 또는 DATABASE_URL 설정을 확인해주세요.</div>
      </div>
    )
  }

  return <NewsClient news={news} total={total} />
}