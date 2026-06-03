import { databaseEnabled, prisma } from '@/lib/db'

export const revalidate = 60

function getFaviconUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }> | { cat?: string }
}) {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Tool Library</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 툴 라이브러리를 볼 수 있습니다.</div>
      </div>
    )
  }

  const resolved = await Promise.resolve(searchParams)
  const cat = resolved.cat
  const where = { published: true, ...(cat ? { category: cat } : {}) }
  const tools = await prisma.aiTool.findMany({ where, orderBy: { createdAt: 'desc' } })

  const catLabel: Record<string, string> = {
    image: 'Image', video: 'Video', '3d': '3D', code: 'Code', plan: 'Planning', music: 'Music',
  }
  const pricingColor: Record<string, string> = {
    free: 'var(--color-green)', paid: 'var(--color-amber)', freemium: 'var(--color-blue)',
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Tool Library</div>
        <h1 className="hero-title">툴 <b>라이브러리</b></h1>
        <div className="hero-meta">{tools.length}개의 도구</div>
      </div>

      <div className="tools-trend-banner">
        <span className="tools-trend-label">
          <i className="ti ti-trending-up"></i>
          AI 툴 트렌드
        </span>
        <div className="tools-trend-links">
          <a href="https://www.toolify.ai/Best-trending-AI-Tools" target="_blank" rel="noopener noreferrer" className="tools-trend-link">
            <i className="ti ti-chart-bar"></i>
            Toolify 월간 랭킹
          </a>
          <span className="tools-trend-divider">·</span>
          <a href="https://www.airankings.co" target="_blank" rel="noopener noreferrer" className="tools-trend-link">
            <i className="ti ti-bolt"></i>
            AI Rankings 실사용 순위
          </a>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <a href="/tools" className={`tab-btn ${!cat ? 'active' : ''}`}>전체</a>
        {Object.entries(catLabel).map(([val, label]) => (
          <a key={val} href={`/tools?cat=${val}`} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="cards-grid">
        {tools.map(tool => {
          const favicon = getFaviconUrl(tool.url)
          return (
            <div key={tool.id} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              {/* 헤더: 파비콘 + 이름 + 가격 뱃지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {favicon && (
                  <img
                    src={favicon}
                    alt=""
                    width={20}
                    height={20}
                    style={{ borderRadius: 4, flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--color-text)', flex: 1, minWidth: 0 }}>{tool.name}</div>
                {tool.pricing && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 'var(--radius-sm)', background: `${pricingColor[tool.pricing]}20`, color: pricingColor[tool.pricing], flexShrink: 0 }}>
                    {tool.pricing}
                  </span>
                )}
              </div>

              {tool.review && (
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5, marginBottom: 10 }}>{tool.review}</div>
              )}
              {tool.rating && (
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`ti ti-star${i < Math.round(tool.rating!) ? '-filled' : ''}`} style={{ fontSize: 11, color: i < Math.round(tool.rating!) ? 'var(--color-amber)' : 'var(--color-text-3)' }} />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)' }}>
                <span>{tool.category ? (catLabel[tool.category] ?? tool.category) : ''}</span>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noopener" style={{ color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    바로가기 <i className="ti ti-external-link" style={{ fontSize: 10 }} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
        {tools.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, gridColumn: '1/-1' }}>
            아직 등록된 툴이 없습니다.
          </div>
        )}
      </div>
    </>
  )
}