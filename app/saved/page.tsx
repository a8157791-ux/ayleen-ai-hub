import { databaseEnabled, prisma } from '@/lib/db'

export const revalidate = 60

export default async function SavedPage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Saved Links</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 저장된 링크를 볼 수 있습니다.</div>
      </div>
    )
  }

  const links = await prisma.savedLink.findMany({ orderBy: { createdAt: 'desc' } })
  const typeColor: Record<string, string> = {
    youtube: 'var(--color-pink)', instagram: 'var(--color-purple)',
    article: 'var(--color-cyan)', news: 'var(--color-green)',
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Saved Links</div>
        <h1 className="hero-title">저장한 <b>글</b></h1>
        <div className="hero-meta">{links.length}개 저장됨</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener"
            className="saved-link-item"
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link.title ?? link.url}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link.url}
              </div>
            </div>
            {link.linkType && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-3)', color: typeColor[link.linkType] ?? 'var(--color-text-3)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                {link.linkType}
              </span>
            )}
          </a>
        ))}
        {links.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            저장된 글이 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
