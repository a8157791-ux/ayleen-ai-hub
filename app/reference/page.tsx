import { databaseEnabled, prisma } from '@/lib/db'

export const revalidate = 60

export default async function ReferencePage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Reference</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 레퍼런스를 불러올 수 있습니다.</div>
      </div>
    )
  }

  const refs = await prisma.reference.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Reference</div>
        <h1 className="hero-title">레퍼 <b>런스</b></h1>
        <div className="hero-meta">{refs.length}개 저장됨</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {refs.map(ref => (
          <a
            key={ref.id}
            href={ref.url}
            target="_blank"
            rel="noopener"
            style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12, textDecoration: 'none' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {ref.faviconUrl
                ? <img src={ref.faviconUrl} alt="" style={{ width: 16, height: 16 }} />
                : <i className="ti ti-world" style={{ fontSize: 13, color: 'var(--color-text-3)' }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ref.title ?? ref.url}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', marginTop: 2 }}>
                {ref.refType ?? ''}
              </div>
              {ref.desc && (
                <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 4 }}>{ref.desc}</div>
              )}
            </div>
          </a>
        ))}
        {refs.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            저장된 레퍼런스가 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
