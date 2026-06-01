import { databaseEnabled, prisma } from '@/lib/db'

const catLabel: Record<string, string> = {
  design: 'Design', code: 'Coding', video: 'Video',
  '3d': '3D', plan: 'Planning', research: 'Research',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return '방금 전'
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export const revalidate = 1800

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }> | { cat?: string }
}) {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">News</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 뉴스 목록을 볼 수 있습니다.</div>
      </div>
    )
  }

  const resolved = await Promise.resolve(searchParams)
  const cat = resolved.cat

  const where = cat ? { category: cat } : {}

  const [news, total] = await Promise.all([
    prisma.aiNews.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.aiNews.count(),
  ])

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Trend Board</div>
        <h1 className="hero-title">트렌드 <b>보드</b></h1>
        <div className="hero-meta">총 {total}건 수집됨</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <a href="/news" className={`tab-btn ${!cat ? 'active' : ''}`}>전체</a>
        {Object.entries(catLabel).map(([val, label]) => (
          <a key={val} href={`/news?cat=${val}`} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="news-list">
        {news.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '24px 0' }}>
            아직 수집된 뉴스가 없습니다. 관리자 패널에서 뉴스를 수집해보세요.
          </div>
        )}
        {news.map((item, i) => {
          const isNew = Date.now() - item.createdAt.getTime() < 86400000
          return (
            <a
              key={item.id}
              href={item.url}
              className="news-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="news-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="news-body">
                {item.category && (
                  <div className={`news-cat cat-${item.category}`}>
                    {catLabel[item.category] ?? item.category}
                  </div>
                )}
                <div className="news-title">{item.title}</div>
                {item.summary && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 3, lineHeight: 1.5 }}>
                    {item.summary}
                  </div>
                )}
                <div className="news-footer">
                  <span>{timeAgo(item.createdAt)}</span>
                  {item.source && <span className="news-source">{item.source}</span>}
                  {isNew && <span className="badge badge-new">NEW</span>}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </>
  )
}
