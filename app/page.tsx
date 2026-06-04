import { databaseEnabled, prisma } from '@/lib/db'
import Link from 'next/link'

const catLabel: Record<string, string> = {
  design: 'Design', code: 'Coding', video: 'Video',
  '3d': '3D', plan: 'Planning', research: 'Research', image: 'Image',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return '방금 전'
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export const revalidate = 1800

export default async function HomePage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Daily Digest</div>
        <h1 className="hero-title">오늘의 <b>AI</b> 트렌드</h1>
        <div className="hero-meta">
          데이터베이스 연결 정보가 없습니다. `DATABASE_URL` 환경 변수를 설정해주세요.
        </div>
      </div>
    )
  }

  let news = []
  let studies = []
  let statNews = 0
  let statStudy = 0
  let statPrompts = 0
  let statSaved = 0

  try {
    ;[news, studies, statNews, statStudy, statPrompts, statSaved] = await Promise.all([
    prisma.aiNews.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.studyNote.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.aiNews.count(),
    prisma.studyNote.count({ where: { published: true } }),
    prisma.promptItem.count({ where: { published: true } }),
    prisma.savedLink.count(),
  ])
  } catch (error) {
    console.error('Home page DB error:', error)
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Daily Digest</div>
        <h1 className="hero-title">데이터베이스 연결에 실패했습니다</h1>
        <div className="hero-meta">
          로컬 DB 또는 `DATABASE_URL` 설정을 확인해주세요.
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Daily Digest</div>
        <h1 className="hero-title">오늘의 <b>AI</b> 트렌드</h1>
        <div className="hero-meta">{today} · {statNews}건 수집됨</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">수집 뉴스</div>
          <div className="stat-value">{statNews}</div>
          <div className="stat-desc">AI 뉴스 기사</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">스터디 노트</div>
          <div className="stat-value">{statStudy}</div>
          <div className="stat-desc">누적 학습 기록</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">프롬프트</div>
          <div className="stat-value">{statPrompts}</div>
          <div className="stat-desc">보관된 프롬프트</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">저장한 글</div>
          <div className="stat-value">{statSaved}</div>
          <div className="stat-desc">북마크 아이템</div>
        </div>
      </div>

      {news.length > 0 && (
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker-inner">
            {[...news, ...news].map((n, i) => {
              const tickerTitle = (n as any).titleKo || n.title
              return (
                <span key={i} className="ticker-item">
                  {tickerTitle.slice(0, 40)}{tickerTitle.length > 40 ? '...' : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <section className="aihub-section">
        <div className="sec-hd">
          <h2 className="sec-title">오늘의 AI 뉴스</h2>
          <span className="sec-count">{statNews}건</span>
          <Link href="/news" className="sec-more">
            전체 보기 <i className="ti ti-arrow-right" />
          </Link>
        </div>
        <div className="news-list">
          {news.slice(0, 7).map((item, i) => {
            const isNew = Date.now() - item.createdAt.getTime() < 86400000
            const displayTitle = (item as any).titleKo || item.title
            const displaySummary = (item as any).summaryKo || item.summary
            return (
              <a key={item.id} href={item.url} className="news-item" target="_blank" rel="noopener noreferrer">
                <span className="news-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="news-body">
                  {item.category && (
                    <div className={`news-cat cat-${item.category}`}>
                      {catLabel[item.category] ?? item.category}
                    </div>
                  )}
                  <div className="news-title">{displayTitle}</div>
                  {(item as any).titleKo && item.title !== (item as any).titleKo && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      {item.title}
                    </div>
                  )}
                  {displaySummary && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 4, lineHeight: 1.5 }}>
                      {displaySummary}
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
      </section>

      {studies.length > 0 && (
        <section className="aihub-section">
          <div className="sec-hd">
            <h2 className="sec-title">최근 스터디룸</h2>
            <span className="sec-count">총 {statStudy}건</span>
            <Link href="/study" className="sec-more">
              전체 보기 <i className="ti ti-arrow-right" />
            </Link>
          </div>
          <div className="study-grid">
            {studies.map(note => (
              <Link key={note.id} href={`/study/${note.id}`} className="study-card">
                <div className="study-thumb">
                  {note.mediaUrl ? (
                    <img src={note.mediaUrl} alt="" loading="lazy" />
                  ) : (
                    <i className="ti ti-photo-ai" style={{ fontSize: 20, color: 'var(--color-indigo)', opacity: 0.45 }} />
                  )}
                </div>
                <div className="study-body">
                  {note.tool && <div className="study-tool">{note.tool}</div>}
                  <div className="study-title">{note.title}</div>
                  <div className="study-date">{note.createdAt.toLocaleDateString('ko-KR')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}